import { Router } from "express";
import {
  crearPublicacion,
  obtenerPublicaciones,
  obtenerPublicacionPorId,
  actualizarPublicacion,
  eliminarPublicacion,
  eliminarPublicacionDefinitivo,
  agregarEtiqueta,
} from "../controllers/publicacion.controller.js";
import {
  validarIdPublicacion,
  validarCrearPublicacion,
  validarActualizarPublicacion,
  validarAgregarEtiqueta,
} from "../middlewares/validations/publicacion.validations.js";
import { validar } from "../middlewares/validator.js";

const router = Router();

router.post("/", validarCrearPublicacion, validar, crearPublicacion);
router.get("/", obtenerPublicaciones);
router.get("/:id", validarIdPublicacion, validar, obtenerPublicacionPorId);
router.put("/:id", validarActualizarPublicacion, validar, actualizarPublicacion);
router.delete("/:id", validarIdPublicacion, validar, eliminarPublicacion);
router.delete("/:id/definitivo", validarIdPublicacion, validar, eliminarPublicacionDefinitivo);

// Relación N:M: agregar una etiqueta a una publicación
router.post("/:id/etiquetas/:etiquetaId", validarAgregarEtiqueta, validar, agregarEtiqueta);

export default router;
