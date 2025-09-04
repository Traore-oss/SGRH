const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Chemin absolu vers dossier uploads dans /public/uploads
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "photo-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;