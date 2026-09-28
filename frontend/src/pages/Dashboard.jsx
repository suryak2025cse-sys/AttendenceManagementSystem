import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  ReceiptText,
  Wallet,
  ArrowRight,
  RefreshCw,
  BellRing
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    totalFees: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingFees: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel API calls
      const [studentsRes, attendanceRes, financialRes, notificationsRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/attendance').catch(() => ({ data: [] })),
        api.get('/reports/financial').catch(() => ({ data: { totalFees: 0, totalExpenses: 0, netBalance: 0, pendingFees: 0 } })),
        api.get('/reports/notifications').catch(() => ({ data: [] }))
      ]);

      const students = studentsRes.data || [];
      const attendance = attendanceRes.data || [];
      const financial = financialRes.data || {};
      const notifications = notificationsRes.data || [];

      // Calculate attendance breakdown
      const present = attendance.filter(a => a.status === 'PRESENT').length;
      const absent = attendance.filter(a => a.status === 'ABSENT').length;

      setStats({
        totalStudents: students.length,
        presentCount: present,
        absentCount: absent,
        totalFees: financial.totalFees || 0,
        totalExpenses: financial.totalExpenses || 0,
        netBalance: financial.netBalance || 0,
        pendingFees: financial.pendingFees || 0
      });

      setRecentAttendance(attendance.slice(-5).reverse());
      setRecentNotifications(notifications.slice(-4).reverse());
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend REST API. Ensure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Administration Dashboard</h1>
          <p className="text-sm text-slate-500">Live summary of student attendance, SMS alerts, and school finances.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline font-semibold ml-4">Retry</button>
        </div>
      )}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={loading ? '...' : stats.totalStudents}
          subtitle="Registered in system"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Present Records"
          value={loading ? '...' : stats.presentCount}
          subtitle="Attendance marked PRESENT"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Total Absent Records"
          value={loading ? '...' : stats.absentCount}
          subtitle="SMS notifications triggered"
          icon={UserX}
          color="rose"
        />
        <StatCard
          title="Fees Collected"
          value={loading ? '...' : `₹${stats.totalFees.toLocaleString('en-IN')}`}
          subtitle={`Pending: ₹${stats.pendingFees.toLocaleString('en-IN')}`}
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Total Expenses"
          value={loading ? '...' : `₹${stats.totalExpenses.toLocaleString('en-IN')}`}
          subtitle="SMS credits, supplies, vendor costs"
          icon={ReceiptText}
          color="amber"
        />
        <StatCard
          title="Net School Balance"
          value={loading ? '...' : `₹${stats.netBalance.toLocaleString('en-IN')}`}
          subtitle="Fees Collected − Total Expenses"
          icon={Wallet}
          color={stats.netBalance >= 0 ? 'sky' : 'rose'}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4">Quick Operations</h2>
          <div className="space-y-2.5">
            <Link
              to="/attendance"
              className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 transition font-medium text-sm group"
            >
              <span>Mark Student Attendance (SMS Trigger)</span>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/students/add"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 transition font-medium text-sm group"
            >
              <span>Register New Student</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/fees"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 transition font-medium text-sm group"
            >
              <span>Generate Fee Invoice / Record Payment</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/reports"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 transition font-medium text-sm group"
            >
              <span>View Attendance & Financial Reports</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Recent WhatsApp Notifications Log */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Recent Automated WhatsApp Alerts</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Meta WhatsApp Cloud API Log</span>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No notifications recorded yet. Marking a student as <span className="font-semibold text-rose-500">ABSENT</span> will generate automated WhatsApp alerts.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNotifications.map((n) => (
                <div key={n.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">{n.message}</p>
                    <p className="text-slate-500">To: <span className="font-mono">{n.phoneNumber}</span> | Student ID: #{n.studentId}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase shrink-0 ${
                    n.status && n.status.includes('SENT') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
