# PayPal Integration Setup Guide 💳

This guide will help you set up PayPal payment integration for the Codeless E-Learning Platform.

---

## 🎯 Current Status

- ✅ **Backend**: Fully integrated with PayPal Checkout SDK
- ✅ **Frontend**: Demo mode implemented (auto-approves payments)
- ⏳ **Production**: Requires PayPal credentials and JS SDK integration

---

## 🚀 Quick Start (Sandbox Testing)

### Step 1: Create PayPal Developer Account

1. Go to https://developer.paypal.com
2. Click **"Log in to Dashboard"**
3. Sign in with your PayPal account (or create one)

### Step 2: Create a Sandbox App

1. Navigate to **"My Apps & Credentials"**
2. Switch to **"Sandbox"** tab
3. Click **"Create App"**
4. Name your app: `Codeless E-Learning Sandbox`
5. Click **"Create App"**

### Step 3: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- **Secret**: `YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY`

Copy these values!

### Step 4: Set Environment Variables

#### On Windows (PowerShell):
```powershell
$env:PAYPAL_CLIENT_ID="YOUR_SANDBOX_CLIENT_ID"
$env:PAYPAL_CLIENT_SECRET="YOUR_SANDBOX_SECRET"
$env:PAYPAL_BASE_URL="https://api-m.sandbox.paypal.com"
```

#### On Linux/Mac:
```bash
export PAYPAL_CLIENT_ID="YOUR_SANDBOX_CLIENT_ID"
export PAYPAL_CLIENT_SECRET="YOUR_SANDBOX_SECRET"
export PAYPAL_BASE_URL="https://api-m.sandbox.paypal.com"
```

#### Or update `.env` file (recommended):
```env
PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_SECRET
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=
```

### Step 5: Create Sandbox Test Accounts

1. In PayPal Developer Dashboard, go to **"Sandbox" → "Accounts"**
2. You'll see auto-generated accounts:
   - **Business Account** (Merchant) - receives payments
   - **Personal Account** (Buyer) - makes payments
3. Click **"View/Edit Account"** to see login credentials

**Important**: Note the email and password for the **Personal Account** (buyer)!

---

## 🔧 Frontend Integration (Full PayPal Buttons)

### Step 1: Add PayPal JS SDK to `index.html`

Edit `frontend/src/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Codeless E-Learning</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  
  <!-- PayPal SDK -->
  <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

**Replace** `YOUR_CLIENT_ID` with your actual PayPal Client ID.

### Step 2: Update Checkout Component

Edit `frontend/src/app/pages/checkout/checkout.component.ts`:

```typescript
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
// ... other imports

export class CheckoutComponent implements OnInit, AfterViewInit {
  // ... existing code

  ngAfterViewInit(): void {
    // Only render PayPal buttons if cart has items
    if (this.cartItems.length > 0) {
      this.renderPayPalButtons();
    }
  }

  private renderPayPalButtons(): void {
    const paypal = (window as any).paypal;
    
    if (!paypal) {
      console.error('PayPal SDK not loaded!');
      return;
    }

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      
      createOrder: (data: any, actions: any) => {
        // Generate idempotency key
        const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Prepare checkout request
        const checkoutRequest = {
          items: this.cartItems.map(item => ({
            courseId: item.course.id,
            quantity: 1
          })),
          idempotencyKey: idempotencyKey
        };

        // Call backend to create order
        return fetch('http://localhost:8080/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(checkoutRequest)
        })
        .then(res => res.json())
        .then(data => {
          console.log('Order created:', data);
          return data.paypalOrderId; // Return PayPal order ID
        });
      },
      
      onApprove: (data: any, actions: any) => {
        console.log('Payment approved:', data.orderID);
        
        // Call backend to capture payment
        return fetch('http://localhost:8080/api/checkout/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ paypalOrderId: data.orderID })
        })
        .then(res => res.json())
        .then(result => {
          console.log('Payment captured:', result);
          
          // Clear cart
          this.cartService.clearCart().subscribe({
            next: () => {
              // Navigate to success page
              this.router.navigate(['/my-courses'], {
                queryParams: { orderSuccess: 'true', orderId: result.orderId }
              });
            }
          });
        });
      },
      
      onError: (err: any) => {
        console.error('PayPal error:', err);
        this.errorMessage = 'Payment failed. Please try again.';
      }
    }).render('#paypal-button-container');
  }

  // Keep the demo completeOrder() method for testing without PayPal
  // ... existing code
}
```

### Step 3: Update Checkout Template

Edit the payment section in the template:

```html
<div class="payment-section" *ngIf="cartItems.length > 0">
  <h2>Payment Method</h2>
  
  <!-- PayPal Button Container -->
  <div id="paypal-button-container"></div>
  
  <!-- OR separator -->
  <div class="payment-separator">
    <span>OR</span>
  </div>
  
  <!-- Demo Mode Button (for testing without PayPal credentials) -->
  <div class="payment-demo">
    <p class="demo-note">Demo Mode (for testing)</p>
    <button class="btn-complete-order-demo" 
            [disabled]="isProcessing"
            (click)="completeOrder()">
      {{ isProcessing ? 'Processing...' : 'Complete Order (Demo)' }}
    </button>
  </div>
  
  <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
