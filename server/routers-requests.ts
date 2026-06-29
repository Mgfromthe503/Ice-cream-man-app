import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";

/**
 * Ice Cream Request API Routes
 * Handles customer requests and driver operations
 */
export const requestsRouter = router({
  /**
   * Create a new ice cream request
   * Called by: Customer
   */
  create: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().optional(),
        shareMode: z.enum(["exact", "street", "meetup"]).default("street"),
        deliveryInstructions: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const requestId = await db.createRequest({
        customerId: ctx.user.id,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        shareMode: input.shareMode,
        deliveryInstructions: input.deliveryInstructions,
        status: "waiting",
        price: "5.00",
      });

      return { id: requestId, status: "waiting" };
    }),

  /**
   * Get all waiting requests
   * Called by: Driver
   */
  getWaiting: protectedProcedure.query(async () => {
    return db.getWaitingRequests();
  }),

  /**
   * Get customer's request history
   * Called by: Customer
   */
  getCustomerHistory: protectedProcedure.query(async ({ ctx }) => {
    return db.getCustomerRequests(ctx.user.id);
  }),

  /**
   * Get driver's active requests
   * Called by: Driver
   */
  getDriverActive: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Get driver ID from user profile
    const driverId = ctx.user.id;
    return db.getDriverRequests(driverId);
  }),

  /**
   * Accept a request
   * Called by: Driver
   */
  accept: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Get driver ID from user profile
      const driverId = ctx.user.id;
      await db.acceptRequest(input.requestId, driverId);
      return { success: true };
    }),

  /**
   * Update request status
   * Called by: Driver
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        status: z.enum(["waiting", "accepted", "in_transit", "completed", "cancelled"]),
      }),
    )
    .mutation(async ({ input }) => {
      await db.updateRequestStatus(input.requestId, input.status);
      return { success: true };
    }),

  /**
   * Cancel a request
   * Called by: Customer or Driver
   */
  cancel: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateRequestStatus(input.requestId, "cancelled");
      return { success: true };
    }),
});

/**
 * Driver Profile API Routes
 */
export const driverRouter = router({
  /**
   * Get driver profile
   * Called by: Driver
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return db.getDriverProfile(ctx.user.id);
  }),

  /**
   * Create driver profile
   * Called by: New Driver
   */
  createProfile: protectedProcedure
    .input(
      z.object({
        vehicleType: z.string().optional(),
        licensePlate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profileId = await db.createDriverProfile({
        userId: ctx.user.id,
        vehicleType: input.vehicleType || "Ice Cream Truck",
        licensePlate: input.licensePlate,
        rating: "5.00",
        totalDeliveries: 0,
        totalEarnings: "0.00",
        isOnline: 0,
      });

      return { id: profileId };
    }),

  /**
   * Update driver location (real-time tracking)
   * Called by: Driver (frequently)
   */
  updateLocation: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        heading: z.number().optional(),
        speed: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Get driver ID from user profile
      const driverId = ctx.user.id;
      await db.updateDriverLocation(
        driverId,
        input.latitude,
        input.longitude,
        input.heading,
        input.speed,
      );
      return { success: true };
    }),

  /**
   * Get driver location history
   * Called by: Driver or Admin
   */
  getLocationHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      // TODO: Get driver ID from user profile
      const driverId = ctx.user.id;
      return db.getDriverLocationHistory(driverId, input.limit || 100);
    }),

  /**
   * Set driver online status
   * Called by: Driver
   */
  setOnlineStatus: protectedProcedure
    .input(z.object({ isOnline: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Get driver ID from user profile
      const driverId = ctx.user.id;
      await db.setDriverOnlineStatus(driverId, input.isOnline);
      return { success: true };
    }),

  /**
   * Complete delivery and update earnings
   * Called by: Driver
   */
  completeDelivery: protectedProcedure
    .input(z.object({ requestId: z.number(), amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Get driver ID from user profile
      const driverId = ctx.user.id;

      // Update request status
      await db.updateRequestStatus(input.requestId, "completed");

      // Update driver earnings
      await db.updateDriverEarnings(driverId, input.amount);

      return { success: true };
    }),
});
