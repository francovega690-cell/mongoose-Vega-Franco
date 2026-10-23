import { body, param } from "express-validator";
import { Etiqueta } from "../../models/etiqueta.model.js";

export const validarIdEtiqueta = [
  param("id").isMongoId().withMessage("El id de la etiqueta no es un ObjectId válido"),
];

export const validarCrearEtiqueta = [
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio").bail()
    .isString().withMessage("El nombre debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("El nombre debe tener entre 2 y 30 caracteres").bail()
    .toLowerCase()
    .custom(async (nombre) => {
      const existe = await Etiqueta.findOne({ nombre });
      if (existe) {
        throw new Error("Ya existe una etiqueta con ese nombre");
      }
      return true;
    }),

  body("descripcion")
    .optional()
    .isString().withMessage("La descripción debe ser texto").bail()
    .trim()
    .isLength({ max: 200 }).withMessage("La descripción puede tener como máximo 200 caracteres"),
];

export const validarActualizarEtiqueta = [
  ...validarIdEtiqueta,

  body("nombre")
    .optional()
    .isString().withMessage("El nombre debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("El nombre debe tener entre 2 y 30 caracteres").bail()
    .toLowerCase()
    .custom(async (nombre, { req }) => {
      const existe = await Etiqueta.findOne({ nombre, _id: { $ne: req.params.id } });
      if (existe) {
        throw new Error("Ya existe otra etiqueta con ese nombre");
      }
      return true;
    }),

  body("descripcion")
    .optional()
    .isString().withMessage("La descripción debe ser texto").bail()
    .trim()
    .isLength({ max: 200 }).withMessage("La descripción puede tener como máximo 200 caracteres"),
];
