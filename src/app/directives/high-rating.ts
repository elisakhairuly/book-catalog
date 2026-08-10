import {
  Directive,
  ElementRef,
  Input,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appHighRating]',
  standalone: true
})
export class HighRating {

  @Input() appHighRating: number = 0;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges() {

    if (this.appHighRating > 5) {

      this.renderer.setStyle(
        this.element.nativeElement,
        'border',
        '2px solid gold'
      );

    } else {

      this.renderer.removeStyle(
        this.element.nativeElement,
        'border'
      );

    }

  }

}