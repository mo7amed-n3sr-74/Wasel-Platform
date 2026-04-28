# 🚀 Wallet & Transaction System - Implementation Guide

## Quick Start

### 1. Update Your App Module

Add the WalletModule to your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { WalletModule } from './modules/wallet/wallet.module';
// ... other imports

@Module({
  imports: [
    // ... existing modules
    WalletModule,
    // ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 2. Create Database Migration

Run the migration to create wallet tables:

```bash
npm run prisma:migrate:dev -- --name init_wallet_system
```

This will:

- Create all wallet tables
- Add indexes for performance
- Generate Prisma Client types

### 3. Seed Test Data (Optional)

Populate database with test data:

```bash
npm run prisma:seed
```

This creates:

- 3 test users with different roles
- 3 wallets with sample balances
- Sample transactions and withdrawals
- A test shipment and payment

### 4. Verify Setup

Check that wallets table was created:

```bash
npm run prisma:studio
# Or query directly:
# SELECT COUNT(*) FROM wallets;
```

## Integration Examples

### Example 1: Initialize Wallet on User Signup

**File: `src/modules/user/user.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { WalletService } from '@/modules/wallet';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async createUser(email: string, password: string) {
    // Create user
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Initialize wallet for new user
    await this.walletService.initializeWallet(user.id, 'USD');

    return user;
  }
}
```

### Example 2: Accept Offer and Process Payment

**File: `src/modules/offers/offers.service.ts`**

```typescript
import { WalletService } from '@/modules/wallet';

@Injectable()
export class OffersService {
  constructor(
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  async acceptOffer(offerId: string, walletId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { shipment: true },
    });

    if (!offer) {
      throw new HttpException('Offer not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Process payment from wallet
      const { shipmentPayment, transaction } =
        await this.walletService.payForShipment(
          walletId,
          offer.shipmentId,
          offer.price.toString(),
        );

      // Update offer status
      await this.prisma.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      });

      // Update shipment status
      await this.prisma.shipment.update({
        where: { id: offer.shipmentId },
        data: { status: 'IN_PROGRESS' },
      });

      return {
        message: 'Offer accepted and payment processed',
        shipmentPayment,
        transaction,
      };
    } catch (error) {
      if (error instanceof InsufficientFundsException) {
        throw new HttpException(
          'Insufficient wallet balance to accept this offer',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      throw error;
    }
  }
}
```

### Example 3: Apply Platform Fee

**File: `src/modules/invoice/invoice.service.ts`**

```typescript
import { WalletService } from '@/modules/wallet';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  async createInvoice(shipmentId: string, amount: Decimal) {
    const platformFeePercent = 0.05; // 5%
    const platformFee = amount.mul(platformFeePercent);

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        shipmentId,
        companyId: shipment.profileId,
        carrierId: acceptedOffer.profileId,
        amount: amount.toNumber(),
        platformFee: platformFee.toNumber(),
        carrierAmount: amount.sub(platformFee).toNumber(),
      },
    });

    // Apply fee to seller's wallet
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { profile: { include: { user: true } } },
    });

    const wallet = await this.walletService.getWalletByUserId(
      shipment.profile.userId,
    );

    await this.walletService.applyFee(
      wallet.id,
      platformFee.toString(),
      'Platform service fee',
      'invoice',
      invoice.id,
    );

    return invoice;
  }
}
```

### Example 4: Handle Withdrawal Request

**File: `src/modules/wallet/wallet.controller.ts`**

```typescript
@Post('withdraw')
async withdraw(@Body() dto: WithdrawWalletDTO) {
  const { withdrawal, transaction } = await this.walletService.withdraw(
    dto.walletId,
    dto.amount,
    dto.bankAccount,
  );

  // In production:
  // 1. Send email notification to user
  // 2. Notify admin of pending withdrawal
  // 3. Store in database for admin review

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Withdrawal initiated. Please allow 1-2 business days for processing.',
    data: {
      withdrawalId: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
    },
  };
}

// Admin endpoint to process withdrawal
@Post('admin/withdrawals/:withdrawalId/process')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
async processWithdrawal(@Param('withdrawalId') withdrawalId: string) {
  // Verify bank transfer was completed
  // Then mark as processed

  const withdrawal = await this.walletService.markWithdrawalAsProcessed(withdrawalId);

  // Send email notification to user that withdrawal is complete

  return {
    statusCode: HttpStatus.OK,
    message: 'Withdrawal processed successfully',
    data: { withdrawal },
  };
}
```

## Testing

### Unit Tests

Run wallet service unit tests:

```bash
npm test -- wallet.service
```

Tests cover:

- ✅ Wallet balance retrieval
- ✅ Recharge operations
- ✅ Withdrawal initiation
- ✅ Shipment payments
- ✅ Transaction history
- ✅ Error handling (insufficient funds, wallet not found, etc.)
- ✅ Fee application
- ✅ Refund processing

### Integration Tests

**File: `test/wallet.e2e-spec.ts`** (create this file)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('Wallet API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let walletId: string;

  describe('GET /wallet/:walletId/balance', () => {
    it('should return wallet balance', async () => {
      // Create test wallet
      const user = await prisma.user.create({
        data: { email: `test_${Date.now()}@example.com`, password: 'test' },
      });

      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 1000,
          currency: 'USD',
        },
      });

      walletId = wallet.id;

      const res = await request(app.getHttpServer()).get(
        `/wallet/${walletId}/balance`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBe('1000');
    });
  });

  describe('POST /wallet/recharge', () => {
    it('should recharge wallet successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/wallet/recharge')
        .send({
          walletId,
          amount: '500.00',
          paymentMethod: 'credit_card',
          externalTransactionId: `ext_${Date.now()}`,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.transaction.type).toBe('RECHARGE');
      expect(res.body.data.wallet.balance).toBe('1500');
    });

    it('should reject invalid amount', async () => {
      const res = await request(app.getHttpServer())
        .post('/wallet/recharge')
        .send({
          walletId,
          amount: '-100', // Negative amount
          paymentMethod: 'credit_card',
          externalTransactionId: 'ext_invalid',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_AMOUNT');
    });
  });

  describe('POST /wallet/pay-shipment', () => {
    it('should process shipment payment', async () => {
      // Create shipment
      const profile = await prisma.profile.create({
        data: {
          username: `user_${Date.now()}`,
          role: 'MANUFACTURER',
          userId: (
            await prisma.user.create({
              data: {
                email: `ship_${Date.now()}@example.com`,
                password: 'test',
              },
            })
          ).id,
        },
      });

      const shipment = await prisma.shipment.create({
        data: {
          shipmentId: `SHIP_${Date.now()}`,
          origin: 'Cairo',
          destination: 'Alexandria',
          origin_lat: 30.0,
          origin_lng: 31.0,
          destination_lat: 31.0,
          destination_lng: 29.0,
          shipmentType: 'GENERAL',
          packaging: 'BOX',
          goodsType: 'ELECTRONICS',
          description: 'Test shipment',
          offerCount: 0,
          profileId: profile.id,
          pickupAt: new Date(),
          deliveryAt: new Date(),
        },
      });

      const res = await request(app.getHttpServer())
        .post('/wallet/pay-shipment')
        .send({
          walletId,
          shipmentId: shipment.id,
          amount: '250.00',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.shipmentPayment.status).toBe('COMPLETED');
    });

    it('should reject insufficient balance', async () => {
      // Create new wallet with low balance
      const lowBalanceWallet = await prisma.wallet.create({
        data: {
          userId: (
            await prisma.user.create({
              data: {
                email: `low_${Date.now()}@example.com`,
                password: 'test',
              },
            })
          ).id,
          balance: 50, // Low balance
          currency: 'USD',
        },
      });

      const profile = await prisma.profile.create({
        data: {
          username: `user2_${Date.now()}`,
          role: 'MANUFACTURER',
          userId: (
            await prisma.user.create({
              data: {
                email: `ship2_${Date.now()}@example.com`,
                password: 'test',
              },
            })
          ).id,
        },
      });

      const shipment = await prisma.shipment.create({
        data: {
          shipmentId: `SHIP2_${Date.now()}`,
          origin: 'Cairo',
          destination: 'Alexandria',
          origin_lat: 30.0,
          origin_lng: 31.0,
          destination_lat: 31.0,
          destination_lng: 29.0,
          shipmentType: 'GENERAL',
          packaging: 'BOX',
          goodsType: 'ELECTRONICS',
          description: 'Test shipment 2',
          offerCount: 0,
          profileId: profile.id,
          pickupAt: new Date(),
          deliveryAt: new Date(),
        },
      });

      const res = await request(app.getHttpServer())
        .post('/wallet/pay-shipment')
        .send({
          walletId: lowBalanceWallet.id,
          shipmentId: shipment.id,
          amount: '250.00',
        });

      expect(res.status).toBe(402);
      expect(res.body.error).toBe('INSUFFICIENT_FUNDS');
    });
  });

  describe('GET /wallet/:walletId/transactions', () => {
    it('should return transaction history', async () => {
      const res = await request(app.getHttpServer()).get(
        `/wallet/${walletId}/transactions?limit=10&offset=0`,
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
      expect(typeof res.body.data.total).toBe('number');
    });
  });
});
```

Run integration tests:

```bash
npm run test:e2e
```

### Manual API Testing with cURL

```bash
# Get balance
curl http://localhost:3000/wallet/wallet_id/balance

# Recharge wallet
curl -X POST http://localhost:3000/wallet/recharge \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "wallet_id",
    "amount": "500.00",
    "paymentMethod": "credit_card",
    "externalTransactionId": "ext_123"
  }'

# Get transaction history
curl http://localhost:3000/wallet/wallet_id/transactions?limit=20&offset=0

# Withdraw funds
curl -X POST http://localhost:3000/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "wallet_id",
    "amount": "100.00",
    "bankAccount": {
      "accountNumber": "1234567890",
      "bankCode": "CBEG",
      "accountHolder": "John Doe"
    }
  }'

# Pay for shipment
curl -X POST http://localhost:3000/wallet/pay-shipment \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "wallet_id",
    "shipmentId": "shipment_id",
    "amount": "250.00"
  }'
