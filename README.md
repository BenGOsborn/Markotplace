# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Change name appengine to containermanager AND move to a Python (with types) SOCKS5 reverse proxy (that or explore NAT / PAT options)
-   SECURITY PROBLEM: if someone draws from my base image, they can start their own version of it and copy the source code for it (SECURE THESE APPS) (I should use a hash for the docker images and run them that way ?)
-   Maybe add a subscription payment system in the future ?
-   \*\*\*\*Problem with current setup - ANYONE can just access the game on the port WITHOUT authentication
-   **I reckon that a simple reverse proxy will work if the user specifies the absolute path to their request each time even with different protocols**
-   App engine can probably be changed so that it sets the name of the container instead of using the container ID
-   \*\*\*\* Some things that are not necessary SHOULD not do any caching (especially if it is dangerous)
-   Instead of using Nginx as a main load balancer, use DNS for different servers on the network via stuff like user.website.com instead of website.com
-   Limit Docker resources - also maybe use Docker pause instead of kill and start all the time - https://docs.docker.com/config/containers/resource_constraints/
-   Maybe rebrand the entire app for gamers specifically
-   Add support for Unity and other game engines that make web apps
-   FIx up OAuth redirect URL in github app
-   Make a blog helping developers to make apps for our site

## Immediate

-   Maybe in the case of caching, instead of clearing the cache, I should instead UPDATE the cache after an update
-   How do I set up customers for future payments too ? - https://stripe.com/docs/payments/save-during-payment (default payment source on card ?)

### New dev system

-   Each user has a single github account connected
-   At any time a user should be able to reauthorize their GitHub account which will update their OAuth token and their Username
-   Each app has a single repo to pull from (and uses that users OAuth token - if it doesnt work, then thats just unlucky)
