# Torino
Torino is a media storage explorer for Azure created by [Roberto Prevato](https://github.com/RobertoPrevato),
consisting of:

* a back-end API that provides the necessary features to
  handle storage containers and a virtual file system
* a front-end Single Page Application that provides
  an administrative interface to configure containers, upload files,
  navigate through the virtual file system files, and also
  interactive sign-in through Azure Active Directory

Using this project is possible to provision a private media storage in Azure,
in a few minutes. :sparkles: :cake:

Torino provides two working modes: **Express** and **Normal**.

| Mode        | Description                                                                                                                                                                                                                                                                                   | Use case                                                                                                                                                                                                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Express** | Doesn't require any setup, it only requires credentials to an Azure Storage Account. Uses a SQLite database. Can be started within seconds, using the provided Docker image.                                                                                                                  | Ideal for personal use and to try Torino, doesn't generate any cost.                                                                                                                                                                                                                                                                         |
| **Normal**  | A full web application integrated with Azure Active Directory, using Application Insights, alerts configuration, and a PostgreSQL database. It requires configuring app registrations in Azure Active Directory, secrets in GitHub for the first deployment, and using an Azure Subscription. | Ideal to have a media storage accessible at a public URL, requiring authentication, that can be shared with other people. Generates costs: in the provided configuration, especially for the Azure Database for PostgreSQL and the App Service Plan (of course, the app can be modified to be hosted in Docker and other kinds of services). |

---

The project is a work-in-progress and by no mean complete. However, Torino is
ready for use and provides complex features:

* Ability to run a Docker container, requiring only a
  Storage Account (Express mode)
* A single page application front-end built using modern technologies:
  TypeScript, HTML5, SASS, React; offering folders view, gallery, features to
  display pictures, play MP3s and videos
* A clean API offering OpenAPI Documentation and supporting OpenID Connect
* CI/CD automation using GitHub Workflows, reusable workflows and a branch
  strategy to handle multiple environments
* Bicep templates to provision the required Azure services, with automated
  deployments
* Access management using JWT Bearer authentication (tokens issued by Azure
  Active Directory)
* Safe handling of private files: access to files is controlled using temporary
  shared access signatures for the Azure Blob Service
* Resizing of pictures, supporting common pictures formats
* Logs collected using Application Insights, including detailed informations
  about dependencies, like queries made by SQLAlchemy
* Database migrations handled using Alembic, and ORM provided by SQLAlchemy
  (uses code-first and has built-in support for PostgreSQL and SQLite)

Since the project is open source and includes automation, it can be easily
modified and enhanced with the desided features.

# Express mode

The recommended way to try Torino in Express mode is using the provided Docker
image:

```bash
docker run -p 8080:8080 \
  -e APP_STORAGE_ACCOUNT_NAME="<NAME>" \
  -e APP_STORAGE_ACCOUNT_KEY="<KEY>" \
  roberto.prevato/torino
```

Otherwise, it is necessary to clone the repository, prepare a Python virtual
environment, build the single page application using `yarn`.

# Normal mode

Using the system in Normal mode provides the full set of features implemented
in the system, but it requires going through several configuration steps, for
the first-time setup.

* Requires forking the project or using the template feature
* Secrets must be configured

<!--
* access management using Azure Active Directory
* interactive sign-in in the SPA
* JWT Bearer authentication in the API
* application telemetries using Azure Application Insights
* data stored in a managed Azure Database for PostgreSQL
* CI/CD using GitHub Workflows
-->

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
The best way to configure a Single Page Application and an API is to:
* use two app registrations: one of the SPA, one of the API,
* configure the SPA to be a client of the API (e.g. supporting `scopes`),
* authenticate requests on the API using `access_token`s obtained during
  sign-in on the SPA.

However, for simplicity during the first set-up, the instructions show how
to configure a single app registration used both by the SPA and the underlying
API. **TODO???**

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

## How to provision an instance of the system

1. Create a copy of this project, using `fork` or the `Use this template`
   features
2. GitHub reusable workflows require paths to a specific organization, therefore
   update the provided `.github/workflows/infrastructure.yml`
   and `.github/workflows/server.yml` to point to your account's name;
   update the `uses` property of the deployment stages:

```yaml
  deploy-dev:
    needs: build-app
    if: github.ref == 'refs/heads/dev'
    uses: <ACCOUNT or ORG>/<PROJECT>/.github/workflows/server-env.yml@dev
```

3. Choose a project name, for example if you chose `pincopallo`, update the
   workflow files to use `pincopallo` instead of `torino` (note that a bug in
   the GH reusable workflows doesn't allow to use dynamic input from env
   variables for called workflows, therefore it is necessary to write more than
   once the project name [ref.
   1](https://github.community/t/reusable-workflow-env-context-not-available-in-jobs-job-id-with/206111),
   [ref. 2](https://github.com/actions/runner/issues/480))

1. Create Azure credentials to enable automated deployments from GitHub Workflows.
   If you decide to use credentials scoped over exact resource groups, you will
   need to create the resource groups before creating the credentials.
   Using the Azure CLI

2. Create the necessary app registrations in Azure Active Directory (examples
   are provided below using the Azure CLI and manifests provided in this
   repository) + Configure yourself as ADMIN!
   + Configure the APPLICATION ID as setting!! TODO

3. Generate secrets that will be used when configuring the PostgreSQL database:
   these are configured as GitHub Secrets

4. Once secrets are configured in GitHub, it is possible to run the
   infrastructure pipeline, to provision the `dev` environment of the system.
   **Run the Infrastructure deployment manually** (TODO)

5. Run the `Server deployment` manually (TODO)


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
