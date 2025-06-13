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

  ngOnInit(): void {
    this._PaymentService.getUserPaymentHistory().subscribe({
      next:(res) =>{
        this.paymentDetails = res.$values;         
        // console.log('payment history:',this.paymentDetails);
      }
    });
  }


}