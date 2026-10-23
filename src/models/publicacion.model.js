import { Schema, model } from "mongoose";

const publicacionSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    contenido: { type: String, required: true, trim: true },
    // Relación 1:N: un usuario tiene muchas publicaciones
    autor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    // Relación N:M: una publicación tiene muchas etiquetas y una etiqueta está en muchas publicaciones
    etiquetas: {
      type: [{ type: Schema.Types.ObjectId, ref: "Etiqueta" }],
      default: undefined,
    },
    esActivo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Publicacion = model("Publicacion", publicacionSchema, "publicaciones");
