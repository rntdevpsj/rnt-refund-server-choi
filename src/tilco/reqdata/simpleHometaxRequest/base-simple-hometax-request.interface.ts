interface SimpleHometax {
  BirthDate: string
  PrivateAuthType: string
  UserName: string
  UserCellphoneNumber: string
  Token: string
  CxId: string
  TxId: string
  ReqTxId: string
}

export interface BaseSimpleHometaxReqeust {
  Auth: SimpleHometax
}
