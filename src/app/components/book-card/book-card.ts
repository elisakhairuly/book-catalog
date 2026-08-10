import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HighRating } from '../../directives/high-rating';

@Component({
  selector: 'app-book-card',
  imports: [RouterLink, HighRating],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {

  @Input() book: any;

}