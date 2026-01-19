import { 
  CanvasContext, 
  CanvasEventHandlers,
  GanttCanvasData
} from '../interfaces/GanttCanvas';
import { CanvasEventHandler } from './CanvasEventHandler';
import { logger } from '@/utils/logger';

/**
 * Main Gantt Canvas Engine
 * Handles all canvas rendering and interactions
 */
export class GanttCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: GanttCanvasData;
  private eventHandler: CanvasEventHandler;
  private isInitialized = false;

  constructor(canvas: HTMLCanvasElement, handlers: Partial<CanvasEventHandlers> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.data = this.createEmptyData();
    this.eventHandler = new CanvasEventHandler(canvas, handlers);
  }

  /**
   * Initialize canvas with dimensions
   */
  initialize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.eventHandler.setupEventListeners();
    this.isInitialized = true;
    logger.debug('Gantt canvas initialized', { width, height }, 'GanttCanvasEngine');
  }

  /**
   * Update canvas data
   */
  updateData(data: Partial<GanttCanvasData>): void {
    this.data = { ...this.data, ...data };
    this.eventHandler.setEngineData(this.data);
  }

  /**
   * Update event handlers without re-initializing
   */
  updateHandlers(handlers: Partial<CanvasEventHandlers>): void {
    this.eventHandler.updateHandlers(handlers);
  }

  /**
   * Get current engine data
   */
  public getData(): GanttCanvasData {
    return this.data;
  }

  /**
   * Render complete Gantt chart
   */
  render(): void {
    if (!this.isInitialized) return;

    const context = this.createCanvasContext();
    this.clearCanvas(context);
    
    // Render layers in order
    const sortedLayers = [...this.data.layers].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const layer of sortedLayers) {
      if (layer.visible) {
        try {
          layer.render(context, this.data);
        } catch (error) {
          logger.error(`Failed to render layer: ${layer.name}`, error, 'GanttCanvasEngine');
        }
      }
    }
  }

  /**
   * Get canvas rendering context
   */
  private createCanvasContext(): CanvasContext {
    return {
      ctx: this.ctx,
      width: this.canvas.width,
      height: this.canvas.height,
      scale: this.data.viewport.scale,
      offsetX: this.data.viewport.offsetX,
      offsetY: this.data.viewport.offsetY
    };
  }

  /**
   * Clear canvas
   */
  private clearCanvas(context: CanvasContext): void {
    context.ctx.clearRect(0, 0, context.width, context.height);
    context.ctx.fillStyle = '#ffffff';
    context.ctx.fillRect(0, 0, context.width, context.height);
  }

  /**
   * Create empty data structure
   */
  private createEmptyData(): GanttCanvasData {
    return {
      tasks: [],
      timeline: {
        startDate: new Date(),
        endDate: new Date(),
        unit: 'day',
        intervals: [],
        scale: 1
      },
      viewport: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        minScale: 0.5,
        maxScale: 3
      },
      layers: []
    };
  }

  /**
   * Destroy canvas engine
   */
  destroy(): void {
    this.eventHandler.removeEventListeners();
    this.isInitialized = false;
    logger.debug('Gantt canvas destroyed', {}, 'GanttCanvasEngine');
  }
}

