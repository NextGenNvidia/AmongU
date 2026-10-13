'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../../services/admin.service';
import { RegistrationRecord } from '../../../types/registration';
import { ALLOWED_BRANCHES } from '../../../constants/branches';

export default function AdminParticipantsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState<'' | 'pending' | 'success' | 'failed'>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getRegistrations({
        page,
        limit: 20,
        search: search.trim() || undefined,
        branch: branch || undefined,
        year: year || undefined,
        paymentStatus: status || undefined,
      });
      if (res.success) {
        setRegistrations(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, branch, year, status]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const blob = await adminService.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amongu-registrations-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;
    try {
      await adminService.updateStatus(id, newStatus, 'Status changed by admin');
      fetchParticipants();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">PARTICIPANT REGISTRATIONS</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">Search, filter and manage event participants</p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-sm py-2 px-6 rounded-full flex items-center gap-2"
        >
          {exporting ? 'EXPORTING...' : '📥 DOWNLOAD CSV'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="au-card bg-gray-900 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Search name, ID, phone, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="bg-black au-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-crew-cyan"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as any);
            setPage(1);
          }}
          className="bg-black au-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="success">Confirmed (Paid)</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            setPage(1);
          }}
          className="bg-black au-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Branches</option>
          {ALLOWED_BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1);
          }}
          className="bg-black au-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
        </select>
      </div>

      {/* Table */}
      <div className="au-card bg-gray-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/60 text-gray-400 font-bold border-b border-gray-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">College ID</th>
                <th className="p-4">Year &amp; Branch</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-bold">
                    Scanning ship logs...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-bold">
                    No participants found matching this filter.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{r.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.email}</p>
                    </td>
                    <td className="p-4 font-mono text-crew-cyan">{r.collegeId}</td>
                    <td className="p-4">
                      <p className="font-bold">
                        Yr {r.year} - {r.branch}
                      </p>
                      <p className="text-xs text-gray-400">Sec: {r.section}</p>
                    </td>
                    <td className="p-4 font-mono text-xs">{r.phone}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          r.paymentStatus === 'success'
                            ? 'bg-crew-lime/20 text-crew-lime border border-crew-lime'
                            : r.paymentStatus === 'pending'
                            ? 'bg-crew-yellow/20 text-crew-yellow border border-crew-yellow'
                            : 'bg-crew-red/20 text-crew-red border border-crew-red'
                        }`}
                      >
                        {r.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={r.paymentStatus}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        className="bg-black text-xs font-bold au-border rounded px-2 py-1 text-gray-300"
                      >
                        <option value="success">Mark Paid</option>
                        <option value="pending">Mark Pending</option>
                        <option value="failed">Mark Failed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-bold">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-black au-border rounded text-xs font-bold disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-black au-border rounded text-xs font-bold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
