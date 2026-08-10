import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../../services/book';

@Component({
  selector: 'app-book-detail',
  imports: [RouterLink],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail implements OnInit {

  book: any = null;

  isLoading = true;

  errorMessage = '';


  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {}


  ngOnInit() {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.isLoading = false;

      this.errorMessage =
        'ID buku tidak ditemukan.';

      return;

    }


    this.bookService.getBookById(id).subscribe({

      next: (data: any) => {

        this.book = data;

        this.isLoading = false;

      },


      error: () => {

        this.isLoading = false;

        this.errorMessage =
          'Buku tidak ditemukan atau gagal mengambil data.';

      }

    });

  }

}