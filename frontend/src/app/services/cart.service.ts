import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError, switchMap } from 'rxjs';

export interface CartItem {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    kind: string;
  };
  addedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Simplified version for guest cart (localStorage)
export interface GuestCartItem {
  courseId: number;
  addedAt: string;
}

export interface ValidationResponse {
  removedCourseTitles: string[];
}

export interface GuestValidationResponse {
  validCourseIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/cart';
  private readonly GUEST_CART_KEY = 'guest_cart';
  
  // Reactive state
  private cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().length);
  private isAuthenticated = signal<boolean>(false);
  private authService: any; // Will be injected in initWithAuthService
  
  // Validation notification state
  private removedCoursesNotification = signal<string | null>(null);
  
  constructor() {
    // Load guest cart initially (auth service will update later)
    this.loadCart();
  }
  
  /**
   * Initialize with AuthService and set up auth state listener
   * Called from app initialization
   */
  initWithAuthService(authService: any): void {
    this.authService = authService;
    
    // Set initial auth state
    this.isAuthenticated.set(authService.isAuthenticated());
    
    // Listen for auth changes
    authService.onAuthChange((authenticated: boolean) => {
      const wasAuthenticated = this.isAuthenticated();
      this.isAuthenticated.set(authenticated);
      
      if (authenticated && !wasAuthenticated) {
        // User just logged in - merge guest cart
        this.mergeGuestCartWithUserCart().subscribe(() => {
          this.loadCart();
        });
      } else {
        // Auth state changed - reload cart
        this.loadCart();
      }
    });
    
    // Load cart with current auth state
    this.loadCart();
  }

  /**
   * Set authentication status and reload cart
   */
  setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated.set(authenticated);
    this.loadCart();
  }

  /**
   * Load cart based on authentication status
   */
  loadCart(): void {
    if (this.isAuthenticated()) {
      // Load from backend and validate
      this.getCart().subscribe({
        next: (cart) => {
          this.cartItems.set(cart.items);
          // Validate cart and remove unpublished courses
          this.validateCart().subscribe();
        },
        error: () => this.cartItems.set([])
      });
    } else {
      // Load from localStorage
      const guestCart = this.getGuestCart();
      // For guest users, we only have course IDs, full cart items will be loaded when they visit the cart page
      // For now, just set count
      this.loadGuestCartItems();
    }
  }

  /**
   * Load full course details for guest cart items
   */
  private loadGuestCartItems(): void {
    const guestCart = this.getGuestCart();
    if (guestCart.length === 0) {
      this.cartItems.set([]);
      return;
    }

    // Validate guest cart first, then load items
    this.validateGuestCart().subscribe(() => {
      const validatedCart = this.getGuestCart();
      if (validatedCart.length === 0) {
        this.cartItems.set([]);
        return;
      }

      // Fetch course details for each valid item
      const courseIds = validatedCart.map(item => item.courseId);
      this.http.post<CartItem[]>('/api/cart/guest/details', { courseIds }).subscribe({
        next: (items) => this.cartItems.set(items),
        error: () => {
          // If API fails, just show count but no details
          // Create placeholder items with IDs only
          const placeholders: CartItem[] = validatedCart.map(item => ({
            id: item.courseId,
            course: {
              id: item.courseId,
              title: 'Loading...',
              slug: '',
              price: 0,
              imageUrl: null,
              kind: 'PRE_RECORDED'
            },
            addedAt: item.addedAt
          }));
          this.cartItems.set(placeholders);
        }
      });
    });
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.baseUrl);
  }

  addItem(courseId: number): Observable<Cart | null> {
    if (this.isAuthenticated()) {
      // Add to backend cart
      return this.http.post<Cart>(`${this.baseUrl}/items`, { courseId })
        .pipe(
          tap(cart => this.cartItems.set(cart.items))
        );
    } else {
      // Add to guest cart (localStorage)
      this.addToGuestCart(courseId);
      this.loadGuestCartItems();
      return of(null); // Return observable for consistency
    }
  }

  removeItem(courseId: number): Observable<void> {
    if (this.isAuthenticated()) {
      return this.http.delete<void>(`${this.baseUrl}/items/${courseId}`)
        .pipe(
          tap(() => {
            const items = this.cartItems().filter(item => item.course.id !== courseId);
            this.cartItems.set(items);
          })
        );
    } else {
      // Remove from guest cart
      this.removeFromGuestCart(courseId);
      this.loadGuestCartItems();
      return of(void 0);
    }
  }

  clearCart(): Observable<void> {
    if (this.isAuthenticated()) {
      return this.http.delete<void>(this.baseUrl)
        .pipe(
          tap(() => this.cartItems.set([]))
        );
    } else {
      this.clearGuestCart();
      this.cartItems.set([]);
      return of(void 0);
    }
  }

  getCartItems() {
    return this.cartItems();
  }

  /**
   * Merge guest cart with user cart after login
   */
  mergeGuestCartWithUserCart(): Observable<void> {
    const guestCart = this.getGuestCart();
    if (guestCart.length === 0) {
      return of(void 0);
    }

    const courseIds = guestCart.map(item => item.courseId);
    
    return this.http.post<Cart>(`${this.baseUrl}/merge`, { courseIds }).pipe(
      tap(cart => {
        this.cartItems.set(cart.items);
        this.clearGuestCart(); // Clear guest cart after merge
      }),
      switchMap(() => of(void 0)),
      catchError(error => {
        console.error('Failed to merge guest cart:', error);
        this.clearGuestCart(); // Clear anyway to avoid duplicate adds
        return of(void 0);
      })
    );
  }

  // ===== Guest Cart (localStorage) Methods =====

  private getGuestCart(): GuestCartItem[] {
    const cartJson = localStorage.getItem(this.GUEST_CART_KEY);
    if (!cartJson) return [];
    
    try {
      return JSON.parse(cartJson);
    } catch {
      return [];
    }
  }

  private saveGuestCart(cart: GuestCartItem[]): void {
    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(cart));
  }

  private addToGuestCart(courseId: number): void {
    const cart = this.getGuestCart();
    
    // Check if already in cart
    if (cart.some(item => item.courseId === courseId)) {
      return;
    }

    cart.push({
      courseId,
      addedAt: new Date().toISOString()
    });

    this.saveGuestCart(cart);
  }

  private removeFromGuestCart(courseId: number): void {
    const cart = this.getGuestCart();
    const filtered = cart.filter(item => item.courseId !== courseId);
    this.saveGuestCart(filtered);
  }

  private clearGuestCart(): void {
    localStorage.removeItem(this.GUEST_CART_KEY);
  }

  // ===== Cart Validation Methods =====

  /**
   * Validate cart and remove unpublished courses (for authenticated users)
   */
  validateCart(): Observable<void> {
    return this.http.post<ValidationResponse>(`${this.baseUrl}/validate`, {}).pipe(
      tap(response => {
        if (response.removedCourseTitles && response.removedCourseTitles.length > 0) {
          // Set notification message
          const count = response.removedCourseTitles.length;
          const message = count === 1
            ? `"${response.removedCourseTitles[0]}" is no longer available and was removed from your cart.`
            : `${count} courses are no longer available and were removed from your cart.`;
          
          this.removedCoursesNotification.set(message);
          
          // Reload cart to reflect changes
          this.loadCart();
          
          // Auto-clear notification after 8 seconds
          setTimeout(() => this.removedCoursesNotification.set(null), 8000);
        }
      }),
      switchMap(() => of(void 0)),
      catchError(() => of(void 0))
    );
  }

  /**
   * Validate guest cart and remove unpublished course IDs (for non-authenticated users)
   */
  validateGuestCart(): Observable<void> {
    const guestCart = this.getGuestCart();
    if (guestCart.length === 0) {
      return of(void 0);
    }

    const courseIds = guestCart.map(item => item.courseId);
    
    return this.http.post<GuestValidationResponse>('/api/cart/guest/validate', { courseIds }).pipe(
      tap(response => {
        const validIds = new Set(response.validCourseIds);
        const originalCount = courseIds.length;
        const validCount = validIds.size;
        
        if (validCount < originalCount) {
          // Filter guest cart to only valid courses
          const validCart = guestCart.filter(item => validIds.has(item.courseId));
          this.saveGuestCart(validCart);
          
          // Set notification
          const removedCount = originalCount - validCount;
          const message = removedCount === 1
            ? '1 course is no longer available and was removed from your cart.'
            : `${removedCount} courses are no longer available and were removed from your cart.`;
          
          this.removedCoursesNotification.set(message);
          
          // Reload cart items
          this.loadGuestCartItems();
          
          // Auto-clear notification after 8 seconds
          setTimeout(() => this.removedCoursesNotification.set(null), 8000);
        }
      }),
      switchMap(() => of(void 0)),
      catchError(() => of(void 0))
    );
  }

  /**
   * Get the removed courses notification message
   */
  getRemovedCoursesNotification() {
    return this.removedCoursesNotification();
  }

  /**
   * Clear the removed courses notification
   */
  clearRemovedCoursesNotification(): void {
    this.removedCoursesNotification.set(null);
  }
}

