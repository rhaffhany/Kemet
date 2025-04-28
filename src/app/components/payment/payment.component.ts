import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CreditCardValidators } from 'angular-cc-library';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { BookingService } from 'src/app/services/booking.service';
import { DetailsService } from 'src/app/services/details.service';

// declare var Stripe;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit{
  constructor(private _FormBuilder:FormBuilder,
              private _ActivatedRoute:ActivatedRoute,
              private _DetailsService:DetailsService,
              private _BookingService:BookingService) {}

  // @Input() checkoutForm: FormGroup;
  // @ViewChild('ccNumber') ccNumberField: ElementRef;
  // @ViewChild('cardExpiry', { static: true }) cardExpiryElement: ElementRef;
  // @ViewChild('cardCvc', { static: true }) cardCvcElement: ElementRef;

  stripe: any;

  paymentForm: FormGroup = this._FormBuilder.group({
    cardNumber: ['', [CreditCardValidators.validateCCNumber]],
    expireDate: ['', [CreditCardValidators.validateExpDate]],
    CVV: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]] 
  });;

  submitted: boolean = false;

  onSubmit() {
    this.submitted = true;
    console.log(this.paymentForm);
  }

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;

  bookedPrice:number = 0;
  selectedBookedDate: string = ''; 
  selectedBoard: string = ''; 

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.planID = params.get('planID'); 
        this._DetailsService.getDetaliedPlan(this.planID).subscribe({
          next: (response)=>{            
            this.packageDetails = response;
            this.planID = response.planId;
          }
        });
      }
    });

    this._BookingService.bookedPrice.subscribe({
      next:(price)=>{
        this.bookedPrice = price;
      }
    });
    this._BookingService.selectedBoard.subscribe({
      next:(selectedBoard)=>{
        this.selectedBoard = selectedBoard;
      }
    });
    this._BookingService.selectedBookedDate.subscribe({
      next:(date)=>{
        this.selectedBookedDate = date;
      }
    });

  }



  ngAfterViewInit(): void {
    // this.stripe = Stripe('pk_test_51RD90GQR59iEhpdYwrxhvr3VErtv0iYOSYn4NjhZa21C715Ds612AqtLIGPJKpGQpsBTo9s6uNs6duhKpwt6gbKQ00NxhJWq20');
    // const elements = this.stripe.elements();
  }



  
}
