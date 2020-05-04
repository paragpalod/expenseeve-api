# expenseeve-api

A expense management node application to compliment with the [expenseeve-app](https://github.com/paragpalod/expenseeve-app) front end.

All the information related to API is provided in this file, and information related to APP is provided in [expenseeve-app](https://github.com/paragpalod/expenseeve-app)

## Folder Structure and Explaination

```bash
.
├── server
|   ├── authStrategy
|   |   └── auth.js
|   ├── config
|   |   ├── index.js
|   |   └── server.js
|   ├── models
|   |   ├── administrator
|   |   |   └── user.js
|   |   ├── authetication
|   |   |   └── session.js
|   |   ├── core
|   |   |   ├── category.js
|   |   |   └── expense.js
|   |   └── index.js
|   ├── routes
|   |   ├── api
|   |   |   ├── administrator
|   |   |   |   └── user.js
|   |   |   └── authetication
|   |   |   |   ├── auth.js
|   |   |   |   └── signup.js
|   |   |   └── core
|   |   |       ├── category.js
|   |   |       └── expense.js
|   |   └── index.js
|   ├── utils
|   |   └── index.js
|   └── index.js
├── .gitignore
├── LICENCE
├── pakage-lock.json
├── package.json
└── README
```

## Project Explaination

**./Server**:- this folder contails all the APIs, Database Models, utils Functions and config information

**./Server/authStrategy**:- this folder contails authorization strategies plugins currently i created default plugin which will be used at every request

**./server/config**:- this folder contails configuration info about modules, server and secret key.

**./server/models**:- this folder contails schema of modules (user, session ,etc) 

**./server/routes**:- this folder contails all the APIs

**./server/utils**:- this folder contailns  functions required for application

**./server/index.js**:- this file is entry point for application everythinsg is integrated here

**./.gitignore**:- this file is used t=for ignoring files and folders while making comments

**./LICENCE**:- MIT licence added in this project

**./package.json**:- this file contains project info , eslint confi info (Standered Configuration), nodemon config, dependncies and devdependan

**./README.md**:- You are currently reading this file

## Platform and Editor
I have used Fedora 31 workstation (64 bit) for development and testing. I used Atom text editor.

## Technologies/Libraries Used

1. Javascript
2. Node Js
3. [Hapi Js](https://hapi.dev/api/?v=19.1.1#route-options)
4. jsonwebtoken
5. mongoose js
6. Mongo Db

Instructions
--------------
Please follow these instructions for running the application.

###### API
- [] install mongodb, node js , npm on your machine
- [] Clone expenseeve-api repo from github.com/paragpalod/expenseeve-api
- [] Install all the dependancies and devedependancies uaing ```npm install``` or ```npm i```
- [] start the server using ```npm start```
