import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import React, { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import FurionPlugin from '../main';
import { AppProvider } from '../canvas/context/AppContext';
import { ChakraProvider } from '../canvas/providers/ChakraProvider';
import { Canvas } from '../canvas/components/Canvas';

export const AI_CANVAS_VIEW_TYPE = 'ai-canvas-view';

export class AICanvasView extends ItemView {
    plugin: FurionPlugin;
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: FurionPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return AI_CANVAS_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'AI Canvas Chat';
    }

    getIcon(): string {
        return 'bot';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('ai-canvas-container');
        
        // Ensure container has proper dimensions
        (container as HTMLElement).style.width = '100%';
        (container as HTMLElement).style.height = '100%';
        (container as HTMLElement).style.position = 'relative';
        (container as HTMLElement).style.background = 'var(--background-primary)';
        (container as HTMLElement).style.overflow = 'hidden';

        console.log('Container setup:', {
            width: (container as HTMLElement).offsetWidth,
            height: (container as HTMLElement).offsetHeight
        });

        try {
            // Mount React component
            this.root = createRoot(container);
        this.root.render(
            React.createElement(StrictMode, null,
                React.createElement(ChakraProvider, null,
                    React.createElement(AppProvider, { 
                        app: this.app, 
                        plugin: this.plugin,
                        children: React.createElement(Canvas)
                    })
                )
            )
        );

            console.log('AI Canvas React component mounted');
        } catch (error) {
            console.error('Error mounting React component:', error);
        }
    }

    async onClose() {
        this.root?.unmount();
        console.log('AI Canvas React view closed');
    }
}
