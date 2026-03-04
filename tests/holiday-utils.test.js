const { getNearestHolidayFromList, getUpcomingHolidaysFromList } = require("../api/holiday-utils");

describe("holiday utils", () => {
  test("今天就是假期：daysLeft 应为 0", () => {
    const holidays = [{ name: "劳动节", date: "2026-05-01" }];
    const result = getNearestHolidayFromList(holidays, new Date("2026-05-01T12:00:00+08:00"));

    expect(result).toEqual({
      name: "劳动节",
      date: "2026-05-01",
      daysLeft: 0
    });
  });

  test("已过期：应跳过已过去假期并选择未来假期", () => {
    const holidays = [
      { name: "元旦", date: "2026-01-01" },
      { name: "清明节", date: "2026-04-05" }
    ];
    const result = getNearestHolidayFromList(holidays, new Date("2026-03-02T09:00:00+08:00"));

    expect(result).toEqual({
      name: "清明节",
      date: "2026-04-05",
      daysLeft: 34
    });
  });

  test("最近选择逻辑：多个未来假期时选择最近那个", () => {
    const holidays = [
      { name: "国庆节", date: "2026-10-01" },
      { name: "端午节", date: "2026-06-19" },
      { name: "劳动节", date: "2026-05-01" }
    ];
    const result = getNearestHolidayFromList(holidays, new Date("2026-04-30T22:00:00+08:00"));

    expect(result).toEqual({
      name: "劳动节",
      date: "2026-05-01",
      daysLeft: 1
    });
  });

  test("未来列表：应返回按日期排序后的前 3 个假期", () => {
    const holidays = [
      { name: "国庆节", date: "2026-10-01" },
      { name: "劳动节", date: "2026-05-01" },
      { name: "清明节", date: "2026-04-05" },
      { name: "端午节", date: "2026-06-19" }
    ];

    const result = getUpcomingHolidaysFromList(holidays, 3, new Date("2026-03-02T09:00:00+08:00"));

    expect(result).toEqual([
      { name: "清明节", date: "2026-04-05", daysLeft: 34 },
      { name: "劳动节", date: "2026-05-01", daysLeft: 60 },
      { name: "端午节", date: "2026-06-19", daysLeft: 109 }
    ]);
  });
});
