/**
 * Сервис для применения inline CSS стилей к DOM элементам перед экспортом в PDF.
 * Необходим потому что html2canvas не видит Tailwind CSS классы.
 *
 * Оптимизирован для печати на листе A4:
 * - Размеры шрифтов соответствуют типографским стандартам (10-12pt)
 * - Отступы уменьшены, т.к. margin добавляется в PdfExportService
 * - Цвета оптимизированы для печати
 *
 * Clean Architecture: Infrastructure Service.
 * SOLID: Single Responsibility - только стилизация для PDF.
 */
export class PdfStyleService {

  // Константы для типографики (стандарты печати)
  private static readonly FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  private static readonly LINE_HEIGHT = '1.4'

  // Цветовая палитра для печати (хороший контраст)
  private static readonly COLORS = {
    text: '#1a1a1a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    heading: '#0f172a',
    tableHeader: '#1e293b',
    tableHeaderText: '#ffffff',
    tableBorder: '#e2e8f0',
    tableAltRow: '#f8fafc',
    sectionBorder: '#e2e8f0',
    background: '#ffffff',
    backgroundMuted: '#f8fafc',
  }

  /**
   * Применяет все необходимые inline стили к элементу.
   * Порядок важен: от общих к частным стилям.
   */
  public applyAllStyles(element: HTMLElement): void {
    this.applyContainerStyles(element)
    this.applyLayoutStyles(element)
    this.applyHeadingStyles(element)
    this.applySectionStyles(element)
    this.applyTableStyles(element)
    this.applyTextStyles(element)
    this.applyProgressBarStyles(element)
  }

  /**
   * Стили для корневого контейнера отчёта.
   * Оптимизированы для PDF экспорта.
   */
  private applyContainerStyles(element: HTMLElement): void {
    element.style.fontFamily = PdfStyleService.FONT_FAMILY
    element.style.lineHeight = PdfStyleService.LINE_HEIGHT
    element.style.color = PdfStyleService.COLORS.text
    element.style.backgroundColor = PdfStyleService.COLORS.background

    // Уменьшаем padding т.к. margin добавляется в PDF
    // Исходный padding 20mm заменяем на 10mm для внутренней структуры
    element.style.padding = '10mm'
    element.style.boxSizing = 'border-box'

    // Убираем тени и границы для чистого PDF
    element.style.boxShadow = 'none'
    element.style.border = 'none'
  }

  /**
   * Стили для общей разметки (flex, grid).
   */
  private applyLayoutStyles(element: HTMLElement): void {
    // Flex контейнеры
    const flexElements = element.querySelectorAll('.flex')
    flexElements.forEach(el => {
      const elem = el as HTMLElement
      elem.style.display = 'flex'
    })

    const flexColElements = element.querySelectorAll('.flex-col')
    flexColElements.forEach(el => {
      (el as HTMLElement).style.flexDirection = 'column'
    })

    const justifyBetween = element.querySelectorAll('.justify-between')
    justifyBetween.forEach(el => {
      (el as HTMLElement).style.justifyContent = 'space-between'
    })

    const itemsStart = element.querySelectorAll('.items-start')
    itemsStart.forEach(el => {
      (el as HTMLElement).style.alignItems = 'flex-start'
    })

    const itemsCenter = element.querySelectorAll('.items-center')
    itemsCenter.forEach(el => {
      (el as HTMLElement).style.alignItems = 'center'
    })

    // Gap утилиты
    const gap2 = element.querySelectorAll('.gap-2')
    gap2.forEach(el => {
      (el as HTMLElement).style.gap = '8px'
    })

    const gap4 = element.querySelectorAll('.gap-4')
    gap4.forEach(el => {
      (el as HTMLElement).style.gap = '16px'
    })
  }

