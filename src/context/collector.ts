import { TFile } from 'obsidian';
import FurionPlugin from '../main';

/**
 * ContextCollector - Coleta e processa contexto de notas
 */
export class ContextCollector {
    private plugin: FurionPlugin;

    constructor(plugin: FurionPlugin) {
        this.plugin = plugin;
    }

    /**
     * Processa múltiplas notas e retorna contexto combinado
     */
    async processNotes(files: TFile[]): Promise<string> {
        const contexts: string[] = [];

        for (const file of files) {
            try {
                const content = await this.plugin.app.vault.read(file);
                const processed = this.processNoteContent(file, content);
                contexts.push(processed);
            } catch (error) {
                console.error(`Error processing note ${file.path}:`, error);
                contexts.push(`## ${file.basename}\n\n*Error reading file*`);
            }
        }

        return contexts.join('\n\n---\n\n');
    }

    /**
     * Processa conteúdo de uma nota individual
     */
    private processNoteContent(file: TFile, content: string): string {
        // Basic processing - could be enhanced with metadata extraction
        const header = `## ${file.basename}\n*Source: ${file.path}*\n`;
        
        // Remove excessive whitespace
        const cleanContent = content
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        return header + '\n' + cleanContent;
    }

    /**
     * Trunca contexto para limite de tokens
     */
    truncateToTokenLimit(content: string, maxTokens: number): string {
        // Simple approximation: ~4 chars per token
        const maxChars = maxTokens * 4;
        
        if (content.length <= maxChars) {
            return content;
        }

        // Truncate at word boundary
        const truncated = content.substring(0, maxChars);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > 0 ? 
            truncated.substring(0, lastSpace) + '\n\n...(truncated)' :
            truncated + '\n\n...(truncated)';
    }

    /**
     * Estima número de tokens
     */
    estimateTokens(text: string): number {
        // Simple estimation: ~4 chars per token
        return Math.ceil(text.length / 4);
    }
}
