import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

import { BookCard } from '../../components/book-card/book-card';

import { BookService } from '../../services/book';

import { HomeSearchService } from '../../services/home-search';


@Component({

  selector: 'app-home',

  imports: [
    RouterLink,
    BookCard
  ],

  templateUrl: './home.html',

  styleUrl: './home.css'

})
export class Home {

  // =========================
  // DATA
  // =========================

  allBooks: any[] = [];


  // =========================
  // STATE
  // =========================

  isLoading = true;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private bookService: BookService,
    private homeSearch: HomeSearchService
  ) {}


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit() {

    this.isLoading = true;


    this.bookService
      .getBooks()
      .subscribe({

        next: (data: any) => {

          this.allBooks =
            data.products;

          this.isLoading = false;

        },

        error: () => {

          this.allBooks = [];

          this.isLoading = false;

        }

      });

  }


  // =========================
  // FEATURED PRODUCTS
  // =========================

  get featuredBooks(): any[] {

    return this.allBooks.slice(0, 4);

  }


  // =========================
  // SEARCH KEYWORD
  // =========================

  get searchKeyword(): string {

    return this.homeSearch.keyword();

  }


  // =========================
  // SEARCH RESULTS
  // =========================

  get searchResults(): any[] {

    const keyword =
      this.searchKeyword
        .toLowerCase()
        .trim();


    if (!keyword) {

      return [];

    }


    return this.allBooks.filter(
      (book: any) => {

        const title =
          String(book.title || '')
            .toLowerCase();


        return title.includes(keyword);

      }
    );

  }

}