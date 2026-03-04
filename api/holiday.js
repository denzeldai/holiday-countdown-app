const { getHolidayPayload } = require("./holiday-utils");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    res.status(200).json(getHolidayPayload());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
