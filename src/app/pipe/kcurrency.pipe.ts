import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kcurrency'
})
export class KcurrencyPipe implements PipeTransform {

  transform(value: number, currency: string = '$'): string {
    if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(2)}k`;
    }
    return `${currency}${value}`;
  }

}
