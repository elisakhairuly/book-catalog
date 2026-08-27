import {
  Component,
  ElementRef,
  HostListener
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  filter
} from 'rxjs';

import {
  CartStateService
} from '../../services/cart-state';

import {
  AuthStateService
} from '../../services/auth-state';

import {
  HomeSearchService
} from '../../services/home-search';


@Component({
  selector: 'app-navbar',

  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule
  ],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css'
})
export class Navbar {

  // =========================
  // SEARCH
  // =========================

  searchKeyword = '';

  isHomePage = false;

  isProductPage = false;


  // =========================
  // MINI CART
  // =========================

  showMiniCart = false;


  // =========================
  // MOBILE MENU
  // =========================

  showMobileMenu = false;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState:
      CartStateService,

    private authState:
      AuthStateService,

    private homeSearch:
      HomeSearchService,

    private router:
      Router,

    private elementRef:
      ElementRef
  ) {

    // =========================
    // CHECK INITIAL ROUTE
    // =========================

    this.checkCurrentRoute(
      this.router.url
    );


    // =========================
    // WATCH ROUTE
    // =========================

    this.router.events
      .pipe(
        filter(
          (
            event
          ): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(
        (
          event:
            NavigationEnd
        ) => {

          this.checkCurrentRoute(
            event.urlAfterRedirects
          );


          // =========================
          // CLOSE DROPDOWNS
          // =========================

          this.showMiniCart =
            false;

          this.showMobileMenu =
            false;

        }
      );

  }


  // =========================================================
  // CLICK OUTSIDE
  // =========================================================

  @HostListener(
    'document:click',
    ['$event']
  )
  handleDocumentClick(
    event: MouseEvent
  ) {

    const target =
      event.target as Node | null;


    if (!target) {

      return;

    }


    // =========================
    // MINI CART
    // =========================

    if (
      this.showMiniCart
    ) {

      const cartWrapper =
        this.elementRef
          .nativeElement
          .querySelector(
            '.cart-wrapper'
          );


      if (
        cartWrapper &&
        !cartWrapper.contains(
          target
        )
      ) {

        this.showMiniCart =
          false;

      }

    }


    // =========================
    // MOBILE MENU
    // =========================

    if (
      this.showMobileMenu
    ) {

      const mobileArea =
        this.elementRef
          .nativeElement
          .querySelector(
            '.mobile-navigation-area'
          );


      if (
        mobileArea &&
        !mobileArea.contains(
          target
        )
      ) {

        this.showMobileMenu =
          false;

      }

    }

  }


  // =========================================================
  // ESCAPE KEY
  // =========================================================

  @HostListener(
    'document:keydown.escape'
  )
  handleEscapeKey() {

    this.showMiniCart =
      false;

    this.showMobileMenu =
      false;

  }


  // =========================
  // CHECK CURRENT ROUTE
  // =========================

  private checkCurrentRoute(
    url: string
  ) {

    // =========================
    // HOME
    // =========================

    this.isHomePage =
      url === '/home' ||
      url.startsWith(
        '/home?'
      );


    // =========================
    // PRODUCT LIST
    // =========================

    this.isProductPage =
      url === '/book' ||
      url.startsWith(
        '/book?'
      );


    // =========================
    // READ SEARCH FROM URL
    // =========================

    if (
      this.isProductPage
    ) {

      const urlTree =
        this.router.parseUrl(
          url
        );


      this.searchKeyword =
        urlTree
          .queryParams[
            'search'
          ] || '';

    }


    // =========================
    // CLEAR SEARCH OTHER PAGE
    // =========================

    else if (
      !this.isHomePage
    ) {

      this.searchKeyword =
        '';

    }

  }


  // =========================
  // LIVE SEARCH
  // =========================

  searchProductsLive() {

    const keyword =
      this.searchKeyword
        .trim();


    // =========================
    // HOME
    // =========================

    if (
      this.isHomePage
    ) {

      this.homeSearch
        .setKeyword(
          keyword
        );

      return;

    }


    // =========================
    // PRODUCT
    // =========================

    if (
      this.isProductPage
    ) {

      this.router.navigate(
        [],
        {
          queryParams: {
            search:
              keyword ||
              null
          },

          queryParamsHandling:
            'merge',

          replaceUrl:
            true
        }
      );

    }

  }


  // =========================
  // SUBMIT SEARCH
  // =========================

  searchProducts() {

    const keyword =
      this.searchKeyword
        .trim();


    if (!keyword) {

      return;

    }


    this.showMiniCart =
      false;

    this.showMobileMenu =
      false;


    this.router.navigate(
      ['/book'],
      {
        queryParams: {
          search:
            keyword
        }
      }
    );

  }


  // =========================
  // CLEAR SEARCH
  // =========================

  clearSearch() {

    this.searchKeyword =
      '';


    // =========================
    // HOME
    // =========================

    if (
      this.isHomePage
    ) {

      this.homeSearch
        .clearSearch();

      return;

    }


    // =========================
    // PRODUCT
    // =========================

    if (
      this.isProductPage
    ) {

      this.router.navigate(
        [],
        {
          queryParams: {
            search:
              null
          },

          queryParamsHandling:
            'merge',

          replaceUrl:
            true
        }
      );

    }

  }


  // =========================================================
  // CART ITEMS
  // =========================================================

  get cartItems() {

    return this.cartState
      .cartItems;

  }


  // =========================================================
  // CART TOTAL ITEMS
  // =========================================================

  get totalItems() {

    return this.cartState
      .totalItems;

  }


  // =========================================================
  // CART TOTAL PRICE
  // =========================================================

  get totalPrice() {

    return this.cartState
      .totalPrice;

  }


  // =========================================================
  // TOGGLE MINI CART
  // =========================================================

  toggleMiniCart(
    event: MouseEvent
  ) {

    event.preventDefault();

    event.stopPropagation();


    // =========================
    // CHECK LOGIN
    // =========================

    if (
      !this.authState
        .isLoggedIn()
    ) {

      this.showMiniCart =
        false;

      this.showMobileMenu =
        false;


      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            redirect:
              '/cart'
          }
        }
      );


      return;

    }


    // =========================
    // CLOSE MOBILE MENU
    // =========================

    this.showMobileMenu =
      false;


    // =========================
    // TOGGLE MINI CART
    // =========================

    this.showMiniCart =
      !this.showMiniCart;

  }


  // =========================================================
  // CLOSE MINI CART
  // =========================================================

  closeMiniCart() {

    this.showMiniCart =
      false;

  }


  // =========================================================
  // MOBILE MENU
  // =========================================================

  toggleMobileMenu(
    event: MouseEvent
  ) {

    event.stopPropagation();


    // Jangan tampil bersamaan
    // dengan mini cart

    this.showMiniCart =
      false;


    this.showMobileMenu =
      !this.showMobileMenu;

  }


  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  closeMobileMenu() {

    this.showMobileMenu =
      false;

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
  // REMOVE CART ITEM
  // =========================================================

  removeCartItem(
    productId: number
  ) {

    this.cartState
      .removeFromCart(
        productId
      );

  }


  // =========================================================
  // OPEN CART PAGE
  // =========================================================

  openCartPage() {

    this.showMiniCart =
      false;

    this.showMobileMenu =
      false;


    this.router.navigate(
      ['/cart']
    );

  }


  // =========================================================
  // CHECKOUT
  // =========================================================

  checkout() {

    this.showMiniCart =
      false;

    this.showMobileMenu =
      false;


    // Checkout final nanti.
    // Untuk sekarang masuk cart.

    this.router.navigate(
      ['/cart']
    );

  }


  // =========================================================
  // LOGIN STATUS
  // =========================================================

  get isLoggedIn() {

    return this.authState
      .isLoggedIn;

  }


  // =========================================================
  // CURRENT USER
  // =========================================================

  get currentUser() {

    return this.authState
      .currentUser;

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logout() {

    this.showMiniCart =
      false;

    this.showMobileMenu =
      false;


    this.authState
      .logout();


    this.router.navigate(
      ['/home']
    );

  }

}