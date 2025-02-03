import { AuthType } from './../../common/type/common.types'
export interface SimpleAuthData {
  authType: 'simple-auth'
  Token: string
  CxId: string
  TxId: string
  ReqTxId: string
  IdentityNumber: string
  PrivateAuthType: string
  BirthDate: string
  UserName: string
  UserCellphoneNumber: string
}

export interface GeneralAuthData {
  authType: 'general-auth'
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

export interface UserAuthData {
  authType: AuthType
  hometaxAuth: SimpleAuthData | GeneralAuthData
  employAuth: SimpleAuthData | GeneralAuthData
}
