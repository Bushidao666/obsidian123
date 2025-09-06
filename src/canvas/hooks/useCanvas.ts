import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasState, NodeData, Connection, Viewport, Position, NodeType, AIChatNodeData } from '../types';
import { useApp } from '../context/AppContext';

/**
 * Hook principal para gerenciar estado do canvas
 */
export const useCanvas = () => {
    const { plugin } = useApp();
    
    const [canvasState, setCanvasState] = useState<CanvasState>({
        nodes: new Map(),
        connections: new Map(),
        viewport: { x: 0, y: 0, zoom: 1 },
        selectedNodes: new Set(),
        selectedConnections: new Set()
    });

    const canvasRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef<Position>({ x: 0, y: 0 });

    // Node operations
    const addNode = useCallback((type: NodeType, position?: Position) => {
        const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const nodePosition = position || { 
            x: Math.random() * 400 + 100, 
            y: Math.random() * 300 + 100 
        };

        let nodeData: NodeData;
        switch (type) {
            case 'note':
                nodeData = {
                    id,
                    type: 'note',
                    position: nodePosition,
                    size: { width: 280, height: 180 },
                    file: undefined,
                    content: undefined
                };
                break;
            case 'text':
                nodeData = {
                    id,
                    type: 'text',
                    position: nodePosition,
                    size: { width: 250, height: 160 },
                    content: '',
                    wordCount: 0,
                    charCount: 0
                };
                break;
            case 'ai-chat':
                nodeData = {
                    id,
                    type: 'ai-chat',
                    position: nodePosition,
                    size: { width: 400, height: 600 },
                    messages: [],
                    connectedCount: 0
                };
                break;
        }

        setCanvasState(prev => {
            const newNodes = new Map(prev.nodes);
            newNodes.set(id, nodeData);
            console.log('Node added:', id, type, nodePosition);
            console.log('Total nodes:', newNodes.size);
            return {
                ...prev,
                nodes: newNodes
            };
        });

        return id;
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setCanvasState(prev => {
            const newNodes = new Map(prev.nodes);
            const newConnections = new Map(prev.connections);
            const newSelectedNodes = new Set(prev.selectedNodes);
            
            // Remove node
            newNodes.delete(nodeId);
            newSelectedNodes.delete(nodeId);
            
            // Remove connections involving this node
            for (const [connId, conn] of newConnections) {
                if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
                    newConnections.delete(connId);
                }
            }
            
            return {
                ...prev,
                nodes: newNodes,
                connections: newConnections,
                selectedNodes: newSelectedNodes
            };
        });
    }, []);

    const updateNode = useCallback((nodeId: string, updates: Partial<NodeData>) => {
        setCanvasState(prev => {
            const newNodes = new Map(prev.nodes);
            const existingNode = newNodes.get(nodeId);
            if (existingNode) {
                newNodes.set(nodeId, { ...existingNode, ...updates } as NodeData);
            }
            return { ...prev, nodes: newNodes };
        });
    }, []);

    const moveNode = useCallback((nodeId: string, position: Position) => {
        updateNode(nodeId, { position });
    }, [updateNode]);

    // Connection operations
    const addConnection = useCallback((fromNodeId: string, toNodeId: string, fromPort = 'output', toPort = 'input') => {
        if (fromNodeId === toNodeId) return null;
        
        const id = `conn-${fromNodeId}-${toNodeId}-${Date.now()}`;
        const connection: Connection = {
            id,
            fromNodeId,
            toNodeId,
            fromPort,
            toPort
        };

        setCanvasState(prev => ({
            ...prev,
            connections: new Map(prev.connections).set(id, connection)
        }));

        // Update connected count for AI chat nodes
        updateConnectedCounts();

        return id;
    }, []);

    const removeConnection = useCallback((connectionId: string) => {
        setCanvasState(prev => {
            const newConnections = new Map(prev.connections);
            newConnections.delete(connectionId);
            return { ...prev, connections: newConnections };
        });
        
        // Update connected counts
        setTimeout(updateConnectedCounts, 10);
    }, []);

    const updateConnectedCounts = useCallback(() => {
        setCanvasState(prev => {
            const newNodes = new Map(prev.nodes);
            let updated = false;

            for (const [nodeId, node] of newNodes) {
                if (node.type === 'ai-chat') {
                    const connectedCount = Array.from(prev.connections.values())
                        .filter(conn => conn.toNodeId === nodeId).length;
                    
                    if ((node as AIChatNodeData).connectedCount !== connectedCount) {
                        newNodes.set(nodeId, { 
                            ...node, 
                            connectedCount 
                        } as AIChatNodeData);
                        updated = true;
                    }
                }
            }

            return updated ? { ...prev, nodes: newNodes } : prev;
        });
    }, []);

    // Selection operations
    const selectNode = useCallback((nodeId: string, multi = false) => {
        setCanvasState(prev => {
            const newSelectedNodes = multi ? 
                new Set(prev.selectedNodes) : 
                new Set<string>();
            
            if (newSelectedNodes.has(nodeId)) {
                newSelectedNodes.delete(nodeId);
            } else {
                newSelectedNodes.add(nodeId);
            }
            
            return { ...prev, selectedNodes: newSelectedNodes };
        });
    }, []);

    const clearSelection = useCallback(() => {
        setCanvasState(prev => ({
            ...prev,
            selectedNodes: new Set(),
            selectedConnections: new Set()
        }));
    }, []);

    // Viewport operations
    const updateViewport = useCallback((viewport: Partial<Viewport>) => {
        setCanvasState(prev => ({
            ...prev,
            viewport: { ...prev.viewport, ...viewport }
        }));
    }, []);

    const zoomIn = useCallback(() => {
        updateViewport({ zoom: Math.min(canvasState.viewport.zoom * 1.2, 3) });
    }, [canvasState.viewport.zoom, updateViewport]);

    const zoomOut = useCallback(() => {
        updateViewport({ zoom: Math.max(canvasState.viewport.zoom / 1.2, 0.1) });
    }, [canvasState.viewport.zoom, updateViewport]);

    const resetZoom = useCallback(() => {
        updateViewport({ x: 0, y: 0, zoom: 1 });
    }, [updateViewport]);

    const zoomToFit = useCallback(() => {
        if (canvasState.nodes.size === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const node of canvasState.nodes.values()) {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + node.size.width);
            maxY = Math.max(maxY, node.position.y + node.size.height);
        }

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (!canvasRect) return;

        const padding = 100;
        const scaleX = (canvasRect.width - padding) / contentWidth;
        const scaleY = (canvasRect.height - padding) / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        updateViewport({
            x: canvasRect.width / 2 - centerX * scale,
            y: canvasRect.height / 2 - centerY * scale,
            zoom: scale
        });
    }, [canvasState.nodes, updateViewport]);

    // Clear all
    const clearAll = useCallback(() => {
        setCanvasState({
            nodes: new Map(),
            connections: new Map(),
            viewport: { x: 0, y: 0, zoom: 1 },
            selectedNodes: new Set(),
            selectedConnections: new Set()
        });
    }, []);

    // Connected nodes helper
    const getConnectedNodes = useCallback((nodeId: string): NodeData[] => {
        const connected: NodeData[] = [];
        
        for (const conn of canvasState.connections.values()) {
            if (conn.toNodeId === nodeId) {
                const sourceNode = canvasState.nodes.get(conn.fromNodeId);
                if (sourceNode) connected.push(sourceNode);
            }
        }
        
        return connected;
    }, [canvasState.connections, canvasState.nodes]);

    // Stats
    const getStats = useCallback(() => {
        const nodesByType = Array.from(canvasState.nodes.values()).reduce((acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            nodeCount: canvasState.nodes.size,
            connectionCount: canvasState.connections.size,
            aiNodeCount: nodesByType['ai-chat'] || 0,
            textNodeCount: nodesByType['text'] || 0,
            noteNodeCount: nodesByType['note'] || 0
        };
    }, [canvasState]);

    return {
        canvasState,
        canvasRef,
        
        // Node operations
        addNode,
        removeNode,
        updateNode,
        moveNode,
        
        // Connection operations
        addConnection,
        removeConnection,
        getConnectedNodes,
        
        // Selection
        selectNode,
        clearSelection,
        
        // Viewport
        updateViewport,
        zoomIn,
        zoomOut,
        resetZoom,
        zoomToFit,
        
        // Utilities
        clearAll,
        getStats
    };
};
