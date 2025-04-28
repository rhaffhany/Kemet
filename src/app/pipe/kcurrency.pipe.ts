import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { CurrencyService } from '../services/currency.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'kcurrency',
  pure: false
})
export class KcurrencyPipe implements PipeTransform, OnDestroy {
  private currentCurrency: string = 'EGP';
  private currencySubscription: Subscription;

  constructor(private currencyService: CurrencyService) {
    this.currencySubscription = this.currencyService.getCurrentCurrency()
      .subscribe(currency => {
        this.currentCurrency = currency;
      });
  }

  transform(value: number, targetCurrency?: string): string {
    const currencyToUse = targetCurrency || this.currentCurrency;
    const convertedValue = this.currencyService.convertCurrency(value, 'EGP', currencyToUse);
    
    // Format numbers based on their size
    if (convertedValue >= 1000000) {
      return `${this.getCurrencySymbol(currencyToUse)}${(convertedValue / 1000000).toFixed(2)}M`;
    } else if (convertedValue >= 1000) {
      return `${this.getCurrencySymbol(currencyToUse)}${(convertedValue / 1000).toFixed(2)}K`;
    }
    
    return `${this.getCurrencySymbol(currencyToUse)}${convertedValue.toFixed(2)}`;
  }

  private getCurrencySymbol(currencyCode: string): string {
    const symbols: { [key: string]: string } = {
      'EGP': 'Eg',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'SAR': 'SR',
      'AED': 'د.إ'
    };
    return symbols[currencyCode] || currencyCode;
  }

  ngOnDestroy() {
    if (this.currencySubscription) {
      this.currencySubscription.unsubscribe();
    }
  }
}
