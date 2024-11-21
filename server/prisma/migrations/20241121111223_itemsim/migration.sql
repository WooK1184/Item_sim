/*
  Warnings:

  - You are about to drop the column `characterId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inventoryId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventoryId` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_characterId_fkey`;

-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_itemId_fkey`;

-- AlterTable
ALTER TABLE `Character` ADD COLUMN `inventoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Inventory` DROP COLUMN `characterId`,
    DROP COLUMN `itemId`,
    DROP COLUMN `quantity`;

-- CreateTable
CREATE TABLE `InventoryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Character_inventoryId_key` ON `Character`(`inventoryId`);

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
