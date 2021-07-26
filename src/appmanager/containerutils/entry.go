package containerutils

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

type Container struct {
	AppID       string
	ContainerID string
	LastHit     time.Time
	Port        int
	Active      bool
}

func (ctr *Container) Expired() bool {
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

	// Create a new container
	resp, err := cli.ContainerCreate(ctx, &container.Config{ // **** I also need to set the name here too for easier usage ? (reconfigure how the container is saved)
		Image: ctr.AppID,
		ExposedPorts: nat.PortSet{
			nat.Port(fmt.Sprintf("%d/tcp", port)): {},
		},
		Env: []string{fmt.Sprintf("PORT=%d", port)},
	}, &container.HostConfig{
		PortBindings: nat.PortMap{
			nat.Port(fmt.Sprintf("%d/tcp", port)): []nat.PortBinding{{HostIP: "0.0.0.0", HostPort: fmt.Sprintf("%d", port)}},
		},
		AutoRemove: true,
		Resources: container.Resources{ Memory: 3e+7 }, // **** Needs to be tested further
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

func CleanupContainers(ctx context.Context, containers *[]Container) {
	// Continuously shutdown unused containers
	for {
		for i, ctr := range *containers {
			if ctr.Active {
				if ctr.Expired() {
					(*containers)[i].StopContainer(ctx)
				}
			}
		}

		// Sleep
		time.Sleep(5 * time.Minute)
	}
}

func GetContainer(ctx context.Context, appID string, containers *[]Container) (*Container, error) {
	// Check if the image is in the list of containers and return that container
	for i, ctr := range *containers {
		if ctr.AppID == appID {
			return &(*containers)[i], nil
		}
	}

	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	// Get a list of images
	images, err := cli.ImageList(ctx, types.ImageListOptions{})
	if err != nil {
		return nil, err
	}

	// Check if the image exists
	for _, image := range images {
		// This requires some modification - it should only allow for images that contain a slash in them OR a custom start - users spinning up base images
		imageID := strings.Split(image.RepoTags[0], ":")[0]
		if imageID == appID {
			// Make a new instance of the container
			newContainer := new(Container)
			newContainer.AppID = appID

			// Add the container to the list
			*containers = append(*containers, *newContainer)

			// Return the container
			return &((*containers)[len(*containers)-1]), nil
		}
	}

	// Return false if no app ID matches
	return nil, nil
}

func GetPort() int {
	// Specify the valid port range
	portMin := 2000
	portMax := 65535

	// Generate a random port until it is correct
	for {
		// Generate a new random port within the range
		port := portMin + rand.Int()%(portMax-portMin+1)

		// Check that the port is not used by the rest of the system
		server, err := net.Listen("tcp", fmt.Sprintf(":%d", port))

		// If the server connected to the port it must be valid, so return it, otherwise continue
		if err == nil {
			server.Close()
			return port
		}
	}
}
