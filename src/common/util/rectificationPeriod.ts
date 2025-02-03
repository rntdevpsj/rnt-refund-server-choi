interface IRectificationPeriod {
  startYear: number
  endYear: number
}

const getPeriodYear = (
  criteria: number,
  month: number,
  year: number,
  minus: number,
): number => {
  return month > criteria ? year - minus : year - (minus + 1)
}

export const getRectificationPeriod = (
  corporateBool: boolean,
): IRectificationPeriod => {
  let startYear, endYear

  const today = new Date()
  const monthOfToday = today.getMonth() + 1
  const yearOfToday = today.getFullYear()

  if (corporateBool) {
    startYear = getPeriodYear(3, monthOfToday, yearOfToday, 5)
    endYear = getPeriodYear(3, monthOfToday, yearOfToday, 1)
  } else {
    startYear = getPeriodYear(5, monthOfToday, yearOfToday, 5)
    endYear = getPeriodYear(5, monthOfToday, yearOfToday, 1)
  }
  return { startYear, endYear }
}
