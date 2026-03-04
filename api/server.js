const express = require("express");
const path = require("path");
const { getHolidayPayload } = require("./holiday-utils");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/holiday", (req, res) => {
  try {
    res.json(getHolidayPayload());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, "..")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
