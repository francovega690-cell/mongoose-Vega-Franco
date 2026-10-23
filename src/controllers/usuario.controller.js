import { matchedData } from "express-validator";
import { Usuario } from "../models/usuario.model.js";
import { Perfil } from "../models/perfil.model.js";
import { Publicacion } from "../models/publicacion.model.js";

export const crearUsuario = async (req, res) => {
  try {
    const datos = matchedData(req);
    const usuario = await Usuario.create(datos);
    res.status(201).json({ message: "Usuario creado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({ esActivo: true })
      .populate({ path: "perfil", match: { esActivo: true } })
      .populate({ path: "publicaciones", match: { esActivo: true } });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
  }
};

export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const usuario = await Usuario.findOne({ _id: id, esActivo: true })
      .populate({ path: "perfil", match: { esActivo: true } })
      .populate({ path: "publicaciones", match: { esActivo: true } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id, ...datos } = matchedData(req);
    const usuario = await Usuario.findOneAndUpdate({ _id: id, esActivo: true }, datos, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario actualizado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
  }
};

// Eliminación lógica en cascada: se desactiva el usuario, su perfil y sus publicaciones
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const usuario = await Usuario.findOneAndUpdate(
      { _id: id, esActivo: true },
      { esActivo: false },
      { returnDocument: "after" },
    );

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await Perfil.updateOne({ usuario: id }, { esActivo: false });
    await Publicacion.updateMany({ autor: id }, { esActivo: false });

    res.status(200).json({ message: "Usuario eliminado correctamente (lógico)" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};

// Eliminación física en cascada: se borra el usuario, su perfil y sus publicaciones
export const eliminarUsuarioDefinitivo = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const usuario = await Usuario.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await Perfil.deleteOne({ usuario: id });
    await Publicacion.deleteMany({ autor: id });

    res.status(200).json({ message: "Usuario y sus datos relacionados eliminados definitivamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};
