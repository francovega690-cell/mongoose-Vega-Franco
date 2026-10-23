import { Router } from "express";
import {
  crearEtiqueta,
  obtenerEtiquetas,
  obtenerEtiquetaPorId,
  actualizarEtiqueta,
  eliminarEtiqueta,
  eliminarEtiquetaDefinitivo,
} from "../controllers/etiqueta.controller.js";
import {
  validarIdEtiqueta,
  validarCrearEtiqueta,
  validarActualizarEtiqueta,
} from "../middlewares/validations/etiqueta.validations.js";
import { validar } from "../middlewares/validator.js";

const router = Router();

router.post("/", validarCrearEtiqueta, validar, crearEtiqueta);
router.get("/", obtenerEtiquetas);
router.get("/:id", validarIdEtiqueta, validar, obtenerEtiquetaPorId);
router.put("/:id", validarActualizarEtiqueta, validar, actualizarEtiqueta);
router.delete("/:id", validarIdEtiqueta, validar, eliminarEtiqueta);
router.delete("/:id/definitivo", validarIdEtiqueta, validar, eliminarEtiquetaDefinitivo);

export default router;
