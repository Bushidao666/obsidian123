import React, { useState } from 'react';
import { Icon } from '@chakra-ui/react';
import { LuX, LuTrash2 } from 'react-icons/lu';
import { Connection, NodeData } from '../../types';

interface ConnectionRendererProps {
    connection: Connection;
    nodes: Map<string, NodeData>;
    onRemove: () => void;
}

/**
 * ConnectionRenderer - Renderiza conexões entre nós
 */
export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({ 
    connection, 
    nodes, 
    onRemove 
}) => {
    const fromNode = nodes.get(connection.fromNodeId);
    const toNode = nodes.get(connection.toNodeId);
    const [isHovered, setIsHovered] = useState(false);

    if (!fromNode || !toNode) return null;

    // Calculate connection points
    const fromPoint = {
        x: fromNode.position.x + fromNode.size.width, // Right edge
        y: fromNode.position.y + fromNode.size.height / 2 // Middle
    };

    const toPoint = {
        x: toNode.position.x, // Left edge
        y: toNode.position.y + toNode.size.height / 2 // Middle
    };

    // Generate smooth curve path
    const generatePath = () => {
        const dx = toPoint.x - fromPoint.x;
        const dy = toPoint.y - fromPoint.y;
        
        // Control points for smooth curve
        const cp1x = fromPoint.x + Math.max(50, Math.abs(dx) * 0.5);
        const cp1y = fromPoint.y;
        const cp2x = toPoint.x - Math.max(50, Math.abs(dx) * 0.5);
        const cp2y = toPoint.y;

        return `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${toPoint.x} ${toPoint.y}`;
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
    };

    // Calculate midpoint for delete button
    const midPoint = {
        x: (fromPoint.x + toPoint.x) / 2,
        y: (fromPoint.y + toPoint.y) / 2
    };

    return (
        <g className="connection">
            {/* Animated flowing dashed line */}
            <defs>
                {/* Gradient for the line */}
                <linearGradient id={`connectionGradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#FF007F', stopOpacity: 0.8 }} />
                    <stop offset="50%" style={{ stopColor: '#FF007F', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.9 }} />
                </linearGradient>
                
                {/* Arrow head with gradient */}
                <marker
                    id={`arrowhead-${connection.id}`}
                    markerWidth="12"
                    markerHeight="8"
                    refX="11"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <polygon
                        points="0 0, 12 4, 0 8"
                        fill={`url(#connectionGradient-${connection.id})`}
                        style={{
                            filter: 'drop-shadow(0 0 3px rgba(255, 0, 127, 0.6))'
                        }}
                    />
                </marker>
            </defs>
            
            {/* Main flowing connection line */}
            <path
                d={generatePath()}
                fill="none"
                stroke={`url(#connectionGradient-${connection.id})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="12 8"
                markerEnd={`url(#arrowhead-${connection.id})`}
                style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    filter: 'drop-shadow(0 0 6px rgba(255, 0, 127, 0.4))',
                    animation: 'dashFlow 3s linear infinite'
                }}
                onDoubleClick={handleDoubleClick}
                onMouseEnter={(e) => {
                    setIsHovered(true);
                    e.currentTarget.style.strokeWidth = '4';
                    e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(255, 0, 127, 0.8))';
                    e.currentTarget.style.strokeDasharray = '16 6';
                    e.currentTarget.style.animationDuration = '2s';
                }}
                onMouseLeave={(e) => {
                    setIsHovered(false);
                    e.currentTarget.style.strokeWidth = '3';
                    e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(255, 0, 127, 0.4))';
                    e.currentTarget.style.strokeDasharray = '12 8';
                    e.currentTarget.style.animationDuration = '3s';
                }}
            />
            
            {/* Hit area for easier clicking */}
            <path
                d={generatePath()}
                fill="none"
                stroke="transparent"
                strokeWidth="24"
                strokeLinecap="round"
                style={{ cursor: 'pointer' }}
                onDoubleClick={handleDoubleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
            
            {/* Delete button on hover */}
            {isHovered && (
                <g>
                    {/* Delete button background */}
                    <circle
                        cx={midPoint.x}
                        cy={midPoint.y}
                        r="12"
                        fill="#FF6B6B"
                        stroke="#000000"
                        strokeWidth="2"
                        style={{
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 2px 8px rgba(255, 107, 107, 0.4))',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={handleDeleteClick}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.setAttribute('fill', '#FF5252');
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.setAttribute('fill', '#FF6B6B');
                        }}
                    />
                    
                    {/* Delete icon */}
                    <foreignObject
                        x={midPoint.x - 8}
                        y={midPoint.y - 8}
                        width="16"
                        height="16"
                        style={{ pointerEvents: 'none' }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            color: 'white',
                            fontSize: '12px'
                        }}>
                            ×
                        </div>
                    </foreignObject>
                </g>
            )}
            
            {/* Subtle glow effect */}
            <path
                d={generatePath()}
                fill="none"
                stroke="#FF007F"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="12 8"
                style={{
                    pointerEvents: 'none',
                    opacity: 0.3,
                    filter: 'blur(2px)',
                    animation: 'dashFlow 3s linear infinite reverse'
                }}
            />
            
            {/* CSS Animation for flowing effect */}
            <style>{`
                @keyframes dashFlow {
                    0% {
                        stroke-dashoffset: 20;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </g>
    );
};
