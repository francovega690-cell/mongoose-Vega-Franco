import "dotenv/config";
import express from "express";
import { connectDB } from "./src/config/database.js";
import usuarioRoutes from "./src/routes/usuario.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API funcionando" });
});

app.use("/api/usuarios", usuarioRoutes);

await connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
