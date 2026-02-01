/**
 * Interfaces for Network Diagram (PERT chart)
 * Following Clean Architecture and SOLID principles
 */

import { CanvasRect } from '../../canvas/interfaces/GanttCanvas';

/**
 * Type of node in network diagram
 */
export enum NetworkNodeType {
  TASK = 'task',
  MILESTONE = 'milestone',
  SUMMARY = 'summary'
}

/**
 * Data for a single node in the network diagram
 */
export interface NetworkNode extends CanvasRect {
  id: string;
  name: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  type: NetworkNodeType;
  critical: boolean;
  progress: number;
  isPinned?: boolean; // If true, node won't be moved by auto-layout
  displayId?: string; // Short ID like "1", "2"
}

/**
 * Dependency connection between nodes
 */
export interface NetworkConnection {
  id: string;
  fromId: string;
  toId: string;
  type: 'fs' | 'ss' | 'ff' | 'sf';
  critical: boolean;
  isDraft?: boolean; // For drawing connection currently being created
}

/**
 * Complete data for network diagram
 */
export interface NetworkDiagramData {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  viewport: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };
  selectedNodeId?: string;
  hoveredNodeId?: string;
  draggingNodeId?: string;
  linkingFromId?: string; // ID of node where connection drag started
}

/**
 * Strategy for graph layout calculation
 */
export interface NetworkLayoutStrategy {
  calculateLayout(nodes: NetworkNode[], connections: NetworkConnection[]): NetworkNode[];
}


