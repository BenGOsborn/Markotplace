# Markotplace

An online marketplace that allows developers to monetize their online web apps.

## Todo

-   Change name appengine to containermanager
-   Third party GitHub app integration
-   Implement auth + auth redirection systems for other apps + auth Image in Docker compose
-   Using Prisma across different microservices / sharing schema and deploying to production without rebuilding
-   Make some sort of shared utils
-   Instead of using a proxy, forward the request using a get / post request method to the specified port then return that request (how do I implement UDP or websockets ?)
-   Auth with Nginx - https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/

DB Schema:
id Int @default(autoincrement()) @id
username String @unique
email String @unique
password String
