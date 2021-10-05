# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Maybe add a subscription payment system in the future ?
-   Maybe rebrand the entire app for gamers specifically
-   Make a blog helping developers to make apps for our site (like Unity and for other game engines)
-   Add some way of ranking the apps to build based on the number of users who own them along with the app data (store this as a part of the app data), this would also allow us to keep forwarding the same user to the same app for keeping track of state if it worked like that
-   Add analytics tracking
-   Rebuild frontend with tailwindcss + fix the html tag types (e.g. turn h1's into h2's etc) and seperate into components
-   Maybe make the .env files contain some of the ports for the docker compose as well which then affect the nginx configs ???
-   Look at all instances of cacheData and check if I can use a different identifier for something (and clear cache) (ESPECIALLY LOOK FOR CACHE CLEARS)

## Known vulnerabilities

-   Make sure on a payment webhook, multiple requests cant be inserted (can this even occur with a many to many relationship?)
-   Look at ways people could break the naming / parsing system
-   Encrypt the app ID's so noone can use them usinbg the secret key ?
-   Users could possibly repeat the Stripe webhooks and keep adding the same app to their account (could they though and who cares ?)

## Immediate

-   One of my apps failed to start (maybe look into the updating tool ?) (could be to do with the build times ?)
-   Try and looking at all .find instances and try and cache some of them
-   Make a new production non-root user for the app to run on
-   Forward www to non www
-   GitHub actions auto deployment
-   Hostnames do not contain port ??? (maybe change that from hostname to domain name or something)
