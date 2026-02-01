import { CanvasRect } from '../../canvas/interfaces/GanttCanvas'

/**
 * Interface for Work Breakdown Structure node
 */
export interface WBSNode extends CanvasRect {
  id: string;
  name: string;
  wbsCode: string; // Hierarchical code like 1.1.2
  level: number;
  parentId?: string;
  isExpanded: boolean;
  isSummary: boolean;
  progress: number;
  startDate: Date;
  endDate: Date;
  duration: string;
  critical: boolean;
  color?: string;
  childrenIds: string[];
}

/**
 * Data structure for the complete WBS diagram
 */
export interface WBSDiagramData {
  nodes: WBSNode[];
  viewport: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };
  selectedNodeId?: string;
  hoveredNodeId?: string;
}

/**
 * Interface for WBS layout algorithm
 */
export interface IWBSLayoutStrategy {
  calculateLayout(nodes: WBSNode[]): WBSNode[];
}


