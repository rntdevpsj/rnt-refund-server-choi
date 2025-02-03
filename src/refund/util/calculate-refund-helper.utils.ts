import * as T from './calculate-util.types'
export class RefundHelper {
  private static getTaxRateAndReductionPerson = (
    year: number,
  ): T.TaxRateAndReduction => {
    let result: T.TaxRateAndReduction = { taxRateObj: {}, reductionObj: {} }

    if (year < 2021) {
      result = {
        taxRateObj: {
          0.06: [0, 12000000],
          0.15: [12000001, 46000000],
          0.24: [46000001, 88000000],
          0.35: [88000001, 150000000],
          0.38: [150000001, 300000000],
          0.4: [300000001, 500000000],
          0.42: [500000001, 1000000000],
          0.45: [1000000001, 99999999999],
        },
        reductionObj: {
          0: [0, 12000000],
          1080000: [12000001, 46000000],
          5220000: [46000001, 88000000],
          14900000: [88000001, 150000000],
          19400000: [150000001, 300000000],
          25400000: [300000001, 500000000],
          35400000: [500000001, 1000000000],
          65400000: [1000000001, 99999999999],
        },
      }
    } else if (year === 2021 || year === 2022) {
      result = {
        taxRateObj: {
          0.06: [0, 12000000],
          0.15: [12000001, 46000000],
          0.24: [46000001, 88000000],
          0.35: [88000001, 150000000],
          0.38: [150000001, 300000000],
          0.4: [300000001, 500000000],
          0.42: [500000001, 99999999999],
        },
        reductionObj: {
          0: [0, 12000000],
          1080000: [12000001, 46000000],
          5220000: [46000001, 88000000],
          14900000: [88000001, 150000000],
          19400000: [150000001, 300000000],
          25400000: [300000001, 500000000],
          35400000: [500000001, 99999999999],
        },
      }
    } else if (year >= 2023) {
      result = {
        taxRateObj: {
          0.06: [0, 14000000],
          0.15: [14000001, 50000000],
          0.24: [50000001, 88000000],
          0.35: [88000001, 150000000],
          0.38: [150000001, 300000000],
          0.4: [300000001, 500000000],
          0.42: [500000001, 99999999999],
        },
        reductionObj: {
          0: [0, 14000000],
          1260000: [14000001, 50000000],
          5760000: [50000001, 88000000],
          15440000: [88000001, 150000000],
          19400000: [150000001, 300000000],
          25400000: [300000001, 500000000],
          35400000: [500000001, 99999999999],
        },
      }
    }
    return result
  }

  private static getTaxRateAndReductionCorporate = (
    year: number,
  ): T.TaxRateAndReduction => {
    let result: T.TaxRateAndReduction = { taxRateObj: {}, reductionObj: {} }
    if (year < 2023) {
      result = {
        taxRateObj: {
          0.1: [0, 200000000],
          0.2: [200000001, 20000000000],
          0.22: [20000000001, 300000000000],
        },
        reductionObj: {
          0: [0, 200000000],
          20000000: [200000001, 20000000000],
          420000000: [200000001, 20000000000],
        },
      }
    } else if (year >= 2023) {
      result = {
        taxRateObj: {
          0.09: [0, 200000000],
          0.19: [200000001, 20000000000],
          0.21: [20000000001, 300000000000],
        },
        reductionObj: {
          0: [0, 200000000],
          20000000: [200000001, 20000000000],
          420000000: [200000001, 20000000000],
        },
      }
    }
    return result
  }

  private static selectKey = (
    criteria: number,
    rangeObj: T.NestedNumberObject,
  ): number => {
    let result = 0
    Object.entries(rangeObj).forEach(([key, range]) => {
      if (criteria >= range[0] && criteria <= range[1]) {
        result = Number(key)
      }
    })
    return result
  }

  public static getExactTaxRateAndReduction = (
    criteria: number,
    year: number,
    corpBool: boolean,
  ): T.NumberObject => {
    let rateAndReduction: T.TaxRateAndReduction
    if (corpBool) {
      rateAndReduction = this.getTaxRateAndReductionCorporate(year)
    } else {
      rateAndReduction = this.getTaxRateAndReductionPerson(year)
    }

    const { taxRateObj, reductionObj } = rateAndReduction
    const result = {
      taxRate: 0,
      reduction: 0,
    }
    const taxRate = this.selectKey(criteria, taxRateObj)
    const reduction = this.selectKey(criteria, reductionObj)
    result.taxRate = taxRate
    result.reduction = reduction

    return result
  }
}
