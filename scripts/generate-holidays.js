const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const defaults = {
    from: new Date().getFullYear(),
    years: 2,
    out: path.join(process.cwd(), "holidays.json")
  };

  const parsed = { ...defaults };

  argv.forEach((arg) => {
    if (arg.startsWith("--from=")) parsed.from = Number(arg.split("=")[1]);
    if (arg.startsWith("--years=")) parsed.years = Number(arg.split("=")[1]);
    if (arg.startsWith("--out=")) parsed.out = path.resolve(arg.split("=")[1]);
  });

  if (!Number.isInteger(parsed.from) || parsed.from < 1970) {
    throw new Error("参数 --from 必须是合法年份，例如 --from=2026");
  }

  if (!Number.isInteger(parsed.years) || parsed.years < 1 || parsed.years > 10) {
    throw new Error("参数 --years 必须是 1 到 10 的整数，例如 --years=2");
  }

  return parsed;
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function main() {
  const { from, years, out } = parseArgs(process.argv.slice(2));
  const rulesPath = path.join(process.cwd(), "data", "holiday-rules.json");
  const rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));

  const result = [];
  for (let year = from; year < from + years; year += 1) {
    rules.forEach((rule) => {
      result.push({
        name: rule.name,
        date: formatDate(year, rule.month, rule.day)
      });
    });
  }

  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  console.log(`Generated ${result.length} holidays to ${out}`);
}

main();
