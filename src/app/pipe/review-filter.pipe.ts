import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reviewFilter'
})
export class ReviewFilterPipe implements PipeTransform {

  transform(reviews: any[], searchText: string): any[] {
    if (!searchText) return reviews;

    return reviews.filter(review =>
      Object.values(review).some(value =>
        value && value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }

}
