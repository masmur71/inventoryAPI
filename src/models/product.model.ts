import mongoose, { Document, Schema } from 'mongoose';

// 1. Definisikan Tipe Data (Interface)
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Buat Schema
const productSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Nama produk wajib diisi'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Deskripsi wajib diisi']
  },
  price: {
    type: Number,
    required: [true, 'Harga wajib diisi'],
    min: [0, 'Harga tidak boleh negatif']
  },
  stock: {
    type: Number,
    required: [true, 'Stok awal wajib diisi'],
    min: [0, 'Stok tidak boleh kurang dari 0'],
    default: 0
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text' });

// 3. Export Model dengan Tipe IProduct
export default mongoose.model<IProduct>('Product', productSchema);