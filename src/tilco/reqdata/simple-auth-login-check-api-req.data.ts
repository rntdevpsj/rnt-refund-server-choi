interface BaseAuth {
  PrivateAuthType: string
  UserName: string
  UserCellphoneNumber: string
  Token: string
  CxId: string
  TxId: string
  ReqTxId: string
}

interface EmployAuth extends BaseAuth {
  IdentityNumber: string
}

interface HometaxAuth extends BaseAuth {
  BirthDate: string
}

export interface EmployLoginCheckApiReqData {
  Auth: EmployAuth
  UserGroupFlag: string
  IndividualFlag: string
}

export interface HometaxLoginCheckApiReqData {
  Auth: HometaxAuth
}
