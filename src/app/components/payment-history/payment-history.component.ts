import { Response } from './../../../../node_modules/http-proxy-middleware/dist/types.d';
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

  ngOnInit(): void {
    this._PaymentService.getUserPaymentHistory().subscribe({
      next:(Response) =>{
        console.log('payment history:',Response);
        
      }
    })
  }
}