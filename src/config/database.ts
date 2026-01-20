import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Tanda seru (!) berarti kita yakin variabel ini ada (non-null assertion)
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Kita casting error sebagai any atau Error agar TS tidak protes
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;