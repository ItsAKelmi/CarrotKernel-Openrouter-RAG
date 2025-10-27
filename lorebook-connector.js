// =============================================================================
// CARROT LOREBOOK CONNECTOR
// Character & Chat Level Lorebook Connection System
// =============================================================================

import { characters, this_chid, chat_metadata, saveSettingsDebounced, saveCharacterDebounced } from '../../../../script.js';
import { world_info, world_names, selected_world_info } from '../../../world-info.js';
import { saveMetadataDebounced, extension_settings } from '../../../extensions.js';
import { getCharaFilename } from '../../../utils.js';
import { characterRepoBooks, tagLibraries, EXTENSION_NAME } from './carrot-state.js';

// =============================================================================
// STATE
// =============================================================================

let connectionPopup = null;
let currentConnections = {}; // { lorebookName: { scope: 'none'|'character'|'chat', isPrimary: false } }

// =============================================================================
// MAIN API
// =============================================================================

export class CarrotLorebookConnector {
    /**
     * Open the lorebook connection popup
     */
    static open() {
        if (!this_chid && this_chid !== 0) {
            toastr.warning('Please select a character first');
            return;
        }

        createConnectionPopup();
        loadCurrentConnections();
        renderLorebookList();
    }

    /**
     * Close the popup
     */
    static close() {
        if (connectionPopup) {
            connectionPopup.remove();
            connectionPopup = null;
        }
    }

    /**
     * Get all lorebook connections for a character
     * @param {number} chid - Character ID
     * @returns {Array} Array of connection objects
     */
    static getCharacterConnections(chid) {
        if (!chid && chid !== 0) return [];

        const character = characters[chid];
        if (!character) return [];

        const connections = [];

        // Primary lorebook from character.data.extensions.world
        const primaryBook = character.data?.extensions?.world;
        if (primaryBook) {
            connections.push({
                name: primaryBook,
                scope: 'character',
                isPrimary: true,
                type: 'primary'
            });
        }

        // Additional character-scoped books from world_info.charLore[].extraBooks
        const charFilename = getCharaFilename(chid);
        const charLore = world_info.charLore || [];
        const charEntry = charLore.find(entry => entry.name === charFilename);
        if (charEntry && Array.isArray(charEntry.extraBooks)) {
            charEntry.extraBooks.forEach(bookName => {
                if (bookName !== primaryBook) { // Don't duplicate primary
                    connections.push({
                        name: bookName,
                        scope: 'character',
                        isPrimary: false,
                        type: 'additional'
                    });
                }
            });
        }

        // Chat-scoped books from chat_metadata.carrot_chat_books
        const chatBooks = chat_metadata.carrot_chat_books || [];
        chatBooks.forEach(bookName => {
            connections.push({
                name: bookName,
                scope: 'chat',
                isPrimary: false,
                type: 'chat'
            });
        });

        return connections;
    }
}

// =============================================================================
// POPUP CREATION
// =============================================================================

