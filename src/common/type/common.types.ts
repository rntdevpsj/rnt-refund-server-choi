export type WorkerType =
  | 'SPECIAL'
  | 'EXCLUDE'
  | 'SHORTHALF'
  | 'OVER1YEAR'
  | 'UNDER1YEAR'

export type AuthType = 'simple-auth' | 'general-auth'

export type ProgressStatus = 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED'

export type ProgressDetail =
  | 'AUTH-FAILED'
  | 'SYSTEM-FAILED'
  | 'NO-CANDIDATE'
  | 'NO-REFUNDABLE'
  | 'REFUNDABLE'

export type RefundStatus =
  | 'APPLY'
  | 'CANCEL'
  | 'PROCESSING'
  | 'HOLD'
  | 'COMPLETED'

export type ProcessStep =
  | 'request-validation' // 요청 검증
  | 'simple-auth-request' // 간편인증 요청
  | 'general-auth-request' // 일반인증 요청
  | 'auth-verification' // 인증 확인
  | 'hometax-data' //홈택스 데이터수집
  | 'employ-data' //고용산재 데이터수집
  | 'refund-calculation' // 환급금 계산
  | 'http' // 통신작업업
  | 'system' // 시스템 작업

export type ServiceOperation =
  | 'request-validation' // 요청 검증
  | 'hometax-auth' // 홈택스 인증
  | 'employ-auth' // 고용보험 인증
  | 'auth' //인증작업업
  | 'login-verify' // 로그인 확인
  | 'my-business-info' //내 사업자정보 조회회
  | 'business-closure' //페업증명원 조회회
  | 'business-register' //사업자 등록원원
  | 'electronic-declaration' //전자신고조회
  | 'my-work-no' //내 사업장관리번호 조회
  | 'total-salary' //보수총액신고 조회회
  | 'employ-info' //근로자고용정보현황 조회회
  | 'workplace-rate' //사업장요율 조회회
  | 'refund-calculate' // 환급금 계산
  | 'refund-hometax' //홈택스데이터수집
  | 'refund-employ' //고용산재데이터수집집
  | 'get-data' //데이터수집집
  | 'process-completion' //종료작업업
  | 'database' // 데이터베이스 작업
  | 'storage' // 스토리지 작업업
  | 'redis' // Redis 작업
  | 'queue' // Queue 작업
  | 'external-api' //외부api 작업업
  | 'system' // 시스템 작업

export type ErrorType =
  | 'validation-error' // 검증 오류
  | 'auth-error' // 인증 오류
  | 'external-api-error' // 외부 API 오류
  | 'database-error' // DB 오류
  | 'redis-error' // Redis 오류
  | 'queue-error' // Queue 오류
  | 'business-error' // 비즈니스 로직 오류
  | 'system-error' // 시스템 오류

export type ProcessStatus =
  | 'processing' // 초기 상태
  | 'auth-completed' // 인증 완료
  | 'completed-no-refund' // 환급금 없음으로 완료
  | 'completed' // 환급금 계산 완료
  | 'failed' // 오류로 완료
  | 'pending'
