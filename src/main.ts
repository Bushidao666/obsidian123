import { App, Editor, MarkdownView, Notice, Plugin, WorkspaceLeaf, ItemView } from 'obsidian';
import { FurionSettings, DEFAULT_SETTINGS, FurionSettingTab } from './settings';
import { AIProvider } from './ai/provider';
import { OpenAIProvider } from './ai/openai-provider';
import { AnthropicProvider } from './ai/anthropic-provider';
import { AICanvasView, AI_CANVAS_VIEW_TYPE } from './views/ai-canvas-view';
import { CanvasMigrator } from './migration/canvas-migrator';

export default class FurionPlugin extends Plugin {
	settings: FurionSettings;
	aiProvider: AIProvider;
	migrator: CanvasMigrator;

	async onload() {
		await this.loadSettings();

		// Initialize AI provider based on settings
		this.updateAIProvider();

		// Register the AI Canvas view
		this.registerView(
			AI_CANVAS_VIEW_TYPE,
			(leaf) => new AICanvasView(leaf, this)
		);

		// Initialize migration system
		this.migrator = new CanvasMigrator(this);

		// Add settings tab
		this.addSettingTab(new FurionSettingTab(this.app, this));

		// Register command to open AI Canvas
		this.addCommand({
			id: 'open-ai-canvas',
			name: 'Open AI Canvas Chat',
			callback: () => {
				this.openAICanvas();
			}
		});

		// Add ribbon icon
		this.addRibbonIcon('bot', 'Furion AI Chat', (evt: MouseEvent) => {
			this.openAICanvas();
		});

		// Auto-migrate legacy data if present
		setTimeout(() => {
			this.migrator.autoMigrate().catch(error => {
				console.error('Auto-migration failed:', error);
			});
		}, 2000); // Delay to ensure plugin is fully loaded

		console.log('Furion AI Canvas Chat plugin loaded with React');
	}

	onunload() {
		console.log('Furion AI Canvas Chat plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateAIProvider();
	}

	updateAIProvider() {
		switch (this.settings.aiProvider) {
			case 'openai':
				this.aiProvider = new OpenAIProvider(this.settings);
				break;
			case 'anthropic':
				this.aiProvider = new AnthropicProvider(this.settings);
				break;
			case 'custom':
				// For custom, we'll use OpenAI provider with custom endpoint
				this.aiProvider = new OpenAIProvider(this.settings);
				break;
		}
	}

	async openAICanvas() {
		// Check if AI Canvas is already open
		const existingLeaves = this.app.workspace.getLeavesOfType(AI_CANVAS_VIEW_TYPE);
		
		if (existingLeaves.length > 0) {
			// Focus existing AI Canvas
			this.app.workspace.revealLeaf(existingLeaves[0]);
		} else {
			// Create new AI Canvas
			const leaf = this.app.workspace.getLeaf('tab');
			await leaf.setViewState({
				type: AI_CANVAS_VIEW_TYPE,
				active: true
			});
		}
	}
}
