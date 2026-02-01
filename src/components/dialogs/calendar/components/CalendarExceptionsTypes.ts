import { CalendarException } from '@/types/calendar-types'

export interface CalendarExceptionsProps {
  exceptions: CalendarException[];
  onExceptionsChange: (exceptions: CalendarException[]) => void;
}
