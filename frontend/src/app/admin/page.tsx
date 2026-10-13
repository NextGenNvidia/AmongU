'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '../../services/admin.service';
import { AdminStats } from '../../types/admin';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl text-crew-cyan animate-pulse">GATHERING SHIP METRICS...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-20 text-center">
        <div className="au-card bg-red-950/80 border-crew-red p-6 max-w-md mx-auto rounded-2xl">
          <p className="text-red-200 font-bold mb-4">{error || 'Unable to load statistics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white">COMMAND CENTER</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">Real-time AmongU registrations &amp; metrics</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/participants"
            className="au-btn bg-crew-cyan text-black font-display text-sm py-2 px-5 rounded-full"
          >
            VIEW PARTICIPANTS
          </Link>
          <Link
            href="/admin/manual-entry"
            className="au-btn bg-crew-lime text-black font-display text-sm py-2 px-5 rounded-full"
          >
            + ON-SPOT CASH ENTRY
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="au-card bg-gray-900 border-black p-6 rounded-2xl">
          <p className="text-sm text-gray-400 font-bold uppercase">Total Registrations</p>
          <p className="font-display text-4xl text-white mt-2">{stats.totalRegistrations}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">All recorded attempts</p>
        </div>

        <div className="au-card bg-gray-900 border-black p-6 rounded-2xl">
          <p className="text-sm text-gray-400 font-bold uppercase">Confirmed &amp; Paid</p>
          <p className="font-display text-4xl text-crew-lime mt-2">{stats.paidCount}</p>
          <p className="text-xs text-crew-lime/80 font-bold mt-1">Verified participants</p>
        </div>

        <div className="au-card bg-gray-900 border-black p-6 rounded-2xl">
          <p className="text-sm text-gray-400 font-bold uppercase">Total Revenue (INR)</p>
          <p className="font-display text-4xl text-crew-yellow mt-2">₹{stats.totalRevenueINR}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">₹{stats.feePerUserINR} per registration</p>
        </div>

        <div className="au-card bg-gray-900 border-black p-6 rounded-2xl">
          <p className="text-sm text-gray-400 font-bold uppercase">Pending / Failed</p>
          <p className="font-display text-4xl text-crew-red mt-2">
            {stats.pendingCount} / {stats.failedCount}
          </p>
          <p className="text-xs text-gray-500 font-bold mt-1">Incomplete or dropped payments</p>
        </div>
      </div>

      {/* Department & Year Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch breakdown */}
        <div className="au-card bg-gray-900 p-6 rounded-2xl">
          <h2 className="font-display text-2xl text-crew-cyan mb-4">CONFIRMED BY BRANCH</h2>
          <div className="space-y-3">
            {stats.byBranch.length === 0 ? (
              <p className="text-gray-500 font-bold text-sm">No branch data recorded yet.</p>
            ) : (
              stats.byBranch.map((item) => (
                <div key={item.branch} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-gray-300 text-sm">{item.branch}</span>
                  <span className="font-display text-crew-lime text-base">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Year breakdown */}
        <div className="au-card bg-gray-900 p-6 rounded-2xl">
          <h2 className="font-display text-2xl text-crew-yellow mb-4">CONFIRMED BY YEAR</h2>
          <div className="space-y-3">
            {stats.byYear.length === 0 ? (
              <p className="text-gray-500 font-bold text-sm">No year data recorded yet.</p>
            ) : (
              stats.byYear.map((item) => (
                <div key={item.year} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-gray-300 text-sm">Year {item.year}</span>
                  <span className="font-display text-crew-yellow text-base">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
