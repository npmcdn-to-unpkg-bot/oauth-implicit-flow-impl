This is just a tryout to check out how to do oauth login via an iframe.
conclusion: possible, but troublesome: You need to remove set x-frame options SAMEORIGIN / DENY.
Maybe try to use a popup window? (and save the response to sessionStorage ->eventlistener) 

To run the 'demo'
(you have to have npm and docker installed on you system)

To start a authentication server:
docker run -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin jboss/keycloak-examples

npm install -g typescript http-server

npm run build

http-server .

go to http://localhost:8080/demo

ps:
remove in keycloak in the realmsettings->security defenses the x-frame-options.
enable in clients->angular2-product implicit flow.
login with stian/password. (when using hte keycloak-examples image)

docker ps
docker inspect -f {{.NetworkSettings.IPAddress}}

http://172.17.0.2:8080/auth/realms/demo/.well-known/openid-configuration