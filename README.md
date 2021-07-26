# Markotplace

An online marketplace that allows developers to monetize their online web apps.

-   EXAMPLE: https://api.github.com/repos/BenGOsborn/WASM-Bird/tarball
-   ALSO: curl -v -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/BenGOsborn/WASM-Bird/tarball (look at the redirect location - it has the download (I wonder if this works for private repos too))

## Todo

-   Maybe add a subscription payment system in the future ?
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
-   Make sure that Docker CANNOT build from an existing image (Im probably just going to do a basic regex check on all of the loading statements)
-   Automatically add the app to the dev's users account on creation

-   Just like Heroku - I need a way where my app can create webhooks in users repositories
-   ???? Do cookies work with webhooks ?

- Make the owner and the repo unique and then we will parse according to that OR have a single string
-   \*\*\*\* Use the octokit/core.js INSTEAD of the regular requests via axios (REMOVE AXIOS)

### New dev system

-   Each user has a single github account connected
-   At any time a user should be able to reauthorize their GitHub account which will update their OAuth token and their Username
-   Each app has a single repo to pull from (and uses that users OAuth token - if it doesnt work, then thats just unlucky)
