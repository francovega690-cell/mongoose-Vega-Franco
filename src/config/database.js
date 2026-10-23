import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB exitosa:", mongoose.connection.name);
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1); // esto es para que si mongo no esta prendido no arranca
  }
};
