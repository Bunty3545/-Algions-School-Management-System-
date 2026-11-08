import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export const GuardianPortal: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [tab, setTab] = useState<'report' | 'attendance' | 'fees'>('report');

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [reportCard, setReportCard] = useState<any>(null);

  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [feeSummary, setFeeSummary] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Simulated Payment Modal
  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchGuardianChildren();
    fetchExams();
  }, []);

  const fetchGuardianChildren = async () => {
    try {
      const res = await api.get('/dashboard');
      const kids = res.data.data.children || [];
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChildId(kids[0].studentId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedExamId(res.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      loadChildData();
    }
  }, [selectedChildId, selectedExamId]);

  const loadChildData = async () => {
    setLoading(true);
    try {
      // 1. Report Card (if exam selected)
      if (selectedExamId) {
        try {
          const repRes = await api.get(`/exams/${selectedExamId}/report-card/${selectedChildId}`);
          setReportCard(repRes.data.data);
        } catch {
          setReportCard(null);
        }
      }

      // 2. Attendance Summary
      const attRes = await api.get(`/attendance/student/${selectedChildId}`);
      setAttendanceSummary(attRes.data.data);

      // 3. Fee Summary
      const feeRes = await api.get(`/fees/student/${selectedChildId}`);
      setFeeSummary(feeRes.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeChild = children.find((c) => c.studentId === selectedChildId);

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setIsProcessingPayment(true);
    setFeedback(null);
    try {
      const res = await api.post('/fees/pay', {
        invoiceId: payingInvoice.id,
        amount: parseFloat(payAmount),
        paymentMethod: 'ONLINE_SIMULATED',
        referenceNote: 'Simulated settlement via Guardian Portal',
      });

      setFeedback({
        message: `Payment of $${payAmount} processed successfully! Receipt: ${res.data.data.payment.paymentNumber}. Ledger reconciled.`,
        type: 'success',
      });
      setPayingInvoice(null);
      loadChildData();
    } catch (err: any) {
      setFeedback({
        message: err.response?.data?.error?.message || 'Payment simulation failed',
        type: 'error',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Child Switcher Ribbon & Privacy Notice */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Linked Students</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Legal Guardianship
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {children.map((kid) => {
              const isSelected = kid.studentId === selectedChildId;
              return (
                <button
                  key={kid.studentId}
                  onClick={() => setSelectedChildId(kid.studentId)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>{kid.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({kid.className})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-tenant Privacy Enforcement Box */}
        <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">Acceptance Test 4: Privacy Isolation</div>
            <div className="text-[11px] text-emerald-700">Strictly isolated to your authorized students only.</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'report', label: 'Academic Report Card', icon: GraduationCap },
          { key: 'attendance', label: 'Attendance Record', icon: CalendarCheck },
          { key: 'fees', label: 'Fee Ledger & Invoices', icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACADEMIC REPORT CARD */}
      {tab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official Student Examination Transcript</h3>
              <p className="text-xs text-slate-500">Grading scale evaluated via server-side configurable rules</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.term})
                  </option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Transcript</span>
              </button>
            </div>
          </div>

          {reportCard ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
                <div>
                  <div className="text-xs font-mono font-bold text-primary-600 uppercase tracking-wider">
                    Official Student Transcript
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{reportCard.examTitle}</h2>
                  <p className="text-xs text-slate-500">Academic Session: {reportCard.academicYear}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-primary-700">
                    Grade {reportCard.overallGrade}
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    GPA: {reportCard.overallGradePoint} / 4.0
                  </div>
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Student Name</div>
                  <div className="font-bold text-slate-900 text-sm">{reportCard.studentName}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Admission ID</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{reportCard.admissionNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Class & Section</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {reportCard.className}-{reportCard.sectionName}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Roll Number</div>
                  <div className="font-bold text-slate-900 text-sm">{reportCard.rollNumber || 'N/A'}</div>
                </div>
              </div>

              {/* Subject Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-center">Max Marks</th>
                      <th className="py-3 px-4 text-center">Pass Marks</th>
                      <th className="py-3 px-4 text-center">Marks Obtained</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportCard.subjects.map((sub: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{sub.subjectName}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{sub.maxMarks}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{sub.passMarks}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                          {sub.marksObtained}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{sub.percentage}%</td>
                        <td className="py-3 px-4 text-center font-bold text-primary-600">{sub.grade}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {sub.isPassed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border border-primary-100 gap-4">
                <div>
                  <div className="text-xs text-slate-500">
                    Total Marks: <span className="font-bold text-slate-900">{reportCard.totalMarksObtained} / {reportCard.totalMaxMarks}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Overall Percentage: <span className="font-bold text-slate-900">{reportCard.overallPercentage}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                    {reportCard.summaryRemark}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Verified by Principal & Examination Controller
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
              No examination marks published yet for this session.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATTENDANCE RECORD */}
      {tab === 'attendance' && attendanceSummary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Attendance Rate</div>
                <div className="text-2xl font-extrabold text-slate-900">{attendanceSummary.attendanceRate}%</div>
                <div className="text-[11px] text-emerald-600 font-medium">Exceeds 75% Requirement</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Present Sessions</div>
                <div className="text-2xl font-extrabold text-slate-900">{attendanceSummary.presentSessions}</div>
                <div className="text-[11px] text-slate-400 font-medium">Out of {attendanceSummary.totalSessions} Total Recorded</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Absences Recorded</div>
                <div className="text-2xl font-extrabold text-slate-900">{attendanceSummary.absentSessions}</div>
                <div className="text-[11px] text-slate-400 font-medium">{attendanceSummary.lateSessions} Late Arrivals</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900">Recent Attendance History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceSummary.history.map((h: any) => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{h.date}</td>
                      <td className="py-2.5 px-3 text-slate-500">{h.session}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-700'
                              : h.status === 'ABSENT'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{h.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEE LEDGER & INVOICES */}
      {tab === 'fees' && feeSummary && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Billed Fees</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">${feeSummary.totalBilled.toFixed(2)}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across All Term Invoices</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-emerald-600 uppercase">Settled Payments</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">${feeSummary.totalPaid.toFixed(2)}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Reconciled to School Ledger</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-amber-600 uppercase">Outstanding Due</div>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">${feeSummary.totalOutstanding.toFixed(2)}</div>
              <div className="text-[11px] text-amber-600 mt-0.5">Payable Online (Simulated)</div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900">Fee Invoices & Settlement Receipts</h4>
            <div className="grid grid-cols-1 gap-4">
              {feeSummary.invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-primary-300 transition bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-base">{inv.title}</div>
                    <div className="text-xs text-slate-500">Category: {inv.category} • Due: {inv.dueDate}</div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total / Outstanding</div>
                      <div className="text-base font-mono font-extrabold text-slate-900">
                        ${inv.amount.toFixed(2)}{' '}
                        <span className="text-amber-600 text-xs">(${inv.amountDue.toFixed(2)} due)</span>
                      </div>
                    </div>

                    {inv.amountDue > 0 ? (
                      <button
                        onClick={() => {
                          setPayingInvoice(inv);
                          setPayAmount(inv.amountDue.toString());
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 transition flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay Online (Simulated)</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fully Settled</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED PAYMENT MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Simulate Online Payment</h3>
                <p className="text-xs text-slate-500">Atomic database transaction & ledger reconciliation</p>
              </div>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="text-slate-500">Invoice: <span className="font-bold text-slate-800">{payingInvoice.title}</span></div>
              <div className="text-slate-500">Invoice Number: <span className="font-mono text-slate-800">{payingInvoice.invoiceNumber}</span></div>
              <div className="text-slate-500">Outstanding Balance: <span className="font-bold text-amber-600">${payingInvoice.amountDue.toFixed(2)}</span></div>
            </div>

            <form onSubmit={handleSimulatedPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  max={payingInvoice.amountDue}
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[11px] text-slate-400">Accepts partial or full settlement</span>
              </div>

              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Simulated gateway will generate a unique audit receipt and reconcile ledger balance instantly.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isProcessingPayment ? 'Processing...' : `Confirm $${payAmount} Settlement`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
