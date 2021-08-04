package docker

import (
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

func Docker() {
	fmt.Println("Docker!")
}

func ListImages() ([]string, error) {
	// Initialize Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	// Get a list of images from the host
	images, err := cli.ImageList(nil, types.ImageListOptions{})
	if err != nil {
		return nil, err
	}

	// Extract the names of the images and return them
	names := []string{}
	for _, image := range images {
		names = append(names, image.ID)
	}
	return names, nil
}
