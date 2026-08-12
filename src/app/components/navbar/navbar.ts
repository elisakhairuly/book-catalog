import { Component } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CartStateService } from '../../services/cart-state';


@Component({

  selector: 'app-navbar',

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css'

})

export class Navbar {


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private cartState: CartStateService
  ) {}


  // =========================
  // CART TOTAL
  // =========================

  get totalItems() {

    return this.cartState.totalItems;

  }


}