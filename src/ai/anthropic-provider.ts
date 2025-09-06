import { requestUrl } from 'obsidian';
import { AIProvider } from './provider';
import { FurionSettings } from '../settings';

export class AnthropicProvider implements AIProvider {
    private settings: FurionSettings;

    constructor(settings: FurionSettings) {
        this.settings = settings;
    }

    async complete(prompt: string, systemPrompt?: string): Promise<string> {
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        return this.chat(messages);
    }

    async chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<string> {
        if (!this.settings.anthropicApiKey) {
            throw new Error('Anthropic API key not configured');
        }

        // Separate system message from conversation
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const conversationMessages = messages.filter(m => m.role !== 'system');

        try {
            const response = await requestUrl({
                url: 'https://api.anthropic.com/v1/messages',
                method: 'POST',
                headers: {
                    'x-api-key': this.settings.anthropicApiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    system: systemMessage,
                    messages: conversationMessages,
                    temperature: options?.temperature ?? this.settings.temperature,
                    max_tokens: options?.maxTokens ?? this.settings.maxTokens
                })
            });

            const data = response.json;
            
            if (data.error) {
                throw new Error(data.error.message || 'Anthropic API error');
            }

            return data.content[0]?.text || 'No response generated';
        } catch (error: any) {
            console.error('Anthropic API error:', error);
            throw new Error(`Anthropic request failed: ${error.message}`);
        }
    }
}
