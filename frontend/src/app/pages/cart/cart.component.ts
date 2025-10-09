import { Component, OnInit } from '@angular/core';
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
  items: CartItem[] = [];
  loading = true;
  subtotal = 0;

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.items = cart.items;
        this.calculateSubtotal();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  removeItem(courseId: number): void {
    this.cartService.removeItem(courseId).subscribe({
      next: () => {
        this.items = this.items.filter(item => item.course.id !== courseId);
        this.calculateSubtotal();
      }
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.items = [];
          this.subtotal = 0;
        }
      });
    }
  }

  proceedToCheckout(): void {
    if (this.items.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  private calculateSubtotal(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.course.price, 0);
  }
}

