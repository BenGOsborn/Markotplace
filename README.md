# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Maybe add a subscription payment system in the future ?
-   Maybe rebrand the entire app for gamers specifically
-   Make a blog helping developers to make apps for our site (like Unity and for other game engines)
-   Add some way of ranking the apps to build based on the number of users who own them along with the app data (store this as a part of the app data)
-   Add analytics tracking

## Known vulnerabilities

-   Make sure on a payment webhook, multiple requests cant be inserted (can this even occur with a many to many relationship?)
-   Could Docker files hack our system by mounting volumes within the container ?
-   Look at ways people could break the naming / parsing system
-   Encrypt the app ID's so noone can use them usinbg the secret key ?
-   Users could possibly repeat the Stripe webhooks and keep adding the same app to their account

## Immediate

-   One of my apps failed to start (maybe look into the updating tool ?) (could be to do with the build times ?)
-   Look at all instances of cacheData and check if I can use a different identifier for something (and clear cache) (ESPECIALLY LOOK FOR CACHE CLEARS)
-   Try and looking at all .find instances and try and cache some of them
-   Add in the metadata
-   Add in better
-   Fix footer
-   Auto deployment system (using some easy to use application)
