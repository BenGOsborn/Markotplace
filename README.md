# Markotplace

An online marketplace that allows developers to monetize their online web apps.

-   EXAMPLE: https://api.github.com/repos/BenGOsborn/WASM-Bird/tarball
-   ALSO: curl -v -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/BenGOsborn/WASM-Bird/tarball (look at the redirect location - it has the download (I wonder if this works for private repos too))

## Todo

-   Maybe add a subscription payment system in the future ?
-   Limit Docker resources - also maybe use Docker pause instead of kill and start all the time - https://docs.docker.com/config/containers/resource_constraints/
-   Maybe rebrand the entire app for gamers specifically
-   Add support for Unity and other game engines that make web apps
-   Make a blog helping developers to make apps for our site
-   Make some sort of API for other developers where they can add their own payment option on their server which is embedded on their website

## Immediate

-   Maybe in the case of caching, instead of clearing the cache, I should instead UPDATE the cache after an update
-   How do I set up customers for future payments too ? - https://stripe.com/docs/payments/save-during-payment (default payment source on card ?)
- How can I prevent exposed ports for the ones I dont want ?

- ALLOW THE OPTION TO LOCALHOST WHEN PRODUCTION NOT ENABLED
- SET NODE_ENV AND REPLACE ENVIRONMENT WITH NODE_ENV IN THE API SERVER

- When the app is added / repo is edited, auto deploy the app
- Custom URL for the appmanager proxy ?
- How am I going to handle images
- Dont hard code all of the ports ?
- DONT GO LOOKING AT THE OS LEVEL FOR THE DOCKER IMAGES IN THE APPMANAGER
- Specify versions of my base Docker images
- Use Gunicorn

- A better way of load balancing the apps - the appbuilder and appmanager will be one big container - these can be distributed across different systems. When a request is made to build an app, this will be load balanced, and the container will keep a record of which appnames correspond with each container. Then when a request is made to get the app, another reverse proxy will send a request to find a server that contains the app, and the servers that do will respond. THIS HAS A PROBLEM - HOW DO I LOAD BALANCE EXTREMELY POPULAR APPS AS THEY WILL BE ALWAYS BUILT ON THE SAME CONTAINER - HOW CAN I BUILD DIFFERENT VERSIONS OF THAT APP IF IT IS REQUIRED (I could just do it manually ???). When the app is updated also, that update request will be forwarded to ALL of the containers that contain that app. (this means that the webhook should be distributed AND I will only need one "build" route which the webhook can forward to)