const fs = require("fs");
const https = require("https");
const path = require("path");

const DEFAULT_URL = "https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics";

function parseArgs(argv) {
  const defaults = {
    url: DEFAULT_URL,
    out: path.join(process.cwd(), "holidays.json")
  };

  const parsed = { ...defaults };

  argv.forEach((arg) => {
    if (arg.startsWith("--url=")) parsed.url = arg.slice("--url=".length);
    if (arg.startsWith("--out=")) parsed.out = path.resolve(arg.slice("--out=".length));
  });

  return parsed;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

function unfoldLines(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  for (const line of lines) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      const prev = result.pop() || "";
      result.push(prev + line.slice(1));
    } else {
      result.push(line);
    }
  }
  return result;
}

function parseDateValue(value) {
  const datePart = value.replace(/T.*$/, "");
  if (!/^\d{8}$/.test(datePart)) return null;
  const year = Number(datePart.slice(0, 4));
  const month = Number(datePart.slice(4, 6));
  const day = Number(datePart.slice(6, 8));
  return { year, month, day };
}

function formatDate({ year, month, day }) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function subtractOneDay(date) {
  const d = new Date(date.year, date.month - 1, date.day);
  d.setDate(d.getDate() - 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function parseIcs(text) {
  const lines = unfoldLines(text);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const [rawKey, rawValue] = line.split(":", 2);
    if (!rawKey || rawValue === undefined) continue;
    const key = rawKey.split(";")[0];
    current[key] = rawValue.trim();
  }

  const holidays = events
    .map((event) => {
      const name = event.SUMMARY ? event.SUMMARY.trim() : null;
      const startRaw = event.DTSTART;
      const endRaw = event.DTEND;

      if (!name || !startRaw) return null;

      const startDate = parseDateValue(startRaw);
      if (!startDate) return null;

      const result = {
        name,
        date: formatDate(startDate),
        startDate: formatDate(startDate)
      };

      if (endRaw) {
        const endDate = parseDateValue(endRaw);
        if (endDate) {
          const inclusiveEnd = subtractOneDay(endDate);
          result.endDate = formatDate(inclusiveEnd);
        }
      }

      return result;
    })
    .filter(Boolean);

  const dedup = new Map();
  holidays.forEach((item) => {
    const key = `${item.name}-${item.startDate}`;
    if (!dedup.has(key)) dedup.set(key, item);
  });

  return Array.from(dedup.values()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

async function main() {
  const { url, out } = parseArgs(process.argv.slice(2));
  const icsText = await fetchUrl(url);
  const holidays = parseIcs(icsText);

  if (!holidays.length) {
    throw new Error("No holidays parsed from ICS");
  }

  fs.writeFileSync(out, `${JSON.stringify(holidays, null, 2)}\n`, "utf8");
  console.log(`Updated ${holidays.length} holidays from ${url}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
