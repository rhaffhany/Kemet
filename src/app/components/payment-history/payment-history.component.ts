import { Component, OnInit } from '@angular/core';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit{
  constructor(private _PaymentService:PaymentService){}

  paymentIcon: string = "/assets/icons/money.png";
  paymentDetails: any[] = [];
  filteredPayments: any[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    this._PaymentService.getUserPaymentHistory().subscribe({
      next:(res) =>{
        this.paymentDetails = res.$values;         
        this.filteredPayments = [...this.paymentDetails];
        // console.log('payment history:',this.paymentDetails);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPayments = [...this.paymentDetails];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPayments = this.paymentDetails.filter(payment => 
      (payment.planName && payment.planName.toLowerCase().includes(searchLower)) ||
      (payment.status && payment.status.toLowerCase().includes(searchLower)) ||
      (payment.amount && payment.amount.toString().toLowerCase().includes(searchLower)) ||
      (payment.paymentDate && payment.paymentDate.toLowerCase().includes(searchLower))
    );
  }
}