import { Component, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  // Use computed values from cart service
  items = computed(() => this.cartService.getCartItems());
  subtotal = computed(() => 
    this.items().reduce((sum, item) => sum + item.course.price, 0)
  );

  // Confirmation dialog state
  showConfirmDialog = false;
  itemToRemove: { courseId: number, courseName: string } | null = null;

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cart is automatically reactive via signals
    // No need to manually load
  }

  confirmRemove(courseId: number, courseName: string): void {
    this.itemToRemove = { courseId, courseName };
    this.showConfirmDialog = true;
  }

  cancelRemove(): void {
    this.showConfirmDialog = false;
    this.itemToRemove = null;
  }

  removeItem(): void {
    if (this.itemToRemove) {
      this.cartService.removeItem(this.itemToRemove.courseId).subscribe({
        next: () => {
          this.showConfirmDialog = false;
          this.itemToRemove = null;
          // Items will update automatically via signal
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          // Cart will update automatically via signal
        }
      });
    }
  }

  proceedToCheckout(): void {
    if (this.items().length > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}

