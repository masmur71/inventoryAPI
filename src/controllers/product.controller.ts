import { Request, Response } from 'express';
// UPDATE: Import IProduct interface juga di sini
import Product, { IProduct } from '../models/product.model';
import redisClient from '../config/redis';

const clearCache = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis Delete Error:', error);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    await clearCache('products'); 
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'products';
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Serving from Cache');
      res.json(JSON.parse(cachedData));
      return; 
    }

    console.log('Serving from MongoDB');
    const products = await Product.find().sort({ createdAt: -1 });

    await redisClient.setEx(cacheKey, 60, JSON.stringify(products));
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await redisClient.setEx(cacheKey, 60, JSON.stringify(product));
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const purchaseProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { quantity } = req.body; 

  try {
    // --- PERBAIKAN DI SINI ---
    const product = await Product.findOneAndUpdate(
      // FIX 1: Gunakan 'as any' pada filter agar TS tidak rewel soal _id
      { 
        _id: id, 
        stock: { $gte: quantity } 
      } as any,
      { 
        $inc: { stock: -quantity } 
      },
      { new: true }
    ) as IProduct | null; // FIX 2: Paksa TS menganggap hasilnya adalah IProduct atau null

    if (!product) {
      res.status(400).json({ message: 'Pembelian gagal: Stok tidak mencukupi atau produk tidak ditemukan' });
      return;
    }

    await clearCache('products');     
    await clearCache(`product:${id}`); 

    // Sekarang product.stock aman diakses
    res.json({ message: 'Pembelian berhasil', remainingStock: product.stock });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};