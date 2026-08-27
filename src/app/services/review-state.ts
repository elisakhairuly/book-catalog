import { Injectable, signal } from '@angular/core';

export interface UserReview {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewStateService {

  private readonly storageKey =
    'product-catalog-reviews';


  // =========================
  // REVIEW STATE
  // =========================

  reviews = signal<UserReview[]>(
    this.loadReviews()
  );


  // =========================
  // ADD REVIEW
  // =========================

  addReview(
    productId: number,
    userName: string,
    rating: number,
    comment: string
  ) {

    const newReview: UserReview = {

      id: Date.now(),

      productId,

      userName,

      rating,

      comment: comment.trim(),

      date: new Date().toISOString()

    };


    this.reviews.update(
      currentReviews => [
        ...currentReviews,
        newReview
      ]
    );


    this.saveReviews();

  }


  // =========================
  // GET PRODUCT REVIEWS
  // =========================

  getReviewsByProduct(
    productId: number
  ): UserReview[] {

    return this.reviews().filter(
      review =>
        review.productId === productId
    );

  }


  // =========================
  // LOAD REVIEWS
  // =========================

  private loadReviews():
    UserReview[] {

    const savedReviews =
      localStorage.getItem(
        this.storageKey
      );


    if (!savedReviews) {
      return [];
    }


    try {

      const parsedReviews =
        JSON.parse(savedReviews);

      return Array.isArray(parsedReviews)
        ? parsedReviews
        : [];

    } catch {

      return [];

    }

  }


  // =========================
  // SAVE REVIEWS
  // =========================

  private saveReviews() {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.reviews()
      )
    );

  }

}