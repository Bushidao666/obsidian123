import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useConnections } from '../hooks/useConnections';
import { NodeRenderer } from './nodes/NodeRenderer';
import { ConnectionRenderer } from './connections/ConnectionRenderer';
import { VercelToolbar } from './ui/VercelToolbar';
import { Position } from '../types';

interface CanvasProps {
    className?: string;
}

/**
 * Canvas principal - Container para todo o sistema de nós
 */
export const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
    const canvas = useCanvas();
    const connections = useConnections(canvas.addConnection);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const lastPanPosition = useRef<Position>({ x: 0, y: 0 });

    // Load Inter font
    useEffect(() => {
        // Add Inter font from Google Fonts
        if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Inter"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    // Pan handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle click or Ctrl+click
            e.preventDefault();
            isPanning.current = true;
            lastPanPosition.current = { x: e.clientX, y: e.clientY };
            
            if (containerRef.current) {
                containerRef.current.style.cursor = 'grabbing';
            }
        } else if (e.target === e.currentTarget) {
            // Click on empty space - clear selection
            canvas.clearSelection();
        }
    }, [canvas]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning.current) {
            e.preventDefault();
            const deltaX = e.clientX - lastPanPosition.current.x;
            const deltaY = e.clientY - lastPanPosition.current.y;
            
            canvas.updateViewport({
                x: canvas.canvasState.viewport.x + deltaX,
                y: canvas.canvasState.viewport.y + deltaY
            });
            
            lastPanPosition.current = { x: e.clientX, y: e.clientY };
        }
        
        // Update temp connection
        if (connections.connectionState.isCreating) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                const { viewport } = canvas.canvasState;
                const mousePos = {
                    x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
                    y: (e.clientY - rect.top - viewport.y) / viewport.zoom
                };
                connections.updateTempConnection(mousePos);
            }
        }
    }, [canvas, connections]);

    const handleMouseUp = useCallback(() => {
        isPanning.current = false;
        if (containerRef.current) {
            containerRef.current.style.cursor = 'default';
        }
        
        // Cancel connection if clicking on empty space
        if (connections.connectionState.isCreating) {
            connections.cancelConnection();
        }
    }, [connections]);

    // Zoom handler
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const { viewport } = canvas.canvasState;
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * scaleFactor));
        
        // Zoom to mouse position
        const zoomRatio = newZoom / viewport.zoom;
        const newX = mouseX - (mouseX - viewport.x) * zoomRatio;
        const newY = mouseY - (mouseY - viewport.y) * zoomRatio;
        
        canvas.updateViewport({
            x: newX,
            y: newY,
            zoom: newZoom
        });
    }, [canvas]);

    // Global mouse events
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            isPanning.current = false;
            if (containerRef.current) {
                containerRef.current.style.cursor = 'default';
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target !== document.body) return; // Only when canvas is focused
            
            switch (e.key) {
                case 'Delete':
                    e.preventDefault();
                    canvas.canvasState.selectedNodes.forEach(nodeId => {
                        canvas.removeNode(nodeId);
                    });
                    break;
                case '1':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        canvas.addNode('note');
                    }
                    break;
                case '2':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        canvas.addNode('text');
                    }
                    break;
                case '3':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        canvas.addNode('ai-chat');
                    }
                    break;
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        canvas.resetZoom();
                    }
                    break;
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        canvas.zoomIn();
                    }
                    break;
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        canvas.zoomOut();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canvas]);

    const { viewport } = canvas.canvasState;
    const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

    console.log('Canvas component rendering...');
    
    return (
        <div className={`canvas-container ${className}`} style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#000000', // Preto sólido Bushido
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#ffffff',
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"', // Inter font features
            fontOpticalSizing: 'auto',
            letterSpacing: '-0.01em'
        }}>
            <VercelToolbar canvas={canvas} />
            
            <div
                ref={containerRef}
                className="canvas-viewport"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    width: '100%',
                    height: '100%',
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#000000', // Preto sólido
                    cursor: isPanning.current ? 'grabbing' : 'default'
                }}
            >
                {/* Debug element to ensure canvas is visible */}
                <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: 'linear-gradient(135deg, #FF007F, #FFD700)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    zIndex: 10000,
                    fontSize: '11px',
                    fontWeight: 700,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 4px 12px rgba(255, 0, 127, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    ⚡ BUSHIDO CANVAS - Nodes: {canvas.canvasState.nodes.size}
                </div>
                
                {/* Grid background */}
                <div 
                    className="canvas-grid"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `
                            linear-gradient(rgba(255, 0, 127, 0.2) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 0, 127, 0.2) 1px, transparent 1px),
                            radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 2px, transparent 2px)
                        `,
                        backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px, ${20 * viewport.zoom}px ${20 * viewport.zoom}px, ${100 * viewport.zoom}px ${100 * viewport.zoom}px`,
                        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                        opacity: 0.4,
                        pointerEvents: 'none'
                    }}
                />
                
                {/* Canvas content */}
                <div 
                    className="canvas-content"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform,
                        transformOrigin: '0 0'
                    }}
                >
                    {/* Connections */}
                    <svg
                        className="canvas-connections"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    >
                        {Array.from(canvas.canvasState.connections.values()).map(connection => (
                            <ConnectionRenderer
                                key={connection.id}
                                connection={connection}
                                nodes={canvas.canvasState.nodes}
                                onRemove={() => canvas.removeConnection(connection.id)}
                            />
                        ))}
                        
                        {/* Temporary connection while dragging */}
                        {connections.connectionState.isCreating && connections.connectionState.tempLine && (
                            <>
                                <defs>
                                    <linearGradient id="tempConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style={{ stopColor: '#FF007F', stopOpacity: 0.9 }} />
                                        <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.7 }} />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={connections.getTempConnectionPath()}
                                    fill="none"
                                    stroke="url(#tempConnectionGradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray="16 8"
                                    opacity="0.9"
                                    style={{ 
                                        pointerEvents: 'none',
                                        filter: 'drop-shadow(0 0 12px rgba(255, 0, 127, 0.6))',
                                        animation: 'dashFlow 2s linear infinite'
                                    }}
                                />
                                <style>{`
                                    @keyframes dashFlow {
                                        0% { stroke-dashoffset: 24; }
                                        100% { stroke-dashoffset: 0; }
                                    }
                                `}</style>
                            </>
                        )}
                    </svg>
                    
                    {/* Nodes */}
                    <div className="canvas-nodes" style={{ position: 'relative', zIndex: 2 }}>
                        {(() => {
                            console.log('Rendering nodes:', canvas.canvasState.nodes.size);
                            return Array.from(canvas.canvasState.nodes.values()).map(node => (
                            <NodeRenderer
                                key={node.id}
                                node={node}
                                selected={canvas.canvasState.selectedNodes.has(node.id)}
                                onSelect={(multi) => canvas.selectNode(node.id, multi)}
                                onMove={(position) => canvas.moveNode(node.id, position)}
                                onUpdate={(updates) => canvas.updateNode(node.id, updates)}
                                onRemove={() => canvas.removeNode(node.id)}
                                onConnectionStart={(fromPort) => {
                                    const rect = containerRef.current?.getBoundingClientRect();
                                    if (rect) {
                                        const { viewport } = canvas.canvasState;
                                        const startPos = {
                                            x: (node.position.x + node.size.width) * viewport.zoom + viewport.x,
                                            y: (node.position.y + node.size.height / 2) * viewport.zoom + viewport.y
                                        };
                                        connections.startConnection(node.id, fromPort, startPos);
                                    }
                                }}
                                onConnectionEnd={(toPort) => {
                                    if (connections.connectionState.isCreating) {
                                        connections.finishConnection(node.id, toPort);
                                    }
                                }}
                                connectedNodes={canvas.getConnectedNodes(node.id)}
                            />
                        ));
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};
