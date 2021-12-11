@description('App registration client id.')
param appClientId string = '00000000-0000-0000-0000-000000000000'

@description('Tenant ID.')
param tenantId string = '00000000-0000-0000-0000-000000000000'

@minLength(2)
param projectName string = 'demo'

@allowed([
  'dev'
  'test'
  'prod'
])
param environment string = 'dev'

@description('Location for all resources.')
param location string = resourceGroup().location

@description('The SKU of App Service Plan.')
param appServicePlanSku string = 'B1'

@description('AlwaysOn on website')
param appServiceAlwaysOn bool = true

@description('The Runtime stack of current web app')
param linuxFxVersion string = 'PYTHON|3.8'

@description('Storage Account Type')
@allowed([
  'Standard_RAGRS'
  'Standard_LRS'
  'Standard_GRS'
  'Standard_ZRS'
  'Premium_LRS'
])
param storageAccountType string = 'Standard_LRS'

@description('Database administrator password')
@minLength(8)
@maxLength(128)
@secure()
param dbAdministratorLoginPassword string

@description('Database application user password')
@minLength(8)
@maxLength(128)
@secure()
param dbAppUserPassword string

@description('Azure database for PostgreSQL vCores capacity')
@allowed([
  1
  2
  4
  8
  16
  32
])
param databaseSkuCapacity int = 1

@description('Azure database for PostgreSQL sku name')
@allowed([
  'GP_Gen5_2'
  'GP_Gen5_4'
  'GP_Gen5_8'
  'GP_Gen5_16'
  'GP_Gen5_32'
  'MO_Gen5_2'
  'MO_Gen5_4'
  'MO_Gen5_8'
  'MO_Gen5_16'
  'B_Gen5_1'
  'B_Gen5_2'
])
param databaseSkuName string = 'B_Gen5_1'

@description('Azure database for PostgreSQL Sku Size')
@allowed([
  '102400'
  '51200'
])
param databaseSkuSizeMB string = '51200'

@description('Azure database for PostgreSQL pricing tier')
@allowed([
  'GeneralPurpose'
  'MemoryOptimized'
  'Basic'
])
param databaseSkuTier string = 'Basic'

@description('PostgreSQL version')
@allowed([
  '11'
])
param postgresqlVersion string = '11'

@description('Monitoring alerts receipients')
param alertEmails array = [
  /*
    {
      name: 'owner'
      address: 'example@example.com'
    }
  */
]

var dbAppUserName = 'webapi'
var dbAdministratorLogin = 'pgsqladmin'
var projectFullName = '${environment}-${projectName}'
var appServicePlanFullName = '${environment}-${projectName}-server'
var storageAccountFullName = replace('${projectFullName}stacc', '-', '')
var appInsFullName = '${projectFullName}-appins'
var dbName = projectName
var dbServerFullName = '${projectFullName}pg'
var actionGroupName = 'alerts action group'

// database firewall rules: by default only traffic within Azure is configured;
var dbFirewallRules = [
  {
    Name: 'AllowAzureServices'
    StartIpAddress: '0.0.0.0'
    EndIpAddress: '0.0.0.0'
  }
]

resource storageAccount 'Microsoft.Storage/storageAccounts@2019-06-01' = {
  name: storageAccountFullName
  location: location
  sku: {
    name: storageAccountType
  }
  kind: 'StorageV2'
  properties: {
    networkAcls: {
      bypass: 'AzureServices'
      virtualNetworkRules: []
      ipRules: []
      defaultAction: 'Allow'
    }
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        file: {
          keyType: 'Account'
          enabled: true
        }
        blob: {
          keyType: 'Account'
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2019-06-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            '*'
          ]
          allowedMethods: [
            'DELETE'
            'GET'
            'POST'
            'MERGE'
            'PUT'
            'OPTIONS'
            'HEAD'
          ]
          maxAgeInSeconds: 300
          exposedHeaders: [
            '*'
          ]
          allowedHeaders: [
            '*'
          ]
        }
      ]
    }
    deleteRetentionPolicy: {
      enabled: false
    }
  }
}

resource storageAccountWebContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2019-06-01' = {
  parent: blobService
  name: '$web'
  properties: {
    publicAccess: 'None'
  }
  dependsOn: [
    storageAccount
  ]
}