function createConnectionPopup() {
    // Remove existing popup if any
    if (connectionPopup) {
        connectionPopup.remove();
    }

    // Get context info
    const character = characters[this_chid];
    const characterName = character?.name || 'Unknown Character';
    const chatName = character?.chat || 'No Chat Selected';

    // Create popup overlay
    const html = `
        <div class="carrot-connection-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;">
            <div class="carrot-connection-popup" style="
                width: 900px;
                max-width: 95vw;
                max-height: 85vh;
                background: var(--SmartThemeBlurTintColor);
                border: 3px solid var(--SmartThemeEmColor);
                border-radius: 16px;
                box-shadow: 0 25px 80px rgba(0,0,0,0.6);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease;">

                <!-- Header -->
                <div class="carrot-connection-header" style="
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
                    border-bottom: 2px solid rgba(139, 92, 246, 0.3);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;">
                    <div>
                        <h3 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 600; color: var(--SmartThemeBodyColor);">
                            🐰 Lorebook Connections
                        </h3>
                        <p style="margin: 0; font-size: 13px; opacity: 0.7;">
                            Character: <strong style="color: var(--SmartThemeBodyColor);">${characterName}</strong> • Chat: <strong style="color: var(--SmartThemeBodyColor);">${chatName}</strong>
                        </p>
                    </div>
                    <button class="carrot-connection-close" style="
                        background: rgba(239, 68, 68, 0.15);
                        border: 1.5px solid rgba(239, 68, 68, 0.4);
                        border-radius: 8px;
                        color: #ef4444;
                        padding: 8px 12px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.2s ease;">
                        <i class="fa-solid fa-times"></i> Close
                    </button>
                </div>

                <!-- Search -->
                <div style="padding: 16px 24px; border-bottom: 1px solid var(--SmartThemeBorderColor);">
                    <input type="text" id="carrot-connection-search" placeholder="🔍 Search lorebooks..." style="
                        width: 100%;
                        padding: 12px 16px;
                        background: var(--black30);
                        border: 2px solid var(--SmartThemeBorderColor);
                        border-radius: 8px;
                        color: var(--SmartThemeBodyColor);
                        font-size: 14px;
                        transition: all 0.2s ease;">
                </div>

                <!-- Lorebook List -->
                <div id="carrot-connection-list" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px;">
                    <div class="carrot-loading-state" style="
                        text-align: center;
                        padding: 40px;
                        opacity: 0.6;">
                        <div class="carrot-spinner" style="
                            width: 40px;
                            height: 40px;
                            border: 3px solid rgba(139, 92, 246, 0.2);
                            border-top-color: #8b5cf6;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 16px;"></div>
                        <p>Loading lorebooks...</p>
                    </div>
                </div>

                <!-- Footer / Actions -->
                <div style="
                    padding: 16px 24px;
                    background: var(--black30);
                    border-top: 2px solid var(--SmartThemeBorderColor);
                    display: flex;
                    gap: 12px;">
                    <button id="carrot-connection-apply" style="
                        flex: 1;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                        <i class="fa-solid fa-check"></i> Apply Connections
                    </button>
                </div>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .carrot-connection-close:hover {
                background: rgba(239, 68, 68, 0.25) !important;
                border-color: rgba(239, 68, 68, 0.6) !important;
            }
            #carrot-connection-search:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
            }
            #carrot-connection-apply:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
            }
            #carrot-connection-list::-webkit-scrollbar {
                width: 8px;
            }
            #carrot-connection-list::-webkit-scrollbar-track {
                background: var(--black30);
                border-radius: 4px;
            }
            #carrot-connection-list::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.4);
                border-radius: 4px;
            }
            #carrot-connection-list::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.6);
            }
        </style>
    `;

    connectionPopup = $(html);
    $('body').append(connectionPopup);

    // Event handlers
    connectionPopup.find('.carrot-connection-close').on('click', () => CarrotLorebookConnector.close());
    connectionPopup.find('.carrot-connection-overlay').on('click', function(e) {
        if (e.target === this) {
            CarrotLorebookConnector.close();
        }
    });
    connectionPopup.find('#carrot-connection-search').on('input', handleSearch);
    connectionPopup.find('#carrot-connection-apply').on('click', applyConnections);
}

// =============================================================================
// DATA LOADING
// =============================================================================

function loadCurrentConnections() {
    currentConnections = {};

    const character = characters[this_chid];
    if (!character) return;

    // Load primary lorebook
    const primaryBook = character.data?.extensions?.world;
    if (primaryBook) {
        currentConnections[primaryBook] = { scope: 'character', isPrimary: true };
    }

    // Load additional character books
    const charFilename = getCharaFilename(this_chid);
    const charLore = world_info.charLore || [];
    const charEntry = charLore.find(entry => entry.name === charFilename);
    if (charEntry && Array.isArray(charEntry.extraBooks)) {
        charEntry.extraBooks.forEach(bookName => {
            if (bookName !== primaryBook) {
                currentConnections[bookName] = { scope: 'character', isPrimary: false };
            }
        });
    }

    // Load chat books
    const chatBooks = chat_metadata.carrot_chat_books || [];
    chatBooks.forEach(bookName => {
        currentConnections[bookName] = { scope: 'chat', isPrimary: false };
    });

    console.log('🐰 Loaded connections:', currentConnections);
}

