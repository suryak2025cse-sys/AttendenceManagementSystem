import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import StatCard from '../components/StatCard';
import { BarChart3, CreditCard, ReceiptText, Wallet, Smartphone, RefreshCw, GraduationCap } from 'lucide-react';

export default function Reports() {
  const [financialData, setFinancialData] = useState({
    totalFees: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingFees: 0
  });
  const [studentReports, setStudentReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'financial' | 'sms'

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [financialRes, studentsRes, notifRes] = await Promise.all([
        api.get('/reports/financial'),
        api.get('/students'),
        api.get('/reports/notifications').catch(() => ({ data: [] }))
      ]);

      setFinancialData(financialRes.data || { totalFees: 0, totalExpenses: 0, netBalance: 0, pendingFees: 0 });
      setNotifications((notifRes.data || []).reverse());

      const students = studentsRes.data || [];
      // Fetch attendance percentage for all students
      const reportPromises = students.map(async (s) => {
        try {
          const pRes = await api.get(`/students/${s.id}/attendancepercentage`);
          return {
            id: s.id,
            name: s.name,
            className: s.className,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            ...pRes.data
          };
        } catch {
          return {
            id: s.id,
            name: s.name,
            className: s.className,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            attendancePercentage: 0
          };
        }
      });

      const resolvedReports = await Promise.all(reportPromises);
      setStudentReports(resolvedReports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-sm text-slate-500">
            Attendance percentages, balance sheet calculations, and Twilio SMS notification audits.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Reports
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Student Attendance Report
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'financial'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          School Financial Statement
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'sms'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          WhatsApp Gateway Audit Log
        </button>
      </div>

      {/* Tab 1: Attendance Percentage Report */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Attendance Percentage Formula: <code className="font-bold font-mono">(Present Days / Total Days) × 100</code>
            </span>
          </div>

          <Table
            headers={['Student Name', 'Class', 'Total Days', 'Present', 'Absent', 'Attendance %', 'Performance Rating']}
            loading={loading}
            emptyMessage="No students registered yet."
          >
            {studentReports.map((r) => {
              const pct = r.attendancePercentage || 0;
              let ratingColor = 'bg-emerald-100 text-emerald-800';
              let ratingText = 'Excellent (≥ 85%)';
              if (pct < 75) {
                ratingColor = 'bg-rose-100 text-rose-800';
                ratingText = 'Critical (< 75%)';
              } else if (pct < 85) {
                ratingColor = 'bg-amber-100 text-amber-800';
                ratingText = 'Average (75-84%)';
              }

              return (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{r.name}</td>
                  <td className="px-4 py-3.5 text-xs text-indigo-700 font-semibold">{r.className}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{r.totalDays || 0}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-700">{r.presentDays || 0}</td>
                  <td className="px-4 py-3.5 font-semibold text-rose-700">{r.absentDays || 0}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-base font-extrabold text-slate-900">{pct}%</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${ratingColor}`}>
                      {ratingText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      )}

      {/* Tab 2: Financial Statement */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Fees Collected"
              value={`₹${financialData.totalFees.toLocaleString('en-IN')}`}
              subtitle="Only status = PAID"
              icon={CreditCard}
              color="emerald"
            />
            <StatCard
              title="Total School Expenses"
              value={`₹${financialData.totalExpenses.toLocaleString('en-IN')}`}
              subtitle="Vendors, SMS credits & utilities"
              icon={ReceiptText}
              color="amber"
            />
            <StatCard
              title="Net Balance"
              value={`₹${financialData.netBalance.toLocaleString('en-IN')}`}
              subtitle="Fees Collected − Expenses"
              icon={Wallet}
              color={financialData.netBalance >= 0 ? 'sky' : 'rose'}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-800">Financial Summary Analysis</h3>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-3 flex justify-between">
                <span className="text-slate-600">Total Tuition Fees Collected (PAID)</span>
                <span className="font-bold text-emerald-600">+ ₹{financialData.totalFees.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-slate-600">Total School Expenses Incurred</span>
                <span className="font-bold text-rose-600">− ₹{financialData.totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-3 flex justify-between font-bold text-base bg-slate-50 px-3 rounded-lg mt-2">
                <span className="text-slate-900">Net Operating Balance</span>
                <span className={financialData.netBalance >= 0 ? 'text-indigo-700' : 'text-rose-700'}>
                  ₹{financialData.netBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="py-3 flex justify-between text-xs text-slate-500 pt-3">
                <span>Uncollected / Pending Student Invoices</span>
                <span className="font-semibold text-amber-600">₹{financialData.pendingFees.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: WhatsApp Gateway Audit Log */}
      {activeTab === 'sms' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Meta WhatsApp Notification History</h3>
              <p className="text-xs text-slate-500">
                All automated WhatsApp messages dispatched via Meta Cloud API when attendance is marked ABSENT.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                Sent: {notifications.filter((n) => n.status && n.status.includes('SENT')).length}
              </span>
              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-md">
                Failed: {notifications.filter((n) => !n.status || !n.status.includes('SENT')).length}
              </span>
            </div>
          </div>

          <Table
            headers={['Notification ID', 'Student ID', 'Parent Phone', 'Message Content', 'Delivery Status', 'Timestamp']}
            loading={loading}
            emptyMessage="No SMS notifications recorded yet."
          >
            {notifications.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500 font-semibold">#{n.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">Student #{n.studentId}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-800 font-semibold">{n.phoneNumber}</td>
                <td className="px-4 py-3 text-xs text-slate-700 max-w-md">{n.message}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      n.status && n.status.includes('SENT')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {n.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {n.sentAt ? n.sentAt.replace('T', ' ').substring(0, 19) : '—'}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
