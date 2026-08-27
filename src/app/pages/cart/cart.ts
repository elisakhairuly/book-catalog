import { Component } from '@angular/core';

import {
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

  templateUrl: './cart.html',

  styleUrl: './cart.css'
})
export class Cart {

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState:
      CartStateService
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
  // Jumlah jenis produk yang dicentang
  // =========================================================

  get selectedProductCount():
    number {

    return this.cartState
      .selectedProductCount();

  }


  // =========================================================
  // SELECTED QUANTITY
  // Total quantity dari produk yang dicentang
  // =========================================================

  get selectedCount():
    number {

    return this.cartState
      .selectedCount();

  }


  // =========================================================
  // SELECTED TOTAL PRICE
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
    // TEMPORARY CHECKOUT DATA
    // =========================

    sessionStorage.setItem(
      'checkout-data',

      JSON.stringify(
        checkoutData
      )
    );


    // =========================
    // TEMPORARY TEST
    // =========================

    console.log(
      'Checkout Data:',
      checkoutData
    );


    // =========================
    // NANTI DIAKTIFKAN
    // SAAT CHECKOUT FINAL
    // =========================

    /*
    this.router.navigate(
      ['/checkout']
    );
    */

  }

}