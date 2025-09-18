const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Créer le dossier uploads/cv s'il n'existe pas
const uploadDir = path.join(__dirname, "../public/uploads/cv");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = "cv-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

// Limiter aux fichiers PDF et Word
const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers PDF, DOC et DOCX sont autorisés"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
