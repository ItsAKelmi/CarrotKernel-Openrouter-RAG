// =============================================================================
// CARROT CONTEXT & STORAGE MANAGEMENT SYSTEM 🥕
// Handles per-chat and per-character settings based on ST's native patterns
// =============================================================================

import { event_types, chat_metadata, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings, getContext, writeExtensionField, saveMetadataDebounced } from '../../../extensions.js';
import { CarrotDebug } from './debugger.js';
import { EXTENSION_NAME } from './carrot-state.js';

// Use consistent extension name from carrot-state.js
const extensionName = EXTENSION_NAME;

export class CarrotContextManager {
    constructor() {
        this.stContext = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Get ST context using the imported getContext function
            this.stContext = getContext();
            this.setupEventListeners();
            this.isInitialized = true;
            CarrotDebug.init('🎯 CarrotContextManager initialized successfully');
        } catch (error) {
            CarrotDebug.error('Failed to initialize CarrotContextManager:', error);
        }
    }

    setupEventListeners() {
        if (!this.stContext?.eventSource) return;

        // Listen for context changes using ST's native events
        this.stContext.eventSource.on(event_types.CHAT_CHANGED, () => {
            const context = this.getCurrentContext();
            CarrotDebug.scan(`Chat changed - Char: ${context.characterId}, Chat: ${context.chatId}, Group: ${context.groupId}`);
        });

        this.stContext.eventSource.on(event_types.CHARACTER_PAGE_LOADED, () => {
            const context = this.getCurrentContext();
            CarrotDebug.scan(`Character changed - Char: ${context.characterId}, Chat: ${context.chatId}`);
        });

        this.stContext.eventSource.on(event_types.GROUP_UPDATED, () => {
            const context = this.getCurrentContext();
            CarrotDebug.scan(`Group updated - Group: ${context.groupId}, Chat: ${context.chatId}`);
        });
    }

    getCurrentContext() {
        // Use ST's native context detection directly (same as ST's getContext())
        const freshContext = getContext();

        // Get a human-readable name for the context
        let contextName = 'Global';
        if (freshContext.groupId) {
            const groupData = freshContext.groups?.find(g => g.id === freshContext.groupId);
            contextName = groupData?.name || `Group ${freshContext.groupId}`;
        } else if (freshContext.characterId) {
            const charData = freshContext.characters?.[freshContext.characterId];
            contextName = charData?.name || `Character ${freshContext.characterId}`;
        }

        return {
            characterId: freshContext.characterId,
            chatId: freshContext.chatId,
            groupId: freshContext.groupId,
            isGroup: !!freshContext.groupId,
            characters: freshContext.characters,
            groups: freshContext.groups,
            name: contextName,
            level: freshContext.groupId ? 'chat' : (freshContext.characterId ? 'character' : 'global')
        };
    }

    isContextValid() {
        const context = this.getCurrentContext();
        return this.isInitialized && (context.characterId || context.groupId);
    }
}

export class CarrotStorageManager {
    constructor(contextManager) {
        this.contextManager = contextManager;
        this.defaultSettings = {
            enabledRepos: new Set(),
            autoScanEnabled: false,
            scanOnStartup: false,
            displaySettings: {
                showCards: true,
                groupByCharacter: true,
                compactMode: false
            }
        };
    }

    // Get settings with proper hierarchy: chat > character > global
    async getSettings() {
        const context = this.contextManager.getCurrentContext();

        // Start with global settings
        let settings = { ...this.defaultSettings };
        const globalSettings = extension_settings[extensionName] || {};
        Object.assign(settings, globalSettings);

        // Override with character-specific settings if available
        if (context.characterId && context.characters) {
            const character = context.characters[context.characterId];
            if (character?.data?.extensions?.[extensionName]) {
                const charSettings = character.data.extensions[extensionName];
                Object.assign(settings, charSettings);
                CarrotDebug.scan(`Applied character-specific settings for ${character.name}`);
            }
        }

        // Override with chat-specific settings (highest priority)
        if (context.chatId && chat_metadata?.[extensionName]) {
            const chatSettings = chat_metadata[extensionName];
            Object.assign(settings, chatSettings);
            CarrotDebug.scan(`Applied chat-specific settings for chat ${context.chatId}`);
        }

        // Convert enabledRepos to Set if it's an array
        if (Array.isArray(settings.enabledRepos)) {
            settings.enabledRepos = new Set(settings.enabledRepos);
        }

        CarrotDebug.scan('Settings hierarchy resolved:', settings);
        return settings;
    }

    // Save settings at the appropriate level
    async saveSettings(settings, level = 'global') {
        const context = this.contextManager.getCurrentContext();

        // Convert Set to Array for JSON serialization
        const serializableSettings = { ...settings };
        if (serializableSettings.enabledRepos instanceof Set) {
            serializableSettings.enabledRepos = Array.from(serializableSettings.enabledRepos);
        }

        switch (level) {
            case 'chat':
                if (!context.chatId) {
                    CarrotDebug.error('Cannot save chat settings: no active chat');
                    return false;
                }

                // Use ST's chat metadata system
                if (!chat_metadata[extensionName]) {
                    chat_metadata[extensionName] = {};
                }
                Object.assign(chat_metadata[extensionName], serializableSettings);

                // Save using ST's debounced function
                await saveMetadataDebounced();
                CarrotDebug.scan(`Saved chat-level settings for chat ${context.chatId}`);
                break;

            case 'character':
                if (!context.characterId || context.isGroup) {
                    CarrotDebug.error('Cannot save character settings: no active character or in group');
                    return false;
                }

                // Use ST's character extension system
                await writeExtensionField(context.characterId, extensionName, serializableSettings);
                CarrotDebug.scan(`Saved character-level settings for character ${context.characterId}`);
                break;

            case 'global':
            default:
                // Use ST's global extension settings
                if (!extension_settings[extensionName]) {
                    extension_settings[extensionName] = {};
                }
                Object.assign(extension_settings[extensionName], serializableSettings);

                // Save using ST's debounced function
                saveSettingsDebounced();
                CarrotDebug.scan('Saved global settings');
                break;
        }

        return true;
    }

    // Clear settings at a specific level
    async clearSettings(level) {
        const context = this.contextManager.getCurrentContext();

        switch (level) {
            case 'chat':
                if (chat_metadata[extensionName]) {
                    delete chat_metadata[extensionName];
                    await saveMetadataDebounced();
                    CarrotDebug.scan('Cleared chat-level settings');
                }
                break;

            case 'character':
                if (context.characterId) {
                    await writeExtensionField(context.characterId, extensionName, null);
                    CarrotDebug.scan('Cleared character-level settings');
                }
                break;

            case 'global':
                if (extension_settings[extensionName]) {
                    delete extension_settings[extensionName];
                    saveSettingsDebounced();
                    CarrotDebug.scan('Cleared global settings');
                }
                break;
        }
    }

    // Check if settings exist at a specific level
    hasSettingsAt(level) {
        const context = this.contextManager.getCurrentContext();

        switch (level) {
            case 'chat':
                return !!(chat_metadata?.[extensionName]);
            case 'character':
                if (!context.characterId || context.isGroup) return false;
                const character = context.characters?.[context.characterId];
                return !!(character?.data?.extensions?.[extensionName]);
            case 'global':
                return !!(extension_settings?.[extensionName]);
            default:
                return false;
        }
    }
}
