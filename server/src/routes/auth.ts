import { Router } from 'express';

const router = Router();

router.get('/test', (_req, res) => {
  res.json({ message: 'Auth routes работают' });
});

export default router;