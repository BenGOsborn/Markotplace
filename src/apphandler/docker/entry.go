package docker

import (
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
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
	"github.com/docker/go-connections/nat"
)

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

func StartContainer(imageName string, port int) (string, error) {
	// Initialize Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return "", err
	}

	// Build and start the image
	resp, err := cli.ContainerCreate(context.TODO(), &container.Config{
		Image: imageName,
		ExposedPorts: nat.PortSet{
			nat.Port(fmt.Sprintf("%d/tcp", port)): {},
		},
		Env: []string{fmt.Sprintf("PORT=%d", port)},
	}, &container.HostConfig{
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

// What if I simply just encrypt the names of the containers using the server side key so NOONE can guess them using the server secret ???
// Also remember that these names have been parsed into lowercase

type ImageName struct {
	appName      string
	ghRepoOwner  string
	ghRepoName   string
	ghRepoBranch string
}

func BuildImageName(imageName ImageName) string {
	const CONTAINER_PREFIX = "markotplace-local"
	name := fmt.Sprintf("%s/%s/%s/%s/%s", strings.ToLower(CONTAINER_PREFIX), strings.ToLower(imageName.appName), strings.ToLower(imageName.ghRepoOwner), strings.ToLower(imageName.ghRepoName), strings.ToLower(imageName.ghRepoBranch))
	return name
}

func ParseImageName(rawImageName string) ImageName {
	// Split the name and extract the details
	split := strings.Split(rawImageName, "/")

	imageName := new(ImageName)
	imageName.appName = split[1]
	imageName.ghRepoOwner = split[2]
	imageName.ghRepoName = split[3]
	imageName.ghRepoBranch = split[4]

	return *imageName
}

func BuildImage(appName string) error {
	// **** Test data
	// **** Add error handling this is MADNESS
	ghRepoOwner := "BenGOsborn"
	ghRepoName := "Cerci"
	ghRepoBranch := "main"

	// Download the repo
	fileUrl := fmt.Sprintf("https://github.com/%s/%s/archive/%s.tar.gz", ghRepoOwner, ghRepoName, ghRepoBranch) // I also need to add a Authorization header in here with the access token
	req, err := http.NewRequest("GET", fileUrl, nil)
	if err != nil {
		return err
	}
	req.Header.Add("Authorization", fmt.Sprintf("token %s", "lol"))
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
	extractedDir := filepath.Join(tempDir, fmt.Sprintf("%s-%s", ghRepoName, ghRepoBranch)) // Don't forget to add the version for this for parsing it
	tar, err := archive.TarWithOptions(extractedDir, &archive.TarOptions{})
	if err != nil {
		return err
	}
	res, err := cli.ImageBuild(context.TODO(), tar, types.ImageBuildOptions{
		Dockerfile: "Dockerfile",
		Tags:       []string{fmt.Sprintf("%s/%s/%s/%s", strings.ToLower(containerPrefix), strings.ToLower(ghRepoOwner), strings.ToLower(ghRepoName), strings.ToLower(ghRepoBranch))},
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