  /**
   * Стили для таблиц - критично для отображения данных.
   * Оптимизированы для печати с хорошей читаемостью.
   */
  private applyTableStyles(element: HTMLElement): void {
    // Контейнеры таблиц
    const tableContainers = element.querySelectorAll('.overflow-x-auto')
    tableContainers.forEach(container => {
      const el = container as HTMLElement
      el.style.overflow = 'visible'
      el.style.border = `1px solid ${PdfStyleService.COLORS.tableBorder}`
      el.style.borderRadius = '6px'
    })

    const tables = element.querySelectorAll('table')
    tables.forEach(table => {
      const t = table as HTMLTableElement
      t.style.width = '100%'
      t.style.borderCollapse = 'collapse'
      t.style.fontSize = '10px' // Оптимально для A4
      t.style.tableLayout = 'fixed'
    })

    const theads = element.querySelectorAll('thead')
    theads.forEach(thead => {
      (thead as HTMLElement).style.backgroundColor = PdfStyleService.COLORS.tableHeader
    })

    const ths = element.querySelectorAll('th')
    ths.forEach(th => {
      const cell = th as HTMLTableCellElement
      cell.style.backgroundColor = PdfStyleService.COLORS.tableHeader
      cell.style.color = PdfStyleService.COLORS.tableHeaderText
      cell.style.padding = '8px 10px'
      cell.style.fontWeight = '600'
      cell.style.textTransform = 'uppercase'
      cell.style.fontSize = '9px'
      cell.style.textAlign = 'left'
      cell.style.letterSpacing = '0.3px'
      cell.style.whiteSpace = 'nowrap'
    })

    const trs = element.querySelectorAll('tbody tr')
    trs.forEach((tr, index) => {
      const row = tr as HTMLTableRowElement
      row.style.backgroundColor = index % 2 === 0
        ? PdfStyleService.COLORS.background
        : PdfStyleService.COLORS.tableAltRow
    })

    const tds = element.querySelectorAll('td')
    tds.forEach(td => {
      const cell = td as HTMLTableCellElement
      cell.style.padding = '6px 10px'
      cell.style.borderBottom = `1px solid ${PdfStyleService.COLORS.tableBorder}`
      cell.style.color = PdfStyleService.COLORS.textSecondary
      cell.style.fontSize = '10px'
      cell.style.verticalAlign = 'middle'
    })
  }

  /**
   * Стили для заголовков.
   * Размеры оптимизированы для типографики A4.
   */
  private applyHeadingStyles(element: HTMLElement): void {
    // Главный заголовок (название программы)
    const h1s = element.querySelectorAll('h1')
    h1s.forEach(h1 => {
      const heading = h1 as HTMLHeadingElement
      heading.style.fontSize = '24px' // ~18pt - оптимально для заголовка
      heading.style.fontWeight = '700'
      heading.style.color = PdfStyleService.COLORS.heading
      heading.style.marginBottom = '2px'
      heading.style.marginTop = '0'
      heading.style.letterSpacing = '-0.5px'
      heading.style.lineHeight = '1.2'
    })

    // Заголовки секций (Информация о проекте, и т.д.)
    const h2s = element.querySelectorAll('h2')
    h2s.forEach(h2 => {
      const heading = h2 as HTMLHeadingElement
      heading.style.fontSize = '14px' // ~10.5pt
      heading.style.fontWeight = '700'
      heading.style.color = PdfStyleService.COLORS.heading
      heading.style.borderBottom = `2px solid ${PdfStyleService.COLORS.sectionBorder}`
      heading.style.paddingBottom = '6px'
      heading.style.marginBottom = '12px'
      heading.style.marginTop = '0'
      heading.style.textTransform = 'none'
    })

    // Подзаголовки (названия таблиц)
    const h3s = element.querySelectorAll('h3')
    h3s.forEach(h3 => {
      const heading = h3 as HTMLHeadingElement
      heading.style.fontSize = '11px' // ~8pt
      heading.style.fontWeight = '700'
      heading.style.color = PdfStyleService.COLORS.tableHeader
      heading.style.textTransform = 'uppercase'
      heading.style.letterSpacing = '0.5px'
      heading.style.marginBottom = '8px'
      heading.style.marginTop = '0'
    })
  }

