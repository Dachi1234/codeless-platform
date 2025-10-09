import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface AdminOrder {
  id: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-orders">
      <div class="page-header">
        <div>
          <h1>Order Management</h1>
          <p class="subtitle">View and manage all orders</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" placeholder="Search orders..." [(ngModel)]="searchTerm" (keyup.enter)="loadOrders()">
        </div>
        <select [(ngModel)]="selectedStatus" (ngModelChange)="loadOrders()">
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Items</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td class="order-id">#{{ order.id }}</td>
              <td>
                <div class="customer-info">
                  <strong>{{ order.userName }}</strong>
                  <span class="email">{{ order.userEmail }}</span>
                </div>
              </td>
              <td class="amount">{{ order.totalAmount | currency:'USD' }}</td>
              <td>{{ order.itemCount }} {{ order.itemCount === 1 ? 'course' : 'courses' }}</td>
              <td>{{ order.paymentMethod }}</td>
              <td>
                <span class="status" [ngClass]="getStatusClass(order.status)">{{ order.status }}</span>
              </td>
              <td>{{ order.createdAt | date:'short' }}</td>
              <td>
                <div class="actions">
                  <button class="action-btn" *ngIf="order.status === 'PAID'" (click)="refundOrder(order.id)">Refund</button>
                  <button class="action-btn view" (click)="viewOrder(order.id)">View</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-orders { max-width: 1400px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0; }
    .subtitle { font-size: 15px; color: #6B7280; margin: 0 0 32px 0; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 24px; }
    .search-box { flex: 1; position: relative; display: flex; align-items: center; }
    .search-box svg { position: absolute; left: 16px; color: #9CA3AF; }
    .search-box input { width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 15px; }
    select { padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 15px; cursor: pointer; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; }
    .spinner { width: 48px; height: 48px; border: 4px solid #E5E7EB; border-top-color: #5A8DEE; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .orders-table { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    th { padding: 16px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; }
    tbody tr { border-bottom: 1px solid #E5E7EB; }
    tbody tr:hover { background: #F9FAFB; }
    td { padding: 16px 20px; font-size: 14px; color: #374151; }
    .order-id { font-weight: 600; color: #5A8DEE; }
    .customer-info { display: flex; flex-direction: column; gap: 4px; }
    .email { font-size: 13px; color: #9CA3AF; }
    .amount { font-weight: 600; color: #10B981; font-size: 16px; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-paid { background: #D1FAE5; color: #065F46; }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-failed { background: #FEE2E2; color: #991B1B; }
    .status-refunded { background: #E5E7EB; color: #374151; }
    .actions { display: flex; gap: 8px; }
    .action-btn { padding: 6px 14px; background: white; color: #EF4444; border: 1px solid #EF4444; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .action-btn:hover { background: #EF4444; color: white; }
    .action-btn.view { color: #5A8DEE; border-color: #5A8DEE; }
    .action-btn.view:hover { background: #5A8DEE; color: white; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private readonly http = inject(HttpClient);

  orders: AdminOrder[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    let url = '/api/admin/orders?';
    if (this.searchTerm) url += `q=${this.searchTerm}&`;
    if (this.selectedStatus) url += `status=${this.selectedStatus}&`;

    this.http.get<AdminOrder[]>(url).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  refundOrder(id: number): void {
    if (!confirm('Are you sure you want to refund this order?')) return;

    this.http.post(`/api/admin/orders/${id}/refund`, {}).subscribe({
      next: () => {
        alert('Order refunded successfully');
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error refunding order:', err);
        alert('Failed to refund order');
      }
    });
  }

  viewOrder(id: number): void {
    alert(`View order details (ID: ${id}) - Full implementation pending`);
  }
}

