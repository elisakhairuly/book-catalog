import {
  Component,
  Input
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import { HighRating } from '../../directives/high-rating';

import { CartStateService } from '../../services/cart-state';

import { AuthStateService } from '../../services/auth-state';


@Component({
  selector: 'app-book-card',

  imports: [
    RouterLink,
    HighRating
  ],

  templateUrl: './book-card.html',

  styleUrl: './book-card.css'
})
export class BookCard {

  // =========================
  // INPUT
  // =========================

  @Input()
  book: any;


  @Input()
  viewMode: 'grid' | 'list' =
    'grid';


  // =========================
  // NOTIFICATION
  // =========================

  showLoginNotification = false;

  showCartNotification = false;

  showQuantityNotification = false;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState: CartStateService,
    private authState: AuthStateService,
    private router: Router
  ) {}


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
    // ADD PRODUCT
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


    this.hideNotifications();

    this.showQuantityNotification =
      true;


    setTimeout(() => {

      this.showQuantityNotification =
        false;

    }, 1400);

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


    // =========================
    // QUANTITY UPDATED
    // =========================

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

}