// =============================================================================
// RENDERING
// =============================================================================

function renderLorebookList(searchTerm = '') {
    const listElement = connectionPopup.find('#carrot-connection-list');
    const availableLorebooks = world_names || [];

    if (availableLorebooks.length === 0) {
        listElement.html('<div style="text-align: center; padding: 40px; opacity: 0.6;">No lorebooks found</div>');
        return;
    }

    // Filter by search term
    const filteredBooks = searchTerm
        ? availableLorebooks.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
        : availableLorebooks;

    // Separate connected vs unconnected lorebooks
    const connectedBooks = [];
    const unconnectedBooks = [];

    filteredBooks.forEach(lorebookName => {
        if (currentConnections[lorebookName] && currentConnections[lorebookName].scope !== 'none') {
            connectedBooks.push(lorebookName);
        } else {
            unconnectedBooks.push(lorebookName);
        }
    });

    let html = '';

    // Render connected lorebooks first (✨ SUGGESTED section)
    if (connectedBooks.length > 0) {
        html += `
            <div style="margin-bottom: 12px; padding: 8px 12px; background: rgba(139, 92, 246, 0.1); border-radius: 6px; border-left: 3px solid #8b5cf6;">
                <div style="font-size: 11px; font-weight: 600; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.5px;">
                    ✨ Connected
                </div>
            </div>
        `;

        connectedBooks.forEach(lorebookName => {
            html += renderLorebookItem(lorebookName, true);
        });
    }

    // Render unconnected lorebooks
    if (unconnectedBooks.length > 0) {
        if (connectedBooks.length > 0) {
            html += `
                <div style="margin: 16px 0 12px 0; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <div style="font-size: 11px; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">
                        All Lorebooks
                    </div>
                </div>
            `;
        }

        unconnectedBooks.forEach(lorebookName => {
            html += renderLorebookItem(lorebookName, false);
        });
    }

    if (html === '') {
        html = '<div style="text-align: center; padding: 40px; opacity: 0.6;">No matches found</div>';
    }

    listElement.html(html);

    // Attach event handlers
    listElement.find('.carrot-conn-star').on('click', handleStarClick);
    listElement.find('.carrot-conn-scope').on('change', handleScopeChange);
    listElement.find('.carrot-conn-badge').on('click', handleBadgeClick);
}

