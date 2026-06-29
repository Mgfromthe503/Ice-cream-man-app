ALTER TABLE `ice_cream_requests` ADD `shareMode` enum('exact','street','meetup') DEFAULT 'street' NOT NULL;--> statement-breakpoint
ALTER TABLE `ice_cream_requests` ADD `deliveryInstructions` text;