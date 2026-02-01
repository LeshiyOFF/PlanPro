/*******************************************************************************
 * Test utilities for ProjectLibre Core
 * Provides helper methods and constants for isolated unit tests
 * 
 * NOTE: These utilities are for ISOLATED tests that don't require
 * full ProjectLibre initialization. For integration tests, use
 * TestEnvironmentInitializer.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 *******************************************************************************/
package com.projectlibre1.pm;

import java.util.Date;
import java.util.Calendar;
import java.util.concurrent.atomic.AtomicLong;
import java.util.UUID;

/**
 * Centralized test utilities for isolated unit tests.
 * Does NOT require ProjectLibre initialization.
 */
public final class TestUtils {
    
    // Time constants in milliseconds
    public static final long MS_PER_SECOND = 1000L;
    public static final long MS_PER_MINUTE = 60 * MS_PER_SECOND;
    public static final long MS_PER_HOUR = 60 * MS_PER_MINUTE;
    public static final long MS_PER_DAY = 8 * MS_PER_HOUR;  // 8-hour workday
    public static final long MS_PER_WEEK = 5 * MS_PER_DAY;  // 5-day workweek
    
    // ID generation
    private static final AtomicLong idCounter = new AtomicLong(0);
    
    private TestUtils() {
        // Utility class - prevent instantiation
    }
    
    /**
     * Generates a sequential ID (simulates current ProjectLibre behavior)
     */
    public static long generateSequentialId() {
        return idCounter.incrementAndGet();
    }
    
    /**
     * Generates a UUID-based ID (proposed replacement)
     */
    public static long generateUuidId() {
        return UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;
    }
    
    /**
     * Returns a fixed test start date (2024-01-01 08:00)
     */
    public static Date getTestStartDate() {
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.JANUARY, 1, 8, 0, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
    
    /**
     * Returns Monday of the current week at 08:00
     */
    public static Date getMondayDate() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        cal.set(Calendar.HOUR_OF_DAY, 8);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
    
    /**
     * Adds days to a date
     */
    public static Date addDays(Date date, int days) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DAY_OF_MONTH, days);
        return cal.getTime();
    }
    
    /**
     * Adds hours to a date
     */
    public static Date addHours(Date date, int hours) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.HOUR_OF_DAY, hours);
        return cal.getTime();
    }
    
    /**
     * Converts days to milliseconds (using 8-hour workday)
     */
    public static long daysToMs(double days) {
        return (long)(days * MS_PER_DAY);
    }
    
    /**
     * Converts hours to milliseconds
     */
    public static long hoursToMs(double hours) {
        return (long)(hours * MS_PER_HOUR);
    }
    
    /**
     * Converts milliseconds to hours
     */
    public static double msToHours(long ms) {
        return (double) ms / MS_PER_HOUR;
    }
    
    /**
     * Converts milliseconds to days (using 8-hour workday)
     */
    public static double msToDays(long ms) {
        return (double) ms / MS_PER_DAY;
    }
    
    /**
     * Calculates work cost
     * 
     * @param workMs    Work duration in milliseconds
     * @param rate      Hourly rate
     * @param units     Resource units (1.0 = 100%)
     * @return          Total cost
     */
    public static double calculateWorkCost(long workMs, double rate, double units) {
        double hours = msToHours(workMs);
        return hours * rate * units;
    }
    
    /**
     * Calculates slack (float) for critical path
     * 
     * @param earlyFinish   Early finish time in ms
     * @param lateFinish    Late finish time in ms
     * @return              Slack in ms
     */
    public static long calculateSlack(long earlyFinish, long lateFinish) {
        return lateFinish - earlyFinish;
    }
    
    /**
     * Determines if a task is critical based on slack
     * 
     * @param earlyFinish   Early finish time in ms
     * @param lateFinish    Late finish time in ms
     * @param threshold     Critical threshold in ms
     * @return              true if task is on critical path
     */
    public static boolean isCritical(long earlyFinish, long lateFinish, long threshold) {
        if (earlyFinish <= 0 || lateFinish <= 0) {
            return false;
        }
        return (lateFinish - earlyFinish) < threshold;
    }
    
    /**
     * Resets the sequential ID counter (for test isolation)
     */
    public static void resetIdCounter() {
        idCounter.set(0);
    }
}
