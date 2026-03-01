const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak. Token tidak ditemukan",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET_KEY_ADMIN");
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      status: "error",
      message: "Token tidak valid",
    });
  }
};

module.exports = authAdmin;