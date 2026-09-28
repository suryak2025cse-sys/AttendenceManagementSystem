import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { Building2, PlusCircle, Phone, Tag } from 'lucide-react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SMS Gateway Vendor',
    phone: ''
  });
  const [message, setMessage] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load vendors.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setMessage({ type: 'error', text: 'Vendor Name and Phone are required.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/vendors', formData);
      setMessage({ type: 'success', text: `Vendor "${formData.name}" added successfully.` });
      setShowModal(false);
      setFormData({ name: '', type: 'SMS Gateway Vendor', phone: '' });
      fetchVendors();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to add vendor.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-sm text-slate-500">
            Manage school service providers, SMS gateway vendors, and suppliers.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Add Vendor
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

      {/* Vendors Table */}
      <Table
        headers={['Vendor ID', 'Vendor Name', 'Type / Category', 'Contact Phone', 'Status']}
        loading={loading}
        emptyMessage="No vendors registered yet. Click 'Add Vendor' to register one."
      >
        {vendors.map((v) => (
          <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-3 font-mono text-xs text-slate-500 font-semibold">#{v.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-900">{v.name}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Tag className="w-3 h-3 text-slate-400" />
                {v.type}
              </span>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-slate-700">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {v.phone}
              </span>
            </td>
            <td className="px-4 py-3 text-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Partner
              </span>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Add New Vendor</h3>
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
                  Vendor / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Twilio SMS Services, Apex Supplies"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vendor Category / Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="SMS Gateway Vendor">SMS Gateway Vendor</option>
                  <option value="School Supply Vendor">School Supply Vendor</option>
                  <option value="Uniform Supplier">Uniform Supplier</option>
                  <option value="IT & Software Services">IT & Software Services</option>
                  <option value="Maintenance & Utilities">Maintenance & Utilities</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +919876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
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
                  {submitting ? 'Saving...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
