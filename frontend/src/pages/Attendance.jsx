import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { CalendarCheck, Send, CheckCircle2, AlertTriangle, Smartphone, UserCheck, UserX } from 'lucide-react';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // { type, message }

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    studentId: '',
    date: todayStr,
    status: 'PRESENT'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get('/students'),
        api.get('/attendance')
      ]);
      setStudents(studentsRes.data);
      setAttendanceRecords(attendanceRes.data.reverse());
      if (studentsRes.data.length > 0 && !form.studentId) {
        setForm((prev) => ({ ...prev, studentId: studentsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Could not connect to backend server. Make sure Spring Boot is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!form.studentId) {
      setAlert({ type: 'error', message: 'Please select a student.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const selectedStudent = students.find((s) => s.id === Number(form.studentId));
      await api.post('/attendance', {
        studentId: Number(form.studentId),
        date: form.date,
        status: form.status
      });

      if (form.status === 'ABSENT') {
        setAlert({
          type: 'absent_sms',
          student: selectedStudent,
          message: `Attendance marked as ABSENT for ${selectedStudent?.name || 'student'}. Automated notification dispatched to parent (${selectedStudent?.parentPhone || 'phone'}).`
        });
      } else {
        setAlert({
          type: 'success',
          message: `Attendance marked as PRESENT for ${selectedStudent?.name || 'student'}.`
        });
      }

      // Refresh attendance logs
      const updatedAttendance = await api.get('/attendance');
      setAttendanceRecords(updatedAttendance.data.reverse());
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Failed to record attendance. Please check backend.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentInfo = (studentId) => {
    return students.find((s) => s.id === studentId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
        <p className="text-sm text-slate-500">
          Record student daily attendance with automated Twilio SMS parent notifications on absence.
        </p>
      </div>

      {/* Dynamic Alerts */}
      {alert && (
        <div
          className={`p-4 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
            alert.type === 'absent_sms'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {alert.type === 'absent_sms' ? (
              <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{alert.message}</p>
              {alert.type === 'absent_sms' && alert.student && (
                <p className="text-xs text-amber-700 mt-1">
                  Recipient: <span className="font-mono font-bold">{alert.student.parentPhone}</span>
                </p>
              )}
            </div>
          </div>

          {alert.type === 'absent_sms' && alert.student && (
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <a
                href={`https://wa.me/${alert.student.parentPhone.replace('+', '')}?text=${encodeURIComponent(
                  `Dear Parent, your child ${alert.student.name} was absent from school today. (Smart School Portal)`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                💬 Open WhatsApp Alert
              </a>
              <a
                href={`sms:${alert.student.parentPhone}?body=${encodeURIComponent(
                  `Dear Parent, your child ${alert.student.name} was absent from school today.`
                )}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                📱 Open Device SMS
              </a>
              <button onClick={() => setAlert(null)} className="font-bold text-xs p-1">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Attendance Form & SMS Trigger Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Mark Daily Attendance</h2>
          </div>

          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={students.length === 0}
                >
                  {students.length === 0 ? (
                    <option value="">No students available. Add student first.</option>
                  ) : (
                    students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Class: {s.className} | Parent: {s.parentPhone})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attendance Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Attendance Status Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Attendance Status <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'PRESENT' })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition ${
                    form.status === 'PRESENT'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs ring-2 ring-emerald-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  PRESENT
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'ABSENT' })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition ${
                    form.status === 'ABSENT'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserX className="w-4 h-4 text-rose-600" />
                  ABSENT (WhatsApp Trigger)
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || students.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Recording Attendance...' : 'Submit Attendance'}
              </button>
            </div>
          </form>
        </div>

        {/* WhatsApp Flow Explanation Card */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <h3>Meta WhatsApp Cloud API Gateway</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            When attendance is submitted with status <span className="text-amber-400 font-semibold">ABSENT</span>, the backend executes this automated pipeline:
          </p>
          <div className="bg-slate-800/80 rounded-lg p-3 space-y-1.5 font-mono text-[11px] border border-slate-700">
            <p className="text-slate-400">1. Save record in MySQL <span className="text-indigo-300">attendance</span></p>
            <p className="text-slate-400">2. Query student parent phone</p>
            <p className="text-slate-400">3. Call <span className="text-emerald-300">Meta WhatsApp Cloud API</span></p>
            <p className="text-slate-400">4. Save status in <span className="text-indigo-300">notifications</span> table</p>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            "Dear Parent, your ward Surya was absent on 2026-09-24. Please contact the school for further information."
          </p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800">Recent Attendance Logs</h2>
        <Table
          headers={['Record ID', 'Student Name', 'Class', 'Date', 'Status', 'Parent Contact', 'Action Taken']}
          loading={loading}
          emptyMessage="No attendance records found yet. Submit the form above to record attendance."
        >
          {attendanceRecords.map((record) => {
            const student = getStudentInfo(record.studentId);
            return (
              <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500 font-semibold">#{record.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {student ? student.name : `Student #${record.studentId}`}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-semibold">
                  {student?.className || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">{record.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      record.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {student?.parentPhone || '—'}
                </td>
                <td className="px-4 py-3 text-xs">
                  {record.status === 'ABSENT' ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${(student?.parentPhone || '').replace('+', '')}?text=${encodeURIComponent(
                          `Dear Parent, your child ${student?.name || 'student'} was absent from school today. (Smart School Portal)`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded border border-emerald-200 transition text-[11px]"
                        title="Send via WhatsApp"
                      >
                        💬 WhatsApp
                      </a>
                      <a
                        href={`sms:${student?.parentPhone || ''}?body=${encodeURIComponent(
                          `Dear Parent, your child ${student?.name || 'student'} was absent from school today.`
                        )}`}
                        className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded border border-indigo-200 transition text-[11px]"
                        title="Send via Device SMS"
                      >
                        📱 SMS
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-400">Regular Entry</span>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </div>
    </div>
  );
}
