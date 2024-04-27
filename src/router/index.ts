import express from 'express';

import sourceRouter from './sourceRouter';
const router = express.Router();

router.use('/source', sourceRouter);
 

export default router    