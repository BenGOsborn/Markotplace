package docker

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

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

func BuildImage(appName string) error {
	// **** Test data
	// **** Add error handling this is MADNESS
	ghRepoOwner := "BenGOsborn"
	ghRepoName := "Webhook-Test"
	ghRepoBranch := "main"

	// Fetch the repo
	fileUrl := fmt.Sprintf("https://github.com/%s/%s/archive/%s.tar.gz", ghRepoOwner, ghRepoName, ghRepoBranch)
	resp, err := http.Get(fileUrl)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Generate a temp directory
	cwd, _ := os.Getwd()
	tempDir, _ := ioutil.TempDir(cwd, "src")
	defer os.RemoveAll(tempDir)

	// Download the file to the temp directory
	filePath := filepath.Join(tempDir, "src.tar.gz")
	file, _ := os.Create(filePath)
	_, _ = io.Copy(file, resp.Body)
	defer file.Close()

	// Decompress tar.gz **** https://medium.com/@skdomino/taring-untaring-files-in-go-6b07cf56bc07
	file.Seek(0, io.SeekStart)
	gzr, _ := gzip.NewReader(file)
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
	cli, _ := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())

	// Build Docker image from repo
	// **** https://www.loginradius.com/blog/async/build-push-docker-images-golang/
	extractedDir := filepath.Join(tempDir, fmt.Sprintf("%s-%s-%s", ghRepoOwner, ghRepoName, ghRepoBranch))
	tar, _ := archive.TarWithOptions()

	// Return no errors
	return nil
}
