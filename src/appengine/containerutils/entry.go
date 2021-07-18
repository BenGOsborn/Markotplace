package containerutils

import (
	"context"
	"errors"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type Container struct {
	AppID string
	ContainerID string
	LastHit time.Time
	Port int
	Active bool
}

func (cnter *Container) Expired(ctx context.Context) bool {
	// Check if a container was last hit more than the given time
	return time.Now().After(cnter.LastHit.Add(20 * time.Minute))
}

func (cnter *Container) StartContainer(ctx context.Context, port int) error {
	if cnter.Active {
		return errors.New("container is already active")
	}

	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// Create a new container
	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: cnter.AppID, // This should be the AppID as well, but we will use this for testing
	}, nil, nil, nil, "")
	if err != nil {
		return err
	}

	// Start the container
	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	// Set the time the container started, the port it started on, the ID of the container, and return no errors
	cnter.LastHit = time.Now()
	cnter.Port = port
	cnter.ContainerID = resp.ID
	cnter.Active = true

	return nil
}

func (cnter *Container) StopContainer(ctx context.Context) error {
	if !cnter.Active {
		return errors.New("no active container to stop")
	}
	
	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// Stop the container
	if err := cli.ContainerStop(ctx, cnter.ContainerID, nil); err != nil {
		return err
	}

	// Reset the values for the container
	cnter.LastHit = time.Time{}
	cnter.Port = 0
	cnter.ContainerID = ""
	cnter.Active = false

	// Dont return error
	return nil
}