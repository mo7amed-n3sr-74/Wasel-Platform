# 💳 Wallet & Transaction System Documentation

## Overview

This module implements a **secure, immutable wallet and transaction system** for the Wasel logistics platform. It handles wallet management, fund transfers, shipment payments, and withdrawals with built-in protection against race conditions and data inconsistency.

## Architecture & Key Features

### 1. **Immutable Transactions (Append-Only)**

- Transactions are **never deleted or modified** - only created
- Every balance change creates a permanent transaction record
- Complete audit trail for compliance and disputes

### 2. **Atomic Operations with Database Transactions**

- All balance updates wrapped in `BEGIN/COMMIT` transactions
- Ensures consistency between wallet balance and transaction records
- Prevents partial failures mid-operation

### 3. **Pessimistic Locking**

- Uses `SELECT ... FOR UPDATE` to lock wallet rows during updates
- Prevents race conditions in high-concurrency scenarios
- Serializes concurrent balance changes

### 4. **Smart Amount Handling**

- **Credits (Deposits)**: Positive amounts (recharges, refunds)
- **Debits (Withdrawals)**: Negative amounts stored (withdrawals, payments, fees)
- Clear intent and automatic balance calculations

### 5. **Comprehensive Error Handling**

- Custom exceptions for specific scenarios
- Detailed error codes for client handling
- Proper HTTP status codes

## Database Schema

