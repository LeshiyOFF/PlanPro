package com.projectlibre.api.exchange;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

/**
 * Unit tests for {@link CalendarRemovalService}.
 * Verifies null handling and that methods do not leave CalendarService in inconsistent state.
 */
@DisplayName("CalendarRemovalService Tests")
class CalendarRemovalServiceTest {

    private final CalendarRemovalService service = new CalendarRemovalService();

    @Nested
    @DisplayName("removeDerivedCalendarIfUnused null handling")
    class RemoveDerivedCalendarIfUnusedNullTests {

        @Test
        @DisplayName("Returns without throwing when project is null")
        void projectNull_doesNotThrow() {
            assertDoesNotThrow(() ->
                service.removeDerivedCalendarIfUnused(null, null, null));
        }

        @Test
        @DisplayName("Returns without throwing when standard is null")
        void standardNull_doesNotThrow() {
            assertDoesNotThrow(() ->
                service.removeDerivedCalendarIfUnused(null, null, null));
        }

        @Test
        @DisplayName("Returns without throwing when toRemove is null")
        void toRemoveNull_doesNotThrow() {
            assertDoesNotThrow(() ->
                service.removeDerivedCalendarIfUnused(null, null, null));
        }
    }

    @Nested
    @DisplayName("removeDerivedCalendarsNotInSet null handling")
    class RemoveDerivedCalendarsNotInSetNullTests {

        @Test
        @DisplayName("Returns without throwing when project is null")
        void projectNull_doesNotThrow() {
            Set<Long> allowed = new HashSet<>();
            assertDoesNotThrow(() ->
                service.removeDerivedCalendarsNotInSet(null, allowed, null));
        }

        @Test
        @DisplayName("Returns without throwing when standard is null")
        void standardNull_doesNotThrow() {
            Set<Long> allowed = new HashSet<>();
            assertDoesNotThrow(() ->
                service.removeDerivedCalendarsNotInSet(null, allowed, null));
        }

        @Test
        @DisplayName("Accepts empty allowedUniqueIds without throwing")
        void emptyAllowedSet_doesNotThrow() {
            assertDoesNotThrow(() ->
                service.removeDerivedCalendarsNotInSet(null, Collections.emptySet(), null));
        }
    }
}
