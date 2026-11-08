import { Router } from 'express';
import * as feeController from '../controllers/feeController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles, verifyGuardianStudentAccess } from '../middleware/rbac';
import { validateRequest } from '../middleware/validator';

const router = Router();

router.use(authenticate);

// Fee ledger reconciliation (Admin only)
router.get('/reconciliation', authorizeRoles('ADMIN'), feeController.getReconciliation);

// List invoices (Admin only)
router.get('/invoices', authorizeRoles('ADMIN'), feeController.getInvoices);

// Create new invoice (Admin only)
router.post(
  '/invoices',
  authorizeRoles('ADMIN'),
  validateRequest({ body: feeController.createInvoiceSchema }),
  feeController.createInvoice
);

// Record payment (Simulated payment by Guardian/Student/Admin)
router.post(
  '/pay',
  validateRequest({ body: feeController.recordPaymentSchema }),
  feeController.payInvoice
);

// Student fee summary (Guardian linked only, Student self, or Admin)
router.get(
  '/student/:studentId',
  verifyGuardianStudentAccess('studentId'),
  feeController.getStudentFees
);

export default router;