### Wallet Table

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  balance DECIMAL(19,4) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Transaction Table (Immutable)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID NOT NULL,
  type ENUM ('RECHARGE', 'WITHDRAW', 'SHIPMENT_PAYMENT', 'REFUND', 'FEE'),
  amount DECIMAL(19,4) NOT NULL,
  status ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
  reference_type VARCHAR(50), -- e.g., 'shipment', 'invoice'
  reference_id VARCHAR(255),
  description TEXT,
  payment_method VARCHAR(50),
  external_transaction_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  INDEX (wallet_id),
  INDEX (created_at),
  INDEX (reference_type, reference_id)
);
```

### Withdrawal Table

```sql
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY,
  wallet_id UUID NOT NULL,
  amount DECIMAL(19,4) NOT NULL,
  status ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'),
  bank_account JSON NOT NULL, -- { accountNumber, bankCode, accountHolder, bankName }
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  INDEX (wallet_id)
);
```

### ShipmentPayment Table

```sql
CREATE TABLE shipment_payments (
  id UUID PRIMARY KEY,
  shipment_id VARCHAR(255) NOT NULL,
  wallet_id UUID NOT NULL,
  amount DECIMAL(19,4) NOT NULL,
  status ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED'),
  transaction_id VARCHAR(255) UNIQUE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (shipment_id) REFERENCES shipments(id),
  INDEX (wallet_id),
  INDEX (shipment_id)
);
```

## Core Methods

### 1. `initializeWallet(userId: string, currency?: string)`

Creates a new wallet for a user.

```typescript
const wallet = await walletService.initializeWallet(userId, 'USD');
// Returns: { id, userId, balance: 0, currency: 'USD', updatedAt }
```

### 2. `getBalance(walletId: string)`

Retrieves current wallet balance.

```typescript
const balance = await walletService.getBalance(walletId);
// Returns: Decimal balance
```

### 3. `recharge(walletId, amount, paymentMethod, externalId, description?)`

Credits the wallet (deposits funds).

```typescript
const { wallet, transaction } = await walletService.recharge(
  'wallet_123',
  '500.00',
  'credit_card',
  'ext_txn_001',
  'Payment via Visa',
);
```

**Transaction Details:**

- Type: `RECHARGE`
- Status: `COMPLETED`
- Amount: Positive (credit)
- Creates permanent transaction record

### 4. `withdraw(walletId, amount, bankAccount)`

Debits the wallet for bank transfers.

```typescript
const { withdrawal, transaction } = await walletService.withdraw(
  'wallet_123',
  '1000.00',
  {
    accountNumber: '1234567890',
    bankCode: 'CBEG',
    accountHolder: 'John Doe',
    bankName: 'Commercial Bank',
  },
);
```

**Validations:**

- Sufficient balance required
- Withdrawal status starts as `PENDING`
- Transaction stores negative amount (debit)
- Marked as `COMPLETED` when processed by admin

### 5. `payForShipment(walletId, shipmentId, amount)`

Processes shipment payment from wallet.

```typescript
const { shipmentPayment, transaction } = await walletService.payForShipment(
  'wallet_123',
  'shipment_456',
  '250.00',
);
```

**Validations:**

- Shipment must exist
- Sufficient balance required
- Prevents duplicate payments for same shipment
- Transaction linked via `referenceId`

### 6. `getTransactionHistory(walletId, limit?, offset?)`

Retrieves paginated transaction records.

```typescript
const { transactions, total } = await walletService.getTransactionHistory(
  'wallet_123',
  20, // limit
  0, // offset
);
// Returns: { transactions: [...], total: 152 }
```

**Features:**

- Immutable view of all operations
- Ordered by `createdAt DESC` (newest first)
- Supports pagination
- Includes all transaction types

### 7. `applyFee(walletId, amount, description, referenceType?, referenceId?)`

Applies a platform or service fee.

```typescript
const transaction = await walletService.applyFee(
  'wallet_123',
  '10.00',
  'Platform service fee',
  'shipment',
  'shipment_456',
);
```

### 8. `processRefund(walletId, amount, reason, referenceType?, referenceId?)`

Issues a refund to the wallet.

```typescript
const transaction = await walletService.processRefund(
  'wallet_123',
  '250.00',
  'Shipment cancelled',
  'shipment',
  'shipment_456',
);
```

### 9. `markWithdrawalAsProcessed(withdrawalId)`

Called by admin after confirming bank transfer.

```typescript
const withdrawal = await walletService.markWithdrawalAsProcessed(withdrawalId);
// Updates: status = COMPLETED, processedAt = now()
```

## API Endpoints

### Get Wallet

```
GET /wallet/{walletId}
Response: { statusCode, message, data: { wallet } }
```

### Get Balance

```
GET /wallet/{walletId}/balance
Response: { statusCode, message, data: { balance: Decimal } }
```

### Get Transaction History

```
GET /wallet/{walletId}/transactions?limit=20&offset=0
Response: { statusCode, message, data: { transactions, total, limit, offset } }
```

### Recharge Wallet

```
POST /wallet/recharge
Body: {
  "walletId": "wallet_123",
  "amount": "500.00",
  "paymentMethod": "credit_card",
  "externalTransactionId": "ext_txn_001",
  "description": "Optional description"
}
```

### Withdraw Funds

```
POST /wallet/withdraw
Body: {
  "walletId": "wallet_123",
  "amount": "1000.00",
  "bankAccount": {
    "accountNumber": "1234567890",
    "bankCode": "CBEG",
    "accountHolder": "John Doe",
    "bankName": "Commercial Bank"
  }
}
```

### Pay for Shipment

```
POST /wallet/pay-shipment
Body: {
  "walletId": "wallet_123",
  "shipmentId": "shipment_456",
  "amount": "250.00"
}
```

### Mark Withdrawal Processed

```
POST /wallet/withdrawals/{withdrawalId}/mark-processed
```

## Error Handling

### Exception Types

| Error                           | Code                     | HTTP Status | When                 |
| ------------------------------- | ------------------------ | ----------- | -------------------- |
| `InsufficientFundsException`    | `INSUFFICIENT_FUNDS`     | 402         | Balance < amount     |
| `WalletNotFoundException`       | `WALLET_NOT_FOUND`       | 404         | Wallet doesn't exist |
| `TransactionFailedException`    | `TRANSACTION_FAILED`     | 500         | Operation failed     |
| `InvalidAmountException`        | `INVALID_AMOUNT`         | 400         | Amount <= 0          |
| `ShipmentNotFoundException`     | `SHIPMENT_NOT_FOUND`     | 404         | Shipment not found   |
| `WithdrawalNotAllowedException` | `WITHDRAWAL_NOT_ALLOWED` | 400         | Withdrawal blocked   |

### Example Error Response

```json
{
  "statusCode": 402,
  "error": "INSUFFICIENT_FUNDS",
  "message": "Insufficient funds. Available: 100, Required: 250"
}
```

## Implementation Examples

### Example 1: User Recharges Wallet

```typescript
try {
  const { wallet, transaction } = await walletService.recharge(
    walletId,
    '500.00',
    'credit_card',
    paymentGatewayId,
    'Visa ending in 4242',
  );

  console.log(`Wallet balance: ${wallet.balance}`);
  console.log(`Transaction ID: ${transaction.id}`);
} catch (error) {
  if (error instanceof TransactionFailedException) {
    // Handle payment failure
  }
}
```

### Example 2: Process Shipment Payment

```typescript
try {
  const { shipmentPayment, transaction } = await walletService.payForShipment(
    walletId,
    shipmentId,
    '250.00',
  );

  // Shipment payment processed
  // Update shipment status if needed
} catch (error) {
  if (error instanceof InsufficientFundsException) {
    // Prompt user to recharge
  } else if (error instanceof ShipmentNotFoundException) {
    // Invalid shipment
  }
}
```

### Example 3: Request Withdrawal

```typescript
try {
  const { withdrawal, transaction } = await walletService.withdraw(
    walletId,
    '1000.00',
    bankAccountDetails,
  );

  // Withdrawal initiated, waiting for admin approval
  // Admin will call markWithdrawalAsProcessed after transfer
} catch (error) {
  if (error instanceof InsufficientFundsException) {
    // Not enough funds
  }
}
```

### Example 4: View Transaction History

```typescript
const { transactions, total } = await walletService.getTransactionHistory(
  walletId,
  10, // Show 10 items
  0, // First page
);

