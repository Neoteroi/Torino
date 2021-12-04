# ARM templates for infrastructure deployment

This folder contains files that are used to provision Azure services that are
required by the system. They are ready for a Python web service using
PostgreSQL, having telemetries collected by Application Insights, and including
a Storage Account that can be used to store files (Blob Service) or NOSQL tabular
data (Table Service).

# Introduction

The provided ARM template uses `parameters` and `variables` to apply a naming
convention that enables creating services for various environments: `dev`,
`test`, and `prod`. Public parameters can be stored in
`parameters.{ENV_NAME}.json` files.

The template is also configure the necessary application settings for the
application server, including credentials to connect to the PostgreSQL
database.

The template is configured to not store any secret. They need to be provided
safely during a CD pipeline (in this example project, using GitHub secrets).

## How to run a deployment locally

To test the deployment of the ARM templates using the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli):

1. do login (`az login`)
2. select the desired Azure subscription (`az account set --subscription "NAME"`)
3. choose the name of the resource group, for example "dev-example-rg"
4. create the resource group, in the desired Azure location
5. run a deployment on the resource group

```bash
ENV=dev
PROJECT_NAME=example
RG="$ENV-$PROJECT_NAME-rg"

# create the resource group:
az group create --name $RG --location "westeurope"

# run the deployment:

az deployment group create --resource-group $RG --parameters @parameters.$ENV.json --parameters projectName=$PROJECT_NAME dbAdministratorLoginPassword=$DB_PASS --template-file template.bicep
```

Note that a project name must be overridden because the provided project name
can be already taken.

Being able to run deployments outside of CI/CD pipelines is also useful
when developing the configuration files for services (to remove the wait time
for pushing changes and for build agents to pick up jobs).

## Included services

| Service              | Description                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App Service Plan     | This is the service that hosts the application service. Note that it's possible to deploy several applications servers to the same App Service Plan, but this ARM template deploys a single app server. |
| Application Insights | Service used to collect telemetries such as server response times, failed requests, performance of dependencies, unhandled exceptions.                                                                  |
| App Service          | This is the application service itself, where the application code is deployed.                                                                                                                         |
| PostgreSQL           | Managed instance of Azure Database for PostgreSQL.                                                                                                                                                      |
| Storage Account      | Service that, for example, can be used to store files (Blob Service), or NoSQL tabular data (Table Service).                                                                                            |

---

## Deployments considerations
Even though it would be possible to pack the Python server in a Docker
image, and deploy it to an Azure App Service using Docker, this project deploys the
Python application code directly, using one of the supported runtimes. Both
approaches have positive and negative sides.

At the time of this writing, the latest supported Python version is still
`Python 3.8`, which is one of the versions supported by `BlackSheep`.

To list the available runtimes for Linux, use:

```bash
az webapp list-runtimes --linux
```

---

Deployments are automated using GitHub Actions.

Recommended reads:
* [Using GitHub Actions for Python Applications](https://azure.github.io/AppService/2020/12/11/cicd-for-python-apps.html)
* [Nylas - How We Deploy Python Code](https://www.nylas.com/blog/packaging-deploying-python/)

## Pricing considerations

The ARM template is configured to limit the amount of generated costs,
and to support different service tiers by environment.
Adjust the services' pricing tier and settings as desired, referring to the
parameters files for TEST and PROD to know which settings impact on pricing.

## References

* [Deploy ARM templates by using GitHub Actions](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-github-actions)
* [Python web app on Azure](https://github.com/Azure/actions-workflow-samples/blob/master/AppService/python-webapp-on-azure.yml)

## TODOs

> Note: Azure ARM templates for dbs generally allow to
> configure the dba password. It is recommended to improve the ARM template and
> release pipeline to automatically configure a user with lower privileges for
> the application server. Most examples for Azure don't include this important
> feature (e.g. see https://github.com/Azure/azure-quickstart-templates).

* Configure a DB user for the application server with limited privileges
* Enable slots, depending on the App Service Plan SKU (e.g. the DEV environment
  can use a cheaper service that doesn`t support staging slots, while TEST and
  PROD environments should support this). Improve the deployment of the app
  server to use staging slots and
* Configure alerts for Application Insights
* Configure health check for Application Insights
