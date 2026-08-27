import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../services/auth-state';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // =========================
  // FORM
  // =========================

  email = '';

  password = '';


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
    private router: Router,
    private route: ActivatedRoute
  ) {

    if (
      this.route.snapshot.queryParamMap.get('registered') === 'true'
    ) {

      this.successMessage =
        'Registrasi berhasil. Silakan login.';

    }

  }


  // =========================
  // LOGIN
  // =========================

  login() {

    this.errorMessage = '';

    this.successMessage = '';


    // =========================
    // VALIDATION
    // =========================

    if (
      !this.email.trim() ||
      !this.password
    ) {

      this.errorMessage =
        'Email dan password wajib diisi.';

      return;

    }


    this.isSubmitting = true;


    const result =
      this.authState.login(
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
      'Login berhasil.';


    setTimeout(() => {

      const redirect =
        this.route.snapshot.queryParamMap.get('redirect');

      if (redirect) {

        this.router.navigateByUrl(
          redirect
        );

      } else {

        this.router.navigate(
          ['/home']
        );

      }

    }, 500);

  }

}