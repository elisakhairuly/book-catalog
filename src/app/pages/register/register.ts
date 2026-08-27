import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStateService } from '../../services/auth-state';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  // =========================
  // FORM
  // =========================

  name = '';

  email = '';

  password = '';

  confirmPassword = '';


  // =========================
  // STATE
  // =========================

  errorMessage = '';

  successMessage = '';

  isSubmitting = false;


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private authState: AuthStateService,
    private router: Router
  ) {}


  // =========================
  // REGISTER
  // =========================

  register() {

    this.errorMessage = '';

    this.successMessage = '';


    // =========================
    // VALIDATION
    // =========================

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'Semua data wajib diisi.';

      return;

    }


    if (this.password.length < 6) {

      this.errorMessage =
        'Password minimal 6 karakter.';

      return;

    }


    if (
      this.password !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'Konfirmasi password tidak sama.';

      return;

    }


    // =========================
    // REGISTER USER
    // =========================

    this.isSubmitting = true;


    const result =
      this.authState.register(
        this.name,
        this.email,
        this.password
      );


    this.isSubmitting = false;


    if (!result.success) {

      this.errorMessage =
        result.message;

      return;

    }


    // =========================
    // SUCCESS
    // =========================

    this.successMessage =
      'Registrasi berhasil. Silakan login.';


    // Pindah ke login

    setTimeout(() => {

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            registered: 'true'
          }
        }
      );

    }, 700);

  }

}