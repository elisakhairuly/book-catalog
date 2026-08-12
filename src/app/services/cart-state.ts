import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartStateService {

  // =========================
  // CART DATA
  // =========================

  cartItems = signal<any[]>([]);

  // =========================
  // TOTAL ITEMS
  // =========================

  totalItems = computed(() => {

    return this.cartItems().reduce(
      (total, item) => total + item.quantity,
      0
    );

  });

  // =========================
  // TOTAL PRICE
  // =========================

  totalPrice = computed(() => {

    return this.cartItems().reduce(
      (total, item) =>
        total + (item.price * item.quantity),
      0
    );

  });

  // =========================
  // ADD TO CART
  // =========================

  addToCart(product: any) {

    const currentItems = this.cartItems();

    const existingItem =
      currentItems.find(
        item => item.id === product.id
      );

    if (existingItem) {

      this.cartItems.set(
        currentItems.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      );

    } else {

      this.cartItems.set([
        ...currentItems,
        {
          ...product,
          quantity: 1
        }
      ]);

    }

  }

  // =========================
  // REMOVE FROM CART
  // =========================

  removeFromCart(productId: number) {

    this.cartItems.set(
      this.cartItems().filter(
        item => item.id !== productId
      )
    );

  }

  // =========================
  // INCREASE QUANTITY
  // =========================

  increaseQuantity(productId: number) {

    this.cartItems.set(
      this.cartItems().map(item =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    );

  }

  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity(productId: number) {

    const currentItems = this.cartItems();

    this.cartItems.set(
      currentItems
        .map(item =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter(item => item.quantity > 0)
    );

  }

  // =========================
  // CLEAR CART
  // =========================

  clearCart() {

    this.cartItems.set([]);

  }

}