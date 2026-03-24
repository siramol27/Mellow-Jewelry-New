// backend/routes/orderRoutes.js
import { Router } from 'express';
import { createOrder, getMyOrders, getAdminOrders, updateStatus } from '../controllers/orderController.js';
import { userAuth } from '../middleware/userAuth.js';

const router = Router();

// guard บทบาทแบบง่ายจาก req.user.role (userAuth ต้องเซ็ต req.user ให้)
const allowRoles = (...roles) => (req, res, next) => {
  const role = String(req.user?.role || '').toLowerCase();
  if (!role || !roles.map(r => r.toLowerCase()).includes(role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// ต้องล็อกอินทั้งหมด
router.post('/', userAuth, createOrder);
router.get('/my', userAuth, getMyOrders);

// เฉพาะ admin/owner
router.get('/admin', userAuth, allowRoles('admin', 'owner'), getAdminOrders);
router.put('/:id/status', userAuth, allowRoles('admin', 'owner'), updateStatus);

export default router;