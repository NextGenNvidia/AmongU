import { IRegistration } from '../models/Registration';

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
    'Fee (INR)',
    'Payment Status',
    'Payment Method',
    'Razorpay Order ID',
    'Razorpay Payment ID',
    'Verified At',
    'Created At',
  ];

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = registrations.map((r) => [
    escapeCsv(r._id),
    escapeCsv(r.name),
    escapeCsv(r.collegeId),
    escapeCsv(r.year),
    escapeCsv(r.branch),
    escapeCsv(r.section),
    escapeCsv(r.phone),
    escapeCsv(r.email),
    escapeCsv(r.amount),
    escapeCsv(r.paymentStatus),
    escapeCsv(r.paymentMethod),
    escapeCsv(r.razorpayOrderId || ''),
    escapeCsv(r.razorpayPaymentId || ''),
    escapeCsv(r.verifiedAt ? r.verifiedAt.toISOString() : ''),
    escapeCsv(r.createdAt ? r.createdAt.toISOString() : ''),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};
