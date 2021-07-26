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
-   Make sure that Docker CANNOT build from an existing image (Im probably just going to do a basic regex check on all of the loading statements)
-   \*\*\*\* Use the octokit/core.js INSTEAD of the regular requests via axios (REMOVE AXIOS)
-   Move some common functions into their own library and misc utils file
-   Change ALL of the URL's embedded in the apps to their Docker compose versions
-   CORS in Python and Go ???

-   Find a way to have the same repo accross different apps ? (maybe when we register a webhook, the ID of the hook will be returned to us on creation AND when a webhook is sent for identification) (this would remove the unique problem)
-   Add the branch option to the app

- Change NODE_ENV to ENVIRONMENT
- Change all listings of site url to the env variable
