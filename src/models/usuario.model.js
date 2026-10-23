import { Schema, model } from "mongoose";

// Propiedad embebida: la dirección solo existe dentro del usuario
const direccionSchema = new Schema(
  {
    calle: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    postal: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    direccion: { type: direccionSchema, required: true },
    esActivo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populate inverso: Usuario no guarda referencias, pero puede traer su perfil y sus publicaciones
usuarioSchema.virtual("perfil", {
  ref: "Perfil",
  localField: "_id",
  foreignField: "usuario",
  justOne: true,
});

usuarioSchema.virtual("publicaciones", {
  ref: "Publicacion",
  localField: "_id",
  foreignField: "autor",
});

export const Usuario = model("Usuario", usuarioSchema);
