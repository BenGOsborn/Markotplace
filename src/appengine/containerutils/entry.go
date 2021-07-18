package containerutils

// Bind ports: https://stackoverflow.com/questions/41789083/set-portbindings-config-for-containercreate-function-in-golang-sdk-for-docker-ap

// ******* I WANT ALL OF THE FUNCTIONS TO TAKE IN A REFERENCE TO THE ORIGINAL CONTAINERS
// ******* I ALSO NEED A WAY TO SPIN UP A CONTAINER

import (
	"context"
	"errors"
	"fmt"
	"strings"
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

// ********* Am I EXACTLY sure about this with its active thingo ?
// ********* Also I should not be removing containers, I should only be stopping them
// ********* I need a way of checking the images on the base OS first LOL
func CleanupContainers(ctx context.Context, containers *[]Container) {
	// Continuously filter out unused containers
	for {
		// Filter out the expired containers
		var newContainers = []Container{}

		for _, ctr := range *containers {
			if ctr.Expired() {
				if ctr.Active {
					// Stop the container
					ctr.StopContainer(ctx)
				}
				continue
			} else {
				// Add the container to the list
				newContainers = append(newContainers, ctr)
			}
		}

		// Set the new containers
		*containers = newContainers

		// Sleep
		time.Sleep(20 * time.Minute)
	}
}

func ValidAppID(ctx context.Context, appID string, containers []Container) (*Container, bool, error) {
	// ************ Users COULD technically spin up base images from this, that wouldn't be intended

	// Check if the image is in the list of containers and return that container
	for _, ctr := range containers {
		if ctr.AppID == appID {
			return &ctr, true, nil
		}
	}
	
	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, false, err
	}

	// Get a list of images
	images, err := cli.ImageList(ctx, types.ImageListOptions{})
	if err != nil {
		return nil, false, err
	}

	// Check if the image exists
	for _, image := range images {
		imageID := strings.Split(image.RepoTags[0], ":")[0]
		if imageID == appID {
			return nil, true, nil
		}
	}

	// Return false if no app ID matches
	return nil, false, nil
}