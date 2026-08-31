import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
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
export class Checkout
  implements OnInit {

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

  isProcessingPayment =
    false;

  isCheckingPayment =
    false;

  paymentSuccess =
    false;

  paymentCancelled =
    false;

  paymentReference =
    '';

  paymentAmount =
    0;

  paymentCurrency =
    '';

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState:
      CartStateService,

    private authState:
      AuthStateService,

    private router:
      Router,

    private route:
      ActivatedRoute
  ) {

    const user =
      this.authState.currentUser();

    if (user) {

      this.receiverName =
        user.name || '';

    }

  }

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit() {

    this.isProcessingPayment =
      false;

    const payment =
      this.route.snapshot
        .queryParamMap
        .get('payment');

    const reference =
      this.route.snapshot
        .queryParamMap
        .get('reference');

    if (reference) {

      this.paymentReference =
        reference;

    }

    if (
      payment ===
      'success'
    ) {

      this.verifyPayment();

    }

    if (
      payment ===
      'cancelled'
    ) {

      this.paymentCancelled =
        true;

    }

  }

  // =========================================================
  // HANDLE BROWSER BACK / FORWARD
  // =========================================================

  @HostListener(
    'window:pageshow',
    ['$event']
  )
  onPageShow(
    event: PageTransitionEvent
  ) {

    this.isProcessingPayment =
      false;

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
  // SUBTOTAL
  // =========================================================

  get subtotal():
    number {

    return this.cartState
      .selectedTotal();

  }

  // =========================================================
  // TOTAL QUANTITY
  // =========================================================

  get totalSelectedItems():
    number {

    return this.selectedItems
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

  }

  // =========================================================
  // SHIPPING COST
  // =========================================================

  get shippingCost():
    number {

    return 0;

  }

  // =========================================================
  // GRAND TOTAL
  // =========================================================

  get grandTotal():
    number {

    return (
      this.subtotal +
      this.shippingCost
    );

  }

  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  async verifyPayment() {

    this.formError = '';

    this.isCheckingPayment =
      true;

    try {

      const savedPayment =
        sessionStorage.getItem(
          'xendit-payment'
        );

      const checkoutDataRaw =
        sessionStorage.getItem(
          'checkout-data'
        );

      if (!savedPayment) {

        throw new Error(
          'Data sesi pembayaran tidak ditemukan.'
        );

      }

      const paymentData =
        JSON.parse(
          savedPayment
        );

      const sessionId =
        paymentData.sessionId;

      if (!sessionId) {

        throw new Error(
          'Payment session ID tidak ditemukan.'
        );

      }

      const response =
        await fetch(
          `/api/check-payment?session_id=${encodeURIComponent(sessionId)}`
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          'Gagal memeriksa status pembayaran.'
        );

      }

      // =====================================================
      // COMPLETED
      // =====================================================

      if (
        data.status ===
        'COMPLETED'
      ) {

        this.paymentSuccess =
          true;

        this.paymentReference =
          data.reference_id ||
          this.paymentReference;

        this.paymentAmount =
          Number(
            data.amount || 0
          );

        this.paymentCurrency =
          data.currency ||
          'IDR';

        // ===================================================
        // REMOVE PURCHASED ITEMS
        // ===================================================

        if (checkoutDataRaw) {

          try {

            const checkoutData =
              JSON.parse(
                checkoutDataRaw
              );

            const purchasedIds =
              Array.isArray(
                checkoutData.items
              )
                ? checkoutData.items
                    .map(
                      (item: any) =>
                        Number(item.id)
                    )
                    .filter(
                      (id: number) =>
                        !Number.isNaN(id)
                    )
                : [];

            this.cartState
              .removePurchasedItems(
                purchasedIds
              );

          } catch (
            checkoutError
          ) {

            console.error(
              'Checkout data parse error:',
              checkoutError
            );

          }

        }

        // ===================================================
        // SAVE PAYMENT RESULT
        // ===================================================

        sessionStorage.setItem(
          'last-payment-result',
          JSON.stringify({

            referenceId:
              this.paymentReference,

            sessionId:
              data.payment_session_id,

            status:
              data.status,

            amount:
              this.paymentAmount,

            currency:
              this.paymentCurrency,

            paymentId:
              data.payment_id ||
              null

          })
        );

        // ===================================================
        // CLEAN TEMPORARY SESSION
        // ===================================================

        sessionStorage.removeItem(
          'checkout-data'
        );

        sessionStorage.removeItem(
          'xendit-payment'
        );

        return;

      }

      // =====================================================
      // ACTIVE
      // =====================================================

      if (
        data.status ===
        'ACTIVE'
      ) {

        this.formError =
          'Pembayaran masih diproses. Silakan tunggu beberapa saat.';

        return;

      }

      // =====================================================
      // EXPIRED
      // =====================================================

      if (
        data.status ===
        'EXPIRED'
      ) {

        this.formError =
          'Sesi pembayaran telah kedaluwarsa. Silakan lakukan checkout kembali.';

        return;

      }

      // =====================================================
      // CANCELED
      // =====================================================

      if (
        data.status ===
        'CANCELED'
      ) {

        this.paymentCancelled =
          true;

        return;

      }

      this.formError =
        `Status pembayaran: ${data.status || 'tidak diketahui'}.`;

    } catch (error) {

      console.error(
        'Verify payment error:',
        error
      );

      this.formError =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memverifikasi pembayaran.';

    } finally {

      this.isCheckingPayment =
        false;

    }

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
  // CANCEL CHECKOUT
  // =========================================================

  cancelCheckout() {

    sessionStorage.removeItem(
      'checkout-data'
    );

    sessionStorage.removeItem(
      'xendit-payment'
    );

    this.formError = '';

    this.isProcessingPayment =
      false;

    this.router.navigate([
      '/cart'
    ]);

  }

  // =========================================================
  // GO PRODUCTS
  // =========================================================

  goToProducts() {

    this.router.navigate([
      '/book'
    ]);

  }

  // =========================================================
  // GO HOME
  // =========================================================

  goToHome() {

    this.router.navigate([
      '/home'
    ]);

  }

  // =========================================================
  // CONTINUE PAYMENT
  // =========================================================

  async continuePayment() {

    this.formError = '';

    if (
      this.selectedItems.length === 0
    ) {

      this.formError =
        'Pilih minimal satu produk sebelum melanjutkan pembayaran.';

      return;

    }

    if (
      !this.receiverName.trim()
    ) {

      this.formError =
        'Nama penerima wajib diisi.';

      return;

    }

    if (
      !this.phone.trim()
    ) {

      this.formError =
        'Nomor telepon wajib diisi.';

      return;

    }

    if (
      !this.address.trim()
    ) {

      this.formError =
        'Alamat pengiriman wajib diisi.';

      return;

    }

    if (
      !this.city.trim()
    ) {

      this.formError =
        'Kota atau kabupaten wajib diisi.';

      return;

    }

    if (
      !this.postalCode.trim()
    ) {

      this.formError =
        'Kode pos wajib diisi.';

      return;

    }

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

    sessionStorage.setItem(
      'checkout-data',
      JSON.stringify(
        checkoutData
      )
    );

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