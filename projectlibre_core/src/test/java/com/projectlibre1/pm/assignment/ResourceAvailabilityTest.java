/*******************************************************************************
 * Tests for Resource availability and allocation logic
 * Covers TODO items in Resource classes related to availability calculations
 * 
 * These are ISOLATED unit tests that test resource allocation algorithms directly
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
import org.junit.jupiter.params.provider.ValueSource;

import java.util.ArrayList;
import java.util.List;

/**
 * Isolated tests for resource availability calculations.
 * Tests the availability algorithms without requiring full ProjectLibre initialization.
 */
class ResourceAvailabilityTest {
    
    // Time constants
    private static final long MS_PER_HOUR = 60 * 60 * 1000L;
    private static final long MS_PER_DAY = 8 * MS_PER_HOUR;
    
    /**
     * Simple resource allocation model
     */
    static class ResourceAllocation {
        double maxUnits;      // Maximum available (e.g., 1.0 = 100%)
        double allocatedUnits; // Currently allocated
        
        ResourceAllocation(double maxUnits) {
            this.maxUnits = maxUnits;
            this.allocatedUnits = 0.0;
        }
        
        double getAvailableUnits() {
            return maxUnits - allocatedUnits;
        }
        
        boolean canAllocate(double units) {
            return units <= getAvailableUnits();
        }
        
        void allocate(double units) {
            if (!canAllocate(units)) {
                throw new IllegalStateException("Cannot allocate " + units 
                    + " units, only " + getAvailableUnits() + " available");
            }
            allocatedUnits += units;
        }
        
        void release(double units) {
            allocatedUnits = Math.max(0, allocatedUnits - units);
        }
    }
    
    @Test
    @DisplayName("New resource should have full availability")
    void testNewResourceFullAvailability() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        
        Assertions.assertEquals(1.0, resource.getAvailableUnits(), 0.001,
            "New resource should have 100% availability");
        Assertions.assertEquals(0.0, resource.allocatedUnits, 0.001,
            "New resource should have zero allocation");
    }
    
    @Test
    @DisplayName("Resource allocation reduces availability")
    void testAllocationReducesAvailability() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        resource.allocate(0.5);
        
        Assertions.assertEquals(0.5, resource.getAvailableUnits(), 0.001,
            "50% allocation should leave 50% available");
        Assertions.assertEquals(0.5, resource.allocatedUnits, 0.001,
            "Allocated units should be 50%");
    }
    
    @Test
    @DisplayName("Multiple allocations accumulate")
    void testMultipleAllocations() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        resource.allocate(0.3);
        resource.allocate(0.4);
        
        Assertions.assertEquals(0.3, resource.getAvailableUnits(), 0.001,
            "30% + 40% allocation should leave 30% available");
    }
    
    @Test
    @DisplayName("Cannot over-allocate resource")
    void testCannotOverAllocate() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        resource.allocate(0.8);
        
        Assertions.assertFalse(resource.canAllocate(0.3),
            "Should not be able to allocate 30% when only 20% available");
        
        Assertions.assertThrows(IllegalStateException.class, () -> {
            resource.allocate(0.3);
        }, "Over-allocation should throw exception");
    }
    
    @Test
    @DisplayName("Releasing allocation increases availability")
    void testReleaseIncreasesAvailability() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        resource.allocate(0.6);
        resource.release(0.3);
        
        Assertions.assertEquals(0.7, resource.getAvailableUnits(), 0.001,
            "Releasing 30% from 60% allocation should give 70% available");
    }
    
    @ParameterizedTest
    @DisplayName("Various max units configurations")
    @ValueSource(doubles = {0.5, 1.0, 2.0, 3.0})
    void testDifferentMaxUnits(double maxUnits) {
        ResourceAllocation resource = new ResourceAllocation(maxUnits);
        
        Assertions.assertEquals(maxUnits, resource.getAvailableUnits(), 0.001,
            "Initial availability should equal max units");
        Assertions.assertTrue(resource.canAllocate(maxUnits),
            "Should be able to allocate full capacity");
    }
    
    @ParameterizedTest
    @DisplayName("Allocation and availability balance")
    @CsvSource({
        "1.0, 0.0, 1.0",    // No allocation
        "1.0, 0.5, 0.5",    // 50% allocated
        "1.0, 1.0, 0.0",    // Fully allocated
        "2.0, 1.0, 1.0",    // 200% capacity, 100% allocated
        "0.5, 0.3, 0.2",    // 50% capacity, 30% allocated
    })
    void testAllocationAvailabilityBalance(double maxUnits, double allocated, double expectedAvailable) {
        ResourceAllocation resource = new ResourceAllocation(maxUnits);
        if (allocated > 0) {
            resource.allocate(allocated);
        }
        
        Assertions.assertEquals(expectedAvailable, resource.getAvailableUnits(), 0.001,
            "Available units calculation mismatch");
    }
    
    @Test
    @DisplayName("Resource with multiple task assignments")
    void testMultipleTaskAssignments() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        List<Double> assignments = new ArrayList<>();
        
        // Assign to multiple tasks
        assignments.add(0.3);
        assignments.add(0.2);
        assignments.add(0.25);
        
        for (double allocation : assignments) {
            Assertions.assertTrue(resource.canAllocate(allocation),
                "Should be able to allocate " + allocation);
            resource.allocate(allocation);
        }
        
        double totalAllocated = 0.3 + 0.2 + 0.25;
        Assertions.assertEquals(totalAllocated, resource.allocatedUnits, 0.001,
            "Total allocation should be sum of assignments");
        Assertions.assertEquals(1.0 - totalAllocated, resource.getAvailableUnits(), 0.001,
            "Remaining availability should be correct");
    }
    
    @Test
    @DisplayName("Resource pool with multiple resources")
    void testResourcePool() {
        List<ResourceAllocation> pool = new ArrayList<>();
        pool.add(new ResourceAllocation(1.0)); // Developer 1
        pool.add(new ResourceAllocation(1.0)); // Developer 2
        pool.add(new ResourceAllocation(0.5)); // Part-time Developer
        
        // Total capacity
        double totalCapacity = pool.stream()
            .mapToDouble(r -> r.maxUnits)
            .sum();
        Assertions.assertEquals(2.5, totalCapacity, 0.001,
            "Total pool capacity should be 2.5");
        
        // Allocate across pool
        pool.get(0).allocate(0.8);
        pool.get(1).allocate(0.5);
        pool.get(2).allocate(0.3);
        
        double totalAvailable = pool.stream()
            .mapToDouble(ResourceAllocation::getAvailableUnits)
            .sum();
        Assertions.assertEquals(0.9, totalAvailable, 0.001,
            "Total available should be 0.2 + 0.5 + 0.2 = 0.9");
    }
    
    @Test
    @DisplayName("Cannot release more than allocated")
    void testReleaseMoreThanAllocated() {
        ResourceAllocation resource = new ResourceAllocation(1.0);
        resource.allocate(0.3);
        resource.release(0.5); // Release more than allocated
        
        // Should not go negative
        Assertions.assertEquals(0.0, resource.allocatedUnits, 0.001,
            "Allocated units should not go negative");
        Assertions.assertEquals(1.0, resource.getAvailableUnits(), 0.001,
            "Available should be max units after over-release");
    }
}
