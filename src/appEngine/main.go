package main

// Make the containers expire after a while
// Docker containers that can spawn siblings
// In the future, I can store the data that details the containers in a shared cache (Redis) which can then map the request to the correct instance of the apps (if I make multiple instances with a load balancer)

// Reverse proxy: https://www.integralist.co.uk/posts/golang-reverse-proxy/ OR https://medium.com/swlh/proxy-server-in-golang-43e2365d9cbc + https://github.com/akashjain132/load-balancer/blob/master/main.go + https://hackernoon.com/writing-a-reverse-proxy-in-just-one-line-with-go-c1edfa78c84b + https://github.com/bechurch/reverse-proxy-demo
// Docker siblings: https://forums.docker.com/t/how-can-i-run-docker-command-inside-a-docker-container/337/6
// SECURITY FOR MOUNTED VOLUMES: https://medium.com/@axbaretto/best-practices-for-securing-containers-8bf8ae0d9952 + https://stackoverflow.com/questions/40844197/what-is-the-docker-security-risk-of-var-run-docker-sock
// Pausing and restarting containers: https://stackoverflow.com/questions/34782678/difference-between-running-and-starting-a-docker-container (maybe put some of these in a deep sleep after an hour or so)

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

type Container struct {
	// This should contain the data for the container
	// Go API Docker https://docs.docker.com/engine/api/sdk/
	AppID string
	LastHit time.Time
	Port int
}

// Initialize default values
const PORT = 3000
var serverHits = 0
var servers = []string{"http://localhost:4000"}
var containers []Container

func (container *Container) expired() bool {
	// Check if a container was last hit more than 20 minutes ago
	return time.Now().After(container.LastHit.Add(20 * time.Minute))
}

// The main function I need is a proxy that is able to redirect requests to their appropriate containers
// I need a way of starting up (NOT BUILDING - THIS WILL BE ANOTHER SERVICE) and monitoring Docker contains and tracking them, and shutting them down / pausing them - (maybe in the future also load balancing them and redirecting them to the correct instance)

func test() {
	for {
		log.Println("Go test")
		time.Sleep(5 * time.Second)
	}
}

func main() {
	// Initialize the context
	ctx := context.Background()

	go test()

	// Initialize the Docker client
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	// Create a new container
	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: "ubuntu",
		Cmd: []string{"echo", "Hello world"},
	}, nil, nil, nil, "")
	if err != nil {
		panic(err)
	}

	// Start the container
	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		panic(err)
	}

	statusCh, errCh := cli.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			panic(err)
		}
	case <-statusCh:
	}

	out, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true})
	if err != nil {
		panic(err)
	}

	stdcopy.StdCopy(os.Stdout, os.Stderr, out)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Get the target server to redirect to and increment the server hits
		target := servers[serverHits % len(servers)]
		serverHits++

		// Parse the origin URL
		origin, _ := url.Parse(target)

		// Create the reverse proxy
		proxy := httputil.NewSingleHostReverseProxy(origin)

		// Initialize the proxy
		proxy.ServeHTTP(w, r)

		// Log the message
		log.Println("Proxy called")
	})

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}