  /**
   * Стили для секций и блоков.
   * Оптимизированы для компактного размещения на A4.
   */
  private applySectionStyles(element: HTMLElement): void {
    // Контейнер с отступами между секциями
    const spaceY = element.querySelectorAll('.space-y-8')
    spaceY.forEach(el => {
      const container = el as HTMLElement
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.gap = '20px'
    })

    const sections = element.querySelectorAll('section')
    sections.forEach(section => {
      const s = section as HTMLElement
      s.style.marginBottom = '16px'
      s.style.pageBreakInside = 'avoid' // Избегаем разрыва секции на страницы
    })

    // Header отчёта (шапка с названием и датой)
    const header = element.querySelector('header')
    if (header) {
      const h = header as HTMLElement
      h.style.display = 'flex'
      h.style.justifyContent = 'space-between'
      h.style.alignItems = 'flex-start'
      h.style.borderBottom = `2px solid ${PdfStyleService.COLORS.sectionBorder}`
      h.style.paddingBottom = '12px'
      h.style.marginBottom = '20px'
    }

    // Footer отчёта (подвал с копирайтом)
    const footer = element.querySelector('footer')
    if (footer) {
      const f = footer as HTMLElement
      f.style.borderTop = `1px solid ${PdfStyleService.COLORS.sectionBorder}`
      f.style.paddingTop = '12px'
      f.style.marginTop = '24px'
      f.style.color = PdfStyleService.COLORS.textLight
      f.style.fontSize = '8px'
      f.style.textAlign = 'center'
      f.style.pageBreakInside = 'avoid'
    }

    // Grid layouts (для информации о проекте)
    const gridBlocks = element.querySelectorAll('.grid')
    gridBlocks.forEach(block => {
      const el = block as HTMLElement
      el.style.display = 'grid'

      if (el.classList.contains('grid-cols-2')) {
        el.style.gridTemplateColumns = '1fr 1fr'
        el.style.gap = '8px 16px'
      }
    })

    // Summary блоки с фоном
    const bgBlocks = element.querySelectorAll('[class*="bg-slate-50"]')
    bgBlocks.forEach(block => {
      const el = block as HTMLElement
      el.style.backgroundColor = PdfStyleService.COLORS.backgroundMuted
      el.style.padding = '12px'
      el.style.borderRadius = '4px'
      el.style.border = `1px solid ${PdfStyleService.COLORS.sectionBorder}`
    })

    // Rounded borders
    const roundedElements = element.querySelectorAll('.rounded-md')
    roundedElements.forEach(el => {
      (el as HTMLElement).style.borderRadius = '6px'
    })
  }

  /**
   * Стили для текстовых элементов.
   * Размеры оптимизированы для читаемости на A4.
   */
  private applyTextStyles(element: HTMLElement): void {
    // Параграфы
    const paragraphs = element.querySelectorAll('p')
    paragraphs.forEach(p => {
      const el = p as HTMLElement
      el.style.margin = '0'
      el.style.lineHeight = '1.4'
    })

    // Курсив
    const italicTexts = element.querySelectorAll('.italic')
    italicTexts.forEach(el => {
      (el as HTMLElement).style.fontStyle = 'italic'
    })

    // Жирный текст
    const boldTexts = element.querySelectorAll('.font-bold')
    boldTexts.forEach(el => {
      (el as HTMLElement).style.fontWeight = '700'
    })

    const semiboldTexts = element.querySelectorAll('.font-semibold')
    semiboldTexts.forEach(el => {
      (el as HTMLElement).style.fontWeight = '600'
    })

    // Размеры текста для печати
    const textXs = element.querySelectorAll('.text-xs')
    textXs.forEach(el => {
      (el as HTMLElement).style.fontSize = '9px'
    })

    const textSm = element.querySelectorAll('.text-sm')
    textSm.forEach(el => {
      (el as HTMLElement).style.fontSize = '10px'
    })

    const textBase = element.querySelectorAll('.text-base')
    textBase.forEach(el => {
      (el as HTMLElement).style.fontSize = '11px'
    })

    const textLg = element.querySelectorAll('.text-lg')
    textLg.forEach(el => {
      (el as HTMLElement).style.fontSize = '12px'
    })

    const textXl = element.querySelectorAll('.text-xl')
    textXl.forEach(el => {
      (el as HTMLElement).style.fontSize = '14px'
    })

    const text3xl = element.querySelectorAll('.text-3xl')
    text3xl.forEach(el => {
      (el as HTMLElement).style.fontSize = '24px'
    })

    // Выравнивание текста
    const textRight = element.querySelectorAll('.text-right')
    textRight.forEach(el => {
      (el as HTMLElement).style.textAlign = 'right'
    })

    const textCenter = element.querySelectorAll('.text-center')
    textCenter.forEach(el => {
      (el as HTMLElement).style.textAlign = 'center'
    })

    // Uppercase
    const uppercase = element.querySelectorAll('.uppercase')
    uppercase.forEach(el => {
      (el as HTMLElement).style.textTransform = 'uppercase'
    })

    // Letter spacing
    const trackingTighter = element.querySelectorAll('.tracking-tighter')
    trackingTighter.forEach(el => {
      (el as HTMLElement).style.letterSpacing = '-0.5px'
    })

    const trackingWide = element.querySelectorAll('.tracking-wide')
    trackingWide.forEach(el => {
      (el as HTMLElement).style.letterSpacing = '0.5px'
    })

    // Цвета текста (Tailwind slate palette)
    const slateTexts = element.querySelectorAll('[class*="text-slate"]')
    slateTexts.forEach(el => {
      const elem = el as HTMLElement
      const className = elem.className

      if (className.includes('text-slate-400')) {
        elem.style.color = PdfStyleService.COLORS.textLight
      } else if (className.includes('text-slate-500')) {
        elem.style.color = PdfStyleService.COLORS.textMuted
      } else if (className.includes('text-slate-600')) {
        elem.style.color = PdfStyleService.COLORS.textSecondary
      } else if (className.includes('text-slate-700')) {
        elem.style.color = '#334155'
      } else if (className.includes('text-slate-800')) {
        elem.style.color = PdfStyleService.COLORS.tableHeader
      } else if (className.includes('text-slate-900')) {
        elem.style.color = PdfStyleService.COLORS.heading
      }
    })
  }

