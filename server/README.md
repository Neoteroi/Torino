# API Server
Project template for an API to deploy in Azure Application Service, connected
to a PostgreSQL database from SaaS offering.

This project template uses onion architecture (with three main namespaces to
separate front-end, business logic, and data access layers).

It features OpenAPI Documentation, configuration handling, database migrations
and GitHub Workflows ready to use, to automate the provisioning of required
services and the deployments of the application.

## Getting started
Requirements and recommended tools:

* Python 3.8
* VS Code
* Azure CLI

## Structure

| Package    | Description                                       |
| ---------- | ------------------------------------------------- |
| app        | front-end layer                                   |
| logic      | business logic layer                              |
| data       | data access layer                                 |
| core       | common classes that are abstracted from any layer |
| migrations | database migrations                               |
