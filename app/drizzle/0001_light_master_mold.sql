CREATE TABLE `driver_location_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`heading` int,
	`speed` decimal(5,2),
	`accuracy` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driver_location_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driver_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vehicleType` varchar(100) DEFAULT 'Ice Cream Truck',
	`licensePlate` varchar(20),
	`rating` decimal(3,2) DEFAULT '5.00',
	`totalDeliveries` int DEFAULT 0,
	`totalEarnings` decimal(10,2) DEFAULT '0.00',
	`isOnline` int DEFAULT 0,
	`currentLatitude` double,
	`currentLongitude` double,
	`lastLocationUpdate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driver_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `driver_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `ice_cream_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`driverId` int,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`address` text,
	`status` enum('waiting','accepted','in_transit','completed','cancelled') NOT NULL DEFAULT 'waiting',
	`price` decimal(5,2) NOT NULL DEFAULT '5.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`completedAt` timestamp,
	`cancelledAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ice_cream_requests_id` PRIMARY KEY(`id`)
);
