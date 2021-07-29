# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Maybe add a subscription payment system in the future ?
-   Limit Docker resources - also maybe use Docker pause instead of kill and start all the time - https://docs.docker.com/config/containers/resource_constraints/
-   Maybe rebrand the entire app for gamers specifically
-   Make a blog helping developers to make apps for our site (like Unity and for other game engines)

## Immediate

-   Maybe in the case of caching, instead of clearing the cache, I should instead UPDATE the cache after an update
-   How do I set up customers for future payments too ? - https://stripe.com/docs/payments/save-during-payment (default payment source on card ?)

-   Use Gunicorn
-   Set better limits for Docker containers on build
-   Reorganize project directories once the project is setup
-   Run frontend on a seperate network than API

-   A better way of load balancing the apps - the appbuilder and appmanager will be one big container - these can be distributed across different systems. When a request is made to build an app, this will be load balanced, and the container will keep a record of which appnames correspond with each container. Then when a request is made to get the app, another reverse proxy will send a request to find a server that contains the app, and the servers that do will respond. THIS HAS A PROBLEM - HOW DO I LOAD BALANCE EXTREMELY POPULAR APPS AS THEY WILL BE ALWAYS BUILT ON THE SAME CONTAINER - HOW CAN I BUILD DIFFERENT VERSIONS OF THAT APP IF IT IS REQUIRED (I could just do it manually ???). When the app is updated also, that update request will be forwarded to ALL of the containers that contain that app. (this means that the webhook should be distributed AND I will only need one "build" route which the webhook can forward to)
-   Fix up the PORT issue and load balancing for the apps and too many ports
- Each app monitor should have a way of automatically building the containers on its system in its spare time (from most used to least used), and can run off a versioning system, and can prioritize different builds above others based on how popular they are being
