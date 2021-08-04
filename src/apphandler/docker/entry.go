package docker

import (
	"context"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
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

func StartContainer(imageName string) (string, error) {
	// Initialize Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return "", err
	}

	// Build and start the image
	resp, err := cli.ContainerCreate(context.TODO(), &container.Config{}, nil, nil, nil, "")
	if err != nil {
		return "", err
	}
	if err := cli.ContainerStart(context.TODO(), resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	// Return the ID of the image
	return resp.ID, nil
}
