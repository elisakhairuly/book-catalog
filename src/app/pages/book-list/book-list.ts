import { Component } from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { BookCard } from '../../components/book-card/book-card';

import { BookService } from '../../services/book';

import { ProductStateService } from '../../services/product-state';


@Component({
  selector: 'app-book-list',

  imports: [
    BookCard
  ],

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

  selectedSort = '';

  selectedRating = 0;


  // =========================
  // MOBILE FILTER
  // =========================

  isFilterOpen = false;


  // =========================
  // VIEW MODE
  // =========================

  viewMode: 'grid' | 'list' =
    'grid';


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


    this.bookService
      .getBooks()
      .subscribe({

        next: (data: any) => {

          this.allBooks =
            data.products || [];


          // =========================
          // PRODUCT STATE
          // =========================

          this.productState.setProducts(
            this.allBooks
          );


          // =========================
          // GET CATEGORIES
          // =========================

          const categoryList: string[] =
            this.allBooks.map(
              (book: any) =>
                String(
                  book.category || ''
                )
            );


          this.categories =
            Array.from(
              new Set<string>(
                categoryList
              )
            )
              .filter(
                category =>
                  category.trim() !== ''
              )
              .sort(
                (a, b) =>
                  a.localeCompare(b)
              );


          // =========================
          // READ QUERY PARAMS
          // =========================

          this.route.queryParams
            .subscribe(params => {

              this.searchKeyword =
                String(
                  params['search'] || ''
                )
                  .toLowerCase();


              this.selectedCategory =
                String(
                  params['category'] || ''
                );


              this.selectedSort =
                String(
                  params['sort'] || ''
                );


              this.selectedRating =
                Number(
                  params['rating'] || 0
                );


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
  // CATEGORY
  // =========================

  selectCategory(
    category: string
  ) {

    this.selectedCategory =
      category;


    this.updateQueryParams();

  }


  // =========================
  // SORT
  // =========================

  selectSort(
    sort: string
  ) {

    this.selectedSort =
      sort;


    this.updateQueryParams();

  }


  // =========================
  // RATING FILTER
  // =========================

  changeRating(
    event: Event
  ) {

    this.selectedRating =
      Number(
        (
          event.target as
          HTMLSelectElement
        ).value
      );


    this.updateQueryParams();

  }


  // =========================
  // VIEW MODE
  // =========================

  setViewMode(
    mode: 'grid' | 'list'
  ) {

    this.viewMode =
      mode;

  }


  // =========================
  // OPEN FILTER
  // =========================

  openFilter() {

    this.isFilterOpen =
      true;

  }


  // =========================
  // CLOSE FILTER
  // =========================

  closeFilter() {

    this.isFilterOpen =
      false;

  }


  // =========================
  // TOGGLE FILTER
  // =========================

  toggleFilter() {

    this.isFilterOpen =
      !this.isFilterOpen;

  }


  // =========================
  // ACTIVE FILTER COUNT
  // =========================

  get activeFilterCount():
    number {

    let count = 0;


    if (
      this.selectedCategory
    ) {

      count++;

    }


    if (
      this.selectedSort
    ) {

      count++;

    }


    if (
      this.selectedRating > 0
    ) {

      count++;

    }


    return count;

  }


  // =========================
  // UPDATE QUERY PARAMS
  // =========================

  private updateQueryParams() {

    const queryParams: {

      search?: string;

      category?: string;

      sort?: string;

      rating?: number;

    } = {};


    // SEARCH

    if (
      this.searchKeyword.trim()
    ) {

      queryParams.search =
        this.searchKeyword.trim();

    }


    // CATEGORY

    if (
      this.selectedCategory
    ) {

      queryParams.category =
        this.selectedCategory;

    }


    // SORT

    if (
      this.selectedSort
    ) {

      queryParams.sort =
        this.selectedSort;

    }


    // RATING

    if (
      this.selectedRating > 0
    ) {

      queryParams.rating =
        this.selectedRating;

    }


    this.router.navigate(
      [],
      {

        relativeTo:
          this.route,

        queryParams

      }
    );

  }


  // =========================
  // APPLY FILTER
  // =========================

  applyFilters() {

    let result =
      this.allBooks.filter(
        (book: any) => {

          const title =
            String(
              book.title || ''
            )
              .toLowerCase();


          const category =
            String(
              book.category || ''
            );


          const rating =
            Number(
              book.rating || 0
            );


          const matchesSearch =
            title.includes(
              this.searchKeyword
            );


          const matchesCategory =
            !this.selectedCategory ||
            category ===
              this.selectedCategory;


          const matchesRating =
            rating >=
              this.selectedRating;


          return (
            matchesSearch &&
            matchesCategory &&
            matchesRating
          );

        }
      );


    // =========================
    // COPY BEFORE SORT
    // =========================

    result =
      [...result];


    // =========================
    // SORT
    // =========================

    switch (
      this.selectedSort
    ) {

      case 'newest':

        result.sort(
          (
            a: any,
            b: any
          ) =>
            Number(b.id) -
            Number(a.id)
        );

        break;


      case 'price-asc':

        result.sort(
          (
            a: any,
            b: any
          ) =>
            Number(a.price) -
            Number(b.price)
        );

        break;


      case 'price-desc':

        result.sort(
          (
            a: any,
            b: any
          ) =>
            Number(b.price) -
            Number(a.price)
        );

        break;


      case 'rating-desc':

        result.sort(
          (
            a: any,
            b: any
          ) =>
            Number(b.rating) -
            Number(a.rating)
        );

        break;


      case 'discount-desc':

        result.sort(
          (
            a: any,
            b: any
          ) =>
            Number(
              b.discountPercentage
            ) -
            Number(
              a.discountPercentage
            )
        );

        break;

    }


    this.filteredBooks =
      result;


    this.totalItems =
      this.filteredBooks.length;


    this.currentPage =
      1;


    this.updatePage();

  }


  // =========================
  // UPDATE PAGE
  // =========================

  updatePage() {

    const start =
      (
        this.currentPage - 1
      ) *
      this.pageSize;


    const end =
      start +
      this.pageSize;


    this.books =
      this.filteredBooks.slice(
        start,
        end
      );

  }


  // =========================
  // TOTAL PAGES
  // =========================

  get totalPages():
    number {

    return Math.ceil(
      this.totalItems /
      this.pageSize
    );

  }


  // =========================
  // PAGE NUMBERS
  // =========================

  get pageNumbers():
    number[] {

    return Array.from(
      {
        length:
          this.totalPages
      },

      (
        _,
        index
      ) =>
        index + 1
    );

  }


  // =========================
  // START ITEM
  // =========================

  get startItem():
    number {

    if (
      this.totalItems === 0
    ) {

      return 0;

    }


    return (
      (
        this.currentPage - 1
      ) *
      this.pageSize
    ) + 1;

  }


  // =========================
  // END ITEM
  // =========================

  get endItem():
    number {

    return Math.min(

      this.currentPage *
        this.pageSize,

      this.totalItems

    );

  }


  // =========================
  // CHANGE PAGE
  // =========================

  changePage(
    page: number
  ) {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage =
      page;


    this.updatePage();


    window.scrollTo({

      top: 0,

      behavior:
        'smooth'

    });

  }


  // =========================
  // RESET FILTER
  // =========================

  resetFilters() {

    this.searchKeyword = '';

    this.selectedCategory = '';

    this.selectedSort = '';

    this.selectedRating = 0;

    this.currentPage = 1;


    this.router.navigate(
      [],
      {

        relativeTo:
          this.route,

        queryParams: {}

      }
    );

  }

}