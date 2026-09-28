import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { ReceiptText, PlusCircle, Building2 } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, venRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/vendors')
      ]);
      setExpenses(expRes.data.reverse());
      setVendors(venRes.data);
      if (venRes.data.length > 0 && !formData.vendorId) {
        setFormData((prev) => ({ ...prev, vendorId: venRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch expense records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorId || !formData.description || !formData.amount || Number(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please fill in all mandatory expense details.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/expenses', {
        vendorId: Number(formData.vendorId),
        description: formData.description,
        amount: Number(formData.amount),
        date: formData.date
      });
      setMessage({ type: 'success', text: 'Expense record logged successfully.' });
      setShowModal(false);
      setFormData({
        vendorId: vendors[0]?.id || '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to log expense.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getVendorName = (vendorId) => {
    const v = vendors.find((item) => item.id === vendorId);
    return v ? v.name : `Vendor #${vendorId}`;
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Management</h1>
          <p className="text-sm text-slate-500">
            Track vendor payments, SMS credits, laboratory supplies, and school operational costs.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Log Expense
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

      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between max-w-sm">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Total School Expenses</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
          <ReceiptText className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <Table
        headers={['Expense ID', 'Vendor / Supplier', 'Description', 'Amount (₹)', 'Date', 'Account Type']}
        loading={loading}
        emptyMessage="No expenses recorded yet. Click 'Log Expense' to add one."
      >
        {expenses.map((exp) => (
          <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-3 font-mono text-xs text-slate-500 font-semibold">#{exp.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              {getVendorName(exp.vendorId)}
            </td>
            <td className="px-4 py-3 text-slate-700 text-sm">{exp.description}</td>
            <td className="px-4 py-3 font-bold text-rose-700">₹{exp.amount.toLocaleString('en-IN')}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-600">{exp.date}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                School Operations
              </span>
            </td>
          </tr>
        ))}
      </Table>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Log School Expense</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Vendor / Payee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={vendors.length === 0}
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expense Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5,000 Twilio SMS Credits, Chemistry Lab Uniforms"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Logging...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
