# Bestof.js.org micro-services built with webtask.io

node.js micro-services used by [bestof.js.org](http://bestof.js.org/#/) web application.

Each "webtask" is either a plain JavaScript function either or a basic Express web server deployed on webtask.io.

[![Build Status](https://semaphoreci.com/api/v1/projects/330c44cc-8058-49f8-b3bb-0b98c5cb09d6/559441/badge.svg)](https://semaphoreci.com/mikeair/microservices)

## User content API

Express web server used to read and write content generated by users:

* Github project reviews (user's rating and opinion about projects)
* Github project links (resources related to projects: tutorials, blog entries...)

### File system

* `src/server.js`: local Express web server
* `src/webtask.js`: entry point to build the file deployed to webtask.io using Webpack
* `build/webtask.js`: bundled webtask built by Webpack, ignored by git

### URLs

* GET `/reviews/`
* POST `/reviews/`
* PUT `/reviews/:id`

* GET `/links/`
* POST `/links/`
* PUT `/links/:id`

### Local test

Start the local Express web server on port 3000

```
npm start
```

### Deploy on webtask.io

STEP 1: build a single file from source files, using Webpack

```
npm run build
```

STEP 2: Create / Update the webtask, using `wt-cli` command line tool

```
npm run deploy
```

This command will display the webtask URL, when the deploy is completed.
