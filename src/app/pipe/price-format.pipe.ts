import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat'
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: any): string {
    console.log('PriceFormatPipe input:', value, 'Type:', typeof value);
    
    // Handle null, undefined, empty string
    if (!value && value !== 0) {
      console.log('Returning Free for null/undefined/empty');
      return 'Free';
    }
    
    // Convert to number for comparison
    const numericValue = parseFloat(value);
    console.log('Parsed numeric value:', numericValue, 'isNaN:', isNaN(numericValue));
    
    // Check if it's a valid number and equals zero
    if (!isNaN(numericValue) && numericValue === 0) {
      console.log('Returning Free for zero value');
      return 'Free';
    }
    
    console.log('Returning original value:', value.toString());
    return value.toString();
  }
} 