resource appServicePlan 'Microsoft.Web/serverfarms@2020-06-01' = {
  name: appServicePlanFullName
  location: location
  sku: {
    name: appServicePlanSku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource appIns 'Microsoft.Insights/components@2020-02-02' = {
  kind: 'web'
  name: appInsFullName
  location: resourceGroup().location
  tags: {
    applicationType: 'web'
    displayName: 'AppInsightsComponentGlobal'
  }
  properties: {
    Application_Type: 'web'
  }
}

resource alertsActionGroup 'microsoft.insights/actionGroups@2019-06-01' = {
  name: actionGroupName
  location: 'global'
  properties: {
    groupShortName: 'alerts group'
    enabled: true
    emailReceivers: [for item in alertEmails: {
      name: 'send-email-to-${item.name}-EmailAction'
      emailAddress: item.address
      useCommonAlertSchema: false
    }]
  }
}

module alertsModule 'alerts.bicep' = {
  name: 'deployAlerts'
  dependsOn: [
    appIns
  ]
  params: {
    projectName: projectName
    environment: environment
    actionGroupName: actionGroupName
  }
}

resource projectSite 'Microsoft.Web/sites@2020-06-01' = {
  name: projectFullName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      alwaysOn: appServiceAlwaysOn
    }
    httpsOnly: true
  }
  dependsOn: [
    storageAccount
    appIns
  ]
}

resource projectSiteConnectionStrings 'Microsoft.Web/sites/config@2015-08-01' = {
  parent: projectSite
  name: 'connectionstrings'
  location: location
  properties: {
    PostgreSQLConnectionString: {
      value: 'postgresql+asyncpg://${dbAdministratorLogin}@${dbServerFullName}:${dbAdministratorLoginPassword}@${databaseServer.properties.fullyQualifiedDomainName}:5432/${projectName}'
      type: 'Custom'
    }
    CloudStorageConnectionString: {
      value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountFullName};AccountKey=${listKeys(storageAccountFullName, '2015-05-01-preview').key1}'
      type: 'Custom'
    }
  }
}

resource projectSiteAppSettings 'Microsoft.Web/sites/config@2015-08-01' = {
  parent: projectSite
  name: 'appsettings'
  location: location
  properties: {
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'true'
    APP_SHOW_ERROR_DETAILS: 'false'
    APP_CLIENT_ID: appClientId
    APP_TENANT_ID: tenantId
    APP_ENV: environment
    APP_STORAGE_ACCOUNT_NAME: storageAccountFullName
    APP_STORAGE_ACCOUNT_KEY: listKeys(storageAccountFullName, '2015-05-01-preview').key1
    APP_DB_CONNECTION_STRING: 'postgresql+asyncpg://${dbAppUserName}@${dbServerFullName}:${dbAppUserPassword}@${databaseServer.properties.fullyQualifiedDomainName}:5432/${projectName}'
    APP_MONITORING_KEY: appIns.properties.InstrumentationKey
  }
}

resource databaseServer 'Microsoft.DBforPostgreSQL/servers@2017-12-01' = {
  location: location
  name: dbServerFullName
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    createMode: 'Default'
    version: postgresqlVersion
    administratorLogin: dbAdministratorLogin
    administratorLoginPassword: dbAdministratorLoginPassword
    sslEnforcement: 'Enabled'
    minimalTlsVersion: 'TLS1_2'
  }
  sku: {
    name: databaseSkuName
    tier: databaseSkuTier
    capacity: databaseSkuCapacity
    size: databaseSkuSizeMB
    family: 'Gen5'
  }
}

@batchSize(1)
resource databaseFirewallRule 'Microsoft.DBforPostgreSQL/servers/firewallrules@2017-12-01' = [for rule in dbFirewallRules: {
  parent: databaseServer
  name: rule.Name
  properties: {
    startIpAddress: rule.StartIpAddress
    endIpAddress: rule.EndIpAddress
  }
}]

resource database 'Microsoft.DBforPostgreSQL/servers/databases@2017-12-01' = {
  parent: databaseServer
  name: dbName
  properties: {
    charset: 'utf8'
    collation: 'English_United States.1252'
  }
}
