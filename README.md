String2string
=========

Prerequisites
---------------
- [Node.js](http://nodejs.org)
- [Bower](http://bower.io/)
- [Sass](http://sass-lang.com/)

Getting Started
---------------

run these commands before starting server (only need to do once):
```
npm install
bower install
sass public/css/main.scss > public/css/main.css
```
also must edit the settings in public/js/app.js and set the $rootScope.baseUrl to the address of the webserver

to run server:
```
node app.js
```
#point the browser to localhost:3000 to visit the site