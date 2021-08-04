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
	file.Close() // Try and defer this and keep the existing file stream

	// Decompress **** figure out how this works!!! https://medium.com/@skdomino/taring-untaring-files-in-go-6b07cf56bc07
	r, _ := os.Open(filePath)
	gzr, err := gzip.NewReader(r)
	if err != nil {
		return err
	}
	defer gzr.Close()

	tr := tar.NewReader(gzr)

	for {
		header, err := tr.Next()

		switch {

		// if no more files are found return
		case err == io.EOF:
			return nil

		// return any other error
		case err != nil:
			return err

		// if the header is nil, just skip it (not sure how this happens)
		case header == nil:
			continue
		}

		// the target location where the dir/file should be created
		target := filepath.Join(tempDir, header.Name)

		// the following switch could also be done using fi.Mode(), not sure if there
		// a benefit of using one vs. the other.
		// fi := header.FileInfo()

		// check the file type
		switch header.Typeflag {

		// if its a dir and it doesn't exist create it
		case tar.TypeDir:
			if _, err := os.Stat(target); err != nil {
				if err := os.MkdirAll(target, 0755); err != nil {
					return err
				}
			}

		// if it's a file create it
		case tar.TypeReg:
			f, err := os.OpenFile(target, os.O_CREATE|os.O_RDWR, os.FileMode(header.Mode))
			if err != nil {
				return err
			}

			// copy over contents
			if _, err := io.Copy(f, tr); err != nil {
				return err
			}

			// manually close here after each file operation; defering would cause each file close
			// to wait until all operations have completed.
			f.Close()
		}
	}

	// Return no errors
	// return nil
}
