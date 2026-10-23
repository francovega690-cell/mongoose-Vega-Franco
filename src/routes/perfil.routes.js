import { Router } from "express";
import {
  crearPerfil,
  obtenerPerfiles,
  obtenerPerfilPorId,
  actualizarPerfil,
  eliminarPerfil,
  eliminarPerfilDefinitivo,
} from "../controllers/perfil.controller.js";
import {
  validarIdPerfil,
  validarCrearPerfil,
  validarActualizarPerfil,
} from "../middlewares/validations/perfil.validations.js";
import { validar } from "../middlewares/validator.js";

const router = Router();

router.post("/", validarCrearPerfil, validar, crearPerfil);
router.get("/", obtenerPerfiles);
router.get("/:id", validarIdPerfil, validar, obtenerPerfilPorId);
router.put("/:id", validarActualizarPerfil, validar, actualizarPerfil);
router.delete("/:id", validarIdPerfil, validar, eliminarPerfil);
router.delete("/:id/definitivo", validarIdPerfil, validar, eliminarPerfilDefinitivo);

export default router;
