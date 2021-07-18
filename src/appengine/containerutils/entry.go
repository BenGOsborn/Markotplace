package containerutils

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

func NewContainer(appID string) *Container {
	ctr := new(Container)
	ctr.AppID = appID

	return ctr
}

func (ctr *Container) Expired(ctx context.Context) bool {
	// Check if a container was last hit more than the given time
	return time.Now().After(ctr.LastHit.Add(20 * time.Minute))
}

func (ctr *Container) StartContainer(ctx context.Context, port int) error {
	// Check that the container is active
	if ctr.Active {
		return errors.New("container is already active")
	}

	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// ****** Clearly the port assignment here does not work

	// Create a new container
	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: ctr.AppID,
		ExposedPorts: nat.PortSet{
			nat.Port(fmt.Sprintf("%d/tcp", port)): {},
		},
		Env: []string{fmt.Sprintf("PORT=%d", port)},
	}, &container.HostConfig{
		PortBindings: nat.PortMap{
			nat.Port(fmt.Sprintf("%d/tcp", port)): []nat.PortBinding{{HostIP: "0.0.0.0", HostPort: fmt.Sprintf("%d", port)}},
		},
	}, nil, nil, "")
	if err != nil {
		return err
	}

	// Start the container
	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	// Set the time the container started, the port it started on, the ID of the container, and return no errors
	ctr.LastHit = time.Now()
	ctr.Port = port
	ctr.ContainerID = resp.ID
	ctr.Active = true

	return nil
}

func (ctr *Container) StopContainer(ctx context.Context) error {
	// Check that the container is not active
	if !ctr.Active {
		return errors.New("no active container to stop")
	}
	
	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	// Stop the container
	if err := cli.ContainerStop(ctx, ctr.ContainerID, nil); err != nil {
		return err
	}

	// Reset the values for the container
	ctr.LastHit = time.Time{}
	ctr.Port = 0
	ctr.ContainerID = ""
	ctr.Active = false

	// Dont return error
	return nil
}