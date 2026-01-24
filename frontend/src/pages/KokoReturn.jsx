import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { orderAPI } from "../services/api";
import CartContext from "../context/CartContext";

const KokoReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useContext(CartContext);
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleKokoReturn();
  }, []);

  const handleKokoReturn = async () => {
    try {
      const orderId = searchParams.get("orderId");
      const trnId = searchParams.get("trnId");
      const status = searchParams.get("status");

      console.log("Koko return:", { orderId, trnId, status });

      if (status !== "SUCCESS") {
        setError("Payment was not successful");
        navigate(`/payment/cancel?orderId=${orderId}&status=${status}`);
        return;
      }

      // Get order data from sessionStorage
      const orderDataStr = sessionStorage.getItem("kokoOrderData");
      if (!orderDataStr) {
        console.error("No order data found in sessionStorage");
        setError("Order data not found. Please contact support.");
        return;
      }

      const orderData = JSON.parse(orderDataStr);

      // Verify order ID matches
      if (orderData.order_number !== orderId) {
        console.error(
          `Order ID mismatch! Koko: ${orderId}, Local: ${orderData.order_number}`
        );
        setError("Security error. Please contact support.");
        return;
      }

      console.log("Creating order in database after Koko payment...");

      // Create order in database
      const orderResponse = await orderAPI.createOrder(orderData);

      if (orderResponse.data.success) {
        console.log("Order created successfully:", orderResponse.data.data);

        // Clear sessionStorage
        sessionStorage.removeItem("kokoOrderData");

        // Clear cart
        await clearCart();

        // Redirect to success page
        navigate(
          `/payment/success?orderId=${orderId}&trnId=${trnId}&status=SUCCESS&paymentMethod=Koko`
        );
      } else {
        throw new Error(
          orderResponse.data.message || "Failed to create order"
        );
      }
    } catch (err) {
      console.error("Error processing Koko return:", err);
      setError(
        `Payment successful but failed to save order. Please contact support with order ID: ${searchParams.get(
          "orderId"
        )}`
      );
    } finally {
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Processing Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment and create your order...
          </p>
        </div>
      </div>
    </div>
  );
};

export default KokoReturn;
