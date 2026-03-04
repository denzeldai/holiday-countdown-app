const fs = require("fs");
const path = require("path");

const dayMs = 24 * 60 * 60 * 1000;
const holidaysFile = path.join(__dirname, "..", "holidays.json");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function loadHolidays() {
  if (!fs.existsSync(holidaysFile)) {
    throw new Error("holidays.json 不存在，请先运行 npm run generate:holidays");
  }

  const raw = fs.readFileSync(holidaysFile, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("holidays.json 格式错误，应为数组");
  }

  return parsed;
}

function getFutureCandidates(holidays, today = new Date()) {
  if (!Array.isArray(holidays) || holidays.length === 0) {
    throw new Error("节假日数据不能为空");
  }

  const current = startOfDay(today);

  return holidays
    .map((holiday) => {
      const holidayDate = startOfDay(new Date(holiday.date));
      return {
        name: holiday.name,
        date: holiday.date,
        holidayDate,
        daysLeft: Math.ceil((holidayDate - current) / dayMs)
      };
    })
    .filter((holiday) => holiday.holidayDate >= current)
    .sort((a, b) => a.holidayDate - b.holidayDate);
}

function getNearestHolidayFromList(holidays, today = new Date()) {
  const candidates = getFutureCandidates(holidays, today);

  const nearest = candidates[0];
  if (!nearest) {
    throw new Error("holidays.json 中没有未来日期，请重新生成节假日数据");
  }

  return {
    name: nearest.name,
    date: nearest.date,
    daysLeft: nearest.daysLeft
  };
}

function getNearestHoliday(today = new Date()) {
  return getNearestHolidayFromList(loadHolidays(), today);
}

function getUpcomingHolidaysFromList(holidays, count = 3, today = new Date()) {
  const candidates = getFutureCandidates(holidays, today);
  return candidates.slice(0, count).map((holiday) => ({
    name: holiday.name,
    date: holiday.date,
    daysLeft: holiday.daysLeft
  }));
}

function getHolidayPayload(today = new Date(), count = 3) {
  const holidays = loadHolidays();
  const nearest = getNearestHolidayFromList(holidays, today);
  const upcoming = getUpcomingHolidaysFromList(holidays, count, today);
  return { ...nearest, upcoming };
}

module.exports = {
  getNearestHoliday,
  getNearestHolidayFromList,
  getUpcomingHolidaysFromList,
  getHolidayPayload,
  startOfDay
};
