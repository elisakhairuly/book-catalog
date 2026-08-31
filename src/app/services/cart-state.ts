import {
  Injectable,
  computed,
  effect,
  signal
} from '@angular/core';

import {
  AuthStateService
} from './auth-state';

@Injectable({
  providedIn: 'root'
})
export class CartStateService {

  // =========================
  // CURRENT USER KEY
  // =========================

  private currentUserKey = '';

  // =========================
  // CART DATA
  // =========================

  cartItems = signal<any[]>([]);

  // =========================
  // SELECTED PRODUCT IDS
  // =========================

  selectedProductIds =
    signal<number[]>([]);

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private authState:
      AuthStateService
  ) {

    effect(() => {

      const user =
        this.authState.currentUser();

      const newUserKey =
        this.getUserKey(user);

      if (
        newUserKey ===
        this.currentUserKey
      ) {
        return;
      }

      this.currentUserKey =
        newUserKey;

      if (!newUserKey) {

        this.cartItems.set([]);

        this.selectedProductIds
          .set([]);

        return;
      }

      this.cartItems.set(
        this.loadCart()
      );

      this.selectedProductIds.set(
        this.loadSelection()
      );

      this.cleanSelection();

    });

  }

  // =========================================================
  // USER KEY
  // =========================================================

  private getUserKey(
    user: any
  ): string {

    if (!user) {
      return '';
    }

    const identity =
      String(
        user.email ||
        user.username ||
        user.name ||
        ''
      )
        .trim()
        .toLowerCase();

    if (!identity) {
      return '';
    }

    return identity.replace(
      /[^a-z0-9@._-]/g,
      '-'
    );
  }

  // =========================================================
  // STORAGE KEYS
  // =========================================================

  private get cartStorageKey():
    string {

    return (
      'product-cart-' +
      this.currentUserKey
    );
  }

  private get selectionStorageKey():
    string {

    return (
      'product-cart-selection-' +
      this.currentUserKey
    );
  }

  // =========================================================
  // TOTAL ITEMS
  // =========================================================

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

  // =========================================================
  // TOTAL PRICE
  // =========================================================

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

  // =========================================================
  // SELECTED ITEMS
  // =========================================================

  selectedItems = computed(() => {

    const selected =
      new Set(
        this.selectedProductIds()
      );

    return this.cartItems()
      .filter(
        item =>
          selected.has(
            item.id
          )
      );

  });

  // =========================================================
  // SELECTED PRODUCT COUNT
  // =========================================================

  selectedProductCount =
    computed(() => {

      return this.selectedItems()
        .length;

    });

  // =========================================================
  // SELECTED ITEM COUNT
  // =========================================================

  selectedCount =
    computed(() => {

      return this.selectedItems()
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

  // =========================================================
  // SELECTED TOTAL
  // =========================================================

  selectedTotal =
    computed(() => {

      return this.selectedItems()
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

  // =========================================================
  // ALL SELECTED
  // =========================================================

  isAllSelected =
    computed(() => {

      const items =
        this.cartItems();

      if (
        items.length === 0
      ) {
        return false;
      }

      const selected =
        new Set(
          this.selectedProductIds()
        );

      return items.every(
        item =>
          selected.has(
            item.id
          )
      );

    });

  // =========================================================
  // LOAD CART
  // =========================================================

  private loadCart():
    any[] {

    if (
      !this.currentUserKey
    ) {
      return [];
    }

    const savedCart =
      localStorage.getItem(
        this.cartStorageKey
      );

    if (!savedCart) {
      return [];
    }

    try {

      const cart =
        JSON.parse(
          savedCart
        );

      return Array.isArray(cart)
        ? cart
        : [];

    } catch {

      return [];

    }
  }

  // =========================================================
  // SAVE CART
  // =========================================================

  private saveCart():
    void {

    if (
      !this.currentUserKey
    ) {
      return;
    }

    localStorage.setItem(
      this.cartStorageKey,
      JSON.stringify(
        this.cartItems()
      )
    );
  }

  // =========================================================
  // LOAD SELECTION
  // =========================================================

  private loadSelection():
    number[] {

    if (
      !this.currentUserKey
    ) {
      return [];
    }

    const savedSelection =
      localStorage.getItem(
        this.selectionStorageKey
      );

    if (!savedSelection) {
      return [];
    }

    try {

      const selection =
        JSON.parse(
          savedSelection
        );

      if (
        !Array.isArray(
          selection
        )
      ) {
        return [];
      }

      return selection
        .map(
          id =>
            Number(id)
        )
        .filter(
          id =>
            !Number.isNaN(id)
        );

    } catch {

      return [];

    }
  }

  // =========================================================
  // SAVE SELECTION
  // =========================================================

  private saveSelection():
    void {

    if (
      !this.currentUserKey
    ) {
      return;
    }

    localStorage.setItem(
      this.selectionStorageKey,
      JSON.stringify(
        this.selectedProductIds()
      )
    );
  }

  // =========================================================
  // CLEAN SELECTION
  // =========================================================

  private cleanSelection() {

    const availableIds =
      new Set(
        this.cartItems()
          .map(
            item =>
              Number(item.id)
          )
      );

    const cleaned =
      this.selectedProductIds()
        .filter(
          id =>
            availableIds.has(id)
        );

    this.selectedProductIds
      .set(cleaned);

    this.saveSelection();

  }

  // =========================================================
  // ADD TO CART
  // =========================================================

  addToCart(
    product: any
  ) {

    if (!product) {
      return;
    }

    const currentItems =
      this.cartItems();

    const existingItem =
      currentItems.find(
        item =>
          item.id === product.id
      );

    if (existingItem) {

      this.cartItems.set(

        currentItems.map(
          item =>

            item.id ===
            product.id

              ? {
                  ...item,

                  quantity:
                    Number(
                      item.quantity
                    ) + 1
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

    this.saveCart();

  }

  // =========================================================
  // REMOVE FROM CART
  // =========================================================

  removeFromCart(
    productId: number
  ) {

    this.cartItems.set(

      this.cartItems()
        .filter(
          item =>
            item.id !==
            productId
        )

    );

    this.selectedProductIds.set(

      this.selectedProductIds()
        .filter(
          id =>
            id !== productId
        )

    );

    this.saveCart();

    this.saveSelection();

  }

  // =========================================================
  // REMOVE PURCHASED ITEMS
  // =========================================================

  removePurchasedItems(
    productIds: number[]
  ) {

    if (
      !Array.isArray(productIds) ||
      productIds.length === 0
    ) {
      return;
    }

    const purchasedIds =
      new Set(
        productIds.map(
          id =>
            Number(id)
        )
      );

    this.cartItems.set(

      this.cartItems()
        .filter(
          item =>
            !purchasedIds.has(
              Number(item.id)
            )
        )

    );

    this.selectedProductIds.set(

      this.selectedProductIds()
        .filter(
          id =>
            !purchasedIds.has(
              Number(id)
            )
        )

    );

    this.saveCart();

    this.saveSelection();

  }

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  increaseQuantity(
    productId: number
  ) {

    this.cartItems.set(

      this.cartItems()
        .map(
          item =>

            item.id ===
            productId

              ? {
                  ...item,

                  quantity:
                    Number(
                      item.quantity
                    ) + 1
                }

              : item
        )

    );

    this.saveCart();

  }

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  decreaseQuantity(
    productId: number
  ) {

    this.cartItems.set(

      this.cartItems()

        .map(
          item =>

            item.id ===
            productId

              ? {
                  ...item,

                  quantity:
                    Number(
                      item.quantity
                    ) - 1
                }

              : item
        )

        .filter(
          item =>
            Number(
              item.quantity
            ) > 0
        )

    );

    this.cleanSelection();

    this.saveCart();

  }

  // =========================================================
  // TOGGLE PRODUCT SELECTION
  // =========================================================

  toggleProductSelection(
    productId: number
  ) {

    const selected =
      new Set(
        this.selectedProductIds()
      );

    if (
      selected.has(productId)
    ) {

      selected.delete(
        productId
      );

    } else {

      selected.add(
        productId
      );

    }

    this.selectedProductIds.set(
      Array.from(selected)
    );

    this.saveSelection();

  }

  // =========================================================
  // IS PRODUCT SELECTED
  // =========================================================

  isSelected(
    productId: number
  ): boolean {

    return this.selectedProductIds()
      .includes(
        productId
      );

  }

  // =========================================================
  // TOGGLE SELECT ALL
  // =========================================================

  toggleSelectAll() {

    if (
      this.isAllSelected()
    ) {

      this.selectedProductIds
        .set([]);

    } else {

      this.selectedProductIds.set(

        this.cartItems()
          .map(
            item =>
              item.id
          )

      );

    }

    this.saveSelection();

  }

  // =========================================================
  // CLEAR SELECTION
  // =========================================================

  clearSelection() {

    this.selectedProductIds
      .set([]);

    if (
      this.currentUserKey
    ) {

      localStorage.removeItem(
        this.selectionStorageKey
      );

    }

  }

  // =========================================================
  // CLEAR CART
  // =========================================================

  clearCart() {

    this.cartItems.set([]);

    this.selectedProductIds
      .set([]);

    if (
      !this.currentUserKey
    ) {
      return;
    }

    localStorage.removeItem(
      this.cartStorageKey
    );

    localStorage.removeItem(
      this.selectionStorageKey
    );

  }

}