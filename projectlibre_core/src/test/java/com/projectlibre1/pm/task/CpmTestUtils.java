/*******************************************************************************
 * Утилиты для тестирования CPM логики (MS Project Standard).
 * Содержит алгоритмы критического пути для изолированных тестов.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0 (CPM-MS)
 *******************************************************************************/
package com.projectlibre1.pm.task;

/**
 * Утилиты CPM: isCritical, containsCriticalChildren, getMinChildSlack, aggregateSummaryDates.
 * Реализуют логику MS Project Standard для изолированных тестов.
 */
public final class CpmTestUtils {
    
    public static final long MS_PER_HOUR = 60 * 60 * 1000L;
    public static final long MS_PER_DAY = 8 * MS_PER_HOUR;
    public static final long CRITICAL_THRESHOLD = 60000L;
    public static final long BASE_DATE = 1704096000000L;
    
    private CpmTestUtils() {
    }
    
    /** CPM-MS.3: Summary tasks НИКОГДА не критические. */
    public static boolean isCritical(MockCpmTask task) {
        if (task.isSummary()) {
            return false;
        }
        return task.getTotalSlack() <= CRITICAL_THRESHOLD;
    }
    
    /** CPM-MS.4: Содержит ли summary критических детей (рекурсивно). */
    public static boolean containsCriticalChildren(MockCpmTask task) {
        if (!task.isSummary()) {
            return false;
        }
        for (MockCpmTask child : task.getChildren()) {
            if (child.isSummary()) {
                if (containsCriticalChildren(child)) {
                    return true;
                }
            } else {
                if (isCritical(child)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /** CPM-MS.5: Минимальный slack среди детей (рекурсивно). */
    public static long getMinChildSlack(MockCpmTask task) {
        if (!task.isSummary()) {
            return task.getTotalSlack();
        }
        if (task.getChildren().isEmpty()) {
            return Long.MAX_VALUE;
        }
        long minSlack = Long.MAX_VALUE;
        for (MockCpmTask child : task.getChildren()) {
            long childSlack = child.isSummary() ? getMinChildSlack(child) : child.getTotalSlack();
            if (childSlack < minSlack) {
                minSlack = childSlack;
            }
        }
        return minSlack;
    }
    
    /** CPM-MS.2: Агрегация дат summary из детей. */
    public static void aggregateSummaryDates(MockCpmTask summary) {
        if (!summary.isSummary() || summary.getChildren().isEmpty()) {
            return;
        }
        long minEarlyStart = Long.MAX_VALUE;
        long maxEarlyFinish = Long.MIN_VALUE;
        long minLateStart = Long.MAX_VALUE;
        long maxLateFinish = Long.MIN_VALUE;
        
        for (MockCpmTask child : summary.getChildren()) {
            if (child.isSummary()) {
                aggregateSummaryDates(child);
            }
            minEarlyStart = Math.min(minEarlyStart, child.getEarlyStart());
            maxEarlyFinish = Math.max(maxEarlyFinish, child.getEarlyFinish());
            minLateStart = Math.min(minLateStart, child.getLateStart());
            maxLateFinish = Math.max(maxLateFinish, child.getLateFinish());
        }
        
        summary.setDates(minEarlyStart, maxEarlyFinish, minLateStart, maxLateFinish);
    }
}
