import { prisma } from '../utils/prisma';
import { NotFoundError, AppError } from '../utils/errors';
import { createAuditLog } from './auditService';

export async function getAllInvoices(filter?: { studentId?: string; status?: string }) {
  const where: any = {};
  if (filter?.studentId) where.studentId = filter.studentId;
  if (filter?.status) where.status = filter.status;

  return await prisma.feeInvoice.findMany({
    where,
    include: {
      student: {
        include: {
          section: {
            include: { class: true },
          },
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createFeeInvoice(params: {
  studentId: string;
  title: string;
  category?: string;
  amount: number;
  dueDate: string;
  notes?: string;
  createdById?: string;
}) {
  const { studentId, title, category = 'Tuition Fee', amount, dueDate, notes, createdById } = params;

  if (amount <= 0) {
    throw new AppError('Invoice amount must be greater than zero', 400);
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { section: { include: { class: true } } },
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const invoice = await prisma.feeInvoice.create({
    data: {
      invoiceNumber,
      studentId,
      title,
      category,
      amount,
      amountPaid: 0,
      amountDue: amount,
      dueDate,
      status: 'PENDING',
      notes,
    },
  });

  if (createdById) {
    await createAuditLog({
      userId: createdById,
      action: 'FEE_INVOICE_CREATED',
      entityType: 'FeeInvoice',
      entityId: invoice.id,
      details: `Generated invoice ${invoiceNumber} for ${student.firstName} ${student.lastName} ($${amount})`,
    });
  }

  return invoice;
}

/**
 * Acceptance Test 5 implementation:
 * Atomic payment recording with automatic balance reconciliation & fee ledger integrity check.
 */
export async function recordFeePayment(params: {
  invoiceId: string;
  amount: number;
  paymentMethod?: string;
  referenceNote?: string;
  receivedById?: string;
}) {
  const { invoiceId, amount, paymentMethod = 'ONLINE_SIMULATED', referenceNote, receivedById } = params;

  if (amount <= 0) {
    throw new AppError('Payment amount must be greater than zero', 400);
  }

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: { student: true, payments: true },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.status === 'PAID' || invoice.amountDue <= 0) {
      throw new AppError('This invoice has already been fully settled', 400);
    }

    if (amount > invoice.amountDue) {
      throw new AppError(
        `Payment amount ($${amount}) exceeds the outstanding balance ($${invoice.amountDue})`,
        400
      );
    }

    const paymentNumber = `PAY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionId = `TXN_SIM_${Date.now()}`;

    // 1. Create payment record
    const payment = await tx.feePayment.create({
      data: {
        paymentNumber,
        invoiceId,
        amount,
        paymentMethod,
        referenceNote: referenceNote || 'Simulated online payment settlement',
        transactionId,
        receivedById,
      },
    });

    // 2. Calculate newly reconciled amounts
    const updatedPaid = Math.round((invoice.amountPaid + amount) * 100) / 100;
    const updatedDue = Math.round((invoice.amount - updatedPaid) * 100) / 100;
    const updatedStatus = updatedDue <= 0.001 ? 'PAID' : 'PARTIALLY_PAID';

    // 3. Update invoice with reconciled values
    const updatedInvoice = await tx.feeInvoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: updatedPaid,
        amountDue: Math.max(0, updatedDue),
        status: updatedStatus,
      },
    });

    // 4. Assert mathematical reconciliation: invoice.amount == updatedPaid + updatedDue
    const reconciliationDelta = Math.abs(updatedInvoice.amount - (updatedPaid + updatedInvoice.amountDue));
    if (reconciliationDelta > 0.01) {
      throw new AppError('Critical reconciliation failure: invoice totals do not balance', 500);
    }

    return {
      payment,
      invoice: updatedInvoice,
      reconciliation: {
        totalInvoiceAmount: updatedInvoice.amount,
        totalPaid: updatedInvoice.amountPaid,
        balanceRemaining: updatedInvoice.amountDue,
        isReconciled: true,
      },
    };
  });
}

/**
 * System-wide or Student-level Fee Ledger Audit Reconciliation
 */
export async function getFeeLedgerReconciliation(studentId?: string) {
  const where = studentId ? { studentId } : {};

  const invoices = await prisma.feeInvoice.findMany({
    where,
    include: {
      payments: true,
      student: { select: { firstName: true, lastName: true, admissionNumber: true } },
    },
  });

  let totalBilled = 0;
  let totalPaidRecorded = 0;
  let totalDueRecorded = 0;
  let totalPaymentsInLedger = 0;
  let allInvoicesReconciled = true;

  const discrepancies: any[] = [];

  for (const inv of invoices) {
    totalBilled += inv.amount;
    totalPaidRecorded += inv.amountPaid;
    totalDueRecorded += inv.amountDue;

    const invoicePaymentsSum = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    totalPaymentsInLedger += invoicePaymentsSum;

    const diffPaymentVsInvoice = Math.abs(inv.amountPaid - invoicePaymentsSum);
    const diffEquation = Math.abs(inv.amount - (inv.amountPaid + inv.amountDue));

    if (diffPaymentVsInvoice > 0.01 || diffEquation > 0.01) {
      allInvoicesReconciled = false;
      discrepancies.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        expectedBilled: inv.amount,
        recordedPaid: inv.amountPaid,
        paymentsSum: invoicePaymentsSum,
        recordedDue: inv.amountDue,
      });
    }
  }

  return {
    summary: {
      totalInvoicesCount: invoices.length,
      totalBilled: Math.round(totalBilled * 100) / 100,
      totalPaid: Math.round(totalPaidRecorded * 100) / 100,
      totalOutstanding: Math.round(totalDueRecorded * 100) / 100,
      totalPaymentsSum: Math.round(totalPaymentsInLedger * 100) / 100,
      isReconciled: allInvoicesReconciled,
    },
    discrepancies,
  };
}

export async function getStudentFeeSummary(studentId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      feeInvoices: {
        include: {
          payments: {
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const invoices = student.feeInvoices;
  const totalBilled = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalDue = invoices.reduce((sum, i) => sum + i.amountDue, 0);

  return {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    admissionNumber: student.admissionNumber,
    totalBilled: Math.round(totalBilled * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalOutstanding: Math.round(totalDue * 100) / 100,
    invoices,
  };
}
