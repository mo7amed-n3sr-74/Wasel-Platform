import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    console.log(dto);
    const paymentIntent = await this.stripeService.createPaymentIntent(
      dto.amount,
      dto.currency,
    );

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = await this.stripeService.constructEventFromPayload(
      req.rawBody!,
      signature,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        break;
      case 'payment_intent.payment_failed':
        break;
    }

    return { received: true };
  }
}
