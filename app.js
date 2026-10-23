import "dotenv/config";
import express from "express";
import { connectDB } from "./src/config/database.js";
import usuarioRoutes from "./src/routes/usuario.routes.js";
import perfilRoutes from "./src/routes/perfil.routes.js";
import publicacionRoutes from "./src/routes/publicacion.routes.js";
import etiquetaRoutes from "./src/routes/etiqueta.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API funcionando" });
});

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/perfiles", perfilRoutes);
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/etiquetas", etiquetaRoutes);

await connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
