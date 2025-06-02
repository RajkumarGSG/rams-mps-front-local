# Maintenance planning (frontend)
> A Vue.js project

## Table of contents

1. [Database structure](database/index.md)
2. [Endpoints/queries (prev)](endpoints/index.md)
3. [Roads list](roadsdata/index.md)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serve

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Building using Docker

- 1. Make sure you have installed `docker` and `docker-compose`
- 2. Clone the repository and navigate to the directory
- 3. Run `./build.sh` (builds a new container, if none exists, and executes `npm run build` inside it)

This container is only for building the app, not serving it. The output is found in the `dist` folder.