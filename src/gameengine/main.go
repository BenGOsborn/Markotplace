package main

// This should be responsible for spinning up the different Docker containers and tracking them
// It should also listen for new merges / commits and build a Docker file from them (using some naming convention)
// The service should receive a game request, then attempt to fetch that game (after validating they can have it)
// The server will then attempt to spin up a container for that game (and its last request ping)
// The different running containers will be monitored for their last response and will be put to sleep if unused
// If a user submits a bad Dockerfile which cant be run, their previous code will be submitted instead (and some sort of flag will be set for them ?)

// Different checks will have to be done concurrently