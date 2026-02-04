const db = require("../config/database");

/**
 * =====================================
 * HELPER (WAJIB ADA)
 * =====================================
 */
const getStatistikByPeriode = async (periode) => {
  let query = "";
  let labels = [];

  if (periode === "harian") {
    query = `
      SELECT 
        LPAD(HOUR(waktu_masuk),2,'0') AS label,
        COUNT(*) AS total
      FROM log_parkir
      WHERE HOUR(waktu_masuk) BETWEEN 6 AND 17
      GROUP BY label
      ORDER BY label
    `;
    labels = [
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
    ];
  }

  if (periode === "mingguan") {
    query = `
    SELECT 
      DAYNAME(waktu_masuk) AS label,
      COUNT(*) AS total
    FROM log_parkir
    GROUP BY label
  `;

    labels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
  }

  if (periode === "bulanan") {
    query = `
      SELECT 
        MONTH(waktu_masuk) AS label,
        COUNT(*) AS total
      FROM log_parkir
      GROUP BY label
      ORDER BY label
    `;
    labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  }

  const rows = await db.query(query);
  const dataMap = {};

  rows.forEach((row) => {
    dataMap[String(row.label)] = row.total;
  });

  return {
    labels: periode === "harian" ? labels.map((l) => `${l}.00`) : labels,
    data: labels.map((l) => dataMap[l] || 0),
  };
};

/**
 * =====================================
 * CONTROLLER
 * =====================================
 */
const getStatistikKendaraan = async (req, res) => {
  try {
    const { periode } = req.query;

    if (!["harian", "mingguan", "bulanan"].includes(periode)) {
      return res.status(400).json({
        success: false,
        message: "Periode tidak valid",
      });
    }

    const statistik = await getStatistikByPeriode(periode);

    res.json({
      success: true,
      labels: statistik.labels,
      data: statistik.data,
    });
  } catch (error) {
    console.error("Statistik Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStatistikKendaraan,
};