function renderLorebookItem(lorebookName, isConnected) {
    // Determine type
    let type = 'lorebook';
    if (characterRepoBooks.has(lorebookName)) {
        type = 'repo';
    } else if (tagLibraries.has(lorebookName)) {
        type = 'taglib';
    }

    const connection = currentConnections[lorebookName] || { scope: 'none', isPrimary: false };
    const isStarred = connection.isPrimary;
    const scope = connection.scope;

    // Star ONLY shows when connected to character scope
    const showStar = (scope === 'character');
    const isCharacterScoped = (scope === 'character');

    // Better badge styling matching the reference image
    const badgeInfo = {
        repo: { emoji: '👤', text: 'Char Repo', bg: 'rgba(156, 39, 176, 0.3)', borderColor: 'rgba(156, 39, 176, 0.6)', textColor: '#ce93d8' },
        taglib: { emoji: '📚', text: 'Tag Lib', bg: 'rgba(33, 150, 243, 0.3)', borderColor: 'rgba(33, 150, 243, 0.6)', textColor: '#90caf9' },
        lorebook: { emoji: '', text: 'Lorebook', bg: 'rgba(76, 175, 80, 0.3)', borderColor: 'rgba(76, 175, 80, 0.6)', textColor: '#81c784' }
    };

    const badge = badgeInfo[type];

    // Highlight connected items
    const borderStyle = isConnected
        ? '2px solid #8b5cf6'
        : '2px solid var(--SmartThemeBorderColor)';
    const boxShadow = isConnected
        ? '0 0 12px rgba(139, 92, 246, 0.3)'
        : 'none';

    return `
        <div class="carrot-conn-item" data-lorebook="${lorebookName}" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            background: var(--black30);
            border: ${borderStyle};
            border-radius: 8px;
            box-shadow: ${boxShadow};
            transition: all 0.2s ease;">

            <!-- Star (only appears when connected to character scope) -->
            ${showStar ? `
                <div class="carrot-conn-star" data-lorebook="${lorebookName}" style="
                    font-size: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"
                    title="⭐ Connected to character${isStarred ? ' (Primary - exported with PNG)' : ''}&#10;Click to disconnect from character">
                    ⭐
                </div>
            ` : '<div style="width: 28px;"></div>'}

            <!-- Lorebook Name -->
            <div style="flex: 1; font-weight: 500; color: var(--SmartThemeBodyColor);">
                ${lorebookName}
            </div>

            <!-- Clickable Badge -->
            <div class="carrot-conn-badge" data-lorebook="${lorebookName}" data-type="${type}" style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                padding: 4px 10px;
                background: ${badge.bg};
                border: 1px solid ${badge.borderColor};
                color: ${badge.textColor};
                border-radius: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;"
                onmouseenter="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2)'"
                onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='none'"
                title="Click to cycle type: Char Repo → Tag Lib → Lorebook">
                ${badge.emoji ? `<span>${badge.emoji}</span>` : ''}
                <span>${badge.text}</span>
            </div>

            <!-- Scope Dropdown -->
            <select class="carrot-conn-scope" data-lorebook="${lorebookName}" style="
                padding: 6px 12px;
                background: var(--black30);
                border: 2px solid var(--SmartThemeBorderColor);
                border-radius: 6px;
                color: var(--SmartThemeBodyColor);
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                min-width: 120px;
                transition: all 0.2s ease;">
                <option value="none" ${scope === 'none' ? 'selected' : ''}>None</option>
                <option value="character" ${scope === 'character' ? 'selected' : ''}>Character</option>
                <option value="chat" ${scope === 'chat' ? 'selected' : ''}>Chat</option>
            </select>
        </div>
    `;
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

function handleSearch(e) {
    const searchTerm = $(e.target).val();
    renderLorebookList(searchTerm);
}

function handleStarClick(e) {
    e.stopPropagation();
    const lorebookName = $(e.target).data('lorebook');

    // Toggle character connection
    if (!currentConnections[lorebookName]) {
        // Not connected at all - connect to character
        currentConnections[lorebookName] = { scope: 'character', isPrimary: false };
    } else if (currentConnections[lorebookName].scope === 'character') {
        // Already character-scoped - remove connection
        delete currentConnections[lorebookName];
    } else {
        // Connected to chat - switch to character
        currentConnections[lorebookName].scope = 'character';
    }

    // Auto-assign primary if this is a char repo and no primary exists
    const isCharRepo = characterRepoBooks.has(lorebookName);
    if (isCharRepo && currentConnections[lorebookName]?.scope === 'character') {
        const hasPrimary = Object.values(currentConnections).some(conn => conn.isPrimary);
        if (!hasPrimary) {
            currentConnections[lorebookName].isPrimary = true;
        }
    }

    renderLorebookList($('#carrot-connection-search').val());
}

function handleScopeChange(e) {
    const lorebookName = $(e.target).data('lorebook');
    const newScope = $(e.target).val();

    if (newScope === 'none') {
        delete currentConnections[lorebookName];
    } else {
        if (!currentConnections[lorebookName]) {
            currentConnections[lorebookName] = { scope: newScope, isPrimary: false };
        } else {
            currentConnections[lorebookName].scope = newScope;
            // If changing to chat, can't be primary
            if (newScope === 'chat') {
                currentConnections[lorebookName].isPrimary = false;
            }
        }
    }

    renderLorebookList($('#carrot-connection-search').val());
}

function handleBadgeClick(e) {
    e.stopPropagation();
    const lorebookName = $(e.currentTarget).data('lorebook');
    const currentType = $(e.currentTarget).data('type');

    // Cycle: repo → taglib → lorebook → repo
    const typeOrder = ['repo', 'taglib', 'lorebook'];
    const currentIndex = typeOrder.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % typeOrder.length;
    const nextType = typeOrder[nextIndex];

    // Update the global sets
    characterRepoBooks.delete(lorebookName);
    tagLibraries.delete(lorebookName);

    if (nextType === 'repo') {
        characterRepoBooks.add(lorebookName);
    } else if (nextType === 'taglib') {
        tagLibraries.add(lorebookName);
    }
    // If lorebook, leave both sets empty

    // Save to extension_settings
    extension_settings[EXTENSION_NAME].characterRepoBooks = Array.from(characterRepoBooks);
    extension_settings[EXTENSION_NAME].tagLibraries = Array.from(tagLibraries);
    saveSettingsDebounced();

    console.log(`🐰 Cycled ${lorebookName}: ${currentType} → ${nextType}`);
    renderLorebookList($('#carrot-connection-search').val());
}

async function applyConnections() {
    const character = characters[this_chid];
    if (!character) {
        toastr.error('No character selected');
        return;
    }

    console.log('🐰 Applying connections:', currentConnections);

    // Separate by scope and primary status
    let primaryLorebook = null;
    const characterScopedBooks = [];
    const chatScopedBooks = [];

    for (const [lorebookName, connection] of Object.entries(currentConnections)) {
        if (connection.isPrimary) {
            primaryLorebook = lorebookName;
            characterScopedBooks.push(lorebookName);
        } else if (connection.scope === 'character') {
            characterScopedBooks.push(lorebookName);
        } else if (connection.scope === 'chat') {
            chatScopedBooks.push(lorebookName);
        }
    }

    // 1. Save primary lorebook to character.data.extensions.world
    if (!character.data) character.data = {};
    if (!character.data.extensions) character.data.extensions = {};
    character.data.extensions.world = primaryLorebook || '';

    // Save character to disk
    saveCharacterDebounced();

    // 2. Save additional character books to world_info.charLore[].extraBooks
    const charFilename = getCharaFilename(this_chid);
    const charLore = world_info.charLore || [];
    const existingIndex = charLore.findIndex(entry => entry.name === charFilename);

    if (characterScopedBooks.length > 0) {
        if (existingIndex !== -1) {
            charLore[existingIndex].extraBooks = characterScopedBooks;
        } else {
            charLore.push({ name: charFilename, extraBooks: characterScopedBooks });
        }
    } else if (existingIndex !== -1) {
        // Remove entry if no books
        charLore.splice(existingIndex, 1);
    }

    Object.assign(world_info, { charLore });
    saveSettingsDebounced();

    // 3. Save chat-scoped books to chat_metadata.carrot_chat_books
    chat_metadata.carrot_chat_books = chatScopedBooks;
    await saveMetadataDebounced();

    console.log('🐰 Connections saved!', {
        primary: primaryLorebook,
        characterScoped: characterScopedBooks,
        chatScoped: chatScopedBooks
    });

    toastr.success('Lorebook connections saved!');
    CarrotLorebookConnector.close();

    // Trigger rescan if auto-rescan is enabled
    // This will be handled by the CHAT_CHANGED handler in index.js
}

console.log('🐰 Lorebook Connector loaded');
