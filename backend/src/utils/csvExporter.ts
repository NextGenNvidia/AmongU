import { IRegistration } from '../models/Registration';

const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const stringVal = String(val).replace(/"/g, '""');
  return `"${stringVal}"`;
};

export const convertRegistrationsToCsv = (registrations: IRegistration[]): string => {
  const headers = [
    'Registration ID',
    'Name',
    'College ID',
    'Year',
    'Branch',
    'Section',
    'WhatsApp Number',
    'KIET Email',
    'Track',
    'Fee (INR)',
    'Payment Status',
    'Payment Method',
    'Attendance',
    'Assigned Team',
    'Assigned Role',
    'Razorpay Order ID',
    'Razorpay Payment ID',
    'Verified At',
    'Registered At',
  ];

  const rows = registrations.map((r) => [
    escapeCsv(r._id),
    escapeCsv(r.name),
    escapeCsv(r.collegeId),
    escapeCsv(r.year),
    escapeCsv(r.branch),
    escapeCsv(r.section),
    escapeCsv(r.phone),
    escapeCsv(r.email),
    escapeCsv(r.notes?.includes('Track:') ? r.notes.split('Track:')[1]?.trim() : (r as any).track || 'Web Development'),
    escapeCsv(r.amount),
    escapeCsv(r.paymentStatus),
    escapeCsv(r.paymentMethod),
    escapeCsv(r.isPresent ? 'Present' : 'Absent'),
    escapeCsv(r.assignedTeamName || r.assignedTeamId || 'Unassigned'),
    escapeCsv(r.assignedRole || 'unassigned'),
    escapeCsv(r.razorpayOrderId || ''),
    escapeCsv(r.razorpayPaymentId || ''),
    escapeCsv(r.verifiedAt ? r.verifiedAt.toISOString() : ''),
    escapeCsv(r.createdAt ? r.createdAt.toISOString() : ''),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

export const convertUsersToCsv = (users: any[]): string => {
  const headers = [
    'User ID',
    'Name',
    'Email',
    'Firebase UID',
    'Registration Status',
    'College ID',
    'Year',
    'Branch',
    'Section',
    'WhatsApp Phone',
    'Track',
    'Fee (INR)',
    'Payment Status',
    'Payment ID',
    'Attendance',
    'Account Status',
    'First Signed In At',
    'Registered At',
    'Last 24h Reminder At',
  ];

  const rows = users.map((u) => [
    escapeCsv(u.id || u._id),
    escapeCsv(u.name || ''),
    escapeCsv(u.email || ''),
    escapeCsv(u.firebaseUid || ''),
    escapeCsv(u.hasRegistered ? 'Registered (Paid)' : 'Pending (Unpaid)'),
    escapeCsv(u.registration?.collegeId || ''),
    escapeCsv(u.registration?.year || ''),
    escapeCsv(u.registration?.branch || ''),
    escapeCsv(u.registration?.section || ''),
    escapeCsv(u.registration?.phone || ''),
    escapeCsv(u.registration?.track || ''),
    escapeCsv(u.registration?.amount || (u.hasRegistered ? 55 : 0)),
    escapeCsv(u.registration?.paymentStatus || (u.hasRegistered ? 'success' : 'pending')),
    escapeCsv(u.registration?.paymentId || ''),
    escapeCsv(u.registration?.isPresent ? 'Present' : 'Absent'),
    escapeCsv(u.isBlocked ? 'Blocked' : 'Active'),
    escapeCsv(u.createdAt ? new Date(u.createdAt).toISOString() : ''),
    escapeCsv(u.registration?.registeredAt ? new Date(u.registration.registeredAt).toISOString() : ''),
    escapeCsv(u.lastReminderSentAt ? new Date(u.lastReminderSentAt).toISOString() : ''),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};
