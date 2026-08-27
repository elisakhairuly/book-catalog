import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { BookService } from '../../services/book';

import { CartStateService } from '../../services/cart-state';

import { AuthStateService } from '../../services/auth-state';

import {
  ReviewStateService,
  UserReview
} from '../../services/review-state';


@Component({
  selector: 'app-book-detail',

  imports: [
    RouterLink
  ],

  templateUrl: './book-detail.html',

  styleUrl: './book-detail.css'
})
export class BookDetail implements OnInit {

  // =========================
  // PRODUCT DATA
  // =========================

  book: any = null;


  // =========================
  // PAGE STATE
  // =========================

  isLoading = true;

  errorMessage = '';


  // =========================
  // NOTIFICATIONS
  // =========================

  showCartNotification = false;

  showLoginNotification = false;

  showQuantityNotification = false;


  // =========================
  // REVIEW FORM
  // =========================

  selectedRating = 0;

  reviewComment = '';

  reviewError = '';

  reviewSuccess = '';


  // =========================
  // REVIEW FILTER
  // =========================

  selectedReviewFilter = 0;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private cartState: CartStateService,
    private authState: AuthStateService,
    private reviewState: ReviewStateService
  ) {}


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit() {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.isLoading = false;

      this.errorMessage =
        'ID produk tidak ditemukan.';

      return;

    }


    this.bookService
      .getBookById(id)
      .subscribe({

        next: (data: any) => {

          this.book = data;

          this.isLoading = false;

        },


        error: () => {

          this.isLoading = false;

          this.errorMessage =
            'Produk tidak ditemukan atau gagal mengambil data.';

        }

      });

  }


  // =========================
  // CART ITEM
  // =========================

  get cartItem(): any {

    if (!this.book) {

      return null;

    }


    return this.cartState
      .cartItems()
      .find(
        item =>
          item.id === this.book.id
      );

  }


  // =========================
  // IS PRODUCT IN CART
  // =========================

  get isInCart(): boolean {

    return !!this.cartItem;

  }


  // =========================
  // DISPLAY QUANTITY
  // =========================

  get quantity(): number {

    return this.cartItem?.quantity || 0;

  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart() {

    if (!this.book) {

      return;

    }


    // =========================
    // CHECK LOGIN
    // =========================

    if (!this.authState.isLoggedIn()) {

      this.hideNotifications();

      this.showLoginNotification =
        true;


      setTimeout(() => {

        this.showLoginNotification =
          false;


        this.router.navigate(
          ['/login'],
          {
            queryParams: {
              redirect:
                this.router.url
            }
          }
        );

      }, 1300);


      return;

    }


    // =========================
    // ADD PRODUCT TO CART
    // =========================

    this.cartState
      .addToCart(
        this.book
      );


    // =========================
    // SUCCESS NOTIFICATION
    // =========================

    this.hideNotifications();

    this.showCartNotification =
      true;


    setTimeout(() => {

      this.showCartNotification =
        false;

    }, 1800);

  }


  // =========================
  // INCREASE QUANTITY
  // =========================

  increaseQuantity() {

    if (
      !this.book ||
      !this.isInCart
    ) {

      return;

    }


    this.cartState
      .increaseQuantity(
        this.book.id
      );


    this.showQuantityUpdated();

  }


  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity() {

    if (
      !this.book ||
      !this.isInCart
    ) {

      return;

    }


    this.cartState
      .decreaseQuantity(
        this.book.id
      );


    this.showQuantityUpdated();

  }


  // =========================
  // QUANTITY NOTIFICATION
  // =========================

  private showQuantityUpdated() {

    this.hideNotifications();

    this.showQuantityNotification =
      true;


    setTimeout(() => {

      this.showQuantityNotification =
        false;

    }, 1400);

  }


  // =========================
  // HIDE NOTIFICATIONS
  // =========================

  private hideNotifications() {

    this.showLoginNotification =
      false;

    this.showCartNotification =
      false;

    this.showQuantityNotification =
      false;

  }


  // =========================
  // SELECT USER RATING
  // =========================

  selectRating(
    rating: number
  ) {

    this.selectedRating =
      rating;

    this.reviewError = '';

  }


  // =========================
  // REVIEW COMMENT
  // =========================

  updateReviewComment(
    event: Event
  ) {

    this.reviewComment =
      (
        event.target as HTMLTextAreaElement
      ).value;

  }


  // =========================
  // SUBMIT REVIEW
  // =========================

  submitReview() {

    this.reviewError = '';

    this.reviewSuccess = '';


    // LOGIN

    if (!this.authState.isLoggedIn()) {

      this.reviewError =
        'Silakan login terlebih dahulu untuk memberikan ulasan.';

      return;

    }


    if (!this.book) {

      return;

    }


    // RATING

    if (
      this.selectedRating < 1 ||
      this.selectedRating > 5
    ) {

      this.reviewError =
        'Pilih rating 1 sampai 5 bintang terlebih dahulu.';

      return;

    }


    // COMMENT

    if (!this.reviewComment.trim()) {

      this.reviewError =
        'Komentar tidak boleh kosong.';

      return;

    }


    // CURRENT USER

    const user =
      this.authState.currentUser();


    // SAVE REVIEW

    this.reviewState.addReview(
      this.book.id,
      user?.name || 'User',
      this.selectedRating,
      this.reviewComment
    );


    // RESET

    this.selectedRating = 0;

    this.reviewComment = '';

    this.reviewSuccess =
      'Ulasan berhasil ditambahkan.';


    setTimeout(() => {

      this.reviewSuccess = '';

    }, 2500);

  }


  // =========================
  // API REVIEWS
  // =========================

  get apiReviews(): any[] {

    if (!this.book?.reviews) {

      return [];

    }


    return this.book.reviews;

  }


  // =========================
  // USER REVIEWS
  // =========================

  get userReviews(): UserReview[] {

    if (!this.book) {

      return [];

    }


    return this.reviewState
      .getReviewsByProduct(
        this.book.id
      );

  }


  // =========================
  // ALL REVIEWS
  // =========================

  get allReviews(): any[] {

    const api =
      this.apiReviews.map(
        (review: any) => ({

          rating:
            Number(review.rating) || 0,

          comment:
            review.comment || '',

          date:
            review.date || '',

          reviewerName:
            review.reviewerName ||
            'Anonymous',

          source:
            'api'

        })
      );


    const user =
      this.userReviews.map(
        review => ({

          rating:
            review.rating,

          comment:
            review.comment,

          date:
            review.date,

          reviewerName:
            review.userName,

          source:
            'user'

        })
      );


    return [
      ...api,
      ...user
    ];

  }


  // =========================
  // FILTERED REVIEWS
  // =========================

  get filteredReviews(): any[] {

    if (
      this.selectedReviewFilter === 0
    ) {

      return this.allReviews;

    }


    return this.allReviews.filter(
      review =>
        review.rating ===
        this.selectedReviewFilter
    );

  }


  // =========================
  // FILTER REVIEW
  // =========================

  filterReviews(
    rating: number
  ) {

    this.selectedReviewFilter =
      rating;

  }


  // =========================
  // TOTAL REVIEWS
  // =========================

  get totalReviews(): number {

    return this.allReviews.length;

  }


  // =========================
  // AVERAGE RATING
  // =========================

  get averageRating(): number {

    if (
      this.totalReviews === 0
    ) {

      return 0;

    }


    const totalRating =
      this.allReviews.reduce(
        (
          total,
          review
        ) => {

          return (
            total +
            Number(review.rating)
          );

        },
        0
      );


    return (
      totalRating /
      this.totalReviews
    );

  }


  // =========================
  // RATING COUNT
  // =========================

  getRatingCount(
    rating: number
  ): number {

    return this.allReviews
      .filter(
        review =>
          review.rating === rating
      )
      .length;

  }


  // =========================
  // RATING PERCENTAGE
  // =========================

  getRatingPercentage(
    rating: number
  ): number {

    if (
      this.totalReviews === 0
    ) {

      return 0;

    }


    return Math.round(
      (
        this.getRatingCount(
          rating
        ) /
        this.totalReviews
      ) * 100
    );

  }


  // =========================
  // STARS
  // =========================

  get stars(): number[] {

    return [
      1,
      2,
      3,
      4,
      5
    ];

  }


  // =========================
  // FORMAT DATE
  // =========================

  formatReviewDate(
    date: string
  ): string {

    if (!date) {

      return '-';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }


    return parsedDate
      .toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      );

  }

}