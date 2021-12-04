# Torino
Torino is a media storage explorer for Azure created by [Roberto Prevato](https://github.com/RobertoPrevato),
consisting of:

* a back-end API built with BlackSheep, using a PostgreSQL database in Azure
  and other services to provide the storage functionalities
* a front-end Single Page Application enabling interactive sign-in, offering
  administrative features to configure containers of files and features to
  navigate through the files

Using this project is possible to provision a private media storage in Azure,
in a few minutes. :sparkles: :cake:

---

The project is a work-in-progress and by no mean complete, for example at the
current state it lacks support for resizing videos, the PostgreSQL database is
not locked inside a VNet and is protected only by firewall rules and passwords.
However, Torino is already an advanced product featuring:

* CI/CD automation using GitHub Workflows, reusable workflows to handle
  multiple environments, and a branch strategy to handle multiple environments
* Bicep templates to provision the required Azure services, with automated
  deployments
* A single page application front-end built using modern technologies:
  TypeScript, HTML5, SASS, React; offering folders view, gallery, features to
  display pictures, play MP3s and videos
* A clean API offering OpenAPI Documentation and supporting OpenID Connect
* Support for access management using JWT Bearer authentication and Application
  Roles
* Safe handling of private files (access to files is controlled using temporary
  shared access signatures for the Azure Blob Service)
* Resizing of pictures, supporting common pictures formats
* Logs collected using Application Insights, including detailed informations
  about dependencies like queries made by SQLAlchemy on the PostgreSQL db
* Database migrations handled using Alembic, and ORM provided by SQLAlchemy

Since the project is open source and includes automation, it can be easily
enhanced with the desided features.

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
Service. It can be modified as desired, for example to be packed in Docker and
published in Kubernetes or another kind of service.

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

## Considerations about Azure subscriptions and credentials
It is recommended to use two Azure subscriptions: one for the non-production
environments, one for the production environment. When using separate
subscriptions, it is possible to configure Azure credentials for the GitHub
Workflows having contributor role scoped for the whole subscription. This has
the benefit that agents can create the resource groups automatically, if they
don't exist, thus reducing the amount of operations that need to be done for
the first time configuration.

Otherwise, if Azure credentials are scoped for exact resource groups, the
resource groups must be created before generating the credentials for the
GitHub agents.

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
   once the project name)

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
In code, the SPA and the API are completely separated. Meaning that is it
possible to (TODO...)
