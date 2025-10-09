import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface OrderItem {
  id: number;
  course: {
    id: number;
    title: string;
    price: number;
  };
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  id: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.getOrders().subscribe({
      next: (response: any) => {
        this.orders = response.content || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getOrders(): Observable<any> {
    return this.http.get('/api/orders');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'status-success',
      'PENDING': 'status-warning',
      'FAILED': 'status-error',
      'REFUNDED': 'status-info'
    };
    return statusMap[status] || 'status-default';
  }
}

