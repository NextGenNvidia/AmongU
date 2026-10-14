import { apiClient } from './api';
import {
  RegistrationFormData,
  RazorpayOrderResponse,
  PaymentVerificationPayload,
  RegistrationRecord,
  VenueCheckInPayload,
  VenueCheckInResponse,
} from '../types/registration';

export const registrationService = {
  // Check my current registration status
  getMyStatus: async (): Promise<{
    success: boolean;
    isRegistered: boolean;
    registration: RegistrationRecord | null;
  }> => {
    const res = await apiClient.get('/registrations/my-status');
    return res.data;
  },

  // Create ₹55 Razorpay order
  createOrder: async (data: RegistrationFormData): Promise<RazorpayOrderResponse> => {
    const res = await apiClient.post<RazorpayOrderResponse>('/registrations/create-order', data);
    return res.data;
  },

  // Verify Razorpay HMAC signature
  verifyPayment: async (payload: PaymentVerificationPayload): Promise<{
    success: boolean;
    message: string;
    registration: RegistrationRecord;
  }> => {
    const res = await apiClient.post('/registrations/verify-payment', payload);
    return res.data;
  },

  // Mark venue attendance via QR scan or College ID
  venueCheckIn: async (payload: VenueCheckInPayload): Promise<VenueCheckInResponse> => {
    const res = await apiClient.post<VenueCheckInResponse>('/registrations/venue-checkin', payload);
    return res.data;
  },
};
