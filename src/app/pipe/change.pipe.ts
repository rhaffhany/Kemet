import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'change'
})
export class ChangePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
