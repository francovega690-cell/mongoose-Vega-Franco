import { validationResult } from "express-validator";

// Middleware reutilizable: si alguna validación falló, responde 400 con los errores que hay
export const validar = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  next();
};
