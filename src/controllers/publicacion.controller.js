import { matchedData } from "express-validator";
import { Publicacion } from "../models/publicacion.model.js";

export const crearPublicacion = async (req, res) => {
  try {
    const datos = matchedData(req);
    const publicacion = await Publicacion.create(datos);
    await publicacion.populate([
      { path: "autor", select: "nombre email" },
      { path: "etiquetas", select: "nombre" },
    ]);
    res.status(201).json({ message: "Publicación creada correctamente", publicacion });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la publicación", error: error.message });
  }
};

export const obtenerPublicaciones = async (req, res) => {
  try {
    const publicaciones = await Publicacion.find({ esActivo: true })
      .populate("autor", "nombre email")
      .populate({ path: "etiquetas", select: "nombre", match: { esActivo: true } });
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las publicaciones", error: error.message });
  }
};

export const obtenerPublicacionPorId = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const publicacion = await Publicacion.findOne({ _id: id, esActivo: true })
      .populate("autor", "nombre email")
      .populate({ path: "etiquetas", select: "nombre", match: { esActivo: true } });

    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.status(200).json(publicacion);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la publicación", error: error.message });
  }
};

export const actualizarPublicacion = async (req, res) => {
  try {
    const { id, ...datos } = matchedData(req);
    const publicacion = await Publicacion.findOneAndUpdate({ _id: id, esActivo: true }, datos, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("autor", "nombre email")
      .populate("etiquetas", "nombre");

    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.status(200).json({ message: "Publicación actualizada correctamente", publicacion });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la publicación", error: error.message });
  }
};

// Eliminación lógica: ningún documento depende de la publicación
export const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const publicacion = await Publicacion.findOneAndUpdate(
      { _id: id, esActivo: true },
      { esActivo: false },
      { returnDocument: "after" },
    );

    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.status(200).json({ message: "Publicación eliminada correctamente (lógico)" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la publicación", error: error.message });
  }
};

export const eliminarPublicacionDefinitivo = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const publicacion = await Publicacion.findByIdAndDelete(id);

    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.status(200).json({ message: "Publicación eliminada definitivamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la publicación", error: error.message });
  }
};

// Relación N:M: agrega una etiqueta a la publicación ($addToSet no repite el id)
export const agregarEtiqueta = async (req, res) => {
  try {
    const { id, etiquetaId } = matchedData(req);
    const publicacion = await Publicacion.findByIdAndUpdate(
      id,
      { $addToSet: { etiquetas: etiquetaId } },
      { returnDocument: "after" },
    ).populate("etiquetas", "nombre");

    res.status(200).json({ message: "Etiqueta agregada a la publicación", publicacion });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar la etiqueta", error: error.message });
  }
};
