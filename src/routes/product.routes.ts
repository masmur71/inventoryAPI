import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  purchaseProduct 
} from '../controllers/product.controller';

const router = Router();

// Endpoint Public
router.post('/', createProduct);       // Create
router.get('/', getProducts);          // Read All
router.get('/:id', getProductById);    // Read One
router.post('/:id/purchase', purchaseProduct); // Transaksi Beli

export default router;