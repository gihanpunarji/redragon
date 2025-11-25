# Koko Payment Gateway Integration

This document outlines the complete implementation of Koko payment gateway (Buy Now Pay Later) integration for the Redragon Colombo e-commerce application.

## Overview

Koko is a Buy Now Pay Later service in Sri Lanka that allows customers to pay in 3 interest-free installments. This integration adds a 14% service fee to the total order amount when customers select Koko as their payment method.

## Important Notes

- **14% Fee**: When Koko payment method is selected, a 14% fee is automatically added to the order total
- **QA Environment**: Currently configured with QA credentials for testing
- **Production**: Production credentials need to be provided and updated in the `.env` file

## Implementation Details

### Backend Implementation

#### 1. Environment Variables (`.env`)

The following credentials have been added to `/backend/.env`:

```env
# Koko Payment Gateway - QA Environment
KOKO_MERCHANT_ID=c8cca514bdfa0582cdc40c9703c71e9d
KOKO_API_KEY=83fA5n1xUaj8OKnX23YY5vlni5q39gBi
KOKO_QA_API_URL=https://qaapi.paykoko.com
KOKO_PROD_API_URL=https://prodapi.paykoko.com
KOKO_PLUGIN_NAME=customapi
KOKO_PLUGIN_VERSION=1.0.1
KOKO_PUBLIC_KEY="-----BEGIN PUBLIC KEY----- ..."
KOKO_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY----- ..."
```

#### 2. Controller (`/backend/controllers/kokoPaymentController.js`)

Implements the following functions:

- **createOrder**: Creates a Koko payment order with RSA-SHA256 signature
  - Automatically adds 14% fee to the order amount
  - Generates unique reference number
  - Signs data using private key
  - Returns form data for auto-submission to Koko

- **handleResponse**: Handles Koko payment callback (webhook)
  - Verifies signature using public key
  - Updates order status in database
  - Returns 200 OK to Koko

- **handleReturn**: Handles success return URL
  - Redirects to frontend success page with order details

- **handleCancel**: Handles cancel URL
  - Redirects to frontend cancel page

- **checkStatus**: Optional status check endpoint
  - Can query Koko API for order status

#### 3. Routes (`/backend/routes/kokoPayment.js`)

API endpoints:

- `POST /api/payment/koko/create` - Create payment order (authenticated)
- `POST /api/payment/koko/response` - Webhook callback (public)
- `GET /api/payment/koko/return` - Return URL (public)
- `GET /api/payment/koko/cancel` - Cancel URL (public)
- `POST /api/payment/koko/check-status` - Check status (authenticated)

#### 4. Database Migration

Run the SQL script to add the Koko transaction ID column:

```bash
mysql -u your_user -p your_database < /backend/add_koko_transaction_id.sql
```

Or manually run:

```sql
ALTER TABLE orders
ADD COLUMN koko_transaction_id VARCHAR(255) DEFAULT NULL;

ALTER TABLE orders
ADD INDEX idx_koko_transaction_id (koko_transaction_id);
```

### Frontend Implementation

#### 1. API Service (`/frontend/src/services/api.js`)

Updated Koko payment API functions:

```javascript
export const kokoPaymentAPI = {
  createOrder: (paymentData) => api.post('/payment/koko/create', paymentData),
  checkStatus: (statusData) => api.post('/payment/koko/check-status', statusData),
};
```

#### 2. Koko Payment Form Component

Created `/frontend/src/components/common/KokoPaymentForm.jsx`:

- Displays loading overlay
- Auto-submits form to Koko payment gateway
- Shows "Redirecting to Koko Payment" message

#### 3. Checkout Integration (`/frontend/src/pages/Checkout.jsx`)

Updated checkout flow:

1. When Koko payment is selected, backend calculates 14% fee
2. Order is created in database
3. Backend generates signed form data
4. Frontend auto-submits form to Koko
5. User completes payment on Koko's platform
6. Koko redirects back to success/cancel URL

#### 4. Payment Success Page (`/frontend/src/pages/PaymentSuccess.jsx`)

Updated to handle Koko payment returns:

- Reads `orderId`, `trnId`, `status` from URL parameters
- Displays success message with transaction details
- Shows order ID, transaction ID, and payment method
- Auto-redirects to account page after 10 seconds

#### 5. Payment Cancel Page (`/frontend/src/pages/PaymentCancel.jsx`)

Already handles Koko payment cancellations:

- Generic cancel page works for all payment methods
- Allows user to retry or return to cart

## Payment Flow

### User Journey

