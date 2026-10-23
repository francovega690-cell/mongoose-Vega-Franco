import { body, param } from "express-validator";
import { Usuario } from "../../models/usuario.model.js";
import { Perfil } from "../../models/perfil.model.js";

export const validarIdPerfil = [
  param("id").isMongoId().withMessage("El id del perfil no es un ObjectId válido"),
];

export const validarCrearPerfil = [
  // Referencia 1:1: el usuario tiene que existir y no tener ya un perfil
  body("usuario")
    .notEmpty().withMessage("El usuario es obligatorio").bail()
    .isMongoId().withMessage("El usuario no es un ObjectId válido").bail()
    .custom(async (usuarioId) => {
      const usuario = await Usuario.findOne({ _id: usuarioId, esActivo: true });
      if (!usuario) {
        throw new Error("El usuario no existe");
      }

      const perfil = await Perfil.findOne({ usuario: usuarioId });
      if (perfil) {
        throw new Error("El usuario ya tiene un perfil");
      }
      return true;
    }),

  body("biografia")
    .optional()
    .isString().withMessage("La biografía debe ser texto").bail()
    .trim()
    .isLength({ max: 300 }).withMessage("La biografía puede tener como máximo 300 caracteres"),

  body("telefono")
    .optional()
    .isString().withMessage("El teléfono debe ser texto").bail()
    .trim()
    .matches(/^\+?[0-9\s-]{6,20}$/).withMessage("El teléfono solo puede tener números, espacios, guiones y un + al inicio"),

  body("fechaNacimiento")
    .optional()
    .isISO8601().withMessage("La fecha de nacimiento debe tener formato AAAA-MM-DD").bail()
    .custom((fecha) => {
      if (new Date(fecha) >= new Date()) {
        throw new Error("La fecha de nacimiento debe ser anterior a hoy");
      }
      return true;
    }),
];

// El usuario dueño del perfil no se puede cambiar, por eso no se valida acá
export const validarActualizarPerfil = [
  ...validarIdPerfil,

  body("biografia")
    .optional()
    .isString().withMessage("La biografía debe ser texto").bail()
    .trim()
    .isLength({ max: 300 }).withMessage("La biografía puede tener como máximo 300 caracteres"),

  body("telefono")
    .optional()
    .isString().withMessage("El teléfono debe ser texto").bail()
    .trim()
    .matches(/^\+?[0-9\s-]{6,20}$/).withMessage("El teléfono solo puede tener números, espacios, guiones y un + al inicio"),

  body("fechaNacimiento")
    .optional()
    .isISO8601().withMessage("La fecha de nacimiento debe tener formato AAAA-MM-DD").bail()
    .custom((fecha) => {
      if (new Date(fecha) >= new Date()) {
        throw new Error("La fecha de nacimiento debe ser anterior a hoy");
      }
      return true;
    }),
];
