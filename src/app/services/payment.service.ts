import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

 constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }

  private DeployUrl = 'https://kemet-server.runasp.net';

  private stripePromise = loadStripe('pk_test_51RKfXWDFSpWxjGAccqQBHkqYho5eeSUWPAAUP1oagJYSnAk6T0fxhUV2u4KvAk1OLxs6WeWv2hIGQZnxypZm7MKh00pbdEmoFk');

  createPayment(bookingID: number):Observable<any>{
    const token = this._AuthService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this._HttpClient.post<{  clientSecret: string, paymentIntendId: string }>(
      `${this.DeployUrl}/api/Payment/create-payment-intent/${bookingID}`,
      {},
      {headers}
    );
  }

  confirmPayment(paymentIntentId: string): Observable<any> {
    const token = this._AuthService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', 
    });
  
    return this._HttpClient.post(
      `${this.DeployUrl}/api/Payment/confirm-payment`,
      JSON.stringify(paymentIntentId),  
      { headers, responseType: 'text' } 
    );
  }
  
  async getStripe() {
    return await this.stripePromise;
  }
  
  getUserPaymentHistory():Observable<any>{
    const token = this._AuthService.getToken();
    const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
    });
    return this._HttpClient.get(`${this.DeployUrl}/api/Payment/user-history`,{headers});
  }

}
