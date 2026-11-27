'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/admin.service';
import { RefundRequestRecord } from '../../types';

export default function RefundsManager() {
  const [refunds, setRefunds] = useState<RefundRequestRecord[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<RefundRequestRecord | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRefunds();
      if (res && res.success) {
        setRefunds(res.refunds || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err: any) {
      console.error('Failed to load refunds:', err);
      setFeedback({
        message: err?.response?.data?.message || err?.message || 'Failed to fetch refund claims',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(upiId);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const openApproveModal = (record: RefundRequestRecord) => {
    setActionTarget(record);
    setActionType('approve');
    setAdminNote('');
  };

  const openRejectModal = (record: RefundRequestRecord) => {
    setActionTarget(record);
    setActionType('reject');
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!actionTarget || !actionType) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      setFeedback({ message: 'A rejection reason is mandatory to inform the cadet.', type: 'error' });
      return;
    }

    try {
      setProcessingAction(true);
      setFeedback(null);

      const res = await adminService.updateRefundStatus(actionTarget._id, {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        rejectionReason: actionType === 'reject' ? rejectionReason.trim() : undefined,
        adminNotes: adminNote.trim() || undefined,
      });

      if (res && res.success) {
        setFeedback({
          message: `Claim for ${actionTarget.name} marked as ${actionType === 'approve' ? 'ACCEPTED' : 'REJECTED'}.`,
          type: 'success',
        });
        setActionTarget(null);
        setActionType(null);
        loadRefunds();
      }
    } catch (err: any) {
      console.error('Failed to update refund status:', err);
      setFeedback({
        message: err?.response?.data?.message || err?.message || 'Error updating refund claim',
        type: 'error',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Filtered & searched refunds
  const filteredRefunds = useMemo(() => {
    return refunds.filter((item) => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term) ||
        item.upiId.toLowerCase().includes(term) ||
        (item.collegeId && item.collegeId.toLowerCase().includes(term)) ||
        (item.paymentId && item.paymentId.toLowerCase().includes(term))
      );
    });
  }, [refunds, filterStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">💸</span>
            <h1 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
              CADET REFUND REQUESTS
            </h1>
            {counts.pending > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold animate-pulse">
                {counts.pending} Pending
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Review fee reimbursements, verify UPI IDs and transaction screenshots, and approve or reject claims.
          </p>
        </div>

        <button
          onClick={loadRefunds}
          disabled={loading}
          className="au-btn bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 py-2 px-4 rounded-xl text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          REFRESH
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-sm font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/70 border-red-500/40 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-mono text-gray-400 uppercase">Total Claims</p>
          <p className="text-3xl font-display text-white mt-1">{counts.total}</p>
          <span className="text-[10px] text-gray-500 font-mono">All submissions</span>
        </div>

        <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4">
          <p className="text-xs font-mono text-amber-400 uppercase">Pending Review</p>
          <p className="text-3xl font-display text-amber-400 mt-1">{counts.pending}</p>
          <span className="text-[10px] text-amber-400/70 font-mono">Requires action</span>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4">
          <p className="text-xs font-mono text-emerald-400 uppercase">Approved / Accepted</p>
          <p className="text-3xl font-display text-emerald-400 mt-1">{counts.approved}</p>
          <span className="text-[10px] text-emerald-400/70 font-mono">Processed</span>
        </div>

        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4">
          <p className="text-xs font-mono text-rose-400 uppercase">Rejected</p>
          <p className="text-3xl font-display text-rose-400 mt-1">{counts.rejected}</p>
          <span className="text-[10px] text-rose-400/70 font-mono">With reasoning</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900/60 p-3 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer shrink-0 ${
                filterStatus === st
                  ? st === 'pending'
                    ? 'bg-amber-500 text-black font-bold'
                    : st === 'approved'
                    ? 'bg-emerald-500 text-black font-bold'
                    : st === 'rejected'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {st} ({st === 'all' ? counts.total : counts[st]})
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search name, email, UPI, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/80 border border-gray-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-crew-cyan"
          />
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-gray-950/90 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-mono text-xs">
            <div className="w-8 h-8 border-2 border-crew-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading refund claims from MongoDB...
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs space-y-2">
            <span className="text-4xl block">🔍</span>
            <p className="text-gray-300 font-bold">No refund claims match your filter.</p>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No refund requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Cadet</th>
                  <th className="py-3 px-4">UPI &amp; Contact</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredRefunds.map((refund) => (
                  <tr key={refund._id} className="hover:bg-gray-900/40 transition-colors">
                    {/* Cadet Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{refund.name}</div>
                      <div className="text-gray-400 text-[11px]">{refund.email}</div>
                      {refund.collegeId && (
                        <span className="inline-block mt-1 bg-black/60 text-crew-cyan px-2 py-0.5 rounded text-[10px] border border-crew-cyan/30">
                          {refund.collegeId}
                        </span>
                      )}
                    </td>

                    {/* UPI & Contact */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-300 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                          {refund.upiId}
                        </span>
                        <button
                          onClick={() => handleCopyUpi(refund.upiId)}
                          title="Copy UPI ID"
                          className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 cursor-pointer"
                        >
                          {copiedUpi === refund.upiId ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                        <span>📞 {refund.phone}</span>
                        <a
                          href={`https://wa.me/91${refund.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          WhatsApp ↗
                        </a>
                      </div>
                    </td>

                    {/* Amount & Payment ID */}
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-400 font-bold text-sm">₹{refund.amount}</div>
                      {refund.paymentId ? (
                        <div className="text-gray-500 text-[10px] font-mono truncate max-w-[130px]" title={refund.paymentId}>
                          ID: {refund.paymentId}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-[10px]">Pre-verified</div>
                      )}
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(refund.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-gray-300 text-xs line-clamp-3 bg-black/40 p-2 rounded-lg border border-gray-800/80">
                        {refund.reason || 'No specific reason stated.'}
                      </p>
                      {refund.status === 'rejected' && refund.rejectionReason && (
                        <div className="mt-1 text-rose-300 text-[10px] bg-rose-950/40 p-1.5 rounded border border-rose-800/40">
                          <strong>Rejection:</strong> {refund.rejectionReason}
                        </div>
                      )}
                      {refund.adminNotes && (
                        <div className="mt-1 text-cyan-300 text-[10px] bg-cyan-950/40 p-1.5 rounded border border-cyan-800/40">
                          <strong>Admin Note:</strong> {refund.adminNotes}
                        </div>
                      )}
                    </td>

                    {/* Screenshot Proof */}
                    <td className="py-3.5 px-4">
                      {refund.screenshotUrl ? (
                        <button
                          onClick={() => setPreviewScreenshot(refund.screenshotUrl || null)}
                          className="group relative block w-14 h-14 rounded-lg overflow-hidden border border-gray-700 hover:border-crew-cyan transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={refund.screenshotUrl}
                            alt="Payment Proof"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold">
                            View
                          </div>
                        </button>
                      ) : (
                        <span className="text-gray-600 text-[11px]">No image</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {refund.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-950/60 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          PENDING
                        </span>
                      )}
                      {refund.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ACCEPTED
                        </span>
                      )}
                      {refund.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 bg-rose-950/60 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          REJECTED
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      {refund.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openApproveModal(refund)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(refund)}
                            className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-700/60 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openApproveModal(refund)}
                            className="text-[10px] text-gray-400 hover:text-emerald-400 underline"
                          >
                            Re-approve
                          </button>
                          <span className="text-gray-600">•</span>
                          <button
                            onClick={() => openRejectModal(refund)}
                            className="text-[10px] text-gray-400 hover:text-rose-400 underline"
                          >
                            Re-reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewScreenshot(null)}
              className="absolute -top-10 right-0 text-white bg-gray-800 hover:bg-crew-red px-3 py-1 rounded-full text-xs font-mono font-bold"
            >
              ✕ CLOSE
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewScreenshot}
              alt="Payment Proof Full"
              className="max-h-[82vh] w-auto object-contain rounded-xl border-2 border-gray-700 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {actionTarget && actionType === 'approve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-emerald-500/40 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-display text-xl">
              <span>✅</span>
              <h3>APPROVE REFUND CLAIM</h3>
            </div>
            <p className="text-xs text-gray-300 font-mono">
              You are accepting the refund claim for <strong className="text-white">{actionTarget.name}</strong> ({actionTarget.email}).
            </p>

            <div className="bg-black/60 p-3 rounded-xl border border-gray-800 text-xs font-mono space-y-1">
              <p className="text-gray-400">Target UPI ID:</p>
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold text-sm">{actionTarget.upiId}</span>
                <button
                  onClick={() => handleCopyUpi(actionTarget.upiId)}
                  className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-gray-700"
                >
                  {copiedUpi === actionTarget.upiId ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-gray-400 pt-1">Refund Amount: <span className="text-emerald-400 font-bold">₹{actionTarget.amount}</span></p>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-mono mb-1">
                Admin Note / UTR / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via GPay Ref: 123456789"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-black/80 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                disabled={processingAction}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={processingAction}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                {processingAction ? 'Confirming...' : 'Confirm Acceptance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionTarget && actionType === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-display text-xl">
              <span>⚠️</span>
              <h3>REJECT REFUND CLAIM</h3>
            </div>
            <p className="text-xs text-gray-300 font-mono">
              Rejecting refund claim for <strong className="text-white">{actionTarget.name}</strong>. The reason will be clearly displayed to the cadet on their refund status screen.
            </p>

            <div>
              <label className="block text-gray-300 text-xs font-mono mb-1">
                Reason for Rejection <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Invalid UPI ID format, payment not received in organizer account, duplicate claim, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-black/80 border border-gray-800 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                disabled={processingAction}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={processingAction || !rejectionReason.trim()}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50"
              >
                {processingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
