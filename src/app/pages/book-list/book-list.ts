import { Component } from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookService } from '../../services/book';

@Component({
  selector: 'app-book-list',
  imports: [BookCard],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList {

  // =========================
  // DATA
  // =========================

  books: any[] = [];

  allBooks: any[] = [];

  filteredBooks: any[] = [];

  categories: string[] = [];


  // =========================
  // FILTER
  // =========================

  searchKeyword = '';

  selectedCategory = '';


  // =========================
  // PAGINATION
  // =========================

  pageSize = 8;

  currentPage = 1;

  totalItems = 0;


  // =========================
  // STATE
  // =========================

  isLoading = true;

  errorMessage = '';


  constructor(
    private bookService: BookService
  ) {}


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit() {

    this.isLoading = true;

    this.errorMessage = '';

    this.bookService.getBooks().subscribe({

      next: (data: any) => {

        this.allBooks = data.products;

        this.categories = Array.from(
          new Set(
            data.products.map(
              (book: any) => book.category as string
            )
          )
        );

        this.isLoading = false;

        this.applyFilters();

      },

      error: () => {

        this.isLoading = false;

        this.errorMessage =
          'Gagal mengambil data buku. Silakan coba lagi.';

      }

    });

  }


  // =========================
  // SEARCH
  // =========================

  searchBooks(event: Event) {

    this.searchKeyword =
      (
        event.target as HTMLInputElement
      ).value.toLowerCase();

    this.applyFilters();

  }


  // =========================
  // CATEGORY
  // =========================

  filterByCategory(event: Event) {

    this.selectedCategory =
      (
        event.target as HTMLSelectElement
      ).value;

    this.applyFilters();

  }


  // =========================
  // FILTER DATA
  // =========================

  applyFilters() {

    this.filteredBooks =
      this.allBooks.filter((book: any) => {

        const matchesSearch =
          book.title
            .toLowerCase()
            .includes(this.searchKeyword);

        const matchesCategory =
          !this.selectedCategory ||
          book.category === this.selectedCategory;

        return (
          matchesSearch &&
          matchesCategory
        );

      });


    // Total hasil setelah filter

    this.totalItems =
      this.filteredBooks.length;


    // Set kembali ke halaman pertama

    this.currentPage = 1;


    // Tampilkan data sesuai halaman

    this.updatePage();

  }


  // =========================
  // UPDATE CURRENT PAGE
  // =========================

  updatePage() {

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start + this.pageSize;

    this.books =
      this.filteredBooks.slice(
        start,
        end
      );

  }


  // =========================
  // TOTAL PAGES
  // =========================

  get totalPages(): number {

    return Math.ceil(
      this.totalItems /
      this.pageSize
    );

  }


  // =========================
  // PAGE NUMBERS
  // =========================

  get pageNumbers(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) => index + 1
    );

  }


  // =========================
  // START ITEM
  // =========================

  get startItem(): number {

    if (this.totalItems === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;

  }


  // =========================
  // END ITEM
  // =========================

  get endItem(): number {

    return Math.min(
      this.currentPage *
      this.pageSize,

      this.totalItems
    );

  }


  // =========================
  // CHANGE PAGE
  // =========================

  changePage(page: number) {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;

    this.updatePage();

    // Scroll kembali ke bagian atas katalog

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  // =========================
  // RESET
  // =========================

  resetFilters() {

    this.searchKeyword = '';

    this.selectedCategory = '';

    this.currentPage = 1;

    this.applyFilters();

  }

}