```

## Monitoring & Maintenance

### Check Wallet Balances

```typescript
// Get all users with low wallet balance
const lowBalances = await prisma.wallet.findMany({
  where: {
    balance: {
      lt: new Decimal('100.00'), // Less than $100
    },
  },
  include: { user: { include: { profile: true } } },
});

// Send notification to users
```

### Monitor Pending Withdrawals

```typescript
// Get pending withdrawals waiting > 24 hours
const stalePendingWithdrawals = await prisma.withdrawal.findMany({
  where: {
    status: 'PENDING',
    createdAt: {
      lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  include: { wallet: { include: { user: true } } },
});

// Send reminder emails to admins
```

### Audit Transaction Trail

```typescript
// Get all transactions for a user within a date range
const auditTrail = await prisma.transaction.findMany({
  where: {
    wallet: {
      userId: 'user_id',
    },
    createdAt: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31'),
    },
  },
  orderBy: { createdAt: 'asc' },
});

// Export to CSV for audit
```

### Reconcile Balances

```typescript
// Verify wallet balance matches sum of transactions
const wallet = await prisma.wallet.findUnique({
  where: { id: 'wallet_id' },
});

const transactionSum = await prisma.transaction.aggregate({
  where: { walletId: 'wallet_id' },
  _sum: { amount: true },
});

const calculatedBalance = transactionSum._sum.amount;

if (!wallet.balance.equals(calculatedBalance)) {
  console.error('Balance mismatch detected!');
  // Alert admin or log to monitoring system
}
```

## Environment Variables

Add to `.env`:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/wasel_platform"

# Wallet Configuration (optional)
WALLET_RECHARGE_MIN=10
WALLET_RECHARGE_MAX=10000
WALLET_WITHDRAWAL_MIN=100
WALLET_WITHDRAWAL_MAX=5000
PLATFORM_FEE_PERCENT=5
```

## Troubleshooting

### Issue: Migration Failed

```bash
# Reset database and re-run migrations
npm run prisma:migrate:reset
```

### Issue: Seed Data Not Created

```bash
# Ensure ts-node is installed
npm install --save-dev ts-node

# Run seed manually
npm run prisma:seed
```

### Issue: Decimal Precision Loss

**Solution**: Always use string for amount inputs, Prisma converts to Decimal internally

```typescript
// ❌ Wrong
const amount = 100.50;
await walletService.recharge(walletId, amount, ...);

// ✅ Correct
const amount = "100.50";
await walletService.recharge(walletId, amount, ...);
```

### Issue: Race Condition on Balance Update

**Solution**: Service uses `FOR UPDATE` locking automatically. If issues persist:

```typescript
// Check database logs for lock waits
SHOW PROCESSLIST; -- MySQL
SELECT * FROM pg_stat_activity; -- PostgreSQL
```

## Performance Optimization

### Add Caching for Balance Reads

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getBalance(walletId: string): Promise<Decimal> {
    const cacheKey = `wallet_balance:${walletId}`;
    const cached = await this.cache.get<Decimal>(cacheKey);

    if (cached) return cached;

    const balance = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });

    await this.cache.set(cacheKey, balance, 60000); // 1 minute TTL
    return balance;
  }

  // Invalidate cache after balance update
  async recharge(...): Promise<{ wallet; transaction }> {
    // ... recharge logic
    await this.cache.del(`wallet_balance:${walletId}`);
    return { wallet, transaction };
  }
}
```

### Archive Old Transactions

```typescript
// Create monthly archive jobs
const archiveOldTransactions = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Move to archive table
  await prisma.transactionArchive.createMany({
    data: await prisma.transaction.findMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    }),
  });

  // Delete from main table
  await prisma.transaction.deleteMany({
    where: { createdAt: { lt: thirtyDaysAgo } },
  });
};
```

---

**Need Help?** Refer to [WALLET_DOCUMENTATION.md](./WALLET_DOCUMENTATION.md) for comprehensive API reference and examples.
