import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Table from '../components/Table';
import { UserPlus, Search, Eye, Trash2, X, Phone, Mail, GraduationCap } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load students. Please verify backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.className.toLowerCase().includes(term) ||
            s.parentName.toLowerCase().includes(term) ||
            s.parentPhone.includes(term)
        )
      );
    }
  }, [searchTerm, students]);

  const viewStudentDetails = async (student) => {
    setSelectedStudent(student);
    setStatsLoading(true);
    setStudentStats(null);
    try {
      const res = await api.get(`/students/${student.id}/attendancepercentage`);
      setStudentStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await api.delete(`/students/${id}`);
      setMessage({ type: 'success', text: 'Student deleted successfully.' });
      fetchStudents();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete student.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-sm text-slate-500">Manage enrolled students, parent contact details, and attendance history.</p>
        </div>
        <Link
          to="/students/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition self-start"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-xs ml-4">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by student name, class, parent name, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Students Table */}
      <Table
        headers={['ID', 'Student Name', 'Class', 'Parent Name', 'Parent Phone', 'Email', 'Actions']}
        loading={loading}
        emptyMessage="No students found. Click '+ Add Student' to register your first student."
      >
        {filteredStudents.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-3.5 font-mono text-xs text-slate-500 font-semibold">#{s.id}</td>
            <td className="px-4 py-3.5 font-medium text-slate-900">{s.name}</td>
            <td className="px-4 py-3.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {s.className}
              </span>
            </td>
            <td className="px-4 py-3.5 text-slate-700">{s.parentName}</td>
            <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{s.parentPhone}</td>
            <td className="px-4 py-3.5 text-xs text-slate-500">{s.email || '—'}</td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => viewStudentDetails(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition"
                  title="View Attendance & Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Student Details & Attendance Percentage Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Student Profile</h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Class / Grade:</span>
                <span className="font-semibold text-indigo-700">{selectedStudent.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Parent / Guardian:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.parentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Parent Phone:</span>
                <span className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedStudent.parentPhone}
                </span>
              </div>
              {selectedStudent.email && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {selectedStudent.email}
                  </span>
                </div>
              )}
            </div>

            {/* Attendance Percentage Section */}
            <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4 text-center space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Attendance Performance
              </h4>

              {statsLoading ? (
                <p className="text-xs text-slate-500">Calculating attendance records...</p>
              ) : studentStats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-6">
                    <div>
                      <p className="text-xs text-slate-500">Total Days</p>
                      <p className="text-lg font-bold text-slate-800">{studentStats.totalDays || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Present</p>
                      <p className="text-lg font-bold text-emerald-700">{studentStats.presentDays || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-rose-600">Absent</p>
                      <p className="text-lg font-bold text-rose-700">{studentStats.absentDays || 0}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-indigo-100">
                    <p className="text-xs text-slate-600 font-medium">Attendance Percentage</p>
                    <p className="text-3xl font-extrabold text-indigo-700 mt-1">
                      {studentStats.attendancePercentage || 0}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No attendance data recorded yet.</p>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
