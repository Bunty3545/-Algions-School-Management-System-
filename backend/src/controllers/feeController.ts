import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as feeService from '../services/feeService';

export const createInvoiceSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  amount: z.number().positive('Invoice amount must be positive'),
  dueDate: z.string().min(1),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.string().optional(),
  referenceNote: z.string().optional(),
});

export async function getInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, status } = req.query as { studentId?: string; status?: string };
    const invoices = await feeService.getAllInvoices({ studentId, status });
    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await feeService.createFeeInvoice({
      ...req.body,
      createdById: req.user!.id,
    });
    return res.status(201).json({
      success: true,
      message: 'Fee invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

export async function payInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { invoiceId, amount, paymentMethod, referenceNote } = req.body;
    const result = await feeService.recordFeePayment({
      invoiceId,
      amount,
      paymentMethod,
      referenceNote,
      receivedById: req.user!.id,
    });
    return res.status(200).json({
      success: true,
      message: 'Simulated payment processed and ledger reconciled successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentFees(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;
    const summary = await feeService.getStudentFeeSummary(studentId);
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getReconciliation(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.query as { studentId?: string };
    const reconciliation = await feeService.getFeeLedgerReconciliation(studentId);
    return res.status(200).json({ success: true, data: reconciliation });
  } catch (error) {
    next(error);
  }
}
