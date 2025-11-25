import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const KokoPaymentForm = ({ formData }) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (formData && formRef.current) {
      // Auto-submit form after a short delay to show loading message
      const timer = setTimeout(() => {
        formRef.current.submit();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData]);

  if (!formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Redirecting to Koko Payment
          </h2>

          <p className="text-gray-600 mb-4">
            Please wait while we redirect you to complete your payment securely with Koko.
          </p>

          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        {/* Hidden form that auto-submits */}
        <form
          ref={formRef}
          action={formData.url}
          method="post"
          style={{ display: 'none' }}
        >
          {Object.entries(formData.formData).map(([key, value]) => (
            <input
              key={key}
              type="hidden"
              name={key}
              value={value}
            />
          ))}
        </form>
      </motion.div>
    </div>
  );
};

export default KokoPaymentForm;
