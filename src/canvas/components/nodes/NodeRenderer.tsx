import React, { useRef, useCallback, useState } from 'react';
import { NodeData, Position } from '../../types';
import { ChakraNoteNodeSimple } from './ChakraNoteNodeSimple';
import { TextNode } from './TextNode';
import { ChakraAIChatNodeSimple } from './ChakraAIChatNodeSimple';
import { ResizableNode } from './ResizableNode';

interface NodeRendererProps {
    node: NodeData;
    selected: boolean;
    onSelect: (multi: boolean) => void;
    onMove: (position: Position) => void;
    onUpdate: (updates: Partial<NodeData>) => void;
    onRemove: () => void;
    onConnectionStart: (fromPort: string) => void;
    onConnectionEnd: (toPort: string) => void;
    connectedNodes: NodeData[];
}

/**
 * NodeRenderer - Renderiza diferentes tipos de nó
 */
export const NodeRenderer: React.FC<NodeRendererProps> = ({
    node,
    selected,
    onSelect,
    onMove,
    onUpdate,
    onRemove,
    onConnectionStart,
    onConnectionEnd,
    connectedNodes
}) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef<Position>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Ultra-optimized drag handlers with pure RAF
    const animationFrameRef = useRef<number>();
    const [isDraggingState, setIsDraggingState] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Don't start drag if clicking on connection port
        const target = e.target as HTMLElement;
        if (target.classList.contains('connection-port') || target.closest('.connection-port')) {
            return;
        }
        
        e.stopPropagation();
        
        if (e.button === 0) { // Left click
            const multi = e.ctrlKey || e.metaKey;
            onSelect(multi);
            
            // Start drag
            isDragging.current = true;
            setIsDraggingState(true);
            dragStart.current = {
                x: e.clientX - node.position.x,
                y: e.clientY - node.position.y
            };
            
            // Set cursor
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }
    }, [node.position, onSelect]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging.current) {
            e.preventDefault();
            
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            
            animationFrameRef.current = requestAnimationFrame(() => {
                const newPosition = {
                    x: e.clientX - dragStart.current.x,
                    y: e.clientY - dragStart.current.y
                };
                onMove(newPosition);
            });
        }
    }, [onMove]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        setIsDraggingState(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);

    // Optimized global mouse events for drag
    React.useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                e.preventDefault();
                
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                
                animationFrameRef.current = requestAnimationFrame(() => {
                    const newPosition = {
                        x: e.clientX - dragStart.current.x,
                        y: e.clientY - dragStart.current.y
                    };
                    onMove(newPosition);
                });
            }
        };

        const handleGlobalMouseUp = () => {
            isDragging.current = false;
            setIsDraggingState(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

        if (isDraggingState) {
            document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
            document.addEventListener('mouseup', handleGlobalMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [isDraggingState, onMove]);

    // Context menu
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 6px;
            box-shadow: var(--shadow-l);
            z-index: 10000;
            min-width: 150px;
        `;

        const items = [
            { label: 'Duplicate', action: () => {/* TODO */} },
            { label: 'Copy ID', action: () => navigator.clipboard.writeText(node.id) },
            { separator: true },
            { label: 'Delete', action: onRemove, danger: true }
        ];

        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.style.cssText = 'height: 1px; background: var(--background-modifier-border); margin: 4px 0;';
                menu.appendChild(sep);
            } else {
                const menuItem = document.createElement('div');
                menuItem.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 13px;
                    color: ${item.danger ? 'var(--color-red)' : 'var(--text-normal)'};
                    transition: background 0.2s ease;
                `;
                menuItem.textContent = item.label || '';
                
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = item.danger ? 'var(--color-red)' : 'var(--background-modifier-hover)';
                    if (item.danger) menuItem.style.color = 'var(--text-on-accent)';
                });
                
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = 'transparent';
                    menuItem.style.color = item.danger ? 'var(--color-red)' : 'var(--text-normal)';
                });
                
                menuItem.addEventListener('click', () => {
                    item.action?.();
                    document.body.removeChild(menu);
                });
                
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);
        
        // Remove on outside click
        setTimeout(() => {
            const handleClick = (e: MouseEvent) => {
                if (!menu.contains(e.target as Node)) {
                    document.body.removeChild(menu);
                    document.removeEventListener('click', handleClick);
                }
            };
            document.addEventListener('click', handleClick);
        }, 10);
    }, [node.id, onRemove]);

    // Render specific node type
    const renderNodeContent = () => {
        switch (node.type) {
            case 'note':
                return (
                    <ChakraNoteNodeSimple 
                        node={node} 
                        onUpdate={onUpdate} 
                        connectedNodes={connectedNodes}
                    />
                );
            case 'text':
                return (
                    <TextNode 
                        node={node} 
                        onUpdate={onUpdate} 
                        connectedNodes={connectedNodes}
                    />
                );
            case 'ai-chat':
                return (
                    <ResizableNode
                        node={node}
                        onResize={(size) => onUpdate({ size })}
                        minWidth={350}
                        minHeight={450}
                        maxWidth={800}
                        maxHeight={900}
                    >
                        <ChakraAIChatNodeSimple 
                            node={node} 
                            onUpdate={onUpdate} 
                            connectedNodes={connectedNodes}
                        />
                    </ResizableNode>
                );
            default:
                return <div>Unknown node type</div>;
        }
    };

    console.log('Rendering node:', node.id, node.type, node.position);
    
    return (
        <div
            ref={nodeRef}
            className={`canvas-node canvas-node-${node.type} ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
            style={{
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: `${node.size.width}px`,
                minHeight: `${node.size.height}px`,
                background: '#0a0a0a',
                border: '1px solid',
                borderColor: selected ? '#FF007F' : '#1a1a1a',
                borderRadius: '12px',
                boxShadow: selected ? 
                    '0 0 0 2px #FF007F, 0 8px 32px rgba(255, 0, 127, 0.4)' : 
                    '0 4px 12px rgba(0, 0, 0, 0.8)',
                cursor: isDraggingState ? 'grabbing' : 'grab',
                transition: isDraggingState ? 'none' : 'all 0.2s ease',
                zIndex: selected ? 1000 : 1,
                transform: isDraggingState ? 'none' : (isHovered && !selected ? 'translateY(-2px)' : 'none'),
                willChange: 'transform, left, top',
                contain: 'layout style paint'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onContextMenu={handleContextMenu}
        >
            {/* Connection ports */}
            {(isHovered || selected) && (
                <>
                    {/* Output port (right) */}
                    {(node.type === 'note' || node.type === 'text') && (
                        <div
                            className="connection-port output-port"
                            style={{
                                position: 'absolute',
                                right: '-12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: node.type === 'note' ? '#FFD700' : '#FF007F',
                                border: '3px solid #000000',
                                cursor: 'crosshair',
                                zIndex: 10000,
                                boxShadow: `0 0 16px ${node.type === 'note' ? '#FFD700' : '#FF007F'}`,
                                transition: 'all 0.2s ease',
                                willChange: 'transform, box-shadow',
                                pointerEvents: 'auto'
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onConnectionStart('output');
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
                                e.currentTarget.style.boxShadow = `0 0 20px ${node.type === 'note' ? '#FFD700' : '#FF007F'}`;
                                e.currentTarget.style.background = node.type === 'note' ? '#FFED4E' : '#FF1493';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                e.currentTarget.style.boxShadow = `0 0 12px ${node.type === 'note' ? '#FFD700' : '#FF007F'}`;
                                e.currentTarget.style.background = node.type === 'note' ? '#FFD700' : '#FF007F';
                            }}
                        />
                    )}
                    
                    {/* Input port (left) */}
                    {node.type === 'ai-chat' && (
                        <div
                            className="connection-port input-port"
                            style={{
                                position: 'absolute',
                                left: '-12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#FF007F',
                                border: '3px solid #000000',
                                cursor: 'crosshair',
                                zIndex: 10000,
                                boxShadow: '0 0 16px #FF007F',
                                transition: 'all 0.2s ease',
                                willChange: 'transform, box-shadow',
                                pointerEvents: 'auto'
                            }}
                            onMouseUp={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onConnectionEnd('input');
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
                                e.currentTarget.style.boxShadow = '0 0 24px #FF007F';
                                e.currentTarget.style.background = '#FF1493';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                e.currentTarget.style.boxShadow = '0 0 16px #FF007F';
                                e.currentTarget.style.background = '#FF007F';
                            }}
                        />
                    )}
                </>
            )}
            
            {/* Node content */}
            {renderNodeContent()}
        </div>
    );
};
