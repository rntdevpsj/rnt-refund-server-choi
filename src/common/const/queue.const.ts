export const NO_RETRY_OPTIONS = {
  attempts: 1,
  removeOnComplete: true,
  removeOnFail: true,
}

export const LOGIN_CHECK_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'fixed',
    delay: 30000, // 30초 간격
  },
  removeOnComplete: true,
  removeOnFail: true,
}
