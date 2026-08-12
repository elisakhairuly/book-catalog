import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStateService } from '../../services/cart-state';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState: CartStateService
  ) {}

  // =========================
  // CART STATE
  // =========================

  get cartItems() {
    return this.cartState.cartItems;
  }

  get totalItems() {
    return this.cartState.totalItems;
  }

  get totalPrice() {
    return this.cartState.totalPrice;
  }

  // =========================
  // INCREASE QUANTITY
  // =========================

  increaseQuantity(productId: number) {

    this.cartState.increaseQuantity(productId);

  }

  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity(productId: number) {

    this.cartState.decreaseQuantity(productId);

  }

  // =========================
  // REMOVE ITEM
  // =========================

  removeItem(productId: number) {

    this.cartState.removeFromCart(productId);

  }

  // =========================
  // CLEAR CART
  // =========================

  clearCart() {

    this.cartState.clearCart();

  }

}