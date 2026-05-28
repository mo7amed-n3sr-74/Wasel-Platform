/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `driverId` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `driver` ADD COLUMN `driverId` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Driver_driverId_key` ON `Driver`(`driverId`);
