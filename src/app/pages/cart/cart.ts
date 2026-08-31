import {
  Component
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  CartStateService
} from '../../services/cart-state';


@Component({
  selector: 'app-cart',

  imports: [
    RouterLink
  ],

  templateUrl:
    './cart.html',

  styleUrl:
    './cart.css'
})
export class Cart {


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState:
      CartStateService,

    private router:
      Router
  ) {}


  // =========================
  // CART ITEMS
  // =========================

  get cartItems() {

    return this.cartState
      .cartItems;

  }


  // =========================
  // TOTAL ITEMS
  // =========================

  get totalItems() {

    return this.cartState
      .totalItems;

  }


  // =========================
  // TOTAL PRICE
  // =========================

  get totalPrice() {

    return this.cartState
      .totalPrice;

  }


  // =========================================================
  // SELECTED PRODUCT COUNT
  // =========================================================

  get selectedProductCount():
    number {

    return this.cartState
      .selectedProductCount();

  }


  // =========================================================
  // SELECTED QUANTITY
  // =========================================================

  get selectedCount():
    number {

    return this.cartState
      .selectedCount();

  }


  // =========================================================
  // SELECTED TOTAL
  // =========================================================

  get selectedTotal():
    number {

    return this.cartState
      .selectedTotal();

  }


  // =========================================================
  // SELECTED ITEMS
  // =========================================================

  get selectedItems():
    any[] {

    return this.cartState
      .selectedItems();

  }


  // =========================================================
  // ALL SELECTED STATUS
  // =========================================================

  get isAllSelected():
    boolean {

    return this.cartState
      .isAllSelected();

  }


  // =========================================================
  // TOGGLE PRODUCT
  // =========================================================

  toggleProduct(
    productId: number
  ) {

    this.cartState
      .toggleProductSelection(
        productId
      );

  }


  // =========================================================
  // PRODUCT SELECTED STATUS
  // =========================================================

  isSelected(
    productId: number
  ): boolean {

    return this.cartState
      .isSelected(
        productId
      );

  }


  // =========================================================
  // SELECT ALL
  // =========================================================

  toggleSelectAll() {

    this.cartState
      .toggleSelectAll();

  }


  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  increaseQuantity(
    productId: number
  ) {

    this.cartState
      .increaseQuantity(
        productId
      );

  }


  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  decreaseQuantity(
    productId: number
  ) {

    this.cartState
      .decreaseQuantity(
        productId
      );

  }


  // =========================================================
  // REMOVE ITEM
  // =========================================================

  removeItem(
    productId: number
  ) {

    this.cartState
      .removeFromCart(
        productId
      );

  }


  // =========================================================
  // CLEAR CART
  // =========================================================

  clearCart() {

    this.cartState
      .clearCart();

  }


  // =========================================================
  // CHECKOUT
  // =========================================================

  checkout() {

    // =========================
    // NOTHING SELECTED
    // =========================

    if (
      this.selectedProductCount === 0
    ) {

      return;

    }


    // =========================
    // PREPARE CHECKOUT DATA
    // =========================

    const checkoutData = {

      items:
        this.selectedItems,

      totalItems:
        this.selectedCount,

      totalProducts:
        this.selectedProductCount,

      totalPrice:
        this.selectedTotal

    };


    // =========================
    // TEMPORARY BACKUP
    // =========================

    sessionStorage.setItem(
      'checkout-data',
      JSON.stringify(
        checkoutData
      )
    );


    console.log(
      'Checkout Data:',
      checkoutData
    );


    // =========================
    // OPEN CHECKOUT PAGE
    // =========================

    this.router.navigate(
      [
        '/checkout'
      ]
    );

  }

}