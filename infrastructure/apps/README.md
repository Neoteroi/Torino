# App registrations
This folder contains scripts and useful information to configure the app
registrations in Azure, for the service.

## Quick reference

List applications by display name:

```bash
az ad app list --display-name "Demo API"
```

Show details by id (object id):

```bash
az ad app show --id "c6df2fb6-a7c7-48c2-b24a-83639eabd0fe"
```

Create a new app:

```bash
az ad app create --display-name "Demo API" --app-roles @api-manifest.json
```

Update an app:

```bash
az ad app update --id "c6df2fb6-a7c7-48c2-b24a-83639eabd0fe" --app-roles @api-manifest.json
```

## References

* https://docs.microsoft.com/en-us/cli/azure/ad/app?view=azure-cli-latest
