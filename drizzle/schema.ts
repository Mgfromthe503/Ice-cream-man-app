import { serial, pgTable, pgEnum, text, timestamp, varchar, doublePrecision, decimal, integer, index, uniqueIndex, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const shareModeEnum = pgEnum("share_mode", ["exact", "street", "meetup"]);
export const requestStatusEnum = pgEnum("request_status", ["waiting", "accepted", "in_transit", "arrived", "completed", "cancelled"]);
export const appRoleEnum = pgEnum("app_role", ["customer", "driver"]);
export const driverApprovalEnum = pgEnum("driver_approval", ["not_requested", "pending", "approved", "suspended"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  appRole: appRoleEnum("appRole").default("customer").notNull(),
  driverApproval: driverApprovalEnum("driverApproval").default("not_requested").notNull(),
  failedLoginAttempts: integer("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Ice Cream Requests Table
 * Stores customer requests for ice cream trucks
 */
export const iceCreamRequests = pgTable("ice_cream_requests", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  driverId: integer("driverId"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address"),
  shareMode: shareModeEnum("shareMode").default("street").notNull(),
  deliveryInstructions: text("deliveryInstructions"),
  status: requestStatusEnum("status").default("waiting").notNull(),
  price: decimal("price", { precision: 5, scale: 2 }).default("5.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Driver Profiles Table
 * Stores ice cream vendor information
 */
export const driverProfiles = pgTable("driver_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  vehicleType: varchar("vehicleType", { length: 100 }).default("Ice Cream Truck"),
  licensePlate: varchar("licensePlate", { length: 20 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  totalDeliveries: integer("totalDeliveries").default(0),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00"),
  isOnline: integer("isOnline").default(0),
  currentLatitude: doublePrecision("currentLatitude"),
  currentLongitude: doublePrecision("currentLongitude"),
  lastLocationUpdate: timestamp("lastLocationUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Driver Location History Table
 * Tracks driver movements for analytics and real-time tracking
 */
export const driverLocationHistory = pgTable("driver_location_history", {
  id: serial("id").primaryKey(),
  driverId: integer("driverId").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  heading: integer("heading"),
  speed: decimal("speed", { precision: 5, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type IceCreamRequest = typeof iceCreamRequests.$inferSelect;
export type InsertIceCreamRequest = typeof iceCreamRequests.$inferInsert;

export type DriverProfile = typeof driverProfiles.$inferSelect;
export type InsertDriverProfile = typeof driverProfiles.$inferInsert;

export type DriverLocationHistory = typeof driverLocationHistory.$inferSelect;
export type InsertDriverLocationHistory = typeof driverLocationHistory.$inferInsert;

/**
 * Payments Table
 * Tracks vendor registration fees and commission payments
 */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  driverId: integer("driverId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'registration_fee', 'sales_commission'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: varchar("transactionId", { length: 191 }),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'completed', 'failed'
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Daily Sales Table
 * Tracks daily sales and driver performance metrics
 */
/**
 * Verified one-time Google Play vendor registrations. Purchase tokens are never
 * stored; a SHA-256 hash enforces replay protection without retaining the token.
 */
export const vendorEntitlements = pgTable("vendor_entitlements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  productId: varchar("productId", { length: 191 }).notNull(),
  purchaseTokenHash: varchar("purchaseTokenHash", { length: 64 }).notNull().unique(),
  orderId: varchar("orderId", { length: 191 }),
  purchaseTimeMillis: varchar("purchaseTimeMillis", { length: 32 }),
  verifiedAt: timestamp("verifiedAt").defaultNow().notNull(),
});

export const dailySales = pgTable("daily_sales", {
  id: serial("id").primaryKey(),
  driverId: integer("driverId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  totalSales: decimal("totalSales", { precision: 10, scale: 2 }).default("0"),
  totalOrders: integer("totalOrders").default(0),
  totalMiles: decimal("totalMiles", { precision: 8, scale: 2 }).default("0"),
  gasSavedDollars: decimal("gasSavedDollars", { precision: 8, scale: 2 }).default("0"),
  timeSavedHours: decimal("timeSavedHours", { precision: 8, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Driver Availability Table
 * Dedicated availability toggle separate from driver profile
 */
export const driverAvailability = pgTable("driver_availability", {
  id: serial("id").primaryKey(),
  driverId: integer("driverId").notNull().unique(),
  available: boolean("available").default(false).notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [index("driver_availability_updated_idx").on(table.updatedAt)]);

/**
 * Request Events Table
 * Full audit trail for every state transition on a request
 */
export const requestEvents = pgTable("request_events", {
  id: serial("id").primaryKey(),
  requestId: integer("requestId").notNull(),
  actorId: integer("actorId"),
  fromStatus: requestStatusEnum("fromStatus"),
  toStatus: requestStatusEnum("toStatus").notNull(),
  note: varchar("note", { length: 280 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("request_events_request_idx").on(table.requestId, table.createdAt)]);

// Export types
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type VendorEntitlement = typeof vendorEntitlements.$inferSelect;
export type InsertVendorEntitlement = typeof vendorEntitlements.$inferInsert;
export type DailySales = typeof dailySales.$inferSelect;
export type InsertDailySales = typeof dailySales.$inferInsert;
export type DriverAvailability = typeof driverAvailability.$inferSelect;
export type InsertDriverAvailability = typeof driverAvailability.$inferInsert;
export type RequestEvent = typeof requestEvents.$inferSelect;
export type InsertRequestEvent = typeof requestEvents.$inferInsert;
