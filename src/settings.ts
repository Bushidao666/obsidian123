import { App, PluginSettingTab, Setting } from 'obsidian';
import FurionPlugin from './main';

export interface FurionSettings {
	aiProvider: 'openai' | 'anthropic' | 'custom';
	openaiApiKey: string;
	anthropicApiKey: string;
	customEndpoint: string;
	customApiKey: string;
	systemPrompt: string;
	temperature: number;
	maxTokens: number;
	contextLimit: number;
	enableHistory: boolean;
	maxHistoryMessages: number;
	autoSaveHistory: boolean;
	historyRetentionDays: number;
	enableStreaming: boolean;
	streamingIndicator: 'dots' | 'typing' | 'pulse';
	enableExport: boolean;
	exportFormat: 'json' | 'markdown' | 'csv';
}

export const DEFAULT_SETTINGS: FurionSettings = {
	aiProvider: 'openai',
	openaiApiKey: '',
	anthropicApiKey: '',
	customEndpoint: '',
	customApiKey: '',
	systemPrompt: 'You are a helpful AI assistant integrated with Obsidian notes. Use the provided context to give relevant and accurate responses.',
	temperature: 0.7,
	maxTokens: 2000,
	contextLimit: 4000,
	enableHistory: true,
	maxHistoryMessages: 50,
	autoSaveHistory: true,
	historyRetentionDays: 30,
	enableStreaming: false,
	streamingIndicator: 'typing',
	enableExport: true,
	exportFormat: 'markdown'
};

export class FurionSettingTab extends PluginSettingTab {
	plugin: FurionPlugin;

	constructor(app: App, plugin: FurionPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Furion AI Canvas Settings'});

		// AI Provider
		new Setting(containerEl)
			.setName('AI Provider')
			.setDesc('Choose your AI provider')
			.addDropdown(dropdown => dropdown
				.addOption('openai', 'OpenAI')
				.addOption('anthropic', 'Anthropic')
				.addOption('custom', 'Custom')
				.setValue(this.plugin.settings.aiProvider)
				.onChange(async (value: any) => {
					this.plugin.settings.aiProvider = value;
					await this.plugin.saveSettings();
				}));

		// API Keys
		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('Your OpenAI API key')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Anthropic API Key')
			.setDesc('Your Anthropic API key')
			.addText(text => text
				.setPlaceholder('sk-ant-...')
				.setValue(this.plugin.settings.anthropicApiKey)
				.onChange(async (value) => {
					this.plugin.settings.anthropicApiKey = value;
					await this.plugin.saveSettings();
				}));

		// Chat settings
		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc('Default system prompt for AI conversations')
			.addTextArea(text => text
				.setPlaceholder('You are a helpful AI assistant...')
				.setValue(this.plugin.settings.systemPrompt)
				.onChange(async (value) => {
					this.plugin.settings.systemPrompt = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('AI response creativity (0.0 = focused, 1.0 = creative)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc('Maximum tokens per AI response')
			.addText(text => text
				.setPlaceholder('2000')
				.setValue(String(this.plugin.settings.maxTokens))
				.onChange(async (value) => {
					this.plugin.settings.maxTokens = parseInt(value) || 2000;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Context Limit')
			.setDesc('Maximum tokens for note context')
			.addText(text => text
				.setPlaceholder('4000')
				.setValue(String(this.plugin.settings.contextLimit))
				.onChange(async (value) => {
					this.plugin.settings.contextLimit = parseInt(value) || 4000;
					await this.plugin.saveSettings();
				}));

		// History settings
		new Setting(containerEl)
			.setName('Enable Chat History')
			.setDesc('Save and restore chat conversations')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableHistory)
				.onChange(async (value) => {
					this.plugin.settings.enableHistory = value;
					await this.plugin.saveSettings();
				}));
	}
}
