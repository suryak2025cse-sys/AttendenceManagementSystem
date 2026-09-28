import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { CreditCard, PlusCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesRes, studentsRes] = await Promise.all([
        api.get('/fees'),
        api.get('/students')
      ]);
      setFees(feesRes.data.reverse());
      setStudents(studentsRes.data);
      if (studentsRes.data.length > 0 && !invoiceForm.studentId) {
        setInvoiceForm((prev) => ({ ...prev, studentId: studentsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch fee records. Ensure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.studentId || !invoiceForm.amount || Number(invoiceForm.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please select a student and enter a valid fee amount.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/fees/invoice', {
        studentId: Number(invoiceForm.studentId),
        amount: Number(invoiceForm.amount)
      });
      setMessage({ type: 'success', text: 'Fee invoice created successfully.' });
      setShowInvoiceModal(false);
      setInvoiceForm({ studentId: students[0]?.id || '', amount: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to create invoice.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (feeId) => {
    try {
      await api.post('/fees/payment', { feeId });
      setMessage({ type: 'success', text: `Fee invoice #${feeId} marked as PAID.` });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to record payment.' });
    }
  };

  const getStudentInfo = (studentId) => {
    return students.find((s) => s.id === studentId);
  };

  const totalCollected = fees
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = fees
    .filter((f) => f.status === 'PENDING')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Management</h1>
          <p className="text-sm text-slate-500">
            Generate student tuition fee invoices and record fee payments.
          </p>
        </div>
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Create Fee Invoice
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-xs ml-4">✕</button>
        </div>
      )}

      {/* Mini Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Fees Collected</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Invoices</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <Table
        headers={['Invoice ID', 'Student Name', 'Class', 'Fee Amount', 'Status', 'Payment Date', 'Actions']}
        loading={loading}
        emptyMessage="No fee invoices generated yet. Click 'Create Fee Invoice' to add one."
      >
        {fees.map((fee) => {
          const student = getStudentInfo(fee.studentId);
          return (
            <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-slate-500 font-semibold">#{fee.id}</td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {student ? student.name : `Student #${fee.studentId}`}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600 font-semibold">
                {student?.className || '—'}
              </td>
              <td className="px-4 py-3 font-bold text-slate-900">
                ₹{fee.amount.toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    fee.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {fee.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {fee.paymentDate || '—'}
              </td>
              <td className="px-4 py-3">
                {fee.status === 'PENDING' ? (
                  <button
                    onClick={() => handleRecordPayment(fee.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark as Paid
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-700">Payment Complete</span>
                )}
              </td>
            </tr>
          );
        })}
      </Table>

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Create Fee Invoice</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={invoiceForm.studentId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={students.length === 0}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Class: {s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 25000"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
