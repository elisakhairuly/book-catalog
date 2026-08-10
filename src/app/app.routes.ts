import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { BookList } from './pages/book-list/book-list';
import { BookDetail } from './pages/book-detail/book-detail';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [

  {
    path: 'home',
    component: Home
  },

  {
    path: 'book',
    component: BookList
  },

  {
    path: 'book/:id',
    component: BookDetail
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: '**',
    component: NotFound
  }

];