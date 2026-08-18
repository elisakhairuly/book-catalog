import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartStateService {

  // =========================
  // STORAGE KEY
  // =========================

  private readonly storageKey = 'product-cart';


  // =========================
  // CART DATA
  // =========================

  cartItems = signal<any[]>(
    this.loadCart()
  );


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
  // LOAD CART FROM STORAGE
  // =========================

  private loadCart(): any[] {

    const savedCart =
      localStorage.getItem(this.storageKey);

    if (!savedCart) {
      return [];
    }

    try {

      const cart =
        JSON.parse(savedCart);

      return Array.isArray(cart)
        ? cart
        : [];

    } catch {

      return [];

    }

  }


  // =========================
  // SAVE CART TO STORAGE
  // =========================

  private saveCart(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.cartItems())
    );

  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart(product: any) {

    const currentItems =
      this.cartItems();

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


    // Simpan perubahan

    this.saveCart();

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


    // Simpan perubahan

    this.saveCart();

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


    // Simpan perubahan

    this.saveCart();

  }


  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity(productId: number) {

    const currentItems =
      this.cartItems();


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
        .filter(
          item => item.quantity > 0
        )
    );


    // Simpan perubahan

    this.saveCart();

  }


  // =========================
  // CLEAR CART
  // =========================

  clearCart() {

    this.cartItems.set([]);


    // Hapus data dari storage

    localStorage.removeItem(
      this.storageKey
    );

  }

}