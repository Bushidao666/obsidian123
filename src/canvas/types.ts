import { TFile } from 'obsidian';

/**
 * Tipos centrais do sistema de Canvas React
 */

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Viewport {
    x: number;
    y: number;
    zoom: number;
}

// Node types
export type NodeType = 'note' | 'text' | 'ai-chat';

export interface BaseNodeData {
    id: string;
    type: NodeType;
    position: Position;
    size: Size;
    selected?: boolean;
}

export interface NoteNodeData extends BaseNodeData {
    type: 'note';
    file?: TFile;
    content?: string;
}

export interface TextNodeData extends BaseNodeData {
    type: 'text';
    content: string;
    wordCount?: number;
    charCount?: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface AIChatNodeData extends BaseNodeData {
    type: 'ai-chat';
    messages: ChatMessage[];
    connectedCount: number;
}

export type NodeData = NoteNodeData | TextNodeData | AIChatNodeData;

// Connection types
export interface Connection {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    fromPort: string;
    toPort: string;
}

// Canvas state
export interface CanvasState {
    nodes: Map<string, NodeData>;
    connections: Map<string, Connection>;
    viewport: Viewport;
    selectedNodes: Set<string>;
    selectedConnections: Set<string>;
}

// Events
export interface NodeEvent {
    nodeId: string;
    event: MouseEvent | TouchEvent;
}

export interface ConnectionEvent {
    connectionId: string;
    event: MouseEvent | TouchEvent;
}

// Serialization
export interface SerializedCanvas {
    version: string;
    metadata: {
        name: string;
        description?: string;
        createdAt: string;
        updatedAt: string;
        author?: string;
        tags?: string[];
    };
    viewport: Viewport;
    nodes: NodeData[];
    connections: Connection[];
}
