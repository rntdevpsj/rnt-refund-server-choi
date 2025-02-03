export const TAX_CODES = {
  REDUCTION: {
    '353': true,
    '369': true,
  },
  CREDIT: {
    '202': true,
    '236': true,
    '201': true,
    '208': true,
    '203': true,
    '273': true,
    '290': true,
    '274': true,
    '275': true,
    '276': true,
    '27A': true,
    '277': true,
    '291': true,
    '278': true,
    '279': true,
    '282': true,
    '283': true,
    '284': true,
    '210': true,
    '20Q': true,
  },
} as const

export interface ReportPerson {
  ReportName: string
  ttirnam101DVO: {
    txnrmStrtDt: string
    stasAmt: string
    cmptTxamt: string
    reTxamt: string
    ddcTxamt: string
    dcsTxamt: string
    ppmTxamt: string
  }
  ttirndm001DVO: {
    bkpDutyClCd: string
    inctxRtnTypeCd: string
    agiAmt: string
  }
  ttirndl012DVOList?: {
    rows: Array<{
      incClCd: string
      incAmt: string
    }>
  }
  txamtDdcReSpecBrkdDVOList?: {
    rows: Array<{
      ereCd: string
      ereAmt: string
    }>
  }
  Items?: Array<{
    Amount: string
  }>
}

export interface HometaxFillingPerson {
  [key: string]: string | number
}

export interface ValidationError {
  message: string
  code: string
}
