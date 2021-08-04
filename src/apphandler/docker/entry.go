package docker

import (
	"context"
	"fmt"

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
	// Now we need to fetch the data from this appData from the repository and branch
	fmt.Println(appName)

	return nil
}
