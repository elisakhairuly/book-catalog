import {
  Injectable,
  computed,
  effect,
  signal
} from '@angular/core';

import { AuthStateService } from './auth-state';


@Injectable({
  providedIn: 'root'
})
export class CartStateService {

  // =========================
  // BASE STORAGE KEY
  // =========================

  private readonly baseStorageKey =
    'product-cart';


  // =========================
  // ACTIVE STORAGE KEY
  // =========================

  private activeStorageKey:
    string | null = null;


  // =========================
  // CART DATA
  // =========================

  cartItems = signal<any[]>([]);


  // =========================
  // TOTAL ITEMS
  // =========================

  totalItems = computed(() => {

    return this.cartItems()
      .reduce(
        (
          total,
          item
        ) => {

          return (
            total +
            Number(
              item.quantity || 0
            )
          );

        },
        0
      );

  });


  // =========================
  // TOTAL PRODUCTS
  // =========================

  totalProducts = computed(() => {

    return this.cartItems().length;

  });


  // =========================
  // TOTAL PRICE
  // =========================

  totalPrice = computed(() => {

    return this.cartItems()
      .reduce(
        (
          total,
          item
        ) => {

          return (
            total +
            (
              Number(
                item.price || 0
              ) *
              Number(
                item.quantity || 0
              )
            )
          );

        },
        0
      );

  });


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private authState:
      AuthStateService
  ) {

    // =========================
    // WATCH LOGIN USER
    // =========================

    effect(() => {

      const user =
        this.authState.currentUser();


      const storageKey =
        this.getUserStorageKey(
          user
        );


      // Kalau user yang aktif
      // tidak berubah,
      // tidak perlu reload cart

      if (
        storageKey ===
        this.activeStorageKey
      ) {

        return;

      }


      // Simpan key user aktif

      this.activeStorageKey =
        storageKey;


      // =========================
      // LOGOUT
      // =========================

      if (!storageKey) {

        this.cartItems.set([]);

        return;

      }


      // =========================
      // LOGIN / SWITCH USER
      // =========================

      const userCart =
        this.loadCart(
          storageKey
        );


      this.cartItems.set(
        userCart
      );

    });

  }


  // =========================
  // GET USER STORAGE KEY
  // =========================

  private getUserStorageKey(
    user: any
  ): string | null {

    if (!user) {

      return null;

    }


    // =========================
    // PRIORITY USER ID
    // =========================

    const userIdentifier =
      user.id ??
      user.email ??
      user.username ??
      user.name;


    if (!userIdentifier) {

      return null;

    }


    const safeIdentifier =
      String(
        userIdentifier
      )
        .trim()
        .toLowerCase()
        .replace(
          /\s+/g,
          '-'
        );


    return (
      `${this.baseStorageKey}-${safeIdentifier}`
    );

  }


  // =========================
  // LOAD CART
  // =========================

  private loadCart(
    storageKey: string
  ): any[] {

    const savedCart =
      localStorage.getItem(
        storageKey
      );


    if (!savedCart) {

      return [];

    }


    try {

      const cart =
        JSON.parse(
          savedCart
        );


      if (
        !Array.isArray(cart)
      ) {

        return [];

      }


      // =========================
      // CLEAN CART DATA
      // =========================

      return cart
        .filter(
          item =>
            item &&
            item.id !==
              undefined
        )
        .map(
          item => ({
            ...item,

            quantity:
              Math.max(
                1,
                Number(
                  item.quantity || 1
                )
              )
          })
        );

    } catch {

      return [];

    }

  }


  // =========================
  // SAVE CART
  // =========================

  private saveCart(): void {

    // Tidak ada user login

    if (
      !this.activeStorageKey
    ) {

      return;

    }


    localStorage.setItem(
      this.activeStorageKey,
      JSON.stringify(
        this.cartItems()
      )
    );

  }


  // =========================
  // GET ITEM
  // =========================

  getCartItem(
    productId: number
  ): any {

    return this.cartItems()
      .find(
        item =>
          Number(item.id) ===
          Number(productId)
      );

  }


  // =========================
  // IS IN CART
  // =========================

  isInCart(
    productId: number
  ): boolean {

    return !!this.getCartItem(
      productId
    );

  }


  // =========================
  // GET QUANTITY
  // =========================

  getQuantity(
    productId: number
  ): number {

    const item =
      this.getCartItem(
        productId
      );


    return Number(
      item?.quantity || 0
    );

  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart(
    product: any
  ) {

    if (
      !product ||
      product.id === undefined
    ) {

      return;

    }


    // Cart hanya milik user login

    if (
      !this.activeStorageKey
    ) {

      return;

    }


    const currentItems =
      this.cartItems();


    const existingItem =
      currentItems.find(
        item =>
          Number(item.id) ===
          Number(product.id)
      );


    // =========================
    // ALREADY EXISTS
    // =========================

    if (existingItem) {

      this.cartItems.set(

        currentItems.map(
          item => {

            if (
              Number(item.id) ===
              Number(product.id)
            ) {

              return {
                ...item,

                quantity:
                  Number(
                    item.quantity || 0
                  ) + 1
              };

            }


            return item;

          }
        )

      );

    }


    // =========================
    // NEW PRODUCT
    // =========================

    else {

      this.cartItems.set([

        ...currentItems,

        {
          ...product,

          quantity: 1
        }

      ]);

    }


    this.saveCart();

  }


  // =========================
  // INCREASE QUANTITY
  // =========================

  increaseQuantity(
    productId: number
  ) {

    if (
      !this.activeStorageKey
    ) {

      return;

    }


    this.cartItems.set(

      this.cartItems()
        .map(
          item => {

            if (
              Number(item.id) ===
              Number(productId)
            ) {

              return {
                ...item,

                quantity:
                  Number(
                    item.quantity || 0
                  ) + 1
              };

            }


            return item;

          }
        )

    );


    this.saveCart();

  }


  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity(
    productId: number
  ) {

    if (
      !this.activeStorageKey
    ) {

      return;

    }


    const updatedItems =
      this.cartItems()
        .map(
          item => {

            if (
              Number(item.id) ===
              Number(productId)
            ) {

              return {
                ...item,

                quantity:
                  Number(
                    item.quantity || 0
                  ) - 1
              };

            }


            return item;

          }
        )
        .filter(
          item =>
            Number(
              item.quantity
            ) > 0
        );


    this.cartItems.set(
      updatedItems
    );


    this.saveCart();

  }


  // =========================
  // SET QUANTITY
  // =========================

  setQuantity(
    productId: number,
    quantity: number
  ) {

    if (
      !this.activeStorageKey
    ) {

      return;

    }


    const newQuantity =
      Number(quantity);


    // Quantity <= 0
    // berarti hapus produk

    if (
      newQuantity <= 0
    ) {

      this.removeFromCart(
        productId
      );

      return;

    }


    this.cartItems.set(

      this.cartItems()
        .map(
          item => {

            if (
              Number(item.id) ===
              Number(productId)
            ) {

              return {
                ...item,

                quantity:
                  newQuantity
              };

            }


            return item;

          }
        )

    );


    this.saveCart();

  }


  // =========================
  // REMOVE FROM CART
  // =========================

  removeFromCart(
    productId: number
  ) {

    if (
      !this.activeStorageKey
    ) {

      return;

    }


    this.cartItems.set(

      this.cartItems()
        .filter(
          item =>
            Number(item.id) !==
            Number(productId)
        )

    );


    this.saveCart();

  }


  // =========================
  // CLEAR CART
  // =========================

  clearCart() {

    this.cartItems.set([]);


    if (
      this.activeStorageKey
    ) {

      localStorage.removeItem(
        this.activeStorageKey
      );

    }

  }


  // =========================
  // RELOAD CURRENT USER CART
  // =========================

  reloadCart() {

    if (
      !this.activeStorageKey
    ) {

      this.cartItems.set([]);

      return;

    }


    this.cartItems.set(

      this.loadCart(
        this.activeStorageKey
      )

    );

  }

}