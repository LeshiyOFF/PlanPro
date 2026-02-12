/*******************************************************************************
 * CPM-MS.11: Unit-тесты для Critical Path Method (MS Project Standard).
 * Summary tasks НЕ на критическом пути; containsCriticalChildren; getMinChildSlack.
 * @version 3.0.0 (CPM-MS)
 *******************************************************************************/
package com.projectlibre1.pm.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;
import static com.projectlibre1.pm.task.CpmTestUtils.*;

/** Тесты CPM с иерархией задач (MS Project Standard). */
class CriticalPathMSTest {

    @Nested @DisplayName("Сценарий 1: Плоский проект")
    class FlatProjectTest {
        @Test @DisplayName("Leaf с нулевым slack критическая")
        void leafZeroSlack() {
            MockCpmTask t = new MockCpmTask("T1", false);
            t.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            assertTrue(isCritical(t));
            assertEquals(0, t.getTotalSlack());
        }
        @Test @DisplayName("Leaf с большим slack НЕ критическая")
        void leafLargeSlack() {
            MockCpmTask t = new MockCpmTask("T2", false);
            t.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + 2 * MS_PER_DAY);
            assertFalse(isCritical(t));
        }
        @Test @DisplayName("Последовательные критические")
        void sequential() {
            MockCpmTask a = new MockCpmTask("A", false);
            MockCpmTask b = new MockCpmTask("B", false);
            a.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            b.setDates(BASE_DATE + MS_PER_DAY, BASE_DATE + 2 * MS_PER_DAY, 
                      BASE_DATE + MS_PER_DAY, BASE_DATE + 2 * MS_PER_DAY);
            assertTrue(isCritical(a));
            assertTrue(isCritical(b));
        }
    }

    @Nested @DisplayName("Сценарий 2: Иерархия 1 уровень")
    class OneLevelTest {
        MockCpmTask sum, a, b;
        @BeforeEach void setup() {
            sum = new MockCpmTask("SUM", true);
            a = new MockCpmTask("A", false);
            b = new MockCpmTask("B", false);
            sum.addChild(a); sum.addChild(b);
            a.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            b.setDates(BASE_DATE + MS_PER_DAY, BASE_DATE + 2 * MS_PER_DAY, 
                      BASE_DATE + MS_PER_DAY, BASE_DATE + 2 * MS_PER_DAY);
            aggregateSummaryDates(sum);
        }
        @Test @DisplayName("Summary.isCritical() = false")
        void sumNotCritical() { assertFalse(isCritical(sum)); }
        @Test @DisplayName("containsCriticalChildren = true")
        void containsCritical() { assertTrue(containsCriticalChildren(sum)); }
        @Test @DisplayName("Дети критические")
        void childrenCritical() { assertTrue(isCritical(a)); assertTrue(isCritical(b)); }
        @Test @DisplayName("Даты агрегированы")
        void datesAggregated() {
            assertEquals(a.getEarlyStart(), sum.getEarlyStart());
            assertEquals(b.getEarlyFinish(), sum.getEarlyFinish());
        }
    }

    @Nested @DisplayName("Сценарий 3: Параллельные дети")
    class ParallelTest {
        MockCpmTask sum, lng, shrt;
        @BeforeEach void setup() {
            sum = new MockCpmTask("SUM", true);
            lng = new MockCpmTask("LONG", false);
            shrt = new MockCpmTask("SHORT", false);
            sum.addChild(lng); sum.addChild(shrt);
            long end = BASE_DATE + 5 * MS_PER_DAY;
            lng.setDates(BASE_DATE, end, BASE_DATE, end);
            shrt.setDates(BASE_DATE, BASE_DATE + 2 * MS_PER_DAY, BASE_DATE + 3 * MS_PER_DAY, end);
            aggregateSummaryDates(sum);
        }
        @Test @DisplayName("Только длинная критическая")
        void onlyLongCritical() { assertTrue(isCritical(lng)); assertFalse(isCritical(shrt)); }
        @Test @DisplayName("getMinChildSlack = 0")
        void minSlackZero() { assertEquals(0, getMinChildSlack(sum)); }
        @Test @DisplayName("containsCriticalChildren = true")
        void containsCritical() { assertTrue(containsCriticalChildren(sum)); }
    }

    @Nested @DisplayName("Сценарий 4: Вложенная иерархия")
    class NestedTest {
        MockCpmTask root, lvl1, a, b;
        @BeforeEach void setup() {
            root = new MockCpmTask("ROOT", true);
            lvl1 = new MockCpmTask("LVL1", true);
            a = new MockCpmTask("A", false);
            b = new MockCpmTask("B", false);
            lvl1.addChild(a); lvl1.addChild(b); root.addChild(lvl1);
            a.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            b.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + 2 * MS_PER_DAY);
            aggregateSummaryDates(root);
        }
        @Test @DisplayName("Рекурсивная агрегация дат")
        void recursiveDates() {
            assertEquals(a.getEarlyStart(), lvl1.getEarlyStart());
            assertEquals(lvl1.getEarlyStart(), root.getEarlyStart());
        }
        @Test @DisplayName("containsCriticalChildren рекурсивно")
        void recursiveContains() {
            assertTrue(containsCriticalChildren(lvl1));
            assertTrue(containsCriticalChildren(root));
        }
        @Test @DisplayName("getMinChildSlack рекурсивно")
        void recursiveMinSlack() {
            assertEquals(0, getMinChildSlack(lvl1));
            assertEquals(0, getMinChildSlack(root));
        }
        @Test @DisplayName("Summary не критические")
        void summariesNotCritical() {
            assertFalse(isCritical(root));
            assertFalse(isCritical(lvl1));
        }
    }

    @Nested @DisplayName("Сценарий 5: Save/Load стабильность")
    class StabilityTest {
        @Test @DisplayName("Даты стабильны")
        void datesStable() {
            MockCpmTask t = new MockCpmTask("T", false);
            t.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            long saved = t.getEarlyStart();
            t.setDates(saved, t.getEarlyFinish(), t.getLateStart(), t.getLateFinish());
            assertEquals(saved, t.getEarlyStart());
        }
        @Test @DisplayName("Иерархия стабильна")
        void hierarchyStable() {
            MockCpmTask s = new MockCpmTask("S", true);
            MockCpmTask c = new MockCpmTask("C", false);
            s.addChild(c);
            c.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            aggregateSummaryDates(s);
            long saved = s.getEarlyStart();
            aggregateSummaryDates(s);
            assertEquals(saved, s.getEarlyStart());
        }
        @Test @DisplayName("Критичность стабильна")
        void criticalityStable() {
            MockCpmTask t = new MockCpmTask("T", false);
            t.setDates(BASE_DATE, BASE_DATE + MS_PER_DAY, BASE_DATE, BASE_DATE + MS_PER_DAY);
            boolean was = isCritical(t);
            t.setDates(t.getEarlyStart(), t.getEarlyFinish(), t.getLateStart(), t.getLateFinish());
            assertEquals(was, isCritical(t));
        }
    }
}
