import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentBaseEndpoint = environment.paymentApiEndpoint;

  constructor(private http: HttpClient) { }

  async createCheckoutSession(moduleName: string, amount: number, moduleId: string): Promise<void> {
    const stripe = await loadStripe(environment.stripePublishableKey);
    const successUrl = `${window.location.origin}/payment-success`;
    const cancelUrl = `${window.location.origin}/payment-cancel`;
    const amountInCents = Math.round(amount * 100);  // Converts amount to cents recommended for Stripe payment

    this.http.post<{ sessionId: string }>(`${this.paymentBaseEndpoint}/checkout`, {
      moduleName,
      amount: amountInCents,
      successUrl,
      cancelUrl,
      moduleId
    }).subscribe(async (response) => {
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: response.sessionId });
      }
    });
  }
}