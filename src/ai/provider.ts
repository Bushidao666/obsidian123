/**
 * Base interface for AI providers
 */
export interface AIProvider {
    /**
     * Complete a single prompt
     */
    complete(prompt: string, systemPrompt?: string): Promise<string>;
    
    /**
     * Chat with conversation history
     */
    chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    
    /**
     * Stream completion (optional)
     */
    streamComplete?(prompt: string, systemPrompt?: string, onChunk?: (chunk: string) => void): Promise<string>;
}
