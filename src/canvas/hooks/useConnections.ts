import { useState, useCallback, useRef } from 'react';
import { Position } from '../types';

interface ConnectionState {
    isCreating: boolean;
    fromNodeId?: string;
    fromPort?: string;
    tempLine?: {
        start: Position;
        end: Position;
    };
}

/**
 * Hook para gerenciar criação de conexões via drag & drop
 */
export const useConnections = (
    onConnectionCreate: (fromNodeId: string, toNodeId: string, fromPort: string, toPort: string) => void
) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>({
        isCreating: false
    });

    const containerRef = useRef<HTMLElement | null>(null);

    const startConnection = useCallback((fromNodeId: string, fromPort: string, startPosition: Position) => {
        setConnectionState({
            isCreating: true,
            fromNodeId,
            fromPort,
            tempLine: {
                start: startPosition,
                end: startPosition
            }
        });

        // Change cursor
        if (document.body) {
            document.body.style.cursor = 'crosshair';
        }
    }, []);

    const updateTempConnection = useCallback((mousePosition: Position) => {
        if (!connectionState.isCreating || !connectionState.tempLine) return;

        setConnectionState(prev => ({
            ...prev,
            tempLine: prev.tempLine ? {
                ...prev.tempLine,
                end: mousePosition
            } : undefined
        }));
    }, [connectionState.isCreating, connectionState.tempLine]);

    const finishConnection = useCallback((toNodeId: string, toPort: string) => {
        if (!connectionState.isCreating || !connectionState.fromNodeId || !connectionState.fromPort) {
            cancelConnection();
            return;
        }

        // Don't connect to same node
        if (connectionState.fromNodeId === toNodeId) {
            cancelConnection();
            return;
        }

        // Create connection
        onConnectionCreate(connectionState.fromNodeId, toNodeId, connectionState.fromPort, toPort);
        
        // Reset state
        setConnectionState({ isCreating: false });
        
        // Reset cursor
        if (document.body) {
            document.body.style.cursor = 'default';
        }
    }, [connectionState, onConnectionCreate]);

    const cancelConnection = useCallback(() => {
        setConnectionState({ isCreating: false });
        
        // Reset cursor
        if (document.body) {
            document.body.style.cursor = 'default';
        }
    }, []);

    // Generate path for temporary connection line
    const getTempConnectionPath = useCallback(() => {
        if (!connectionState.tempLine) return '';

        const { start, end } = connectionState.tempLine;
        const dx = end.x - start.x;
        
        // Control points for smooth curve
        const cp1x = start.x + Math.max(50, Math.abs(dx) * 0.5);
        const cp1y = start.y;
        const cp2x = end.x - Math.max(50, Math.abs(dx) * 0.5);
        const cp2y = end.y;

        return `M ${start.x} ${start.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${end.x} ${end.y}`;
    }, [connectionState.tempLine]);

    return {
        connectionState,
        startConnection,
        updateTempConnection,
        finishConnection,
        cancelConnection,
        getTempConnectionPath
    };
};
