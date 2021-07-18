package containerutils

// TODO: IN the future add an option for UDP as well as TCP

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
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
	// Check that the container is active
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
		Image: cnter.AppID,
		ExposedPorts: nat.PortSet{
			nat.Port(fmt.Sprintf("%d/%s", port, "tcp")): struct{}{},
		},
		Env: []string{fmt.Sprintf("PORT=%d", port)},
	}, &container.HostConfig{}, nil, nil, "")
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
	// Check that the container is not active
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