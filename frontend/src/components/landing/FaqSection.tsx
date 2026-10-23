import React from 'react';

export const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="py-20 relative z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display text-4xl md:text-5xl text-center mb-12 text-white"
          style={{ textShadow: '4px 4px 0 #000' }}
        >
          COMMUNICATIONS (FAQ)
        </h2>

        <div className="space-y-4">
          <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
            <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
              Who is eligible to participate in AmongU?
              <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4">
              All 1st, 2nd, 3rd, and 4th year students of KIET Group of Institutions with an active @kiet.edu email ID.
            </div>
          </details>

          <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
            <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
              What is the registration fee?
              <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4">
              The entry fee is ₹55 per participant, payable via UPI, debit card, or netbanking via Razorpay.
            </div>
          </details>

          <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
            <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
              What if I face an issue during payment?
              <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4">
              Our backend automatically reconciles payments via Razorpay Webhooks. If your payment is debited, your
              ticket will automatically confirm. You can also visit our club registration desk for manual verification!
            </div>
          </details>

          <details className="au-card bg-gray-900 rounded-xl group cursor-pointer">
            <summary className="font-display text-xl text-white p-6 flex justify-between items-center">
              Will I get participation certificates?
              <span className="text-crew-cyan group-open:rotate-45 transition-transform text-2xl">+</span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 font-bold border-t-2 border-gray-800 pt-4">
              Yes, all registered participants who complete their submissions will receive official event certificates!
            </div>
          </details>
        </div>
      </div>
    </section>
  );
};
