# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Change name appengine to containermanager
-   There could be problems with using http in production instead of https for the authentication section
-   How do I use my redis connection across multiple files ? (some sort of shared npm package with the modules)
-   Make some sort of shared utils
-   Switch proxy engine over to Python with their own proxy
-   \*\*\*\*Problem with current setup - ANYONE can just access the game on the port WITHOUT authentication
-   Do not write a custom redis request, simply just use the existing one and try and set a cookie and see if it work
-   Look into what a NAT is instead of the proxy ?, SOCKS proxies too, PAT ?
-   Instead of using a proxy, forward the request using a get / post request method to the specified port then return that request (how do I implement UDP or websockets ? - I can use a seperate reverse proxy for web sockets only (how do websockets work for Heroku and other platforms ?))
-   Auth with Nginx - https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/
-   **I reckon that a simple reverse proxy will work if the user specifies the absolute path to their request each time even with different protocols**
-   App engine can probably be changed so that it sets the name of the container instead of using the container ID
