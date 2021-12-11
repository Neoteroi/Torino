This page documents more details about the system.

## Considerations regarding access management

The system is thought to be used with Azure Active Directory and not allow
sign-up for new users, however it can be easily modified to be integrated with
other identity providers such as Auth0, Okta, or Azure Active Directory B2C,
and offer sign-up to users. The project includes manifest files to create
app registrations in Azure Active Directory, including Application Roles to
handle authorization in the SPA and the API.

## Requirements to provision an instance of the system

* A GitHub account
* An Azure tenant, with an Azure subscription
* Sufficient rights to create an app registration in the Azure tenant, and
  owner rights on the Azure subscription (required to create the credentials
  for the GitHub agents running the jobs, with `Contributor` role)
* Azure CLI with Bicep extension

## Deployment considerations
The system is currently thought to be deployed in a instance of Azure App
Service for Linux. It can be modified as desired, for example to be packed in
Docker and published in Kubernetes or another kind of service.

The project is structured to support multiple environments and deployments to
environments using dedicated branches, and [reusable
workflows](https://docs.github.com/en/actions/learn-github-actions/reusing-workflows):

| Branch | Environment |
| ------ | ----------- |
| `dev`  | `dev`       |
| `test` | `test`      |
| `prod` | `prod`      |

However, for private use it might be sufficient to provision a single instance
of the system.

## Pricing considerations
The system is configured to use a PostgreSQL database with `Basic` pricing tier
and `Dev/Test` pricing tier for the App Service Plan for the **DEV**
environment, and better services for the `TEST` and `PROD` environments. Adjust
the `Bicep` parameters files as desired, to scale up or down the services. In
the provided configuration, these two services are those generating the bigger
costs.

## Considerations about App Registrations
The recommended way to configure a Single Page Application and an API is to:
* use two app registrations: one of the SPA, one of the API,
* configure the SPA to be a client of the API (e.g. supporting `scopes`),
* authenticate requests on the API using `access_token`s obtained during
  sign-in on the SPA.

## Considerations about Azure subscriptions and credentials
It is recommended to use two Azure subscriptions: one for the non-production
environments, one for the production environment. When using separate
subscriptions, it is possible to configure Azure credentials for the GitHub
Workflows having contributor role scoped for the whole subscription. This has
the benefit that agents can create the resource groups automatically, if they
don't exist, thus reducing the amount of operations that need to be done for
the first time configuration.

Otherwise, if Azure credentials are scoped for exact resource groups, resource
groups must be created before generating the credentials for the GitHub agents.

## Considerations regarding the separation of the SPA and the API
The SPA and the API are completely separated in code. Meaning that they are
developed separately (which is good) and it is possible, for example, to deploy
the SPA in a Azure Storage static website, while having the API in a different
service. However, for simplicity, in the provided configuration the static
files of the SPA are served by the same web application that contains the API.
The clear separation of SPA and API also enable configuring two app
registrations and properly authorize web requests on the API using
`access_token`(s). Again, to keep the "Getting started" guide simple, the
instructions explain how to configure a single app registration having an SPA
platform (thus representing the whole web application: SPA and API together),
rather than having two app registrations and configuring roles.

For a more advanced setup, for example to enable the scenario of a CLI that
provides interactive sign-in and uses the same API of the SPA, it is recommended
to configure separate app registrations and scopes, so that the interactive
sign-in in the SPA obtains an access token for the API (rather than only an
`id_token`).
