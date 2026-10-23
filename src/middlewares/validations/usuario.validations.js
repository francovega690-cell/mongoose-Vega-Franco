import { body, param } from "express-validator";
import { Usuario } from "../../models/usuario.model.js";

export const validarIdUsuario = [
  param("id").isMongoId().withMessage("El id del usuario no es un ObjectId válido"),
];

export const validarCrearUsuario = [
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio").bail()
    .isString().withMessage("El nombre debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("email")
    .notEmpty().withMessage("El email es obligatorio").bail()
    .isString().withMessage("El email debe ser texto").bail()
    .trim()
    .isEmail().withMessage("El email no es válido").bail()
    .toLowerCase()
    .custom(async (email) => {
      const existe = await Usuario.findOne({ email });
      if (existe) {
        throw new Error("El email ya está registrado");
      }
      return true;
    }),

  // Propiedad embebida
  body("direccion")
    .notEmpty().withMessage("La dirección es obligatoria").bail()
    .isObject().withMessage("La dirección debe ser un objeto"),

  body("direccion.calle")
    .notEmpty().withMessage("La calle es obligatoria").bail()
    .isString().withMessage("La calle debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("La calle debe tener entre 3 y 100 caracteres"),

  body("direccion.ciudad")
    .notEmpty().withMessage("La ciudad es obligatoria").bail()
    .isString().withMessage("La ciudad debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("direccion.postal")
    .notEmpty().withMessage("El código postal es obligatorio").bail()
    .isString().withMessage("El código postal debe ser texto").bail()
    .trim()
    .isLength({ min: 4, max: 10 }).withMessage("El código postal debe tener entre 4 y 10 caracteres"),
];

export const validarActualizarUsuario = [
  ...validarIdUsuario,

  body("nombre")
    .optional()
    .isString().withMessage("El nombre debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("email")
    .optional()
    .isString().withMessage("El email debe ser texto").bail()
    .trim()
    .isEmail().withMessage("El email no es válido").bail()
    .toLowerCase()
    .custom(async (email, { req }) => {
      const existe = await Usuario.findOne({ email, _id: { $ne: req.params.id } });
      if (existe) {
        throw new Error("El email ya está registrado por otro usuario");
      }
      return true;
    }),

  // Si se envía la dirección, tiene que venir completa porque reemplaza a la anterior
  body("direccion")
    .optional()
    .isObject().withMessage("La dirección debe ser un objeto").bail()
    .custom((direccion) => {
      if (!direccion.calle || !direccion.ciudad || !direccion.postal) {
        throw new Error("La dirección debe tener calle, ciudad y postal");
      }
      return true;
    }),

  body("direccion.calle")
    .optional()
    .isString().withMessage("La calle debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("La calle debe tener entre 3 y 100 caracteres"),

  body("direccion.ciudad")
    .optional()
    .isString().withMessage("La ciudad debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("direccion.postal")
    .optional()
    .isString().withMessage("El código postal debe ser texto").bail()
    .trim()
    .isLength({ min: 4, max: 10 }).withMessage("El código postal debe tener entre 4 y 10 caracteres"),
];
