import express from 'express';
import { getAmazonSalesData } from '../controllers/amazon';

const router = express.Router();
 

router.get('/amazon-sales', getAmazonSalesData);

const sourceRouter = router 
export default sourceRouter 