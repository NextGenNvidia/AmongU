'use client';

import React, { useState } from 'react';
import { adminService } from '../../../services/admin.service';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS, ALLOWED_YEARS } from '../../../constants/branches';

export default function AdminManualEntryPage() {
  const [formData, setFormData] = useState<{
    name: string;
    collegeId: string;
    year: string;
    branch: string;
    section: string;
    phone: string;
    email: string;
    notes: string;
  }>({
    name: '',
    collegeId: '',
    year: '1',
    branch: ALLOWED_BRANCHES[0],
    section: 'A',
    phone: '',
    email: '',
    notes: 'Paid via cash at offline desk',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      setSubmitting(true);
      const res = await adminService.manualRegister(formData);
      if (res.success) {
        setSuccessMsg(`Successfully registered ${res.registration.name} (ID: ${res.registration.collegeId})!`);
        setFormData({
          name: '',
          collegeId: '',
          year: '1',
          branch: ALLOWED_BRANCHES[0],
          section: 'A',
          phone: '',
          email: '',
          notes: 'Paid via cash at offline desk',
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Error creating manual registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">ON-SPOT DESK REGISTRATION</h1>
        <p className="text-gray-400 text-sm font-bold mt-1">
          Register a participant paying via cash directly at the club desk
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-950/80 border-2 border-crew-lime text-crew-lime font-bold p-4 rounded-xl text-center">
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/80 border-2 border-crew-red text-red-200 font-bold p-4 rounded-xl text-center">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="au-card bg-gray-900 p-6 md:p-8 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-crew-cyan font-bold mb-1 text-sm">Full Name (First &amp; Last)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label className="block text-crew-cyan font-bold mb-1 text-sm">College ID (15 Digits)</label>
            <input
              type="text"
              required
              maxLength={15}
              value={formData.collegeId}
              onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
              className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono"
              placeholder="210029012000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-crew-cyan font-bold mb-1 text-sm">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
              >
                {ALLOWED_YEARS.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-crew-cyan font-bold mb-1 text-sm">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
              >
                {ALLOWED_SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-crew-cyan font-bold mb-1 text-sm">Branch</label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan"
            >
              {ALLOWED_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-crew-cyan font-bold mb-1 text-sm">WhatsApp Number</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-crew-cyan font-bold mb-1 text-sm">KIET Email (@kiet.edu)</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan font-mono text-xs"
                placeholder="student.name@kiet.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-crew-cyan font-bold mb-1 text-sm">Notes / Cash Receipt Remark</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-black au-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-crew-cyan text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full au-btn bg-crew-lime hover:bg-green-400 text-black font-display text-xl py-3.5 rounded-xl mt-4"
          >
            {submitting ? 'RECORDING REGISTRATION...' : 'CONFIRM CASH REGISTRATION (₹55)'}
          </button>
        </form>
      </div>
    </div>
  );
}
