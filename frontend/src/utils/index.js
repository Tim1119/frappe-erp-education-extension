// src/utils/index.js
export function getCalendarDates(month = 0, year = 0) {
  let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let firstDay = new Date(year, month, 1)
  let leftPadding = firstDay.getDay()
  let datesInCurrentMonth = getCurrentMonthDates(firstDay)
  let datesInPreviousMonth = getBeforeDates(firstDay, leftPadding)
  let datesTillNow = [...datesInPreviousMonth, ...datesInCurrentMonth]
  let datesInNextMonth = getNextMonthDates(datesTillNow)
  return [...datesTillNow, ...datesInNextMonth]

  function getCurrentMonthDates(date) {
    let month = date.getMonth()
    if (month == 1 && isLeapYear(date)) daysInMonth[month] = 29
    return getDatesAfter(date, 1, daysInMonth[month] + 1)
  }
  function getBeforeDates(firstDay, leftPadding) {
    return getDatesAfter(firstDay, 0, leftPadding, -1).reverse()
  }
  function getNextMonthDates(dates) {
    let lastDate = dates[dates.length - 1]
    return getDatesAfter(lastDate, 1, 42 - dates.length + 1, 1, true)
  }
  function getDatesAfter(date, startIndex, counter, stepper = 1, nextMonth = false) {
    let all = []
    for (let i = startIndex; i < counter; i++) {
      all.push(new Date(date.getFullYear(), nextMonth ? date.getMonth() + 1 : date.getMonth(), i * stepper))
    }
    return all
  }
  function isLeapYear(date) {
    let y = date.getFullYear()
    return y % 400 === 0 || (y % 100 !== 0 && y % 4 === 0)
  }
}

export function groupBy(arr, fn) {
  if (!Array.isArray(arr)) return {}
  return arr.reduce((acc, item) => {
    const group = fn(item)
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})
}