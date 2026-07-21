import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib = require('stripe');

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new StripeLib(process.env.STRIPE_SECRET_KEY!);
  }

  getClient(): Stripe {
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    });
  }

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    successUrl: string,
    cancelUrl: string,
  ) {
    return this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async constructEventFromPayload(
    payload: Buffer,
    signature: string,
  ) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}