</div>
```

---

## 🧪 Testing with Sandbox

### 1. Start Application

```bash
# Backend
cd backend/codeless-backend
./mvnw.cmd spring-boot:run

# Frontend
cd frontend
ng serve
```

### 2. Test Flow

1. **Login** as `user@example.com` / `password`
2. **Add courses to cart**
3. **Proceed to checkout**
4. **Click PayPal button**
5. **Login with sandbox buyer account**
   - Email: `sb-xxxxx@personal.example.com` (from PayPal dashboard)
   - Password: `XXXXXXXX` (from PayPal dashboard)
6. **Complete payment**
7. **Verify**:
   - Redirected to "My Courses"
   - Courses enrolled
   - Cart cleared
   - Order in database

### 3. Check PayPal Dashboard

1. Go to **Sandbox → Accounts**
2. Click **"View/Edit"** on Business Account
3. Click **"Login to Sandbox"**
4. View transaction in PayPal sandbox

---

## 🔐 Production Setup

### When Ready for Production:

1. **Switch to Live Mode**:
   - In PayPal Dashboard, go to **"Live"** tab
   - Create a **Live App**
   - Get **Live Credentials**

2. **Update Environment Variables**:
   ```env
   PAYPAL_CLIENT_ID=LIVE_CLIENT_ID
   PAYPAL_CLIENT_SECRET=LIVE_CLIENT_SECRET
   PAYPAL_BASE_URL=https://api-m.paypal.com
   ```

3. **Update Frontend**:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=LIVE_CLIENT_ID&currency=USD"></script>
   ```

4. **Business Verification**:
   - Complete PayPal Business Account verification
   - Link bank account for payouts
   - Complete compliance forms

---

## 🎯 Webhook Setup (Optional but Recommended)

### Why Webhooks?

Webhooks provide real-time payment notifications and handle edge cases (e.g., user closes browser before redirect).

### Setup Steps:

1. **In PayPal Dashboard**:
   - Go to **"Webhooks"**
   - Click **"Create Webhook"**
   - Webhook URL: `https://yourdomain.com/api/checkout/webhook/paypal`
   - Select events:
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`
     - `PAYMENT.CAPTURE.REFUNDED`

2. **Get Webhook ID**:
   - Copy the Webhook ID
   - Set environment variable:
     ```env
     PAYPAL_WEBHOOK_ID=YOUR_WEBHOOK_ID
     ```

3. **Webhook is Already Implemented**:
   - Backend: `CheckoutWebhookController.java`
   - Signature verification: `PayPalService.verifyWebhookSignature()`
   - Currently accepts all webhooks (insecure - TODO: implement proper verification)

---

## 💡 Tips & Best Practices

### Security:
- ✅ **Never commit** PayPal credentials to Git
- ✅ **Always use** environment variables
- ✅ **Enable** webhook signature verification in production
- ✅ **Use HTTPS** in production

### Testing:
- ✅ Test with **multiple sandbox accounts**
- ✅ Test **edge cases**: declined cards, cancelled payments
- ✅ Test **idempotency**: click PayPal button multiple times

### Performance:
- ✅ **Cache** PayPal SDK client
- ✅ **Log** all PayPal API calls for debugging
- ✅ **Monitor** webhook delivery

### User Experience:
- ✅ Show **clear loading states**
- ✅ Provide **error messages** for failed payments
- ✅ Send **confirmation emails** after successful payment
- ✅ Display **receipt** on success page

---

## 🆘 Troubleshooting

### Problem: "PayPal SDK not loaded"

**Solution**: Check `index.html` has PayPal script tag with correct Client ID.

---

### Problem: "Invalid credentials"

**Solution**: 
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set correctly
- Ensure you're using **Sandbox** credentials with sandbox URL
- Check for extra spaces in environment variables

---

### Problem: "Order not found"

**Solution**:
- Check backend logs for PayPal order creation errors
- Verify database has order with `provider_payment_id`
- Check `OrderRepository.findByProviderPaymentId()` method

---

### Problem: "Payment approved but enrollments not created"

**Solution**:
- Check `/api/checkout/capture` endpoint logs
- Verify `OrderService.markOrderAsPaidAndEnroll()` executed
- Check `enrollment` table in database
- Look for errors in `GlobalExceptionHandler`

---

## 📚 Resources

- **PayPal Developer Docs**: https://developer.paypal.com/docs/
- **Checkout SDK Reference**: https://developer.paypal.com/sdk/js/reference/
- **Webhooks Guide**: https://developer.paypal.com/api/rest/webhooks/
- **Sandbox Testing**: https://developer.paypal.com/tools/sandbox/

---

## ✅ Checklist

Before going to production:

- [ ] PayPal Business Account verified
- [ ] Live credentials obtained
- [ ] Webhook endpoint deployed and tested
- [ ] Webhook signature verification implemented
- [ ] SSL/HTTPS enabled
- [ ] Error logging configured
- [ ] Email notifications set up
- [ ] Refund policy defined
- [ ] Terms of service updated
- [ ] Privacy policy includes payment info
- [ ] Compliance with local regulations

---

**Happy Coding!** 🚀

If you encounter any issues, check the logs and refer to PayPal's official documentation.

