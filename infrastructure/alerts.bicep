param actionGroupName string = 'alerts action group'
param environment string = 'dev'
param projectName string
param resourcesInfo object = {
  appinsights: {
    type: 'microsoft.insights/components'
    suffix: 'appins'
  }
  webapp: {
    type: 'Microsoft.Web/sites'
    suffix: 'webapp'
  }
  serverfarm: {
    type: 'Microsoft.Web/serverfarms'
    suffix: 'server'
  }
}

@description('Alert metrics.')
param alerts array = [
  {
    resource: 'appinsights'
    name: 'Availability'
    metricName: 'availabilityResults/availabilityPercentage'
    operator: 'LessThan'
    threshold: 100
    timeAggregation: 'Average'
    dimensions: []
    description: 'Availability of the service is less than 100%'
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    severity: 2
    enabled: true
  }
  {
    resource: 'serverfarm'
    name: 'Server farm CPU usage'
    metricName: 'CpuPercentage'
    operator: 'GreaterThan'
    threshold: 90
    timeAggregation: 'Average'
    dimensions: []
    description: 'Server farm high CPU usage'
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    severity: 3
    enabled: true
  }
  {
    resource: 'serverfarm'
    name: 'Server farm memory usage'
    metricName: 'MemoryPercentage'
    operator: 'GreaterThan'
    threshold: 90
    timeAggregation: 'Average'
    dimensions: []
    description: 'Server farm high memory usage'
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    severity: 3
    enabled: true
  }
  {
    resource: 'serverfarm'
    name: 'Server farm HTTP queue length'
    metricName: 'HttpQueueLength'
    operator: 'GreaterThan'
    threshold: 30
    timeAggregation: 'Count'
    dimensions: []
    description: 'Server farm big queue'
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    severity: 3
    enabled: true
  }
  {
    resource: 'webapp'
    name: 'Server errors'
    metricName: 'Http5xx'
    operator: 'GreaterThan'
    threshold: 5
    timeAggregation: 'Count'
    dimensions: []
    description: 'Responses in range 5xx'
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    severity: 1
    enabled: true
  }
  {
    resource: 'webapp'
    name: 'Bad requests'
    metricName: 'Http4xx'
    operator: 'GreaterThan'
    threshold: 50
    timeAggregation: 'Count'
    dimensions: []
    description: 'Responses in range 4xx'
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    severity: 3
    enabled: true
  }
]

var name = '${environment}-${projectName}'
var actionGroupId = resourceId('microsoft.insights/actionGroups', actionGroupName)

resource alerts_name 'Microsoft.Insights/metricAlerts@2018-03-01' = [for item in alerts: {
  name: item.name
  location: 'global'
  tags: {}
  properties: {
    enabled: item.enabled
    severity: item.severity
    description: item.description
    scopes: [
      resourceId(resourcesInfo[item.resource].type, '${name}-${resourcesInfo[item.resource].suffix}')
    ]
    evaluationFrequency: item.evaluationFrequency
    windowSize: item.windowSize
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          name: 'Alert criterion'
          metricName: item.metricName
          dimensions: item.dimensions
          operator: item.operator
          threshold: item.threshold
          timeAggregation: item.timeAggregation
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroupId
      }
    ]
  }
}]
