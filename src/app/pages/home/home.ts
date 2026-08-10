import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookCard } from '../../components/book-card/book-card';
import { BookService } from '../../services/book';

@Component({
  selector: 'app-home',
  imports: [RouterLink, BookCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  featuredBooks: any[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.bookService.getBooks().subscribe((data: any) => {
      this.featuredBooks = data.products.slice(0, 4);
    });
  }

}