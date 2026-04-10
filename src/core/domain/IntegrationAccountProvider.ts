const _IntegrationAccountProvider: {
  JIRA: 'JIRA'
} = {
  JIRA: 'JIRA',
}

export type IntegrationAccountProvider =
  (typeof _IntegrationAccountProvider)[keyof typeof _IntegrationAccountProvider]