  /**
   * Стили для прогресс-баров.
   * Уменьшены для компактного отображения в таблицах.
   */
  private applyProgressBarStyles(element: HTMLElement): void {
    // Контейнеры прогресс-баров (flex с gap)
    const progressWrappers = element.querySelectorAll('.min-w-\\[100px\\]')
    progressWrappers.forEach(wrapper => {
      const el = wrapper as HTMLElement
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.gap = '6px'
      el.style.minWidth = '80px'
    })

    // Flex-1 элементы
    const flex1 = element.querySelectorAll('.flex-1')
    flex1.forEach(el => {
      (el as HTMLElement).style.flex = '1 1 0%'
    })

    // Фон прогресс-бара (серый контейнер)
    const progressContainers = element.querySelectorAll('.h-2')
    progressContainers.forEach(container => {
      const el = container as HTMLElement
      el.style.height = '6px'
      el.style.borderRadius = '3px'
      el.style.overflow = 'hidden'

      if (el.classList.contains('bg-slate-200')) {
        el.style.backgroundColor = PdfStyleService.COLORS.tableBorder
      }
    })

    // Rounded-full для прогресс-баров
    const roundedFull = element.querySelectorAll('.rounded-full')
    roundedFull.forEach(el => {
      (el as HTMLElement).style.borderRadius = '9999px'
    })

    // Заполненная часть прогресс-бара
    const progressBars = element.querySelectorAll('.bg-green-500, .bg-blue-500, .bg-amber-500, .bg-slate-300')
    progressBars.forEach(bar => {
      const el = bar as HTMLElement
      el.style.height = '100%'
      el.style.transition = 'none'

      if (el.classList.contains('bg-green-500')) {
        el.style.backgroundColor = '#22c55e'
      } else if (el.classList.contains('bg-blue-500')) {
        el.style.backgroundColor = '#3b82f6'
      } else if (el.classList.contains('bg-amber-500')) {
        el.style.backgroundColor = '#f59e0b'
      } else if (el.classList.contains('bg-slate-300')) {
        el.style.backgroundColor = '#cbd5e1'
      }
    })

    // Метка процента рядом с прогресс-баром
    const percentLabels = element.querySelectorAll('.w-10')
    percentLabels.forEach(label => {
      const el = label as HTMLElement
      el.style.width = '28px'
      el.style.flexShrink = '0'
    })
  }
}
