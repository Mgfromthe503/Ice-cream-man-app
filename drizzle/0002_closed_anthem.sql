CREATE TABLE `daily_sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalSales` decimal(10,2) DEFAULT '0',
	`totalOrders` int DEFAULT 0,
	`totalMiles` decimal(8,2) DEFAULT '0',
	`gasSavedDollars` decimal(8,2) DEFAULT '0',
	`timeSavedHours` decimal(8,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`transactionId` varchar(191),
	`status` varchar(50) DEFAULT 'pending',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