1. **Checkout**: User selects Koko payment method
2. **Fee Display**: 14% fee is shown (calculated automatically)
3. **Place Order**: Order is created with "pending" payment status
4. **Redirect**: User is redirected to Koko payment gateway
5. **Payment**: User completes payment on Koko's platform
6. **Return**: Koko redirects back to success/cancel page
7. **Callback**: Koko sends webhook to update order status

### Technical Flow

```
[Frontend]                 [Backend]              [Koko Gateway]
    |                          |                        |
    |-- POST /koko/create ---->|                        |
    |                          |-- Calculate 14% fee    |
    |                          |-- Generate signature   |
    |<-- Form data ------------|                        |
    |                          |                        |
    |-- Auto-submit form ------------------------------>|
    |                          |                        |
    |                          |<-- Webhook callback ---|
    |                          |-- Verify signature     |
    |                          |-- Update order status  |
    |                          |-- Return 200 OK ------>|
    |                          |                        |
    |<-- Redirect back ---------------------------------|
    |-- Success page ------>|                          |
```

## Testing

### QA Environment Testing

Use the provided QA credentials:

- **Gateway Mobile**: 765283630
- **Gateway Password**: Madhu@123
- **API Endpoint**: https://qaapi.paykoko.com

### Testing Checklist

- [ ] Select Koko payment in checkout
- [ ] Verify 14% fee is added correctly
- [ ] Complete payment on Koko gateway
- [ ] Verify success redirect works
- [ ] Check order status updated in database
- [ ] Test payment cancellation
- [ ] Verify webhook callback updates order
- [ ] Check transaction ID is saved

## Production Deployment

### Before Going Live

1. **Get Production Credentials** from Koko
   - Production merchant ID
   - Production API key
   - Production public/private keys

2. **Update Environment Variables**
   ```env
   KOKO_MERCHANT_ID=<production_merchant_id>
   KOKO_API_KEY=<production_api_key>
   KOKO_PUBLIC_KEY=<production_public_key>
   KOKO_PRIVATE_KEY=<production_private_key>
   ```

3. **Update API URL** in controller (if needed)
   - Change from `KOKO_QA_API_URL` to `KOKO_PROD_API_URL`

4. **Database Migration**
   - Ensure `koko_transaction_id` column exists in production database

5. **Webhook Configuration**
   - Register webhook URL with Koko: `https://yourdomain.com/api/payment/koko/response`
   - Whitelist your server IP with Koko

6. **Testing**
   - Test with small amounts first
   - Verify all callbacks work correctly
   - Check order status updates properly

### Security Considerations

- Private key is stored in environment variables (not in code)
- All requests are signed with RSA-SHA256
- Webhook responses are verified before processing
- HTTPS is required for production

## Troubleshooting

### Common Issues

1. **Signature Verification Failed**
   - Check private/public keys are correct
   - Ensure data string is in exact order as per documentation
   - Verify no extra whitespace or line breaks in keys

2. **Payment Not Updating**
   - Check webhook URL is accessible from internet
   - Verify firewall/security group allows Koko's IP
   - Check database connection in webhook handler

3. **14% Fee Not Applied**
   - Verify backend is calculating fee correctly
   - Check `amount * 1.14` calculation

4. **Form Auto-Submit Not Working**
   - Check React component is rendering
   - Verify form data structure is correct
   - Check browser console for errors

### Debug Mode

Add console logs in controller:

```javascript
console.log('Koko Payment Data:', kokoPaymentData);
console.log('Data String:', dataString);
console.log('Signature:', signature);
```

## Support

For Koko Payment Gateway support:
- Contact Koko support team
- Refer to official Koko documentation
- Check webhook logs in backend

## Files Modified/Created

### Backend
- ✅ `/backend/.env` - Added credentials
- ✅ `/backend/controllers/kokoPaymentController.js` - Complete rewrite
- ✅ `/backend/routes/kokoPayment.js` - Updated routes
- ✅ `/backend/server.js` - Enabled routes
- ✅ `/backend/add_koko_transaction_id.sql` - Database migration

### Frontend
- ✅ `/frontend/src/services/api.js` - Updated API endpoints
- ✅ `/frontend/src/components/common/KokoPaymentForm.jsx` - New component
- ✅ `/frontend/src/pages/Checkout.jsx` - Integrated Koko payment
- ✅ `/frontend/src/pages/PaymentSuccess.jsx` - Updated for Koko returns

## Integration Complete! 🎉

The Koko payment gateway is now fully integrated and ready for testing with QA credentials. Follow the testing checklist above before moving to production.
