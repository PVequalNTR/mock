# deno practice
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Eason0729_nsd&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Eason0729_nsd)

## root file summary

- dockerFile
- .env
- dev.json
  openapi file, but it's not up to date.
- deps.ts
  dependencies for cache

## dictionary summary

- db
  - litesql file
  - litesql tool(included gitignore)
  - `db.ts`
- db/models
  - database model
  - pivot model
- models
  - tools to get in touch with database
- routes
  - api routes,
    frontEnd are expected to be another project
- script
  - script for server
- utils
  - some other file...

## variable naming

- sanitize
  delete unnecessary data to avoid sending something confidential to user
- cleanValue
  value which has no possibility to inject the database

## setup

1. download nginx and use the ``nginx.conf`` in the root folder
2. launch nginx and deno@v1.13.2
3. ready to go(although I am too lazy to update the api file, which is too stale now)