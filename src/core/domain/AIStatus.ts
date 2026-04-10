const _AIStatus: {
  PENDING: 'PENDING'
  SKIPPED: 'SKIPPED'
  DOING: 'DOING'
  SUCCESS: 'SUCCESS'
  FAILURE: 'FAILURE'
} = {
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
  DOING: 'DOING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
}

export type AIStatus = (typeof _AIStatus)[keyof typeof _AIStatus]
