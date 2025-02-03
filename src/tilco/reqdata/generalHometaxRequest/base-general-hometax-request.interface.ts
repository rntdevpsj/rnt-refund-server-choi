interface GeneralHometax {
  CertFile: string
  KeyFile: string
  CertPassword: string
  AgentId: string
  AgentPassword: string
  DeptUserId: string
  DeptUserPassword: string
  UserName: string
  IdentityNumber: string
}

export interface BaseGeneralHometaxRequest {
  Auth: GeneralHometax
}
