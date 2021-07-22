# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Change name appengine to containermanager AND move to a Python (with types) SOCKS5 reverse proxy (that or explore NAT / PAT options)
-   Make some sort of shared utils
-   SECURITY PROBLEM: if someone draws from my base image, they can start their own version of it and copy the source code for it (SECURE THESE APPS)
-   Maybe add a subscription payment system in the future ?
-   Move into different files
-   \*\*\*\*Problem with current setup - ANYONE can just access the game on the port WITHOUT authentication
-   Auth with Nginx - https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/ (Do I still need this kinda thing ?)
-   **I reckon that a simple reverse proxy will work if the user specifies the absolute path to their request each time even with different protocols**
-   App engine can probably be changed so that it sets the name of the container instead of using the container ID
-   \*\*\*\* Some things that are not necessary SHOULD not do any caching (especially if it is dangerous)
-   Instead of using Nginx as a main load balancer, use DNS for different servers on the network via stuff like user.website.com instead of website.com
-   Set the types for some of the shared connections that could be undefined ?
