import React from 'react';

/**
 * Секция масштаба
 * Отображает текущий уровень масштабирования
 */
interface ZoomSectionProps {
  zoom: number;
  onZoomChange?: (zoom: number) => void;
}

export const ZoomSection: React.FC<ZoomSectionProps> = ({ zoom, onZoomChange }) => {
  const handleZoomIn = React.useCallback(() => {
    const newZoom = Math.min(500, zoom + 10);
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomOut = React.useCallback(() => {
    const newZoom = Math.max(10, zoom - 10);
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomReset = React.useCallback(() => {
    onZoomChange?.(100);
  }, [onZoomChange]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Масштаб:</span>
      <span className="font-mono min-w-[3rem] text-center">{zoom}%</span>
      <div className="flex gap-1">
        <button
          onClick={handleZoomOut}
          className="px-1 py-0.5 text-xs border border-border rounded hover:bg-muted"
          title="Уменьшить"
        >
          −
        </button>
        <button
          onClick={handleZoomReset}
          className="px-1 py-0.5 text-xs border border-border rounded hover:bg-muted"
          title="Сбросить"
        >
          ⟲
        </button>
        <button
          onClick={handleZoomIn}
          className="px-1 py-0.5 text-xs border border-border rounded hover:bg-muted"
          title="Увеличить"
        >
          +
        </button>
      </div>
    </div>
  );
};

