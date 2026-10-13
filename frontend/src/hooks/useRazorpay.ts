'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay SDK');

    document.body.appendChild(script);

    return () => {
      // Keep script cached
    };
  }, []);

  const openCheckout = (options: {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  }) => {
    if (!window.Razorpay) {
      alert('Razorpay SDK is still loading. Please check your internet connection.');
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { isLoaded, openCheckout };
};
