# API Server
This folder contains the source code of the Torino API,

The code uses dependency injection, and is designed to support PostgreSQL,
SQLite, and Table API as persistence layers for the virtual file system. The
persistence layer is configurable by application settings.

This project uses onion architecture (with three main namespaces to
separate front-end, business logic, and data access layers).

It features OpenAPI Documentation, configuration handling, database migrations
and GitHub Workflows ready to use, to automate the provisioning of required
services and the deployments of the application.

## Getting started
Requirements and recommended tools:

* Python >=3.8
* VS Code
* Azure CLI

## Structure

| Package    | Description                             |
| ---------- | --------------------------------------- |
| app        | front-end layer                         |
| domain     | domain classes and business logic layer |
| data       | data access layer                       |
| core       | common classes                          |
| migrations | database migrations                     |
