/*
  Warnings:

  - You are about to drop the column `content` on the `notification` table. All the data in the column will be lost.
  - Added the required column `message` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `content`,
    ADD COLUMN `message` LONGTEXT NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