transactions.forEach((txn) => {
  console.log(`${txn.type}: ${txn.amount} (${txn.status})`);
});

console.log(`Total transactions: ${total}`);
```

## Race Condition Handling

### Pessimistic Locking Strategy

```sql
-- Lock acquired in Prisma transaction
SELECT id, balance FROM wallets WHERE id = ? FOR UPDATE;

-- Both operations are serialized:
-- Thread 1: Read balance → Update balance → Commit
-- Thread 2: Waits for Thread 1 → Read balance → Update balance → Commit
```

### Key Guarantees

✅ Only one update can proceed at a time per wallet
✅ Balance always accurate (no lost updates)
✅ Transactions are durable and immutable
✅ No orphaned balances or inconsistent states

## Testing the System

### Run Database Migration

```bash
npm run prisma:migrate:dev
# Creates all wallet tables
```

### Seed Test Data

```bash
npm run prisma:seed
# Populates with:
# - 3 test users (seller, carrier, admin)
# - 3 wallets with sample balances
# - Sample transactions and withdrawals
```

### Test Endpoints

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

# Process shipment payment
curl -X POST http://localhost:3000/wallet/pay-shipment \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "wallet_id",
    "shipmentId": "shipment_id",
    "amount": "250.00"
  }'
```

## Integration with Other Modules

### In User Module (Initialize Wallet on Signup)

```typescript
// user.service.ts
async createUser(email: string, password: string) {
  const user = await this.prisma.user.create({ ... });

  // Initialize wallet
  await this.walletService.initializeWallet(user.id, 'USD');

  return user;
}
```

### In Shipment Module (Process Payment)

```typescript
// shipment.service.ts
async acceptOffer(offerId: string, walletId: string) {
  const offer = await this.getOffer(offerId);

  // Process payment
  await this.walletService.payForShipment(
    walletId,
    offer.shipmentId,
    offer.price
  );

  // Update offer status
  await this.updateOfferStatus(offerId, 'ACCEPTED');
}
```

### In Invoice Module (Apply Fees)

```typescript
// invoice.service.ts
async createInvoice(shipmentId: string) {
  const invoice = await this.prisma.invoice.create({ ... });

  // Apply platform fee
  await this.walletService.applyFee(
    walletId,
    platformFee,
    'Platform fee',
    'invoice',
    invoice.id
  );

  return invoice;
}
```

## Performance Considerations

### Indexes

- `transactions(wallet_id)` - For transaction history queries
- `transactions(created_at)` - For time-based queries
- `transactions(reference_type, reference_id)` - For reference lookups
- `wallets(user_id)` - For user wallet lookups
- `withdrawals(wallet_id)` - For withdrawal queries

### Optimization Tips

- Paginate transaction history (don't fetch all at once)
- Cache balance in Redis for reads (invalidate on updates)
- Archive old transactions to separate table
- Consider sharding wallets table by user_id for scale

## Security Best Practices

✅ **Implemented:**

- Immutable transaction log (audit trail)
- Atomic operations (no partial updates)
- Pessimistic locking (prevents race conditions)
- Input validation (amount, wallet, shipment)
- Error handling with proper status codes
- Transaction idempotency (external_transaction_id unique)

🔒 **Recommended:**

- Enable SSL/TLS for API calls
- Rate limit wallet endpoints
- Require authentication/authorization
- Encrypt sensitive bank account data
- Regular database backups
- Monitor for suspicious patterns
- Two-factor authentication for withdrawals

## Troubleshooting

### Balance Shows Incorrect After Recharge

**Issue**: Transaction created but balance not updated
**Solution**: Check if database transaction committed. Review logs for "TRANSACTION_FAILED".

### Withdrawal Stuck in PENDING

**Issue**: Admin didn't call `markWithdrawalAsProcessed`
**Solution**: Admin dashboard should list pending withdrawals. Confirm bank transfer, then mark processed.

### Concurrent Update Errors

**Issue**: `Prisma Error: Unique constraint failed`
**Solution**: Ensure using `FOR UPDATE` locking and `$transaction()`. Check if external_transaction_id already exists.

### High Query Times

**Issue**: Transaction history queries slow
**Solution**: Ensure indexes created. Implement pagination. Consider Redis caching for balance.

## Roadmap

Future enhancements:

- [ ] Subscription support (recurring payments)
- [ ] Multi-currency support
- [ ] Escrow transactions
- [ ] Automatic fee calculations
- [ ] Transaction reconciliation jobs
- [ ] Real-time balance updates (WebSocket)
- [ ] Analytics dashboard
