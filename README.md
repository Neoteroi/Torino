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

| Mode        | Description                                                                                                                                                                                                                                                                                                                      | Use case                                                                                                                                                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Express** | It only requires credentials to an Azure Storage Account, having CORS enabled for the Blob Service. By default it uses the Table API in the Storage Account to store information for the virtual file system, but it can be configured to use a SQLite database. Can be started within seconds, using the provided Docker image. | Ideal for personal use and to try Torino, doesn't generate any cost, besides the storage account. It is also possible to enable Application Insights on the service.                                                                                                                                                                         |
| **Normal**  | A full web application integrated with Azure Active Directory, using Application Insights, alerts configuration, and a PostgreSQL database. It requires configuring app registrations in Azure Active Directory, secrets in GitHub for the first deployment.                                                                     | Ideal to have a media storage accessible at a public URL, requiring authentication, that can be shared with other people. Generates costs: in the provided configuration, especially for the Azure Database for PostgreSQL and the App Service Plan (of course, the app can be modified to be hosted in Docker and other kinds of services). |

---

The project is a work-in-progress and by no mean complete. However, Torino is
ready for use and provides complex features:

* Ability to run a Docker container, requiring only a Storage Account (Express
  mode)
* A single page application front-end built using modern technologies:
  TypeScript, HTML5, SASS, React; offering folders view, features to
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

The fastest way to try Torino in Express mode is using the provided Docker
image:

```bash
docker run -p 8080:80 \
  -e APP_STORAGE_ACCOUNT_NAME="<NAME>" \
  -e APP_STORAGE_ACCOUNT_KEY="<KEY>" \
  roberto.prevato/torino
```

The system in Express mode runs without users' authentication, and can be
immediately used to start creating containers and uploading files to the
storage.

# Normal mode

Using the system in Normal mode provides the full set of features implemented
in the system, but it requires going through several configuration steps, for
the first-time setup.

## How to provision an instance of the system in normal mode

The following instructions provide an overview of the necessary steps to use
all the features provided in this repository.

1. Fork this project
2. GitHub reusable workflows require paths to a specific organization,
   therefore update the provided `.github/workflows/infrastructure.yml` and
   `.github/workflows/server.yml` to point to your account's name; update the
   `uses` property of the deployment stages:

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

4. Create Azure credentials to enable automated deployments from GitHub
   Workflows, refer to this documentation for more information: <br>
   [Deploy to App Service using GitHub
   Actions](https://docs.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=applevel#generate-deployment-credentials)

5. Create the necessary app registrations in Azure Active Directory. The folder
   `infrastructure/apps` contains an example bash script that can be used to
   create the app registrations for the API and the SPA, including application
   roles handled by the system. Once the applications are created:
   + Configure the API app registration to _expose an api_, and the SPA app
     registration to use that API
   + Refer to this documentation for more information on how to expose an API:
     + [Quickstart: Configure an application to expose a web
       API](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis)
     + [Quickstart: Configure a client application to access a web
       API](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-access-web-apis)
   + API scope and SPA client ID must be configured in the SPA's `settings.js` under `ui` folder
   + Configure the API client ID and audience in the YAML settings of the
     web service, under `server` folder
     + Note: it is possible to use several `settings.$APP_ENV.yaml` files, the
       right file is read when the application starts depending on the
       following env variable: `APP_ENV`

```yaml
# EXAMPLE
auth:
  audience: api://e9ee7140-519d-458c-9621-0b3e110ea5a3
  issuer: https://sts.windows.net/b62b317a-19c2-40c0-8650-2d9672324ac4/
```

6. Configure GitHub secrets like described in [Configuring GitHub Actions](./docs/configuring-github-actions.md)

7. Once secrets are configured in GitHub, it is possible to run the
   infrastructure pipeline, to provision the `dev` environment of the system.
   This workflow is configured to be run manually (`workflow_dispatch`).

8. Once the Azure services are created for an environment (e.g. `dev-example-rg`),
   it is possible to create a `GitHub` release referencing the `dev` branch to
   trigger a deployment of the web application in the resource group.
   In the provided configuration, the SPA is served by the same web application
   that offers the API, this can be modified as desired.

---
