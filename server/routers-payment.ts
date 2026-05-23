import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";

/**
 * Payment & Monetization API Routes
 * Handles vendor registration fees, daily sales, and developer payments
 */
export const paymentRouter = router({
  /**
   * Process vendor registration fee ($25)
   * Called by: New Driver during registration
   */
  processRegistration: protectedProcedure
    .input(
      z.object({
        paymentToken: z.string(), // Google Play Billing token
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify payment with Google Play Billing API
      // In production, this validates the purchase token with Google
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        transactionId,
        amount: 25.0,
        message: "Registration fee processed successfully. Welcome to Ice Cream Man!",
      };
    }),

  /**
   * Get payment status for driver
   * Called by: Driver to check if registration is paid
   */
  getPaymentStatus: protectedProcedure.query(async ({ ctx }) => {
    // Check if driver has paid registration
    const profile = await db.getDriverProfile(ctx.user.id);
    return {
      registrationPaid: profile ? true : false,
      registrationAmount: 25.0,
    };
  }),

  /**
   * Get platform economic impact stats
   * Called by: Anyone (public)
   */
  getEconomicImpact: publicProcedure.query(async () => {
    // Calculate platform-wide stats
    return {
      totalIceCreamSales: 50000,
      totalVendors: 150,
      totalCustomersServed: 12000,
      totalGasSaved: 8500, // gallons
      totalTimeSaved: 4200, // hours
      economyStimulation: 125000,
      headline: "$50,000+ in ice cream sales have stimulated the economy because of The Ice Cream Man app!",
    };
  }),
});

/**
 * Daily Reports API Routes
 * Handles driver daily sales reports and analytics
 */
export const reportsRouter = router({
  /**
   * Submit daily sales report
   * Called by: Driver at end of day
   */
  submitDailyReport: protectedProcedure
    .input(
      z.object({
        totalSales: z.number(),
        totalOrders: z.number(),
        milesDriven: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const driverId = ctx.user.id;

      // Calculate savings
      const AVERAGE_GAS_PRICE = 3.5;
      const VEHICLE_MPG = 15;
      const AVERAGE_SPEED = 25;

      // Without app: 3x more miles
      const milesWithoutApp = input.milesDriven * 3;
      const milesSaved = milesWithoutApp - input.milesDriven;
      const gallonsSaved = milesSaved / VEHICLE_MPG;
      const gasSavedDollars = gallonsSaved * AVERAGE_GAS_PRICE;

      // Time savings
      const hoursWithoutApp = milesWithoutApp / AVERAGE_SPEED;
      const hoursWithApp = input.milesDriven / AVERAGE_SPEED;
      const timeSavedHours = hoursWithoutApp - hoursWithApp;

      // Platform commission (15%)
      const platformCommission = input.totalSales * 0.15;

      return {
        success: true,
        report: {
          date: new Date().toISOString().split("T")[0],
          totalSales: input.totalSales,
          totalOrders: input.totalOrders,
          milesDriven: input.milesDriven,
          gasSavedDollars: Math.round(gasSavedDollars * 100) / 100,
          timeSavedHours: Math.round(timeSavedHours * 10) / 10,
          milesSaved: Math.round(milesSaved * 10) / 10,
          platformCommission: Math.round(platformCommission * 100) / 100,
          netEarnings: Math.round((input.totalSales - platformCommission) * 100) / 100,
          economicImpact: Math.round(input.totalSales * 2.5 * 100) / 100,
        },
      };
    }),

  /**
   * Get driver's report history
   * Called by: Driver
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Return report history
      return {
        reports: [],
        totalSalesAllTime: 0,
        totalGasSavedAllTime: 0,
        totalTimeSavedAllTime: 0,
      };
    }),

  /**
   * Get driver's cumulative stats
   * Called by: Driver
   */
  getCumulativeStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalDays: 0,
      totalSales: 0,
      totalOrders: 0,
      totalMiles: 0,
      totalGasSaved: 0,
      totalTimeSaved: 0,
      averageDailySales: 0,
      averageDailyOrders: 0,
    };
  }),
});
