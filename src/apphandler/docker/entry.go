package docker

import (
	"apphandler/database"
	"archive/tar"
	"bufio"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
	"github.com/docker/go-connections/nat"
)

const CONTAINER_PREFIX = "markotplace-local"

func ListImages() ([]string, error) {
	// Initialize Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	// Get a list of images from the host
	images, err := cli.ImageList(context.TODO(), types.ImageListOptions{})
	if err != nil {
		return nil, err
	}

	// Extract the tags of the images and return them
	tags := []string{}
	for _, image := range images {
		tag := image.RepoTags
		if len(tag) > 0 {
			tags = append(tags, tag[0])
		}
	}
	return tags, nil
}

func StartContainer(appData *database.AppData, port int) (string, error) {
	// Initialize Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return "", err
	}

	// Build and start the image
	resp, err := cli.ContainerCreate(context.TODO(),
		&container.Config{
			Image: buildImageName(appData),
			ExposedPorts: nat.PortSet{
				nat.Port(fmt.Sprintf("%d/tcp", port)): {},
			},
			Env: append(appData.Env, fmt.Sprintf("PORT=%d", port)),
		},
		&container.HostConfig{
			PortBindings: nat.PortMap{
				nat.Port(fmt.Sprintf("%d/tcp", port)): []nat.PortBinding{{HostIP: "localhost", HostPort: fmt.Sprintf("%d", port)}},
			},
			AutoRemove: true,
			Resources:  container.Resources{Memory: 3e+7, CPUPercent: 5},
		}, nil, nil, "")
	if err != nil {
		return "", err
	}
	if err := cli.ContainerStart(context.TODO(), resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	// Return the ID of the image
	return resp.ID, nil
}

type ErrorLine struct {
	Error string `json:"error"`
}

type ImageName struct {
	appName    string
	appVersion int
}

func buildImageName(appData *database.AppData) string {
	// Create an image name from the params
	name := fmt.Sprintf("%s/%s/%d", strings.ToLower(CONTAINER_PREFIX), strings.ToLower(appData.AppName), appData.AppVersion)

	return name
}

func ParseImageName(rawImageName string) (*ImageName, error) {
	// Split the name and extract the details
	split := strings.Split(rawImageName, "/")

	imageName := new(ImageName)
	imageName.appName = split[1]
	appVersion := split[2]
	appVersionParsed, err := strconv.Atoi(appVersion)
	if err != nil {
		return nil, err
	}
	imageName.appVersion = int(appVersionParsed)

	return imageName, nil
}

func BuildImage(appData *database.AppData) error {
	// Download the repo
	fileUrl := fmt.Sprintf("https://github.com/%s/%s/archive/%s.tar.gz", appData.GhRepoOwner, appData.GhRepoName, appData.GhRepoBranch)
	req, err := http.NewRequest("GET", fileUrl, nil)
	if err != nil {
		return err
	}
	req.Header.Add("Authorization", fmt.Sprintf("token %s", appData.GhAccessToken))
	httpClient := &http.Client{}
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return errors.New("bad status code")
	}

	// Generate a temp directory
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}
	tempDir, err := ioutil.TempDir(cwd, "src")
	if err != nil {
		return err
	}
	defer os.RemoveAll(tempDir)

	// Download the file to the temp directory
	filePath := filepath.Join(tempDir, "src.tar.gz")
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return err
	}

	// Decompress tar.gz **** https://medium.com/@skdomino/taring-untaring-files-in-go-6b07cf56bc07
	file.Seek(0, io.SeekStart)
	gzr, err := gzip.NewReader(file)
	if err != nil {
		return err
	}
	defer gzr.Close()

	tr := tar.NewReader(gzr)

	for {
		header, err := tr.Next()

		if err == io.EOF {
			// If no more files are found then exit
			break
		} else if err != nil {
			// Return on any other error
			return err
		} else if header == nil {
			// Skip nil header
			continue
		}

		// The target location where the dir/file should be created
		target := filepath.Join(tempDir, header.Name)

		// Check the file type
		switch header.Typeflag {

		// If dir that doesnt exist create it
		case tar.TypeDir:
			if _, err := os.Stat(target); err != nil {
				if err := os.MkdirAll(target, 0755); err != nil {
					return err
				}
			}

		// If file then create it
		case tar.TypeReg:
			f, err := os.OpenFile(target, os.O_CREATE|os.O_RDWR, os.FileMode(header.Mode))
			if err != nil {
				return err
			}

			// Copy contents to file
			if _, err := io.Copy(f, tr); err != nil {
				return err
			}

			// Close the file
			f.Close()
		}
	}

	// Initialize Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// Build Docker image from repo **** https://www.loginradius.com/blog/async/build-push-docker-images-golang/
	extractedDir := filepath.Join(tempDir, fmt.Sprintf("%s-%s", appData.GhRepoName, appData.GhRepoBranch))
	tar, err := archive.TarWithOptions(extractedDir, &archive.TarOptions{})
	if err != nil {
		return err
	}
	res, err := cli.ImageBuild(context.TODO(), tar, types.ImageBuildOptions{
		Dockerfile: "Dockerfile",
		Tags:       []string{buildImageName(appData)},
		Remove:     true,
	})
	if err != nil {
		return err
	}

	// Read the output from the build
	var lastLine string
	scanner := bufio.NewScanner(res.Body)
	for scanner.Scan() {
		lastLine = scanner.Text()
	}

	// Check for errors
	errLine := &ErrorLine{}
	json.Unmarshal([]byte(lastLine), errLine)
	if errLine.Error != "" {
		return errors.New(errLine.Error)
	}
	if err := scanner.Err(); err != nil {
		return err
	}

	// Return no errors
	return nil
}
