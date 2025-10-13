import { Component, OnInit, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="checkout-page">
      <div class="container">
        <h1 class="page-title">Checkout</h1>
        
        <div class="checkout-layout">
          <!-- Order Summary -->
          <div class="order-summary">
            <h2>Order Summary</h2>
            
            <div class="cart-items" *ngIf="cartItems().length > 0">
              <div class="cart-item" *ngFor="let item of cartItems()">
                <img [src]="item.course.imageUrl || 'https://via.placeholder.com/80x60'" 
                     [alt]="item.course.title"
                     class="item-image">
                <div class="item-details">
                  <h3 class="item-title">{{ item.course.title }}</h3>
                  <span class="item-type">{{ item.course.kind }}</span>
                </div>
                <div class="item-price">\${{ item.course.price }}</div>
              </div>
            </div>

            <div class="empty-cart" *ngIf="cartItems().length === 0">
              <p>Your cart is empty.</p>
              <a routerLink="/courses" class="btn-browse">Browse Courses</a>
            </div>

            <div class="summary-totals" *ngIf="cartItems().length > 0">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>\${{ getSubtotal() }}</span>
              </div>
              <div class="total-row discount">
                <span>Discount:</span>
                <span>-\$0.00</span>
              </div>
              <div class="total-row total">
                <span>Total:</span>
                <span>\${{ getSubtotal() }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="payment-section" *ngIf="cartItems().length > 0">
            <h2>Payment Method</h2>
            
            <!-- Payment Method Selection -->
            <div class="payment-methods">
              <div class="payment-method-option" 
                   [class.selected]="selectedPaymentMethod === 'card'"
                   (click)="selectPaymentMethod('card')">
                <div class="radio-circle">
                  <div class="radio-dot" *ngIf="selectedPaymentMethod === 'card'"></div>
                </div>
                <div class="payment-method-info">
                  <div class="payment-method-title">Credit / Debit Card</div>
                  <div class="payment-method-icons">
                    <span class="card-icon">💳</span>
                    <span class="card-brand">Visa</span>
                    <span class="card-brand">Mastercard</span>
                    <span class="card-brand">Amex</span>
                  </div>
                </div>
              </div>

              <div class="payment-method-option" 
                   [class.selected]="selectedPaymentMethod === 'paypal'"
                   (click)="selectPaymentMethod('paypal')">
                <div class="radio-circle">
                  <div class="radio-dot" *ngIf="selectedPaymentMethod === 'paypal'"></div>
                </div>
                <div class="payment-method-info">
                  <div class="payment-method-title">PayPal</div>
                  <div class="payment-method-desc">Pay securely with PayPal</div>
                </div>
              </div>
            </div>

            <!-- Credit Card Form -->
            <div class="payment-form" *ngIf="selectedPaymentMethod === 'card'">
              <p class="form-note">Demo Mode: Use any card details for testing</p>
              
              <div class="form-group">
                <label>Card Number</label>
                <input type="text" 
                       placeholder="1234 5678 9012 3456" 
                       class="form-input"
                       maxlength="19">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Expiry Date</label>
                  <input type="text" 
                         placeholder="MM/YY" 
                         class="form-input"
                         maxlength="5">
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input type="text" 
                         placeholder="123" 
                         class="form-input"
                         maxlength="4">
                </div>
              </div>

              <div class="form-group">
                <label>Cardholder Name</label>
                <input type="text" 
                       placeholder="John Doe" 
                       class="form-input">
              </div>

              <button class="btn-complete-order" 
                      [disabled]="isProcessing"
                      (click)="completeOrder()">
                {{ isProcessing ? 'Processing Payment...' : 'Pay $' + getSubtotal() }}
              </button>
            </div>

            <!-- PayPal Payment -->
            <div class="payment-form" *ngIf="selectedPaymentMethod === 'paypal'">
              <p class="form-note">Demo Mode: PayPal integration ready</p>
              
              <button class="btn-complete-order btn-paypal" 
                      [disabled]="isProcessing"
                      (click)="completeOrder()">
                {{ isProcessing ? 'Processing...' : 'Continue with PayPal' }}
              </button>
            </div>
            
            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
            
            <div class="secure-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Your payment information is secure & encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .checkout-page {
      min-height: calc(100vh - 200px);
      padding: 2rem 0;
      background: #F8F9FB;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1A1D29;
      margin-bottom: 2rem;
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 968px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }
    }

    .order-summary, .payment-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid #E5E7EB;
    }

    .order-summary h2, .payment-section h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1A1D29;
      margin-bottom: 1.5rem;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      background: #F9FAFB;
      border-radius: 12px;
      align-items: center;
    }

    .item-image {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1A1D29;
      margin: 0;
    }

    .item-type {
      font-size: 0.75rem;
      color: #6B7280;
      text-transform: uppercase;
    }

    .item-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1A1D29;
    }

    .summary-totals {
      border-top: 2px solid #E5E7EB;
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      color: #374151;
    }

    .total-row.discount {
      color: #10B981;
    }

    .total-row.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1A1D29;
      padding-top: 0.75rem;
      border-top: 1px solid #E5E7EB;
    }

    .empty-cart {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-cart p {
      color: #6B7280;
      margin-bottom: 1.5rem;
    }

    .btn-browse {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: #6366F1;
      color: white;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-browse:hover {
      background: #4F46E5;
      transform: translateY(-2px);
    }

    .payment-placeholder {
      text-align: center;
      padding: 2rem;
      background: #F9FAFB;
      border-radius: 12px;
      border: 2px dashed #D1D5DB;
    }

    .placeholder-text {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .placeholder-note {
      color: #6B7280;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .btn-complete-order {
      width: 100%;
      padding: 1rem 2rem;
      background: #1A1D29;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-complete-order:hover:not(:disabled) {
      background: #6366F1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-complete-order:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #FEE2E2;
      color: #DC2626;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .secure-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      color: #6B7280;
      font-size: 0.875rem;
    }

    .secure-note svg {
      stroke: #10B981;
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .payment-method-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-method-option:hover {
      border-color: #6366F1;
      background: #F9FAFB;
    }

    .payment-method-option.selected {
      border-color: #6366F1;
      background: #EEF2FF;
    }

    .radio-circle {
      width: 24px;
      height: 24px;
      border: 2px solid #D1D5DB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .payment-method-option.selected .radio-circle {
      border-color: #6366F1;
    }

    .radio-dot {
      width: 12px;
      height: 12px;
      background: #6366F1;
      border-radius: 50%;
    }

    .payment-method-info {
      flex: 1;
    }

    .payment-method-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1A1D29;
      margin-bottom: 0.25rem;
    }

    .payment-method-desc {
      font-size: 0.875rem;
      color: #6B7280;
    }

    .payment-method-icons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-icon {
      font-size: 1.5rem;
    }

    .card-brand {
      font-size: 0.75rem;
      color: #6B7280;
      padding: 0.25rem 0.5rem;
      background: #F3F4F6;
      border-radius: 4px;
    }

    .payment-form {
      margin-top: 1.5rem;
    }

    .form-note {
      font-size: 0.875rem;
      color: #6B7280;
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background: #FEF3C7;
      border-radius: 8px;
      border-left: 3px solid #F59E0B;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn-paypal {
      background: #0070BA;
    }

    .btn-paypal:hover:not(:disabled) {
      background: #005EA6;
    }
  `
})
export class CheckoutComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Use computed signals from CartService
  cartItems = computed(() => this.cartService.getCartItems());
  subtotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.course.price, 0)
  );
  
  isProcessing = false;
  errorMessage = '';
  selectedPaymentMethod: 'card' | 'paypal' = 'card';

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
      return;
    }

    // Cart items are automatically loaded via signals
    // No need to manually fetch
  }

  getSubtotal(): number {
    return this.subtotal();
  }

  selectPaymentMethod(method: 'card' | 'paypal'): void {
    this.selectedPaymentMethod = method;
    this.errorMessage = '';
  }

  completeOrder(): void {
    this.isProcessing = true;
    this.errorMessage = '';

    // Generate idempotency key
    const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare checkout request
    const checkoutRequest = {
      items: this.cartItems().map(item => ({
        courseId: item.course.id,
        quantity: 1
      })),
      idempotencyKey: idempotencyKey
    };

    // Call backend to create order and get PayPal order ID
    this.http.post<any>('/api/checkout', checkoutRequest).subscribe({
      next: (data) => {
        console.log('Order created successfully:', data);
        // For demo: Simulate successful payment and call capture
        // In production, integrate PayPal buttons SDK
        this.capturePayment(data.paypalOrderId);
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.message || 'Failed to create order. Please try again.';
        console.error('Checkout error:', err);
      }
    });
  }

  private capturePayment(paypalOrderId: string): void {
    // Call backend to capture payment
    this.http.post<any>('/api/checkout/capture', { paypalOrderId }).subscribe({
      next: (data) => {
        console.log('Payment captured:', data);
        
        // Clear cart
        this.cartService.clearCart().subscribe({
          next: () => {
            this.isProcessing = false;
            // Navigate to dashboard with success message
            this.router.navigate(['/dashboard'], {
              queryParams: { orderSuccess: 'true' }
            });
          },
          error: (err) => {
            this.isProcessing = false;
            this.errorMessage = 'Order completed but failed to clear cart.';
          }
        });
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.message || 'Payment failed. Please try again.';
        console.error('Capture error:', err);
      }
    });
  }
}
