import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IWorkCalendar, IWorkingDay, CalendarTemplateType } from '@/domain/calendar/interfaces/IWorkCalendar';
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService';
import { Calendar, Clock, Save, X } from 'lucide-react';

interface CalendarEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (calendar: IWorkCalendar) => void;
  calendar?: IWorkCalendar; // Если передан - режим редактирования, иначе создание
}

/**
 * Диалог редактирования рабочего календаря
 * Позволяет выбрать шаблон или настроить график вручную
 * Stage 8.15: Эталонный редактор календарей
 */
export const CalendarEditorDialog: React.FC<CalendarEditorDialogProps> = ({
  open,
  onClose,
  onSave,
  calendar
}) => {
  const templateService = CalendarTemplateService.getInstance();
  const allTemplates = templateService.getAllTemplates();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CalendarTemplateType>(CalendarTemplateType.STANDARD);
  const [workingDays, setWorkingDays] = useState<IWorkingDay[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [defaultStartTime, setDefaultStartTime] = useState('09:00');
  const [defaultEndTime, setDefaultEndTime] = useState('18:00');

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  /**
   * Вычисляет количество рабочих часов из времени начала и окончания.
   * Обрабатывает переход через полночь для ночных смен.
   * 
   * @param startTime время начала в формате "HH:mm"
   * @param endTime время окончания в формате "HH:mm"
   * @returns количество часов
   */
  const calculateHoursFromTime = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let hours = endH - startH;
    const minutes = endM - startM;
    
    // Обработка перехода через полночь (ночная смена)
    if (hours < 0) {
      hours += 24;
    }
    
    const totalHours = hours + minutes / 60;
    return Math.max(1, Math.round(totalHours));
  };

  // Инициализация при открытии
  useEffect(() => {
    if (open) {
      if (calendar) {
        // Режим редактирования: восстанавливаем все данные из календаря
        setName(calendar.name);
        setDescription(calendar.description || '');
        setSelectedTemplate(calendar.templateType);
        setWorkingDays([...calendar.workingDays]);
        
        // Ищем первый рабочий день с установленными часами
        const workingDay = calendar.workingDays.find(wd => wd.isWorking && wd.workingHours);
        if (workingDay?.workingHours) {
          const start = workingDay.workingHours.start;
          const end = workingDay.workingHours.end;
          setDefaultStartTime(start);
          setDefaultEndTime(end);
          // Пересчитываем hoursPerDay из реальных рабочих часов
          const calculatedHours = calculateHoursFromTime(start, end);
          setHoursPerDay(calculatedHours);
        } else {
          setHoursPerDay(calendar.hoursPerDay);
        }
      } else {
        // Режим создания
        const template = templateService.getTemplateByType(CalendarTemplateType.STANDARD);
        if (template) {
          setName(template.name);
          setDescription(template.description);
          setWorkingDays([...template.workingDays]);
          setHoursPerDay(template.hoursPerDay);
          setDefaultStartTime(template.defaultWorkTime.start);
          setDefaultEndTime(template.defaultWorkTime.end);
        }
      }
    }
  }, [open, calendar, templateService]);

  // Проверка на пользовательские изменения
  const checkAndSetCustom = (newWorkingDays: IWorkingDay[], newHours: number) => {
    const currentTemplate = allTemplates.find(t => t.type === selectedTemplate);
    if (currentTemplate && selectedTemplate !== CalendarTemplateType.CUSTOM) {
      const isStillMatching = templateService.isMatchingTemplate(newWorkingDays, currentTemplate) && 
                              newHours === currentTemplate.hoursPerDay;
      
      if (!isStillMatching) {
        setSelectedTemplate(CalendarTemplateType.CUSTOM);
        // Не меняем описание автоматически, чтобы не затирать ввод пользователя
      }
    }
  };

  // Применение шаблона
  const handleTemplateChange = (templateType: string) => {
    const type = templateType as CalendarTemplateType;
    setSelectedTemplate(type);
    
    const template = templateService.getTemplateByType(type);
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setWorkingDays([...template.workingDays]);
      setHoursPerDay(template.hoursPerDay);
      setDefaultStartTime(template.defaultWorkTime.start);
      setDefaultEndTime(template.defaultWorkTime.end);
    }
  };

  // Переключение рабочего/выходного дня
  const toggleWorkingDay = (dayOfWeek: number) => {
    const newWorkingDays = workingDays.map(wd => {
      if (wd.dayOfWeek === dayOfWeek) {
        return {
          ...wd,
          isWorking: !wd.isWorking,
          workingHours: !wd.isWorking ? {
            start: defaultStartTime,
            end: defaultEndTime
          } : undefined
        };
      }
      return wd;
    });
    setWorkingDays(newWorkingDays);
    checkAndSetCustom(newWorkingDays, hoursPerDay);
  };

  // Сохранение
  const handleSave = () => {
    const now = new Date();
    const calendarName = name.trim() || 'Новый календарь';
    
    // V2.0: Генерация правильного ID в формате custom_<UUID>_<name>
    const calendarId = calendar?.id || templateService.createCustomCalendar(calendarName).id;
    
    const newCalendar: IWorkCalendar = {
      id: calendarId,
      name: calendarName,
      description: description.trim(),
      templateType: selectedTemplate,
      workingDays: workingDays,
      exceptions: calendar?.exceptions || [],
      hoursPerDay,
      workingDaysPerWeek: workingDays.filter(wd => wd.isWorking).length,
      isBase: calendar?.isBase || false,
      createdAt: calendar?.createdAt || now,
      updatedAt: now
    };

    onSave(newCalendar);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {calendar ? 'Редактирование календаря' : 'Создание календаря'}
          </DialogTitle>
          <DialogDescription>
            Настройте рабочее расписание для ресурса. Выберите готовый шаблон или создайте свой график.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Название */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-name">Название календаря</Label>
              <Input
                id="calendar-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Смена А (2/2)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-description">Описание</Label>
              <Input
                id="calendar-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое пояснение к графику"
              />
            </div>
          </div>

          {/* Выбор шаблона */}
          <div className="space-y-2">
            <Label>Шаблон графика</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allTemplates.map(template => (
                  <SelectItem key={template.type} value={template.type}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.shortDescription}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Сетка дней недели */}
          <div className="space-y-2">
            <Label>Рабочие дни недели</Label>
            <div className="grid grid-cols-7 gap-2">
              {workingDays
                .sort((a, b) => {
                  // Сортируем так, чтобы неделя начиналась с понедельника
                  const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                  const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                  return orderA - orderB;
                })
                .map((wd) => (
                  <button
                    key={wd.dayOfWeek}
                    type="button"
                    onClick={() => toggleWorkingDay(wd.dayOfWeek)}
                    className={`
                      aspect-square p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center
                      ${wd.isWorking
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground border-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    <span className="text-xs font-bold">{dayNames[wd.dayOfWeek]}</span>
                    {wd.isWorking && wd.workingHours && (
                      <span className="text-[9px] mt-1 opacity-80">
                        {wd.workingHours.start.substring(0, 5)}
                      </span>
                    )}
                  </button>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Нажмите на день, чтобы сделать его рабочим или выходным
            </p>
          </div>

          {/* Рабочее время */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Начало рабочего дня
              </Label>
              <Input
                id="start-time"
                type="time"
                value={defaultStartTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setDefaultStartTime(newStart);
                  // Автопересчёт hoursPerDay из нового времени
                  const newHours = calculateHoursFromTime(newStart, defaultEndTime);
                  setHoursPerDay(newHours);
                  // Обновляем все рабочие дни
                  const newWorkingDays = workingDays.map(wd => ({
                    ...wd,
                    workingHours: wd.isWorking && wd.workingHours ? {
                      start: newStart,
                      end: wd.workingHours.end
                    } : wd.workingHours
                  }));
                  setWorkingDays(newWorkingDays);
                  checkAndSetCustom(newWorkingDays, newHours);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Окончание рабочего дня
              </Label>
              <Input
                id="end-time"
                type="time"
                value={defaultEndTime}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  setDefaultEndTime(newEnd);
                  // Автопересчёт hoursPerDay из нового времени
                  const newHours = calculateHoursFromTime(defaultStartTime, newEnd);
                  setHoursPerDay(newHours);
                  // Обновляем все рабочие дни
                  const newWorkingDays = workingDays.map(wd => ({
                    ...wd,
                    workingHours: wd.isWorking && wd.workingHours ? {
                      start: wd.workingHours.start,
                      end: newEnd
                    } : wd.workingHours
                  }));
                  setWorkingDays(newWorkingDays);
                  checkAndSetCustom(newWorkingDays, newHours);
                }}
              />
            </div>
          </div>

          {/* Часов в рабочем дне */}
          <div className="space-y-2">
            <Label htmlFor="hours-per-day">Часов в рабочем дне</Label>
            <Input
              id="hours-per-day"
              type="number"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => {
                const newVal = parseInt(e.target.value, 10) || 8;
                setHoursPerDay(newVal);
                checkAndSetCustom(workingDays, newVal);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
