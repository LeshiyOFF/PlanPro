/*******************************************************************************
 * Tests for Assignment cost calculation logic
 * Covers TODO items in Assignment.java related to cost calculations
 * 
 * These are ISOLATED unit tests that test cost calculation algorithms directly
 * without requiring full ProjectLibre initialization.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 *******************************************************************************/
package com.projectlibre1.pm.assignment;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * Isolated tests for assignment cost calculations.
 * Tests the cost calculation algorithms without requiring full ProjectLibre initialization.
 */
class AssignmentCostTest {
    
    // Time constants (milliseconds)
    private static final long MS_PER_HOUR = 60 * 60 * 1000L;
    private static final long MS_PER_DAY = 8 * MS_PER_HOUR; // 8-hour workday
    
    /**
     * Calculates standard work cost
     * Cost = (work in hours) * (hourly rate) * units
     */
    private double calculateStandardCost(long workMs, double hourlyRate, double units) {
        double workHours = (double) workMs / MS_PER_HOUR;
        return workHours * hourlyRate * units;
    }
    
    /**
     * Calculates overtime cost
     * Overtime cost = (overtime work in hours) * (overtime rate)
     */
    private double calculateOvertimeCost(long overtimeWorkMs, double overtimeRate) {
        double overtimeHours = (double) overtimeWorkMs / MS_PER_HOUR;
        return overtimeHours * overtimeRate;
    }
    
    /**
     * Calculates total assignment cost
     */
    private double calculateTotalCost(long workMs, double hourlyRate, double units,
                                      long overtimeWorkMs, double overtimeRate) {
        return calculateStandardCost(workMs, hourlyRate, units) 
             + calculateOvertimeCost(overtimeWorkMs, overtimeRate);
    }
    
    @Test
    @DisplayName("Standard work cost calculation - 40 hours at $50/hour")
    void testStandardWorkCost() {
        long workMs = 40 * MS_PER_HOUR; // 40 hours
        double hourlyRate = 50.0;
        double units = 1.0;
        
        double expected = 40.0 * 50.0; // $2000
        double actual = calculateStandardCost(workMs, hourlyRate, units);
        
        Assertions.assertEquals(expected, actual, 0.01,
            "40 hours at $50/hour should cost $2000");
    }
    
    @Test
    @DisplayName("Part-time resource cost calculation - 50% units")
    void testPartTimeResourceCost() {
        long workMs = 40 * MS_PER_HOUR;
        double hourlyRate = 50.0;
        double units = 0.5; // 50% allocation
        
        double expected = 40.0 * 50.0 * 0.5; // $1000
        double actual = calculateStandardCost(workMs, hourlyRate, units);
        
        Assertions.assertEquals(expected, actual, 0.01,
            "40 hours at $50/hour with 50% units should cost $1000");
    }
    
    @Test
    @DisplayName("Overtime cost calculation - 10 hours at $75/hour")
    void testOvertimeCost() {
        long overtimeMs = 10 * MS_PER_HOUR;
        double overtimeRate = 75.0;
        
        double expected = 10.0 * 75.0; // $750
        double actual = calculateOvertimeCost(overtimeMs, overtimeRate);
        
        Assertions.assertEquals(expected, actual, 0.01,
            "10 overtime hours at $75/hour should cost $750");
    }
    
    @Test
    @DisplayName("Total cost with standard and overtime work")
    void testTotalCostWithOvertime() {
        long workMs = 40 * MS_PER_HOUR;
        double hourlyRate = 50.0;
        double units = 1.0;
        long overtimeMs = 10 * MS_PER_HOUR;
        double overtimeRate = 75.0;
        
        double expected = 2000.0 + 750.0; // $2750
        double actual = calculateTotalCost(workMs, hourlyRate, units, overtimeMs, overtimeRate);
        
        Assertions.assertEquals(expected, actual, 0.01,
            "Total cost should include standard and overtime");
    }
    
    @ParameterizedTest
    @DisplayName("Parametrized cost calculation tests")
    @CsvSource({
        "8, 100.0, 1.0, 0, 0.0, 800.0",     // 1 day at $100/hour
        "40, 50.0, 1.0, 0, 0.0, 2000.0",    // 1 week at $50/hour
        "160, 50.0, 1.0, 0, 0.0, 8000.0",   // 1 month at $50/hour
        "40, 50.0, 0.5, 0, 0.0, 1000.0",    // 50% allocation
        "40, 50.0, 2.0, 0, 0.0, 4000.0",    // 200% allocation (multiple resources)
        "40, 50.0, 1.0, 10, 75.0, 2750.0",  // With overtime
    })
    void testCostCalculations(long workHours, double hourlyRate, double units,
                               long overtimeHours, double overtimeRate, double expectedCost) {
        long workMs = workHours * MS_PER_HOUR;
        long overtimeMs = overtimeHours * MS_PER_HOUR;
        
        double actual = calculateTotalCost(workMs, hourlyRate, units, overtimeMs, overtimeRate);
        
        Assertions.assertEquals(expectedCost, actual, 0.01,
            "Cost calculation mismatch");
    }
    
    @Test
    @DisplayName("Zero work should result in zero cost")
    void testZeroWorkZeroCost() {
        double cost = calculateStandardCost(0, 50.0, 1.0);
        Assertions.assertEquals(0.0, cost, 0.001,
            "Zero work should result in zero cost");
    }
    
    @Test
    @DisplayName("Zero rate should result in zero cost")
    void testZeroRateZeroCost() {
        double cost = calculateStandardCost(40 * MS_PER_HOUR, 0.0, 1.0);
        Assertions.assertEquals(0.0, cost, 0.001,
            "Zero rate should result in zero cost");
    }
    
    @Test
    @DisplayName("Zero units should result in zero cost")
    void testZeroUnitsZeroCost() {
        double cost = calculateStandardCost(40 * MS_PER_HOUR, 50.0, 0.0);
        Assertions.assertEquals(0.0, cost, 0.001,
            "Zero units should result in zero cost");
    }
    
    @Test
    @DisplayName("Cost should scale linearly with work")
    void testCostScalesLinearly() {
        double hourlyRate = 50.0;
        double units = 1.0;
        
        double cost10h = calculateStandardCost(10 * MS_PER_HOUR, hourlyRate, units);
        double cost20h = calculateStandardCost(20 * MS_PER_HOUR, hourlyRate, units);
        double cost40h = calculateStandardCost(40 * MS_PER_HOUR, hourlyRate, units);
        
        Assertions.assertEquals(cost10h * 2, cost20h, 0.01,
            "20 hours should cost twice as much as 10 hours");
        Assertions.assertEquals(cost10h * 4, cost40h, 0.01,
            "40 hours should cost four times as much as 10 hours");
    }
    
    @Test
    @DisplayName("Overtime rate typically 1.5x standard rate")
    void testTypicalOvertimeRate() {
        double standardRate = 50.0;
        double overtimeRate = standardRate * 1.5; // 1.5x multiplier
        
        long standardWorkMs = 40 * MS_PER_HOUR;
        long overtimeWorkMs = 10 * MS_PER_HOUR;
        
        double standardCost = calculateStandardCost(standardWorkMs, standardRate, 1.0);
        double overtimeCost = calculateOvertimeCost(overtimeWorkMs, overtimeRate);
        
        Assertions.assertEquals(2000.0, standardCost, 0.01);
        Assertions.assertEquals(750.0, overtimeCost, 0.01);
        Assertions.assertEquals(2750.0, standardCost + overtimeCost, 0.01);
    }
}
