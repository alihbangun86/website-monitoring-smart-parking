const db = require("../config/database");

const getStatistikByPeriode = async (periode) => {
  let query = "";
  let labels = [];

  if (periode === "harian") {
    query = `
      SELECT LPAD(HOUR(waktu_masuk),2,'0') AS label, COUNT(*) AS total
      FROM log_parkir
      WHERE DATE(waktu_masuk)=CURDATE()
      GROUP BY label ORDER BY label
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
      SELECT DAYOFWEEK(waktu_masuk) AS day_index, COUNT(*) AS total
      FROM log_parkir
      WHERE YEARWEEK(waktu_masuk,1)=YEARWEEK(CURDATE(),1)
      GROUP BY day_index ORDER BY day_index
    `;
    labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  }

  if (periode === "bulanan") {
    query = `
      SELECT MONTH(waktu_masuk) AS label, COUNT(*) AS total
      FROM log_parkir
      WHERE YEAR(waktu_masuk)=YEAR(CURDATE())
      GROUP BY label ORDER BY label
    `;
    labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  }

  const result = await db.query(query);

  const safeRows = Array.isArray(result)
    ? result
    : result
      ? Object.values(result)
      : [];

  const dataMap = {};

  for (const row of safeRows) {
    if (periode === "mingguan") {
      const index = row.day_index - 2;
      if (index >= 0 && index < labels.length) {
        dataMap[labels[index]] = row.total;
      }
    } else {
      dataMap[String(row.label)] = row.total;
    }
  }

  return {
    labels: periode === "harian" ? labels.map((l) => `${l}.00`) : labels,
    data: labels.map((l) => dataMap[l] || 0),
  };
};

const getStatistikKendaraan = async (req, res) => {
  try {
    const { periode } = req.query;

    if (!["harian", "mingguan", "bulanan"].includes(periode)) {
      return res
        .status(400)
        .json({ success: false, message: "Periode tidak valid" });
    }

    const statistik = await getStatistikByPeriode(periode);

    res.json({ success: true, ...statistik });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStatistikKendaraan };
