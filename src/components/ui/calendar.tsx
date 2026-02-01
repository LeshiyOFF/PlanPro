import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import type { DayPickerProps } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ru } from 'date-fns/locale'
import { format, startOfToday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'

/** Обёртка над AnimatePresence с корректным типом возврата (React допускает null, не undefined). */
const CalendarAnimatePresence = AnimatePresence as React.ComponentType<{ mode?: 'wait' | 'sync'; children: React.ReactNode }>

/** Пропсы календаря: режим single с опциональными selected/onSelect (расширяют DayPicker для single mode). */
export type CalendarProps = Omit<DayPickerProps, 'mode' | 'selected' | 'onSelect'> & {
  mode?: 'single'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onSelect,
  selected,
  ...props
}: CalendarProps) {
  const { t } = useTranslation()
  const today = startOfToday()

  const [month, setMonth] = React.useState<Date>(
    (Array.isArray(selected) ? selected[0] : selected instanceof Date ? selected : null) || today,
  )

  const handleTodayClick = () => {
    setMonth(today)
    onSelect?.(today)
  }

  return (
    <div className={cn(
      'overflow-hidden rounded-[32px] bg-primary select-none w-[360px] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.3)] relative flex flex-col antialiased border-none',
      className,
    )}>
      {/* Изолированные стили для DayPicker v9 */}
      <style>{`
        .rdp-root {
          --rdp-accent-color: hsl(var(--primary));
          --rdp-accent-foreground-color: hsl(var(--primary-foreground));
          margin: 0 !important;
          width: 100%;
        }
        
        .rdp-months { width: 100%; }
        .rdp-month { width: 100%; display: flex; flex-direction: column; }
        .rdp-month_grid { width: 100%; border-collapse: collapse; }
        
        .rdp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 12px; }
        .rdp-weekday { 
          font-size: 11px; 
          font-weight: 700; 
          color: #94a3b8; 
          text-transform: uppercase; 
          letter-spacing: 0.15em;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rdp-weeks { display: flex; flex-direction: column; gap: 6px; }
        .rdp-week { display: grid; grid-template-columns: repeat(7, 1fr); }

        .rdp-day {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          aspect-ratio: 1 / 1;
          position: relative;
        }
        
        /* КНОПКА ДНЯ */
        .rdp-day_button {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none !important;
          background: transparent !important;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          outline: none !important;
        }

        /* ТОЧКА ДЛЯ СЕГОДНЯ (Фикс: вешаем на кнопку внутри rdp-today) */
        .rdp-today .rdp-day_button::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
          box-shadow: 0 0 4px rgba(var(--primary), 0.4);
        }

        /* РАМКА ДЛЯ ВЫБРАННОЙ ДАТЫ (Фикс: через box-shadow для четкости) */
        .rdp-selected .rdp-day_button {
          box-shadow: inset 0 0 0 2px hsl(var(--primary)) !important;
          color: hsl(var(--primary)) !important;
          font-weight: 700 !important;
        }

        /* Совмещение Сегодня + Выбранная */
        .rdp-selected.rdp-today .rdp-day_button::after {
          background-color: hsl(var(--primary));
        }

        .rdp-day_button:hover:not(.rdp-selected *) {
          background-color: #f8fafc !important;
          color: #0f172a;
        }

        .rdp-day_button:active { transform: scale(0.92); }

        .rdp-outside .rdp-day_button {
          color: #e2e8f0;
          opacity: 0.5;
        }
      `}</style>

      {/* Акцентная шапочка (Header) */}
      <div className="bg-primary p-7 pb-9 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">
            {t('common.calendar', 'Календарь')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-4xl font-bold tracking-tight first-letter:uppercase">
              {format(month, 'LLLL', { locale: ru })}
            </h2>
            <span className="text-2xl font-light opacity-50">
              {format(month, 'yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Тело календаря (bg-white здесь, чтобы скрыть bg-primary родителя) */}
      <div className="bg-white px-6 py-6 pb-10 flex-1 flex flex-col gap-6 rounded-b-[32px]">
        {/* Навигация */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => {
              const prev = new Date(month)
              prev.setMonth(prev.getMonth() - 1)
              setMonth(prev)
            }}
            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary border border-slate-100 hover:border-primary/20"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5px]" />
          </button>

          <button
            onClick={handleTodayClick}
            className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-all border border-primary/10"
          >
            {t('common.today', 'Сегодня')}
          </button>

          <button
            onClick={() => {
              const next = new Date(month)
              next.setMonth(next.getMonth() + 1)
              setMonth(next)
            }}
            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary border border-slate-100 hover:border-primary/20"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* Сетка DayPicker */}
        <CalendarAnimatePresence mode="wait">
          <motion.div
            key={month.toString()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <DayPicker
              mode="single"
              month={month}
              onMonthChange={setMonth}
              showOutsideDays={showOutsideDays}
              locale={ru}
              className="m-0 p-0"
              selected={selected}
              onSelect={onSelect ? (selectedVal: Date | undefined) => onSelect(selectedVal) : undefined}
              classNames={{
                months: 'w-full',
                month: 'w-full',
                month_caption: 'hidden',
                nav: 'hidden',
                weekdays: 'rdp-weekdays',
                weekday: 'rdp-weekday',
                weeks: 'rdp-weeks',
                day: 'rdp-day',
                ...classNames,
              }}
              {...(props as Omit<DayPickerProps, 'mode' | 'selected' | 'onSelect' | 'month' | 'onMonthChange' | 'locale' | 'className' | 'classNames' | 'showOutsideDays'>)}
            />
          </motion.div>
        </CalendarAnimatePresence>
      </div>
    </div>
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
