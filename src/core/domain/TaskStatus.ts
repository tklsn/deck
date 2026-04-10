const _TaskStatus: {
  PENDING: 'PENDING'
  DOING: 'DOING'
  DONE: 'DONE'
} = {
  PENDING: 'PENDING',
  DOING: 'DOING',
  DONE: 'DONE',
}

export type TaskStatus = (typeof _TaskStatus)[keyof typeof _TaskStatus]
