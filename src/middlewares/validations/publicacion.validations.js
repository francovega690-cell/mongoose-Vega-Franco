import { body, param } from "express-validator";
import { isValidObjectId } from "mongoose";
import { Usuario } from "../../models/usuario.model.js";
import { Publicacion } from "../../models/publicacion.model.js";
import { Etiqueta } from "../../models/etiqueta.model.js";

export const validarIdPublicacion = [
  param("id").isMongoId().withMessage("El id de la publicación no es un ObjectId válido"),
];

// Arreglo de etiquetas (N:M): opcional, pero si se envía no puede estar vacío ni tener repetidas
const validarEtiquetas = [
  body("etiquetas")
    .optional()
    .isArray({ min: 1 }).withMessage("Las etiquetas deben ser un arreglo con al menos 1 elemento").bail()
    .custom((etiquetas) => {
      if (new Set(etiquetas).size !== etiquetas.length) {
        throw new Error("Hay etiquetas repetidas");
      }
      return true;
    }),

  body("etiquetas.*")
    .isMongoId().withMessage("Cada etiqueta debe ser un ObjectId válido").bail()
    .custom(async (etiquetaId) => {
      const etiqueta = await Etiqueta.findOne({ _id: etiquetaId, esActivo: true });
      if (!etiqueta) {
        throw new Error(`La etiqueta ${etiquetaId} no existe`);
      }
      return true;
    }),
];

export const validarCrearPublicacion = [
  body("titulo")
    .notEmpty().withMessage("El título es obligatorio").bail()
    .isString().withMessage("El título debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El título debe tener entre 3 y 100 caracteres"),

  body("contenido")
    .notEmpty().withMessage("El contenido es obligatorio").bail()
    .isString().withMessage("El contenido debe ser texto").bail()
    .trim()
    .isLength({ min: 5, max: 2000 }).withMessage("El contenido debe tener entre 5 y 2000 caracteres"),

  // Referencia 1:N: el autor tiene que existir
  body("autor")
    .notEmpty().withMessage("El autor es obligatorio").bail()
    .isMongoId().withMessage("El autor no es un ObjectId válido").bail()
    .custom(async (autorId) => {
      const usuario = await Usuario.findOne({ _id: autorId, esActivo: true });
      if (!usuario) {
        throw new Error("El autor no existe");
      }
      return true;
    }),

  ...validarEtiquetas,
];

// El autor no se puede cambiar, por eso no se valida acá
export const validarActualizarPublicacion = [
  ...validarIdPublicacion,

  body("titulo")
    .optional()
    .isString().withMessage("El título debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El título debe tener entre 3 y 100 caracteres"),

  body("contenido")
    .optional()
    .isString().withMessage("El contenido debe ser texto").bail()
    .trim()
    .isLength({ min: 5, max: 2000 }).withMessage("El contenido debe tener entre 5 y 2000 caracteres"),

  ...validarEtiquetas,
];

// Endpoint N:M: ambos documentos tienen que existir y el vínculo no puede estar repetido
export const validarAgregarEtiqueta = [
  param("id")
    .isMongoId().withMessage("El id de la publicación no es un ObjectId válido").bail()
    .custom(async (id) => {
      const publicacion = await Publicacion.findOne({ _id: id, esActivo: true });
      if (!publicacion) {
        throw new Error("La publicación no existe");
      }
      return true;
    }),

  param("etiquetaId")
    .isMongoId().withMessage("El id de la etiqueta no es un ObjectId válido").bail()
    .custom(async (etiquetaId) => {
      const etiqueta = await Etiqueta.findOne({ _id: etiquetaId, esActivo: true });
      if (!etiqueta) {
        throw new Error("La etiqueta no existe");
      }
      return true;
    }).bail()
    .custom(async (etiquetaId, { req }) => {
      if (!isValidObjectId(req.params.id)) {
        return true;
      }
      const vinculo = await Publicacion.findOne({ _id: req.params.id, etiquetas: etiquetaId });
      if (vinculo) {
        throw new Error("La publicación ya tiene esa etiqueta");
      }
      return true;
    }),
];
