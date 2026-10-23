import { Schema, model } from "mongoose";

// Relación 1:1: cada perfil pertenece a un único usuario
const perfilSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true,
    },
    biografia: { type: String, trim: true },
    telefono: { type: String, trim: true },
    fechaNacimiento: { type: Date },
    esActivo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Perfil = model("Perfil", perfilSchema, "perfiles");
