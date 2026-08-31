import {
  Component
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  CartStateService
} from '../../services/cart-state';

import {
  AuthStateService
} from '../../services/auth-state';

@Component({
  selector: 'app-checkout',

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './checkout.html',

  styleUrl:
    './checkout.css'
})
export class Checkout {

  // =========================
  // SHIPPING FORM
  // =========================

  receiverName = '';

  phone = '';

  address = '';

  city = '';

  postalCode = '';

  // =========================
  // FORM STATE
  // =========================

  formError = '';

  isProcessingPayment = false;

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState:
      CartStateService,

    private authState:
      AuthStateService,

    private router:
      Router
  ) {

    const user =
      this.authState.currentUser();

    if (user) {
      this.receiverName =
        user.name || '';
    }
  }

  // =========================================================
  // SELECTED ITEMS
  // =========================================================

  get selectedItems(): any[] {
    return this.cartState
      .selectedItems();
  }

  // =========================================================
  // SUBTOTAL
  // =========================================================

  get subtotal(): number {
    return this.cartState
      .selectedTotal();
  }

  // =========================================================
  // TOTAL QUANTITY
  // =========================================================

  get totalSelectedItems(): number {
    return this.selectedItems.reduce(
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
  }

  // =========================================================
  // SHIPPING COST
  // =========================================================

  get shippingCost(): number {
    return 0;
  }

  // =========================================================
  // GRAND TOTAL
  // =========================================================

  get grandTotal(): number {
    return (
      this.subtotal +
      this.shippingCost
    );
  }

  // =========================================================
  // BACK TO CART
  // =========================================================

  backToCart() {
    this.router.navigate([
      '/cart'
    ]);
  }

  // =========================================================
  // CONTINUE PAYMENT
  // =========================================================

  async continuePayment() {

    this.formError = '';

    // =======================================================
    // CHECK PRODUCTS
    // =======================================================

    if (
      this.selectedItems.length === 0
    ) {
      this.formError =
        'Pilih minimal satu produk sebelum melanjutkan pembayaran.';

      return;
    }

    // =======================================================
    // VALIDATE NAME
    // =======================================================

    if (
      !this.receiverName.trim()
    ) {
      this.formError =
        'Nama penerima wajib diisi.';

      return;
    }

    // =======================================================
    // VALIDATE PHONE
    // =======================================================

    if (
      !this.phone.trim()
    ) {
      this.formError =
        'Nomor telepon wajib diisi.';

      return;
    }

    // =======================================================
    // VALIDATE ADDRESS
    // =======================================================

    if (
      !this.address.trim()
    ) {
      this.formError =
        'Alamat pengiriman wajib diisi.';

      return;
    }

    // =======================================================
    // VALIDATE CITY
    // =======================================================

    if (
      !this.city.trim()
    ) {
      this.formError =
        'Kota atau kabupaten wajib diisi.';

      return;
    }

    // =======================================================
    // VALIDATE POSTAL CODE
    // =======================================================

    if (
      !this.postalCode.trim()
    ) {
      this.formError =
        'Kode pos wajib diisi.';

      return;
    }

    // =======================================================
    // CHECKOUT PAYLOAD
    // =======================================================

    const checkoutData = {
      customer: {
        name:
          this.receiverName.trim(),

        phone:
          this.phone.trim(),

        address:
          this.address.trim(),

        city:
          this.city.trim(),

        postalCode:
          this.postalCode.trim()
      },

      items:
        this.selectedItems,

      totalItems:
        this.totalSelectedItems,

      subtotal:
        this.subtotal,

      shipping:
        this.shippingCost,

      total:
        this.grandTotal
    };

    // =======================================================
    // SAVE TEMPORARY DATA
    // =======================================================

    sessionStorage.setItem(
      'checkout-data',
      JSON.stringify(
        checkoutData
      )
    );

    // =======================================================
    // CREATE PAYMENT
    // =======================================================

    try {

      this.isProcessingPayment =
        true;

      const response =
        await fetch(
          '/api/create-payment',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                customer:
                  checkoutData.customer,

                items:
                  checkoutData.items
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          'Gagal membuat pembayaran.'
        );
      }

      if (
        !data.payment_link_url
      ) {
        throw new Error(
          'Payment link Xendit tidak tersedia.'
        );
      }

      // =====================================================
      // SAVE PAYMENT SESSION
      // =====================================================

      sessionStorage.setItem(
        'xendit-payment',
        JSON.stringify({
          referenceId:
            data.reference_id,

          sessionId:
            data.payment_session_id,

          amount:
            data.amount,

          currency:
            data.currency
        })
      );

      // =====================================================
      // REDIRECT TO XENDIT
      // =====================================================

      window.location.href =
        data.payment_link_url;

    } catch (error) {

      console.error(
        'Payment error:',
        error
      );

      this.formError =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memproses pembayaran.';

      this.isProcessingPayment =
        false;
    }
  }
}