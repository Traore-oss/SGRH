require("dotenv").config(); // ⚠ doit être en tout premier

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
const performanceRoutes = require("./Routes/performanceRoutes");
const RecurtementRoutes = require("./Routes/recutementRoute");
const RapportRoute = require("./Routes/RapportRoute");

const app = express();
const port = process.env.PORT || 8000;

// Connexion à MongoDB
connectDB();

// ✅ CORS configuré correctement
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true, // 🔑 autorise l’envoi des cookies
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Routes
app.use("/api/auth", authRoutes); // ⚠ nom en minuscule pour uniformiser
app.use("/api/users", userRoutes);
app.use("/api/departements", departementRoutes);
app.use("/api/conges", demandeConges);
app.use("/api/formation", GestionFormation);
app.use("/api/pointages", Pointages);
app.use("/api/salaires", SalaireRoutes);
app.use("/api/performances", performanceRoutes);
app.use("/api/recrutement", RecurtementRoutes);
app.use("/api/rapports", RapportRoute);

// Lancement serveur
app.listen(port, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${port}`);
});

