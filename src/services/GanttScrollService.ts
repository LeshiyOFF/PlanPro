// src/services/GanttScrollService.ts
// Assumes DOM is browser (Electron renderer). No external deps.
import { ViewMode } from '@wamra/gantt-task-react'

export interface ScrollOptions {
  // preferred strategy: 'element' uses DOM bounding rect of taskId, 'index' uses stepIndex->pixels formula
  strategy?: 'element' | 'index';
  // if using index strategy
  stepIndex?: number;
  columnWidth?: number; // px per step (day/week/month depending on viewMode)
  preStepsCount?: number; // mirror/pre-step compensator (default 1)
  // robust fallback timeout when waiting for DOM expansion (ms)
  expansionTimeout?: number;
  // when jumping huge ranges, optionally switch viewMode instead of huge day count
  onRequireViewModeFallback?: (recommendedMode: ViewMode) => void;
  // use instant scroll until stable, then optionally smooth
  smoothAfterStableMs?: number;
  // containerWidth for soft centering
  containerWidth?: number;
}

export class GanttScrollService {
  private container: HTMLElement
  private isUserInteracting = false
  private watchdogRaf = 0
  private takeoverListenersInstalled = false
  private readonly userTakeoverEvents = ['wheel', 'pointerdown', 'touchstart', 'keydown']
  private readonly stableFrameCountRequired = 3

  constructor(container: HTMLElement) {
    this.container = container
    this.installUserTakeoverListeners()
  }

  dispose() {
    this.removeUserTakeoverListeners()
    this.cancelWatchdog()
  }

  // ---------- public API ----------

  // scroll-to-date by index formula
  // GANTT-FIX: preStepsCount изменён на 0 (по умолчанию) для синхронизации с библиотекой
  async scrollToIndex(stepIndex: number, columnWidth: number, preStepsCount = 0, opts?: Partial<ScrollOptions>) {
    const effectiveIndex = stepIndex + preStepsCount
    let targetPos = Math.round(effectiveIndex * columnWidth)

    // Soft centering logic from previous implementation
    if (opts?.containerWidth && opts.containerWidth > 0) {
      const offset = opts.containerWidth * 0.2
      targetPos = Math.max(0, targetPos - offset)
    }

    return this.scrollToPositionWithWatchdog(targetPos, opts)
  }

  // scroll-to-element by task DOM id (preferred if available)
  async scrollToTaskByDataId(taskDataId: string, opts?: Partial<ScrollOptions>) {
    // Find element anywhere inside container
    const el = this.container.querySelector<HTMLElement>(`[data-id="${taskDataId}"]`)
    if (!el) {
      // Fallback to index if element not found (e.g. not rendered yet)
      return false
    }
    // compute left relative to container scroll
    const rect = el.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()
    let targetPos = Math.round(this.container.scrollLeft + (rect.left - containerRect.left))

    // Soft centering logic
    if (opts?.containerWidth && opts.containerWidth > 0) {
      const offset = opts.containerWidth * 0.2
      targetPos = Math.max(0, targetPos - offset)
    }

    await this.scrollToPositionWithWatchdog(targetPos, opts)
    return true
  }

  // main primitive
  async scrollToPosition(targetPos: number, opts?: Partial<ScrollOptions>) {
    return this.scrollToPositionWithWatchdog(targetPos, opts)
  }

  // ---------- internals ----------

  private installUserTakeoverListeners() {
    if (this.takeoverListenersInstalled) return
    const markTaken = () => {
      if (!this.isUserInteracting) {
        console.log('[GanttScrollService] User took over control via input event')
        this.isUserInteracting = true
      }
    }
    for (const evt of this.userTakeoverEvents) {
      this.container.addEventListener(evt, markTaken, { passive: true, capture: true })
    }
    this.takeoverListenersInstalled = true
  }

  private removeUserTakeoverListeners() {
    if (!this.takeoverListenersInstalled) return
    const markTaken = () => { this.isUserInteracting = true }
    for (const evt of this.userTakeoverEvents) {
      this.container.removeEventListener(evt, markTaken, { capture: true } as EventListenerOptions)
    }
    this.takeoverListenersInstalled = false
  }

  private cancelWatchdog() {
    if (this.watchdogRaf) {
      cancelAnimationFrame(this.watchdogRaf)
      this.watchdogRaf = 0
    }
  }

  private async scrollToPositionWithWatchdog(targetPos: number, opts?: Partial<ScrollOptions>) {
    // normalize
    const expansionTimeout = opts?.expansionTimeout ?? 3000 // ms

    // quick guard: if huge target, suggest view-mode fallback via callback
    const maxReasonablePixels = 200000 // tune: if target > this, maybe switch to Month/Year
    if (Math.abs(targetPos - this.container.scrollLeft) > maxReasonablePixels && opts?.onRequireViewModeFallback) {
      // large jump -> recommend switching view mode (caller decides)
      console.log(`[GanttScrollService] Huge jump detected (${Math.abs(targetPos - this.container.scrollLeft)}px). Recommending view mode fallback.`)
      opts.onRequireViewModeFallback('Year' as ViewMode)
    }

    this.isUserInteracting = false // reset user flag when program starts nav

    console.log(`[GanttScrollService] Starting watchdog scroll to ${targetPos}`)

    const start = performance.now()
    let stableFrames = 0

    return new Promise<void>((resolve) => {
      const tick = () => {
        // if user intervened -> cancel nav and resolve to let caller handle UX
        if (this.isUserInteracting) {
          console.log('[GanttScrollService] Navigation aborted by user')
          this.cancelWatchdog()
          resolve() // user intercepted navigation
          return
        }

        const maxScroll = Math.max(0, this.container.scrollWidth - this.container.clientWidth)
        // if target beyond current maxScroll -> set as far as possible to trigger DOM expansion
        const desired = Math.min(targetPos, maxScroll)

        // apply instant scroll (avoids smooth conflict during build)
        if (Math.abs(this.container.scrollLeft - desired) > 1) {
          this.container.scrollLeft = desired
          stableFrames = 0
        } else {
          stableFrames++
        }

        // If we reached target and container already supports target (maxScroll >= target)
        if (stableFrames >= this.stableFrameCountRequired && (maxScroll >= targetPos || Math.abs(this.container.scrollLeft - targetPos) <= 2)) {
          console.log(`[GanttScrollService] Navigation reached stable target ${targetPos}`)

          // perform subtle smooth scroll to exact target (if browser supports)
          if ('scrollTo' in this.container) {
            try {
              // @ts-expect-error — scrollTo с options поддерживается не во всех типах DOM
              this.container.scrollTo({ left: targetPos, behavior: 'smooth' })
            } catch {
              // Игнорируем, если smooth scroll не поддерживается
            }
          }

          this.cancelWatchdog()
          resolve()
          return
        }

        // timeout - if we waited too long for DOM expansion
        if (performance.now() - start > expansionTimeout) {
          console.warn(`[GanttScrollService] Navigation timeout waiting for ${targetPos} (current max: ${maxScroll})`)
          this.cancelWatchdog()
          resolve() // caller can show feedback to user
          return
        }

        // continue
        this.watchdogRaf = requestAnimationFrame(tick)
      }

      // start
      this.watchdogRaf = requestAnimationFrame(tick)
    })
  }

  public getCurrentScroll(): number {
    return this.container.scrollLeft
  }
}
