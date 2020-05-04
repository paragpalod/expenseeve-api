# expenseeve-api

A expense management application

## Info

1. Langauge :- Javascript
2. Envirnoment :- Node Js
3. Framework :- [Hapi Js]( https://hapi.dev/api/?v=18.4.1 )

## Development Envirnoment Setup

1. Install eslint package in your IDE or Text Editor

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

## Start Command :- npm start
