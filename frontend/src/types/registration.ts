export type PaymentStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod = 'razorpay' | 'manual_cash';

export interface RegistrationFormData {
  name: string;
  collegeId: string;
  year: '1' | '2';
  branch: string;
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  phone: string;
  email: string;
}

export interface RegistrationRecord extends RegistrationFormData {
  _id: string;
  userId: string;
  firebaseUid: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  message?: string;
  order: {
    id: string;
    amount: number;
    currency: string;
    keyId: string;
  };
  registrationId: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
