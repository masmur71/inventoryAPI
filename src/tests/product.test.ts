import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app'; // Import aplikasi Express
import Product from '../models/product.model';
import redisClient from '../config/redis';

// Gunakan Database khusus testing agar data asli tidak terganggu
const TEST_DB_URI = 'mongodb://localhost:27017/inventory_test_db';

beforeAll(async () => {
  // Connect ke DB Test
  await mongoose.connect(TEST_DB_URI);
  // Connect ke Redis
  if (!redisClient.isOpen) await redisClient.connect();
});

afterAll(async () => {
  // Bersihkan DB dan tutup koneksi setelah test selesai
  await Product.deleteMany({});
  await mongoose.connection.close();
  if (redisClient.isOpen) await redisClient.quit();
});

beforeEach(async () => {
  // Kosongkan collection Product setiap sebelum test baru dimulai
  await Product.deleteMany({});
  // Hapus cache Redis
  if (redisClient.isOpen) await redisClient.flushAll();
});

describe('Product API High-Concurrency Test', () => {
  
  // 1. Test Dasar: Create Product
  it('should create a new product', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Laptop Gaming',
      description: 'High Spec',
      price: 15000000,
      stock: 10
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('Laptop Gaming');
  });

  // 2. Test Krusial: Race Condition / Concurrency
  it('should handle high concurrency correctly (prevent overselling)', async () => {
    // Setup: Buat produk dengan STOK HANYA 5
    const product = await Product.create({
      name: 'Limited Edition Sneaker',
      description: 'Rare Item',
      price: 2000000,
      stock: 5 // Stok cuma 5
    });

    // Action: Simulasikan 20 orang membeli BERSAMAAN (Promise.all)
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(
        request(app)
          .post(`/api/products/${product._id}/purchase`)
          .send({ quantity: 1 })
      );
    }

    // Jalankan semua request serentak
    const responses = await Promise.all(requests);

    // Analisa Hasil
    const successResponses = responses.filter(res => res.statusCode === 200);
    const failedResponses = responses.filter(res => res.statusCode === 400);

    console.log(`Sukses Beli: ${successResponses.length}, Gagal: ${failedResponses.length}`);

    // Assertion (Pembuktian)
    expect(successResponses.length).toEqual(5); // Harusnya cuma 5 yg berhasil
    expect(failedResponses.length).toEqual(15); // Sisanya harus gagal

    // Cek Database Terakhir: Stok harus 0, BUKAN minus
    const finalProduct = await Product.findById(product._id);
    expect(finalProduct?.stock).toEqual(0);
  });
});