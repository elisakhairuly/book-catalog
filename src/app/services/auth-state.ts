import { Injectable, computed, signal } from '@angular/core';

export interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  // =========================
  // STORAGE KEYS
  // =========================

  private readonly usersStorageKey =
    'product-catalog-users';

  private readonly currentUserStorageKey =
    'product-catalog-current-user';


  // =========================
  // AUTH STATE
  // =========================

  currentUser = signal<AuthUser | null>(
    this.loadCurrentUser()
  );


  // =========================
  // COMPUTED LOGIN STATUS
  // =========================

  isLoggedIn = computed(() => {
    return this.currentUser() !== null;
  });


  // =========================
  // REGISTER
  // =========================

  register(
    name: string,
    email: string,
    password: string
  ): {
    success: boolean;
    message: string;
  } {

    const users =
      this.loadRegisteredUsers();

    const normalizedEmail =
      email.trim().toLowerCase();


    // Cek email sudah digunakan

    const existingUser =
      users.find(
        user =>
          user.email.toLowerCase() ===
          normalizedEmail
      );


    if (existingUser) {

      return {
        success: false,
        message: 'Email sudah terdaftar.'
      };

    }


    // Buat user baru

    const newUser: RegisteredUser = {

      id: Date.now(),

      name: name.trim(),

      email: normalizedEmail,

      password

    };


    users.push(newUser);


    // Simpan ke localStorage

    localStorage.setItem(
      this.usersStorageKey,
      JSON.stringify(users)
    );


    return {
      success: true,
      message: 'Registrasi berhasil.'
    };

  }


  // =========================
  // LOGIN
  // =========================

  login(
    email: string,
    password: string
  ): {
    success: boolean;
    message: string;
  } {

    const users =
      this.loadRegisteredUsers();

    const normalizedEmail =
      email.trim().toLowerCase();


    const user =
      users.find(
        registeredUser =>
          registeredUser.email.toLowerCase() ===
            normalizedEmail &&
          registeredUser.password ===
            password
      );


    if (!user) {

      return {
        success: false,
        message: 'Email atau password salah.'
      };

    }


    // Jangan simpan password di current user

    const authUser: AuthUser = {

      id: user.id,

      name: user.name,

      email: user.email

    };


    // Update Angular Signal

    this.currentUser.set(
      authUser
    );


    // Persistent login

    localStorage.setItem(
      this.currentUserStorageKey,
      JSON.stringify(authUser)
    );


    return {
      success: true,
      message: 'Login berhasil.'
    };

  }


  // =========================
  // LOGOUT
  // =========================

  logout() {

    this.currentUser.set(null);

    localStorage.removeItem(
      this.currentUserStorageKey
    );

  }


  // =========================
  // LOAD REGISTERED USERS
  // =========================

  private loadRegisteredUsers():
    RegisteredUser[] {

    const savedUsers =
      localStorage.getItem(
        this.usersStorageKey
      );


    if (!savedUsers) {
      return [];
    }


    try {

      const parsedUsers =
        JSON.parse(savedUsers);

      return Array.isArray(parsedUsers)
        ? parsedUsers
        : [];

    } catch {

      return [];

    }

  }


  // =========================
  // LOAD CURRENT USER
  // =========================

  private loadCurrentUser():
    AuthUser | null {

    const savedUser =
      localStorage.getItem(
        this.currentUserStorageKey
      );


    if (!savedUser) {
      return null;
    }


    try {

      return JSON.parse(
        savedUser
      ) as AuthUser;

    } catch {

      return null;

    }

  }

}