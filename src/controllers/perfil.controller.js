import { matchedData } from "express-validator";
import { Perfil } from "../models/perfil.model.js";

export const crearPerfil = async (req, res) => {
  try {
    const datos = matchedData(req);
    const perfil = await Perfil.create(datos);
    await perfil.populate("usuario", "nombre email");
    res.status(201).json({ message: "Perfil creado correctamente", perfil });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el perfil", error: error.message });
  }
};

export const obtenerPerfiles = async (req, res) => {
  try {
    const perfiles = await Perfil.find({ esActivo: true }).populate("usuario", "nombre email");
    res.status(200).json(perfiles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los perfiles", error: error.message });
  }
};

export const obtenerPerfilPorId = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const perfil = await Perfil.findOne({ _id: id, esActivo: true }).populate("usuario", "nombre email");

    if (!perfil) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.status(200).json(perfil);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const { id, ...datos } = matchedData(req);
    const perfil = await Perfil.findOneAndUpdate({ _id: id, esActivo: true }, datos, {
      returnDocument: "after",
      runValidators: true,
    }).populate("usuario", "nombre email");

    if (!perfil) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.status(200).json({ message: "Perfil actualizado correctamente", perfil });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el perfil", error: error.message });
  }
};

// Eliminación lógica: el perfil no tiene documentos que dependan de él
export const eliminarPerfil = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const perfil = await Perfil.findOneAndUpdate(
      { _id: id, esActivo: true },
      { esActivo: false },
      { returnDocument: "after" },
    );

    if (!perfil) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.status(200).json({ message: "Perfil eliminado correctamente (lógico)" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el perfil", error: error.message });
  }
};

export const eliminarPerfilDefinitivo = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const perfil = await Perfil.findByIdAndDelete(id);

    if (!perfil) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.status(200).json({ message: "Perfil eliminado definitivamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el perfil", error: error.message });
  }
};
