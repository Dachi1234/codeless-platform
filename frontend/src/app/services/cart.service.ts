import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = '/api/cart';
  
  // Reactive state
  private cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().length);
  
  constructor(private http: HttpClient) {
    // Load cart on service init
    this.loadCart();
  }

  loadCart(): void {
    this.getCart().subscribe({
      next: (cart) => this.cartItems.set(cart.items),
      error: () => this.cartItems.set([])
    });
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.baseUrl);
  }

  addItem(courseId: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/items`, { courseId })
      .pipe(
        tap(cart => this.cartItems.set(cart.items))
      );
  }

  removeItem(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${courseId}`)
      .pipe(
        tap(() => {
          const items = this.cartItems().filter(item => item.course.id !== courseId);
          this.cartItems.set(items);
        })
      );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.baseUrl)
      .pipe(
        tap(() => this.cartItems.set([]))
      );
  }

  getCartItems() {
    return this.cartItems();
  }
}

