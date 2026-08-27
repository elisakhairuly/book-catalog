import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { BookList } from './pages/book-list/book-list';
import { BookDetail } from './pages/book-detail/book-detail';
import { Cart } from './pages/cart/cart';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { NotFound } from './pages/not-found/not-found';

import { authGuard } from './guards/auth-guard';


export const routes: Routes = [

  // =========================
  // HOME - PUBLIC
  // =========================

  {
    path: 'home',
    component: Home
  },


  // =========================
  // PRODUCT LIST - PUBLIC
  // =========================

  {
    path: 'book',
    component: BookList
  },


  // =========================
  // PRODUCT DETAIL - PUBLIC
  // =========================

  {
    path: 'book/:id',
    component: BookDetail
  },


  // =========================
  // CART - LOGIN REQUIRED
  // =========================

  {
    path: 'cart',
    component: Cart,
    canActivate: [authGuard]
  },


  // =========================
  // LOGIN
  // =========================

  {
    path: 'login',
    component: Login
  },


  // =========================
  // REGISTER
  // =========================

  {
    path: 'register',
    component: Register
  },


  // =========================
  // DEFAULT
  // =========================

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },


  // =========================
  // NOT FOUND
  // =========================

  {
    path: '**',
    component: NotFound
  }

];