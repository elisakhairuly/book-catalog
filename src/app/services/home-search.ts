import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeSearchService {

  // =========================
  // SEARCH STATE
  // =========================

  keyword = signal('');


  // =========================
  // SET SEARCH
  // =========================

  setKeyword(value: string) {

    this.keyword.set(
      value.toLowerCase().trimStart()
    );

  }


  // =========================
  // CLEAR SEARCH
  // =========================

  clearSearch() {

    this.keyword.set('');

  }

}