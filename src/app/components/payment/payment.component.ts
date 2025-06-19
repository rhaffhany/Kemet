import { Component, OnDestroy, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditCardValidators } from 'angular-cc-library';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { DetailsService } from 'src/app/services/details.service';
import { Stripe, PaymentIntent } from '@stripe/stripe-js';
import { PaymentService } from 'src/app/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy{
  constructor(private _FormBuilder:FormBuilder,
              private _ActivatedRoute:ActivatedRoute,
              private _DetailsService:DetailsService,
              private _PaymentService:PaymentService,
              private _ToastrService:ToastrService,
              private _BookingService:BookingService,
              private _Router:Router) {}

  private stripe: Stripe | null = null;
  cardElement: any;
  subscriptions: Subscription = new Subscription();
  
  paymentForm: FormGroup = this._FormBuilder.group({
    cardNumber: ['', [CreditCardValidators.validateCCNumber]],
    expireDate: ['', [CreditCardValidators.validateExpDate]],
    CVV: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]] 
  });

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;

  bookingData:any = {};
  bookingID:any;

  bookedPrice:number = 0;
  fullBookedPrice:number = 0;
  selectedBookedDate: string = ''; 
  selectedBoard: string = ''; 
  visitorType: string = '';
  numOfPeople:number = 0;
  isLoading: boolean = true;
  isPaying: boolean = false; 


  async ngOnInit(){
    // payment
    this.bookingID = +this._ActivatedRoute.snapshot.paramMap.get('bookingID')!;
    this.stripe = await this._PaymentService.getStripe();

    const elements = this.stripe?.elements();
    this.cardElement = elements?.create('card');
    this.cardElement?.mount('#card-element');


    this.subscriptions.add(
      this._ActivatedRoute.paramMap.subscribe({
        next: (params) => {
        this.planID = params.get('planID'); 
          this._DetailsService.getDetaliedPlan(this.planID).subscribe({
            next: (response)=>{            
              this.packageDetails = response;
              this.planID = response.planId;
              this.isLoading = false; 
            }
          });
        }
      })
    );

    
    this.subscriptions.add(
      this._ActivatedRoute.paramMap.subscribe({
        next: (params) => {
          this.bookingID = params.get('bookingID')!;
          this._BookingService.getBookedTripByID(this.bookingID).subscribe({
            next: (response)=>{  
              this.bookingData = response;
              this.bookingID = response.id;
              this.bookedPrice = response.bookedPrice;
              this.fullBookedPrice = response.fullBookedPrice;
              this.selectedBookedDate = response.reserveDate;
              this.selectedBoard = response.reserveType;
              this.visitorType = response.bookedCategory;  
              this.numOfPeople = response.numOfPeople;
              this.isLoading = false; 
            }
          });
        }
      })
    );

  }

  async pay() {
    this.isPaying = true;
    this._PaymentService.createPayment(this.bookingID).subscribe({
      next: (response) => {
        const clientSecret = response.clientSecret;
        
        this.stripe?.confirmCardPayment(clientSecret, 
          { payment_method: { card: this.cardElement } }).then((result) => {
            if (result.error) {
              this._ToastrService.error('Please try again.','Payment confirmation Error!');
              this.isPaying = false;
            } else if (result.paymentIntent?.status === 'succeeded') {
  
              // console.log("Backend response: ",response);
              
              this._ToastrService.success('Payment confirmed successfully!');

              if (response === 'Payment not successful') {
                this._ToastrService.error('Payment not successful. Please try again.'); 
              }

              this.isPaying = false;
              this._Router.navigate(['/payment-history']).then(() => {
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              });
            }    
          });
        },error: (error) =>{
          this._ToastrService.error('Please try again.','Payment failed!');
          this.isPaying = false;
          console.log("Error: ",error);
        }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}