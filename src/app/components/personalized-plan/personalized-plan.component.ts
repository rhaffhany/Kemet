import { Component, AfterViewInit, Renderer2, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-personalized-plan',
  templateUrl: './personalized-plan.component.html',
  styleUrls: ['./personalized-plan.component.scss']
})
export class PersonalizedPlanComponent implements AfterViewInit {
  egypt = 'assets/img/Egypt.jpg';
  location = 'assets/icons/Location.png';
  regenerate = 'assets/icons/regenerate.png';
  pyramids = 'assets/img/Egypt3.jpg';

  @ViewChild('regenerateIcons', { static: false }) regenerateIcons!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const icons = this.regenerateIcons.nativeElement.querySelectorAll('.regenerate');
    icons.forEach((img: HTMLElement) => {
      this.renderer.listen(img, 'click', () => {
        this.renderer.addClass(img, 'rotate');
        setTimeout(() => {
          this.renderer.removeClass(img, 'rotate');
        }, 1000);
      });
    });
  }
}
