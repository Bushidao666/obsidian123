import React, { useRef, useState, useCallback } from 'react';
import { NodeData, Position } from '../../types';

interface ResizableNodeProps {
    node: NodeData;
    children: React.ReactNode;
    onResize: (size: { width: number; height: number }) => void;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}

/**
 * Wrapper para tornar nós redimensionáveis
 */
export const ResizableNode: React.FC<ResizableNodeProps> = ({
    node,
    children,
    onResize,
    minWidth = 200,
    minHeight = 150,
    maxWidth = 600,
    maxHeight = 800
}) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<string>('');
    const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({
        x: 0, y: 0, width: 0, height: 0
    });

    const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        e.preventDefault();
        
        setIsResizing(true);
        setResizeDirection(direction);
        
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            width: node.size.width,
            height: node.size.height
        };

        document.body.style.cursor = `${direction}-resize`;
    }, [node.size]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;

        if (resizeDirection.includes('e')) {
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.current.width + deltaX));
        }
        if (resizeDirection.includes('s')) {
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.current.height + deltaY));
        }
        if (resizeDirection.includes('w')) {
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.current.width - deltaX));
        }
        if (resizeDirection.includes('n')) {
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.current.height - deltaY));
        }

        onResize({ width: newWidth, height: newHeight });
    }, [isResizing, resizeDirection, onResize, minWidth, minHeight, maxWidth, maxHeight]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        setResizeDirection('');
        document.body.style.cursor = 'default';
    }, []);

    // Global mouse events for resize
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    const resizeHandles = [
        { direction: 'se', cursor: 'se-resize', bottom: '-5px', right: '-5px' },
        { direction: 'sw', cursor: 'sw-resize', bottom: '-5px', left: '-5px' },
        { direction: 's', cursor: 's-resize', bottom: '-5px', left: '50%', transform: 'translateX(-50%)' }
    ];

    return (
        <div
            ref={nodeRef}
            style={{
                position: 'relative',
                width: `${node.size.width}px`,
                height: `${node.size.height}px`
            }}
        >
            {children}
            
            {/* Modern Resize handles */}
            {resizeHandles.map(({ direction, cursor, ...style }) => (
                <div
                    key={direction}
                    style={{
                        position: 'absolute',
                        width: '12px',
                        height: '12px',
                        background: '#FFD700',
                        borderRadius: '3px',
                        cursor: cursor,
                        opacity: 0.7,
                        transition: 'all 0.2s ease',
                        zIndex: 500,
                        border: '2px solid #000000',
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                        ...style
                    }}
                    onMouseDown={(e) => handleResizeStart(e, direction)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = (style.transform || '') + ' scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                        e.currentTarget.style.transform = style.transform || '';
                    }}
                />
            ))}
            
            {/* Modern Resize overlay */}
            {isResizing && (
                <div
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        border: '2px dashed #FF007F',
                        background: 'rgba(255, 0, 127, 0.05)',
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 999,
                        backdropFilter: 'blur(1px)'
                    }}
                />
            )}
        </div>
    );
};
