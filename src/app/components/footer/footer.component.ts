import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  logo:string = "/assets/logo/kemet.png";
  facebookLogo:string = "/assets/icons/Facebook.svg";
  twitterLogo:string = "/assets/icons/twitter.png";
  instagramLogo:string = "/assets/icons/Instagram.svg";
  tiktokLogo:string = "/assets/icons/tiktok.png";

  user:string = '@';

  emailLogo:string = "/assets/icons/Email.svg";
  phoneLogo:string = "/assets/icons/Phone.svg";
  locationLogo:string = "/assets/icons/Mark.svg";

  email:string = "contact@company.com";

  // Currency calculator
  currencies = [
    { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' }
  ];
  amount: number = 0;
  fromCurrency: string = 'EGP';
  toCurrency: string = 'USD';
  convertedAmount: number = 0;

  constructor(
    private router: Router,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.currencyService.getCurrentCurrency().subscribe(currency => {
      this.toCurrency = currency;
    });
  }

  calculateConversion() {
    if (this.amount) {
      this.convertedAmount = this.currencyService.convertCurrency(this.amount, this.fromCurrency, this.toCurrency);
    }
  }

  navigateToPlan(): void {
    this.router.navigate(['/plan']);
  }

  openSocialMedia(platform: string): void {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = 'https://www.facebook.com/kemeteg';
        break;
      case 'instagram':
        url = 'https://www.instagram.com/_kemeteg/';
        break;
      case 'twitter':
        url = 'https://twitter.com/kemeteg';
        break;
      case 'tiktok':
        url = 'https://www.tiktok.com/@kemeteg'; 
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
  }
}
