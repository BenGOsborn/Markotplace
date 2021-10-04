# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Maybe add a subscription payment system in the future ?
-   Maybe rebrand the entire app for gamers specifically
-   Make a blog helping developers to make apps for our site (like Unity and for other game engines)
-   Add some way of ranking the apps to build based on the number of users who own them along with the app data (store this as a part of the app data), this would also allow us to keep forwarding the same user to the same app for keeping track of state if it worked like that
-   Add analytics tracking
-   Rebuild frontend with tailwindcss

## Known vulnerabilities

-   Make sure on a payment webhook, multiple requests cant be inserted (can this even occur with a many to many relationship?)
-   Look at ways people could break the naming / parsing system
-   Encrypt the app ID's so noone can use them usinbg the secret key ?
-   Users could possibly repeat the Stripe webhooks and keep adding the same app to their account (could they though and who cares ?)

## Immediate

-   One of my apps failed to start (maybe look into the updating tool ?) (could be to do with the build times ?)
-   Look at all instances of cacheData and check if I can use a different identifier for something (and clear cache) (ESPECIALLY LOOK FOR CACHE CLEARS)
-   Try and looking at all .find instances and try and cache some of them
-   Add in https via letsencrypt docker (add setup SSL in deploy script)
-   Auto deployment system (using some easy to use application)
-   GitHub actions auto deployment

-   Change the .env files to have the domain name instead of the URL for the frontend and backend and then use that with NGINX and the deployment scripts
-   Update the dev environment to use the same ports as the .env files
-   Make a new user for the app to run on

-   The problem is that the template is not being filled out by docker compose properly - it is unclear why (update the dev version of docker compose too)
-   It seems that the 'command' is preventing nginx from running the template script - how can I work around this
-   Maybe consider changing from frontend hostname to backend host name ???? (because now the backend is not getting the certificate properly ?)
