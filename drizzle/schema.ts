import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, double, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Ice Cream Requests Table
 * Stores customer requests for ice cream trucks
 */
export const iceCreamRequests = mysqlTable("ice_cream_requests", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  driverId: int("driverId"),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  address: text("address"),
  status: mysqlEnum("status", ["waiting", "accepted", "in_transit", "completed", "cancelled"])
    .default("waiting")
    .notNull(),
  price: decimal("price", { precision: 5, scale: 2 }).default("5.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Driver Profiles Table
 * Stores ice cream vendor information
 */
export const driverProfiles = mysqlTable("driver_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  vehicleType: varchar("vehicleType", { length: 100 }).default("Ice Cream Truck"),
  licensePlate: varchar("licensePlate", { length: 20 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  totalDeliveries: int("totalDeliveries").default(0),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00"),
  isOnline: int("isOnline").default(0),
  currentLatitude: double("currentLatitude"),
  currentLongitude: double("currentLongitude"),
  lastLocationUpdate: timestamp("lastLocationUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Driver Location History Table
 * Tracks driver movements for analytics and real-time tracking
 */
export const driverLocationHistory = mysqlTable("driver_location_history", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  heading: int("heading"),
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
