/*
  Warnings:

  - You are about to alter the column `pickupAt` on the `shipment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `deliveryAt` on the `shipment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `offer` MODIFY `proposal` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `profile` ADD COLUMN `balance` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `totalSpent` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `shipment` MODIFY `pickupAt` DATETIME(3) NOT NULL,
    MODIFY `deliveryAt` DATETIME(3) NOT NULL;
