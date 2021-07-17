# Here we want to build an image where we compile the Go server, and then make a new docker image with the server and then run that
# We want to test if the ports inside of a container are unique to the container and thats it
# Do ports within this system clash with ports outside of the system too ?

# This a terrible idea because then we cant export them - we should just build the image with the files somehow
# Maybe I should just copy the way cloud companies do it ? - where there are different subfiles which can do things

# Proposal
#   I could have an Nginx container
#   This Nginx container would be the entrypoint for different Dockerfiles that are running on its container
#   These containers would be managed by something to check their uptime and stuff, and be able to setup another server with containers (like a master)
#   The Nginx container would be able to serve external applications game files 
#   It would also have to pull