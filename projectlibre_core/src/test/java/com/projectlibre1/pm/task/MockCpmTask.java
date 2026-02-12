/*******************************************************************************
 * Mock задача для тестирования CPM логики (MS Project Standard).
 * Симулирует NormalTask без требования полной инициализации ProjectLibre.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0 (CPM-MS)
 *******************************************************************************/
package com.projectlibre1.pm.task;

import java.util.ArrayList;
import java.util.List;

/**
 * Симуляция задачи для изолированного тестирования CPM логики.
 * Содержит минимально необходимые поля для проверки критического пути.
 */
public class MockCpmTask {
    
    private final String id;
    private final boolean isSummary;
    private final List<MockCpmTask> children = new ArrayList<>();
    private long earlyStart;
    private long earlyFinish;
    private long lateStart;
    private long lateFinish;
    
    public MockCpmTask(String id, boolean isSummary) {
        this.id = id;
        this.isSummary = isSummary;
    }
    
    public void setDates(long earlyStart, long earlyFinish, long lateStart, long lateFinish) {
        this.earlyStart = earlyStart;
        this.earlyFinish = earlyFinish;
        this.lateStart = lateStart;
        this.lateFinish = lateFinish;
    }
    
    public void addChild(MockCpmTask child) {
        children.add(child);
    }
    
    public String getId() {
        return id;
    }
    
    public boolean isSummary() {
        return isSummary;
    }
    
    public List<MockCpmTask> getChildren() {
        return children;
    }
    
    public long getEarlyStart() {
        return earlyStart;
    }
    
    public long getEarlyFinish() {
        return earlyFinish;
    }
    
    public long getLateStart() {
        return lateStart;
    }
    
    public long getLateFinish() {
        return lateFinish;
    }
    
    public long getTotalSlack() {
        return lateFinish - earlyFinish;
    }
}
