import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrency = new BehaviorSubject<string>('EGP');
  private exchangeRates = new BehaviorSubject<{[key: string]: number}>({});
  private apiUrl = 'https://api.exchangerate-api.com/v4/latest/EGP';

  constructor(private http: HttpClient) {
    this.loadExchangeRates();
  }

  private loadExchangeRates() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        this.exchangeRates.next(data.rates);
      },
      error: (error) => {
        console.error('Error loading exchange rates:', error);
      }
    });
  }

  getCurrentCurrency(): Observable<string> {
    return this.currentCurrency.asObservable();
  }

  getExchangeRates(): Observable<{[key: string]: number}> {
    return this.exchangeRates.asObservable();
  }

  setCurrency(currency: string) {
    this.currentCurrency.next(currency);
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    const rates = this.exchangeRates.value;
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return amount;
    }
    return amount * (rates[toCurrency] / rates[fromCurrency]);
  }
}