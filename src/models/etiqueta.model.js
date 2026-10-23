import { Schema, model } from "mongoose";

const etiquetaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    descripcion: { type: String, trim: true },
    esActivo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populate inverso N:M: Etiqueta no guarda referencias, busca las publicaciones que la tienen en su arreglo
etiquetaSchema.virtual("publicaciones", {
  ref: "Publicacion",
  localField: "_id",
  foreignField: "etiquetas",
});

export const Etiqueta = model("Etiqueta", etiquetaSchema);
