import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { AuthStateService } from '../services/auth-state';


export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  const authState =
    inject(AuthStateService);

  const router =
    inject(Router);


  // =========================
  // SUDAH LOGIN
  // =========================

  if (authState.isLoggedIn()) {
    return true;
  }


  // =========================
  // BELUM LOGIN
  // =========================

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        redirect: state.url
      }
    }
  );

};