import { Router } from "express";
import {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  eliminarUsuarioDefinitivo,
} from "../controllers/usuario.controller.js";
import {
  validarIdUsuario,
  validarCrearUsuario,
  validarActualizarUsuario,
} from "../middlewares/validations/usuario.validations.js";
import { validar } from "../middlewares/validator.js";

const router = Router();

router.post("/", validarCrearUsuario, validar, crearUsuario);
router.get("/", obtenerUsuarios);
router.get("/:id", validarIdUsuario, validar, obtenerUsuarioPorId);
router.put("/:id", validarActualizarUsuario, validar, actualizarUsuario);
router.delete("/:id", validarIdUsuario, validar, eliminarUsuario);
router.delete("/:id/definitivo", validarIdUsuario, validar, eliminarUsuarioDefinitivo);

export default router;
