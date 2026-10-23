import { matchedData } from "express-validator";
import { Etiqueta } from "../models/etiqueta.model.js";
import { Publicacion } from "../models/publicacion.model.js";

export const crearEtiqueta = async (req, res) => {
  try {
    const datos = matchedData(req);
    const etiqueta = await Etiqueta.create(datos);
    res.status(201).json({ message: "Etiqueta creada correctamente", etiqueta });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la etiqueta", error: error.message });
  }
};

export const obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await Etiqueta.find({ esActivo: true }).populate({
      path: "publicaciones",
      select: "titulo",
      match: { esActivo: true },
    });
    res.status(200).json(etiquetas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las etiquetas", error: error.message });
  }
};

export const obtenerEtiquetaPorId = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const etiqueta = await Etiqueta.findOne({ _id: id, esActivo: true }).populate({
      path: "publicaciones",
      select: "titulo",
      match: { esActivo: true },
    });

    if (!etiqueta) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    res.status(200).json(etiqueta);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la etiqueta", error: error.message });
  }
};

export const actualizarEtiqueta = async (req, res) => {
  try {
    const { id, ...datos } = matchedData(req);
    const etiqueta = await Etiqueta.findOneAndUpdate({ _id: id, esActivo: true }, datos, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!etiqueta) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    res.status(200).json({ message: "Etiqueta actualizada correctamente", etiqueta });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la etiqueta", error: error.message });
  }
};

// Eliminación lógica: la etiqueta se desactiva y el populate de publicaciones ya no la muestra
export const eliminarEtiqueta = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const etiqueta = await Etiqueta.findOneAndUpdate(
      { _id: id, esActivo: true },
      { esActivo: false },
      { returnDocument: "after" },
    );

    if (!etiqueta) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    res.status(200).json({ message: "Etiqueta eliminada correctamente (lógico)" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la etiqueta", error: error.message });
  }
};

// Eliminación física en cascada: se borra la etiqueta y se quita de todas las publicaciones
export const eliminarEtiquetaDefinitivo = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const etiqueta = await Etiqueta.findByIdAndDelete(id);

    if (!etiqueta) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    await Publicacion.updateMany({ etiquetas: id }, { $pull: { etiquetas: id } });

    res.status(200).json({ message: "Etiqueta eliminada definitivamente y quitada de las publicaciones" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la etiqueta", error: error.message });
  }
};
