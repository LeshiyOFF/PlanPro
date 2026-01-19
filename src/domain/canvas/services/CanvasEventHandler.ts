import { 
  CanvasPoint, 
  CanvasEventHandlers,
  GanttTaskRender,
  GanttInteractionType,
  GanttCanvasData
} from '../interfaces/GanttCanvas';
import { GanttInteractionService } from './GanttInteractionService';
import { TaskBarsLayer } from '../layers/TaskBarsLayer';

/**
 * Canvas event handling functionality
 */
export class CanvasEventHandler {
  private handlers: CanvasEventHandlers;
  private canvas: HTMLCanvasElement;
  private tasks: GanttTaskRender[] = [];
  private interactionService: GanttInteractionService;
  private engineData: GanttCanvasData | null = null;

  // Храним ссылки на связанные обработчики для корректного удаления
  private boundMouseDown = (e: MouseEvent) => this.handleMouseDown(e);
  private boundMouseUp = (e: MouseEvent) => this.handleMouseUp(e);
  private boundMouseMove = (e: MouseEvent) => this.handleMouseMove(e);
  private boundClick = (e: MouseEvent) => this.handleClick(e);
  private boundDblClick = (e: MouseEvent) => this.handleDoubleClick(e);
  private boundContextMenu = (e: MouseEvent) => this.handleRightClick(e);
  private boundWheel = (e: WheelEvent) => this.handleWheel(e);

  constructor(canvas: HTMLCanvasElement, handlers: Partial<CanvasEventHandlers> = {}) {
    this.canvas = canvas;
    this.interactionService = new GanttInteractionService();
    this.handlers = {
      onClick: () => {},
      onDoubleClick: () => {},
      onRightClick: () => {},
      onMouseMove: () => {},
      onMouseDown: () => {},
      onMouseUp: () => {},
      onWheel: () => {},
      ...handlers
    };
  }

  /**
   * Обновляет данные движка для расчетов трансформаций
   */
  public setEngineData(data: GanttCanvasData): void {
    this.engineData = data;
    this.tasks = data.tasks;
  }

  /**
   * Обновляет обработчики событий без пересоздания слушателей
   */
  public updateHandlers(handlers: Partial<CanvasEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Set tasks for hit testing
   */
  public setTasks(tasks: GanttTaskRender[]): void {
    this.tasks = tasks;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    this.canvas.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('click', this.boundClick);
    this.canvas.addEventListener('dblclick', this.boundDblClick);
    this.canvas.addEventListener('contextmenu', this.boundContextMenu);
    this.canvas.addEventListener('wheel', this.boundWheel);
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    this.canvas.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('click', this.boundClick);
    this.canvas.removeEventListener('dblclick', this.boundDblClick);
    this.canvas.removeEventListener('contextmenu', this.boundContextMenu);
    this.canvas.removeEventListener('wheel', this.boundWheel);
  }

  /**
   * Get mouse position relative to canvas
   */
  private getMousePosition(event: MouseEvent): CanvasPoint {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Hit test for tasks with transformation support
   */
  hitTestTask(point: CanvasPoint): GanttTaskRender | null {
    if (!this.engineData) return null;

    const { scale, offsetX, offsetY } = this.engineData.viewport;
    
    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i];
      
      // Вычисляем экранные координаты точно так же, как в TaskBarsLayer
      const screenRect = {
        x: (task.x + offsetX + TaskBarsLayer.HEADER_WIDTH) * scale,
        y: (i * TaskBarsLayer.ROW_HEIGHT + offsetY + TaskBarsLayer.TIMELINE_HEADER_HEIGHT + 5) * scale,
        width: task.width * scale,
        height: (TaskBarsLayer.ROW_HEIGHT - 10) * scale
      };

      if (this.isPointInRect(point, screenRect)) {
        return task;
      }
    }
    return null;
  }

  /**
   * Check if point is in rectangle
   */
  private isPointInRect(point: CanvasPoint, rect: { x: number; y: number; width: number; height: number }): boolean {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  }

  /**
   * Update cursor based on task interaction zone
   */
  private updateCursor(point: CanvasPoint, task: GanttTaskRender | null): void {
    if (!task) {
      this.canvas.style.cursor = 'default';
      return;
    }

    const type = this.interactionService.getInteractionType(point, task);
    switch (type) {
      case GanttInteractionType.RESIZE_START:
      case GanttInteractionType.RESIZE_END:
        this.canvas.style.cursor = 'col-resize';
        break;
      case GanttInteractionType.DRAG:
        this.canvas.style.cursor = 'grab';
        break;
      default:
        this.canvas.style.cursor = 'pointer';
    }
  }

  /**
   * Event handlers
   */
  private handleClick(event: MouseEvent): void {
    const point = this.getMousePosition(event);
    const target = this.hitTestTask(point);
    this.handlers.onClick(point, target);
  }

  private handleDoubleClick(event: MouseEvent): void {
    const point = this.getMousePosition(event);
    const target = this.hitTestTask(point);
    this.handlers.onDoubleClick(point, target);
  }

  private handleRightClick(event: MouseEvent): void {
    event.preventDefault();
    const point = this.getMousePosition(event);
    const target = this.hitTestTask(point);
    this.handlers.onRightClick(point, target);
  }

  private handleMouseMove(event: MouseEvent): void {
    const point = this.getMousePosition(event);
    const target = this.hitTestTask(point);
    this.updateCursor(point, target);
    this.handlers.onMouseMove(point, target);
  }

  private handleMouseDown(event: MouseEvent): void {
    const point = this.getMousePosition(event);
    const target = this.hitTestTask(point);
    
    if (target) {
      this.canvas.style.cursor = 'grabbing';
    }
    
    this.handlers.onMouseDown(point, target);
  }

  private handleMouseUp(event: MouseEvent): void {
    const point = this.getMousePosition(event);
    const target = this.hitTestTask(point);
    this.handlers.onMouseUp(point, target);
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    this.handlers.onWheel(event.deltaY);
  }
}
