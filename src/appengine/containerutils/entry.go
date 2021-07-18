package containerutils

import (
	"context"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type Container struct {
	// This should contain the data for the container
	// Go API Docker https://docs.docker.com/engine/api/sdk/
	AppID string
	ContainerID string
	LastHit time.Time
	Port int
	ctx context.Context // This seems very annoying to manage ALONG with the Docker context (how do I manage this ?)
}

func (cnter *Container) expired() bool {
	// Check if a container was last hit more than the given time
	return time.Now().After(cnter.LastHit.Add(20 * time.Minute))
}

func (cnter *Container) startContainer(port int) error {
	// Initialize a context
	cnter.ctx = context.Background()
	
	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// Create a new container
	resp, err := cli.ContainerCreate(cnter.ctx, &container.Config{
		Image: "bengosborn/ts-wasmbird", // This should be the AppID as well, but we will use this for testing
	}, nil, nil, nil, "")
	if err != nil {
		return err
	}

	// Start the container
	if err := cli.ContainerStart(cnter.ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	// Set the time the container started, the port it started on, the ID of the container, and return no errors
	cnter.LastHit = time.Now()
	cnter.Port = port
	cnter.ContainerID = resp.ID

	return nil
}

func (cnter *Container) stopContainer() error {
	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// Stop the container
	if err := cli.ContainerStop(cnter.ctx, cnter.ContainerID, nil); err != nil {
		return err
	}

	// Dont return error
	return nil
}