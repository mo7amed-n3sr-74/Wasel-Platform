// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting database seeding...');

//   try {
//     // Create test users
//     const user1 = await prisma.user.upsert({
//       where: { email: 'seller@example.com' },
//       update: {},
//       create: {
//         email: 'seller@example.com',
//         password: 'hashedPassword123', // In real app, use bcrypt
//       },
//     });

//     const user2 = await prisma.user.upsert({
//       where: { email: 'carrier@example.com' },
//       update: {},
//       create: {
//         email: 'carrier@example.com',
//         password: 'hashedPassword456',
//       },
//     });

//     const user3 = await prisma.user.upsert({
//       where: { email: 'admin@example.com' },
//       update: {},
//       create: {
//         email: 'admin@example.com',
//         password: 'hashedPasswordAdmin',
//       },
//     });

//     console.log('✅ Users created:', [user1.id, user2.id, user3.id]);

//     // Create profiles
//     const profile1 = await prisma.profile.upsert({
//       where: { username: 'seller_user' },
//       update: {},
//       create: {
//         username: 'seller_user',
//         first_name: 'Ahmed',
//         last_name: 'Hassan',
//         role: 'MANUFACTURER',
//         userId: user1.id,
//         isActive: true,
//         verify: true,
//       },
//     });

//     const profile2 = await prisma.profile.upsert({
//       where: { username: 'carrier_user' },
//       update: {},
//       create: {
//         username: 'carrier_user',
//         first_name: 'Mohammed',
//         last_name: 'Ali',
//         role: 'CARRIER_COMPANY',
//         userId: user2.id,
//         isActive: true,
//         verify: true,
//       },
//     });

//     const profile3 = await prisma.profile.upsert({
//       where: { username: 'admin_user' },
//       update: {},
//       create: {
//         username: 'admin_user',
//         first_name: 'Admin',
//         last_name: 'User',
//         role: 'ADMIN',
//         userId: user3.id,
//         isActive: true,
//         verify: true,
//       },
//     });

//     console.log('✅ Profiles created:', [profile1.id, profile2.id, profile3.id]);

//     // Create wallets
//     const wallet1 = await prisma.wallet.upsert({
//       where: { userId: user1.id },
//       update: {},
//       create: {
//         userId: user1.id,
//         balance: '1000.50',
//         currency: 'USD',
//       },
//     });

//     const wallet2 = await prisma.wallet.upsert({
//       where: { userId: user2.id },
//       update: {},
//       create: {
//         userId: user2.id,
//         balance: '5000.00',
//         currency: 'USD',
//       },
//     });

//     const wallet3 = await prisma.wallet.upsert({
//       where: { userId: user3.id },
//       update: {},
//       create: {
//         userId: user3.id,
//         balance: '50000.00',
//         currency: 'USD',
//       },
//     });

//     console.log('✅ Wallets created:', [wallet1.id, wallet2.id, wallet3.id]);

//     // Create sample transactions
//     const transaction1 = await prisma.transaction.create({
//       data: {
//         type: 'RECHARGE',
//         amount: '1000.50',
//         status: 'COMPLETED',
//         walletId: wallet1.id,
//         paymentMethod: 'credit_card',
//         externalTransactionId: 'ext_txn_001',
//         description: 'Initial wallet recharge via credit card',
//       },
//     });

//     const transaction2 = await prisma.transaction.create({
//       data: {
//         type: 'RECHARGE',
//         amount: '5000.00',
//         status: 'COMPLETED',
//         walletId: wallet2.id,
//         paymentMethod: 'bank_transfer',
//         externalTransactionId: 'ext_txn_002',
//         description: 'Initial wallet recharge via bank transfer',
//       },
//     });

//     console.log('✅ Sample transactions created');

//     // Create sample shipment
//     const shipment = await prisma.shipment.create({
//       data: {
//         shipmentId: 'SHIP_001',
//         origin: 'Cairo',
//         destination: 'Alexandria',
//         origin_lat: 30.0444,
//         origin_lng: 31.2357,
//         destination_lat: 31.2001,
//         destination_lng: 29.9187,
//         shipmentType: 'GENERAL',
//         packaging: 'BOX',
//         goodsType: 'ELECTRONICS',
//         description: 'Sample electronics shipment',
//         weight: 50,
//         pickupAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//         deliveryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//         offerCount: 0,
//         profileId: profile1.id,
//       },
//     });

//     console.log('✅ Sample shipment created:', shipment.id);

//     // Create sample shipment payment
//     const shipmentPayment = await prisma.shipmentPayment.create({
//       data: {
//         shipmentId: shipment.id,
//         walletId: wallet1.id,
//         amount: '500.00',
//         status: 'COMPLETED',
//         paidAt: new Date(),
//       },
//     });

//     console.log('✅ Shipment payment created');

//     // Create sample withdrawal
//     const withdrawal = await prisma.withdrawal.create({
//       data: {
//         walletId: wallet2.id,
//         amount: '1000.00',
//         status: 'PENDING',
//         bankAccount: {
//           accountNumber: '1234567890',
//           bankCode: 'CBEG',
//           accountHolder: 'Mohammed Ali',
//           bankName: 'Commercial Bank of Egypt',
//         },
//       },
//     });

//     console.log('✅ Sample withdrawal created');

//     // Create transaction for withdrawal
//     const withdrawalTransaction = await prisma.transaction.create({
//       data: {
//         type: 'WITHDRAW',
//         amount: '-1000.00',
//         status: 'PENDING',
//         walletId: wallet2.id,
//         referenceType: 'withdrawal',
//         referenceId: withdrawal.id,
//         description: 'Withdrawal to bank account ending in 7890',
//       },
//     });

//     console.log('✅ Withdrawal transaction created');

//     console.log('🎉 Database seeding completed successfully!');
//     console.log('\n📊 Seed Summary:');
//     console.log(`   Users: 3`);
//     console.log(`   Profiles: 3`);
//     console.log(`   Wallets: 3`);
//     console.log(`   Transactions: 2 (recharges), 1 (withdrawal)`);
//     console.log(`   Shipments: 1`);
//     console.log(`   Shipment Payments: 1`);
//     console.log(`   Withdrawals: 1`);

//     console.log('\n💡 Test Wallet IDs:');
//     console.log(`   Seller Wallet: ${wallet1.id} (Balance: 1000.50)`);
//     console.log(`   Carrier Wallet: ${wallet2.id} (Balance: 5000.00)`);
//     console.log(`   Admin Wallet: ${wallet3.id} (Balance: 50000.00)`);
//   } catch (error) {
//     console.error('❌ Seeding failed:', error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
