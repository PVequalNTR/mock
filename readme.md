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
- test
  - test file for k6

## variable naming

- sanitize
  delete unnecessary data to avoid sending something confidential to user
- cleanValue
  value which has no possibility to inject the database

## setup

1. download nginx and use the ``nginx.conf`` in the root folder
2. launch nginx and deno@v1.13.2
3. ready to go(although I am too lazy to update the api file, which is too stale now)

## more

if you want a muti machine application, you can 
1. edit``.env``file
```
ENVIRONMENT=development
PORT=3000
# make sure it's in network disk for muti machine
STORAGE_PATH=db/tmp/
# postgresql if muti machine
SQL_TYPE=sqlite
# make sure not NULL for postgresql
SQL_DATABASE=NULL
SQL_HOST=NULL
SQL_USERNAME=NULL
SQL_PASSWORD=NULL
SQL_PORT=NULL
# change password
DEFAULT_NAME=admin
DEFAULT_PASSWORD=password
TOKEN_TTL=7200000
HASH_TABLE=Xyju4NsGxfrJC6knwgP1i0W7vTB2R3KHocOpadZYmQqFIVltUEDLSzMh8e5Ab
```

Disclaimer: I didn't test it because docker get bad compatibility on ``arm64``