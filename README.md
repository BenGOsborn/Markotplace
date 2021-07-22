# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Change name appengine to containermanager AND move to a Python (with types) SOCKS5 reverse proxy (that or explore NAT / PAT options)
-   Make some sort of shared utils
-   SECURITY PROBLEM: if someone draws from my base image, they can start their own version of it and copy the source code for it (SECURE THESE APPS) (I should use a hash for the docker images and run them that way ?)
-   Maybe add a subscription payment system in the future ?
-   \*\*\*\*Problem with current setup - ANYONE can just access the game on the port WITHOUT authentication
-   **I reckon that a simple reverse proxy will work if the user specifies the absolute path to their request each time even with different protocols**
-   App engine can probably be changed so that it sets the name of the container instead of using the container ID
-   \*\*\*\* Some things that are not necessary SHOULD not do any caching (especially if it is dangerous)
-   Instead of using Nginx as a main load balancer, use DNS for different servers on the network via stuff like user.website.com instead of website.com
-   Limit Docker resources - also maybe use Docker pause instead of kill and start all the time - https://docs.docker.com/config/containers/resource_constraints/

## Immediate

-   Implement a better system for user accounts (including deletion) and GitHub authentication ?
-   Implement payment system ?
-   The apps will require their own GitHub repository link (or repo name to be deployed)
