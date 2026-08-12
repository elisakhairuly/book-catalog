import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {

  products = signal<any[]>([]);

  setProducts(products: any[]) {
    this.products.set(products);
  }

  clearProducts() {
    this.products.set([]);
  }

}