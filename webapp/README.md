String2string webapp
=========

Prerequisites
---------------
- [Node.js](http://nodejs.org)
- [Bower](http://bower.io/)
- [Sass](http://sass-lang.com/)

Getting Started
---------------

Run these commands before starting server (only need to do once):
```
npm install
bower install
sass public/css/main.scss > public/css/main.css
```
One <b>must</b> also edit the settings in public/js/app.js and set the $rootScope.baseUrl to the address of the webserver
This will enable the websockets to connect to the correct server.

to run server:
```
node app.js
```
<b>point the browser to localhost:3000 to visit the site</b>
