import { requestUrl } from 'obsidian';
import { AIProvider } from './provider';
import { FurionSettings } from '../settings';

export class OpenAIProvider implements AIProvider {
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
        if (!this.settings.openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const endpoint = this.settings.aiProvider === 'custom' ? 
            this.settings.customEndpoint : 
            'https://api.openai.com/v1/chat/completions';

        const apiKey = this.settings.aiProvider === 'custom' ? 
            this.settings.customApiKey : 
            this.settings.openaiApiKey;

        try {
            const response = await requestUrl({
                url: endpoint,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: options?.temperature ?? this.settings.temperature,
                    max_tokens: options?.maxTokens ?? this.settings.maxTokens
                })
            });

            const data = response.json;
            
            if (data.error) {
                throw new Error(data.error.message || 'OpenAI API error');
            }

            return data.choices[0]?.message?.content || 'No response generated';
        } catch (error: any) {
            console.error('OpenAI API error:', error);
            throw new Error(`OpenAI request failed: ${error.message}`);
        }
    }
}
