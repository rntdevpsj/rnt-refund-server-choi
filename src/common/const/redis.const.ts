// Redis 키 패턴
export const REDIS_KEYS = {
  queue: {
    auth: (jobId: string) => `bull:auth-queue:${jobId}`,
    refund: (jobId: string) => `bull:refund-queue:${jobId}`,
  },
  data: {
    auth: (userId: string) => `data:auth:${userId}`,
    process: (userId: string) => `data:process:${userId}`,
  },
} as const

// Redis TTL 설정
export const REDIS_TTL = {
  auth: 3600, // 1시간
  process: 3600, // 1시간
} as const

// 프로세스 단계별 상태 매핑
export const PROCESS_STATUS_MAP = {
  'auth-verification': 'auth-completed',
  'refund-calculation': 'completed',
} as const
