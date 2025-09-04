require("dotenv").config(); // ⚠ doit être tout en haut

const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import des routes
const departementRoutes = require("./Routes/DepartementRoutes");
const demandeConges = require("./Routes/congesRoutes");
const GestionFormation = require("./Routes/FormationRoutes");
const Pointages = require("./Routes/PointageRoutes");
const SalaireRoutes = require("./Routes/SalaireRoutes");
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const Evaluation = require("./Routes/evaluationRoutes");

const app = express();
const port = process.env.PORT || 8000;

// Connexion à MongoDB
connectDB();

// ✅ CORS configuré pour ton frontend
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];

app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); // autorise Postman ou curl
    if (allowedOrigins.indexOf(origin) === -1){
      const msg = `L'origine CORS ${origin} n'est pas autorisée.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Routes
app.use("/api/Auth", authRoutes);
app.use("/api/Users", userRoutes);
app.use("/api/departements", departementRoutes);
app.use("/api/conges", demandeConges);
app.use("/api/formation", GestionFormation);
app.use("/api/pointages", Pointages);
app.use("/api/salaires", SalaireRoutes);
app.use("/api/evaluation", Evaluation);

// Lancement serveur
app.listen(port, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${port}`);
});
