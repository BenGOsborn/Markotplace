# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Maybe add a subscription payment system in the future ?
-   Maybe rebrand the entire app for gamers specifically
-   Make a blog helping developers to make apps for our site (like Unity and for other game engines)

## Known vulnerabilities

-   Make sure on a payment webhook, multiple requests cant be inserted (can this even occur with a many to many relationship?)
-   Could Docker files hack our system by mounting volumes within the container ?
-   Look at ways people could break the naming / parsing system
-   Encrypt the app ID's so noone can use them usinbg the secret key ?
-   Users could possibly repeat the Stripe webhooks and keep adding the same app to their account

## Immediate

-   One of my apps failed to start (maybe look into the updating tool ?)
-   Maybe I should also cache some of the dev info ?
-   Look at all instances of cacheData and check if I can use a different identifier for something (and clear cache)
-   Try and looking at all .find instances and try and cache some of them
-   Make all pages fixed to a minimum height for the footer to work ?

## Better load balancer

-   Add in the Upgrade header for websockets for nginx and my proxy + test proxies with websockets
-   A better way of load balancing the apps - the appbuilder and appmanager will be one big container - these can be distributed across different systems. When a request is made to build an app, this will be load balanced, and the container will keep a record of which appnames correspond with each container. Then when a request is made to get the app, another reverse proxy will send a request to find a server that contains the app, and the servers that do will respond. THIS HAS A PROBLEM - HOW DO I LOAD BALANCE EXTREMELY POPULAR APPS AS THEY WILL BE ALWAYS BUILT ON THE SAME CONTAINER - HOW CAN I BUILD DIFFERENT VERSIONS OF THAT APP IF IT IS REQUIRED (I could just do it manually ???). When the app is updated also, that update request will be forwarded to ALL of the containers that contain that app. (this means that the webhook should be distributed AND I will only need one "build" route which the webhook can forward to)
-   Fix up the PORT issue and load balancing for the apps and too many ports
-   Each app monitor should have a way of automatically building the containers on its system in its spare time (from most used to least used), and can run off a versioning system, and can prioritize different builds above others based on how popular they are being
-   I can just have one instance of the app which makes sure to keep up to date, and then I can just scale the PC. OR, if I decide to load balance it, it should be able to keep itself up to date with the current database in regards to building, building on demand, starting containers and handling them properly
