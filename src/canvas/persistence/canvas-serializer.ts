import { TFile } from 'obsidian';
import { CanvasState, SerializedCanvas, NodeData } from '../types';
import FurionPlugin from '../../main';

export interface SerializerConfig {
    plugin: FurionPlugin;
    storageFolder?: string;
}

/**
 * CanvasSerializer - Sistema de persistência para canvas React
 */
export class CanvasSerializer {
    private plugin: FurionPlugin;
    private config: Required<SerializerConfig>;

    constructor(config: SerializerConfig) {
        this.plugin = config.plugin;
        this.config = {
            storageFolder: `.obsidian/plugins/${this.plugin.manifest.id}/flows`,
            ...config
        };

        this.ensureStorageFolder();
    }

    /**
     * Serializa estado do canvas
     */
    async serializeCanvas(
        canvasState: CanvasState,
        metadata: Partial<SerializedCanvas['metadata']> = {}
    ): Promise<SerializedCanvas> {
        const now = new Date().toISOString();

        return {
            version: '3.0.0', // React version
            metadata: {
                name: metadata.name || 'Untitled Flow',
                description: metadata.description,
                createdAt: metadata.createdAt || now,
                updatedAt: now,
                author: metadata.author,
                tags: [...(metadata.tags || []), 'react']
            },
            viewport: canvasState.viewport,
            nodes: this.serializeNodes(canvasState.nodes),
            connections: Array.from(canvasState.connections.values())
        };
    }

    /**
     * Deserializa canvas
     */
    async deserializeCanvas(data: SerializedCanvas): Promise<CanvasState> {
        // Validate version
        if (!this.isVersionSupported(data.version)) {
            throw new Error(`Unsupported canvas version: ${data.version}`);
        }

        // Restore nodes
        const nodes = new Map<string, NodeData>();
        for (const nodeData of data.nodes) {
            const restoredNode = await this.restoreNodeData(nodeData);
            nodes.set(restoredNode.id, restoredNode);
        }

        // Restore connections
        const connections = new Map();
        for (const conn of data.connections) {
            connections.set(conn.id, conn);
        }

        return {
            nodes,
            connections,
            viewport: data.viewport,
            selectedNodes: new Set(),
            selectedConnections: new Set()
        };
    }

    /**
     * Serializa nós com sanitização
     */
    private serializeNodes(nodes: Map<string, NodeData>): NodeData[] {
        return Array.from(nodes.values()).map(node => {
            const serialized = { ...node };
            
            // Sanitize TFile references
            if (node.type === 'note' && (node as any).file) {
                (serialized as any).file = {
                    path: (node as any).file.path,
                    basename: (node as any).file.basename,
                    extension: (node as any).file.extension,
                    stat: (node as any).file.stat
                };
            }
            
            return serialized;
        });
    }

    /**
     * Restaura dados do nó após deserialização
     */
    private async restoreNodeData(nodeData: NodeData): Promise<NodeData> {
        const restored = { ...nodeData };

        // Restore TFile reference for note nodes
        if (nodeData.type === 'note' && (nodeData as any).file?.path) {
            const file = this.plugin.app.vault.getAbstractFileByPath((nodeData as any).file.path);
            if (file instanceof TFile) {
                (restored as any).file = file;
                
                // Reload content preview
                try {
                    const content = await this.plugin.app.vault.read(file);
                    (restored as any).content = content.substring(0, 500);
                } catch (error) {
                    console.warn(`Could not read file: ${(nodeData as any).file.path}`);
                    (restored as any).content = undefined;
                }
            } else {
                console.warn(`File not found: ${(nodeData as any).file.path}`);
                (restored as any).file = null;
            }
        }

        return restored;
    }

    /**
     * Salva canvas em arquivo
     */
    async saveToFile(canvas: SerializedCanvas, filename?: string): Promise<TFile> {
        const fileName = filename || `${canvas.metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        const filePath = `${this.config.storageFolder}/${fileName}`;

        const content = JSON.stringify(canvas, null, 2);

        try {
            const existingFile = this.plugin.app.vault.getAbstractFileByPath(filePath);
            
            if (existingFile instanceof TFile) {
                await this.plugin.app.vault.modify(existingFile, content);
                return existingFile;
            } else {
                return await this.plugin.app.vault.create(filePath, content);
            }
        } catch (error) {
            console.error('Error saving canvas:', error);
            throw new Error(`Failed to save canvas: ${error.message}`);
        }
    }

    /**
     * Carrega canvas de arquivo
     */
    async loadFromFile(file: TFile): Promise<SerializedCanvas> {
        try {
            const content = await this.plugin.app.vault.read(file);
            const data = JSON.parse(content);

            if (!this.validateStructure(data)) {
                throw new Error('Invalid canvas file structure');
            }

            return data as SerializedCanvas;
        } catch (error) {
            console.error('Error loading canvas:', error);
            throw new Error(`Failed to load canvas: ${error.message}`);
        }
    }

    /**
     * Lista canvas salvos
     */
    async listSavedCanvas(): Promise<Array<{
        file: TFile;
        metadata: SerializedCanvas['metadata'];
    }>> {
        const canvases: Array<{ file: TFile; metadata: SerializedCanvas['metadata'] }> = [];

        try {
            const folder = this.plugin.app.vault.getAbstractFileByPath(this.config.storageFolder);
            
            if (folder && 'children' in folder) {
                for (const child of (folder as any).children) {
                    if (child instanceof TFile && child.extension === 'json') {
                        try {
                            const content = await this.plugin.app.vault.read(child);
                            const data = JSON.parse(content);
                            
                            if (data.metadata) {
                                canvases.push({
                                    file: child,
                                    metadata: data.metadata
                                });
                            }
                        } catch (error) {
                            console.warn(`Error reading canvas file ${child.path}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error listing canvases:', error);
        }

        // Sort by update date (newest first)
        canvases.sort((a, b) => 
            new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        );

        return canvases;
    }

    /**
     * Valida estrutura do canvas
     */
    private validateStructure(data: any): boolean {
        if (!data || typeof data !== 'object') return false;
        if (!data.version || !data.metadata || !data.viewport) return false;
        if (!Array.isArray(data.nodes) || !Array.isArray(data.connections)) return false;
        
        return true;
    }

    /**
     * Verifica se versão é suportada
     */
    private isVersionSupported(version: string): boolean {
        const supportedVersions = ['3.0.0'];
        return supportedVersions.includes(version);
    }

    /**
     * Garante que pasta de storage existe
     */
    private async ensureStorageFolder(): Promise<void> {
        try {
            const folder = this.plugin.app.vault.getAbstractFileByPath(this.config.storageFolder);
            if (!folder) {
                await this.plugin.app.vault.createFolder(this.config.storageFolder);
            }
        } catch (error: any) {
            if (!error.message?.includes('already exists')) {
                console.error('Error creating storage folder:', error);
            }
        }
    }
}
