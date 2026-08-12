import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../../services/book';
import { CartStateService } from '../../services/cart-state';

@Component({
  selector: 'app-book-detail',
  imports: [RouterLink],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail implements OnInit {

  // =========================
  // DATA
  // =========================

  book: any = null;


  // =========================
  // STATE
  // =========================

  isLoading = true;

  errorMessage = '';

  showCartNotification = false;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartState: CartStateService
  ) {}


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit() {

    const id =
      this.route.snapshot.paramMap.get('id');


    // =========================
    // CHECK ID
    // =========================

    if (!id) {

      this.isLoading = false;

      this.errorMessage =
        'ID produk tidak ditemukan.';

      return;

    }


    // =========================
    // GET PRODUCT DETAIL
    // =========================

    this.bookService.getBookById(id).subscribe({

      next: (data: any) => {

        this.book = data;

        this.isLoading = false;

      },


      error: () => {

        this.isLoading = false;

        this.errorMessage =
          'Produk tidak ditemukan atau gagal mengambil data.';

      }

    });

  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart() {

    if (!this.book) {
      return;
    }


    // Masukkan produk ke cart state

    this.cartState.addToCart(this.book);


    // Tampilkan notifikasi

    this.showCartNotification = true;


    // Sembunyikan notifikasi setelah 2.5 detik

    setTimeout(() => {

      this.showCartNotification = false;

    }, 2500);

  }

}