import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookCard } from '../../components/book-card/book-card';
import { BookService } from '../../services/book';
import { ProductStateService } from '../../services/product-state';

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


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private productState: ProductStateService
  ) {}


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit() {

    this.isLoading = true;

    this.errorMessage = '';


    // =========================
    // GET PRODUCTS
    // =========================

    this.bookService.getBooks().subscribe({

      next: (data: any) => {

        this.allBooks = data.products;


        // =========================
        // PRODUCT STATE
        // =========================

        this.productState.setProducts(
          data.products
        );


        // =========================
        // GET CATEGORIES
        // =========================

        this.categories = Array.from(
          new Set(
            data.products.map(
              (book: any) =>
                book.category as string
            )
          )
        );


        // =========================
        // READ QUERY PARAMS
        // =========================

        this.route.queryParams.subscribe(params => {

          this.searchKeyword =
            (params['search'] || '').toLowerCase();

          this.selectedCategory =
            params['category'] || '';


          // =========================
          // APPLY FILTER
          // =========================

          this.applyFilters();

        });


        this.isLoading = false;

      },


      error: () => {

        this.isLoading = false;

        this.errorMessage =
          'Gagal mengambil data produk. Silakan coba lagi.';

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


    this.updateQueryParams();

  }


  // =========================
  // CATEGORY
  // =========================

  filterByCategory(event: Event) {

    this.selectedCategory =
      (
        event.target as HTMLSelectElement
      ).value;


    this.updateQueryParams();

  }


  // =========================
  // UPDATE QUERY PARAMETERS
  // =========================

  private updateQueryParams() {

    const queryParams: {
      search?: string;
      category?: string;
    } = {};


    // =========================
    // SEARCH
    // =========================

    if (this.searchKeyword.trim()) {

      queryParams.search =
        this.searchKeyword.trim();

    }


    // =========================
    // CATEGORY
    // =========================

    if (this.selectedCategory) {

      queryParams.category =
        this.selectedCategory;

    }


    // =========================
    // UPDATE URL
    // =========================

    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: queryParams
      }
    );

  }


  // =========================
  // FILTER DATA
  // =========================

  applyFilters() {

    this.filteredBooks =
      this.allBooks.filter((book: any) => {

        const title =
          String(book.title || '').toLowerCase();


        const category =
          String(book.category || '');


        // =========================
        // SEARCH MATCH
        // =========================

        const matchesSearch =
          title.includes(
            this.searchKeyword
          );


        // =========================
        // CATEGORY MATCH
        // =========================

        const matchesCategory =
          !this.selectedCategory ||
          category === this.selectedCategory;


        return (
          matchesSearch &&
          matchesCategory
        );

      });


    // =========================
    // TOTAL RESULT
    // =========================

    this.totalItems =
      this.filteredBooks.length;


    // =========================
    // RESET PAGE
    // =========================

    this.currentPage = 1;


    // =========================
    // UPDATE PAGE
    // =========================

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


    // Scroll ke atas

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


    // Hapus query params

    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {}
      }
    );

  }

}