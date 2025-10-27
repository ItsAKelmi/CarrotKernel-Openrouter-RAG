// =============================================================================
// CARROT STATE MANAGEMENT MODULE 🥕
// Centralized state management for CarrotKernel extension
// Eliminates circular dependencies and provides single source of truth
// =============================================================================

// =============================================================================
// SHARED DATA STRUCTURES
// =============================================================================

// Lorebook management
export const selectedLorebooks = new Set();      // Enabled lorebooks
export const characterRepoBooks = new Set();     // Lorebooks marked as character repositories
export const tagLibraries = new Set();           // Lorebooks marked as tag libraries (pack definitions)

// Character data
export const scannedCharacters = new Map();      // character_name -> { tags: Map, source: lorebook_name }

// Injection state
export let lastInjectedCharacters = [];          // Track which characters were injected for persistence

// Repository Manager state
export let currentRepoView = 'home';             // Current view: 'home', 'repository', 'character'
export let selectedCharacter = null;             // Currently selected character name
export let selectedRepository = null;            // Currently selected repository name

// Pack Manager state
export let _packManagerOpening = false;

// Sheet command state
export let pendingSheetCommand = null;           // Store current sheet command if detected

// Misc state
export let lastProcessedMessage = null;
export let pendingThinkingBlockData = [];        // Store character data for thinking blocks when AI responds

// =============================================================================
// STATE UPDATERS
// =============================================================================

/**
 * Update lastInjectedCharacters array
 * @param {string[]} characters - Array of character names that were injected
 */
export function setLastInjectedCharacters(characters) {
    lastInjectedCharacters = Array.isArray(characters) ? [...characters] : [];
}

/**
 * Get current lastInjectedCharacters
 * @returns {string[]} Array of character names
 */
export function getLastInjectedCharacters() {
    return [...lastInjectedCharacters];
}

/**
 * Update current repository view
 * @param {string} view - New view name
 */
export function setCurrentRepoView(view) {
    currentRepoView = view;
}

/**
 * Update selected character
 * @param {string} character - Character name
 */
export function setSelectedCharacter(character) {
    selectedCharacter = character;
}

/**
 * Update selected repository
 * @param {string} repository - Repository name
 */
export function setSelectedRepository(repository) {
    selectedRepository = repository;
}

/**
 * Update pack manager opening state
 * @param {boolean} isOpening - Whether pack manager is opening
 */
export function setPackManagerOpening(isOpening) {
    _packManagerOpening = isOpening;
}

/**
 * Update pending sheet command
 * @param {object} command - Sheet command object
 */
export function setPendingSheetCommand(command) {
    pendingSheetCommand = command;
}

/**
 * Update last processed message
 * @param {object} message - Message object
 */
export function setLastProcessedMessage(message) {
    lastProcessedMessage = message;
}

/**
 * Update pending thinking block data
 * @param {array} data - Thinking block data array
 */
export function setPendingThinkingBlockData(data) {
    pendingThinkingBlockData = Array.isArray(data) ? [...data] : [];
}

/**
 * Add data to pending thinking block
 * @param {object} data - Data to add
 */
export function addToPendingThinkingBlockData(data) {
    pendingThinkingBlockData.push(data);
}

/**
 * Clear pending thinking block data
 */
export function clearPendingThinkingBlockData() {
    pendingThinkingBlockData = [];
}

// =============================================================================
// COLLECTION HELPERS
// =============================================================================

/**
 * Clear all scanned characters
 */
export function clearScannedCharacters() {
    scannedCharacters.clear();
}

/**
 * Add character to scanned characters
 * @param {string} name - Character name
 * @param {object} data - Character data
 */
export function addScannedCharacter(name, data) {
    scannedCharacters.set(name, data);
}

/**
 * Remove character from scanned characters
 * @param {string} name - Character name
 */
export function removeScannedCharacter(name) {
    scannedCharacters.delete(name);
}

/**
 * Check if character exists in scanned characters
 * @param {string} name - Character name
 * @returns {boolean}
 */
export function hasScannedCharacter(name) {
    return scannedCharacters.has(name);
}

/**
 * Get character data
 * @param {string} name - Character name
 * @returns {object|undefined} Character data
 */
export function getScannedCharacter(name) {
    return scannedCharacters.get(name);
}

/**
 * Get all scanned character names
 * @returns {string[]} Array of character names
 */
export function getScannedCharacterNames() {
    return Array.from(scannedCharacters.keys());
}

/**
 * Get number of scanned characters
 * @returns {number}
 */
export function getScannedCharacterCount() {
    return scannedCharacters.size;
}

// =============================================================================
// LOREBOOK HELPERS
// =============================================================================

/**
 * Add lorebook to selected lorebooks
 * @param {string} lorebookName
 */
export function addSelectedLorebook(lorebookName) {
    selectedLorebooks.add(lorebookName);
}

/**
 * Remove lorebook from selected lorebooks
 * @param {string} lorebookName
 */
export function removeSelectedLorebook(lorebookName) {
    selectedLorebooks.delete(lorebookName);
}

/**
 * Clear all selected lorebooks
 */
export function clearSelectedLorebooks() {
    selectedLorebooks.clear();
}

/**
 * Check if lorebook is selected
 * @param {string} lorebookName
 * @returns {boolean}
 */
export function isLorebookSelected(lorebookName) {
    return selectedLorebooks.has(lorebookName);
}

/**
 * Get array of selected lorebook names
 * @returns {string[]}
 */
export function getSelectedLorebookNames() {
    return Array.from(selectedLorebooks);
}

/**
 * Add lorebook to character repos
 * @param {string} lorebookName
 */
export function addCharacterRepoBook(lorebookName) {
    characterRepoBooks.add(lorebookName);
}

/**
 * Remove lorebook from character repos
 * @param {string} lorebookName
 */
export function removeCharacterRepoBook(lorebookName) {
    characterRepoBooks.delete(lorebookName);
}

/**
 * Clear all character repo books
 */
export function clearCharacterRepoBooks() {
    characterRepoBooks.clear();
}

/**
 * Check if lorebook is a character repo
 * @param {string} lorebookName
 * @returns {boolean}
 */
export function isCharacterRepoBook(lorebookName) {
    return characterRepoBooks.has(lorebookName);
}

/**
 * Get array of character repo book names
 * @returns {string[]}
 */
export function getCharacterRepoBookNames() {
    return Array.from(characterRepoBooks);
}

/**
 * Add lorebook to tag libraries
 * @param {string} lorebookName
 */
export function addTagLibrary(lorebookName) {
    tagLibraries.add(lorebookName);
}

/**
 * Remove lorebook from tag libraries
 * @param {string} lorebookName
 */
export function removeTagLibrary(lorebookName) {
    tagLibraries.delete(lorebookName);
}

/**
 * Clear all tag libraries
 */
export function clearTagLibraries() {
    tagLibraries.clear();
}

/**
 * Check if lorebook is a tag library
 * @param {string} lorebookName
 * @returns {boolean}
 */
export function isTagLibrary(lorebookName) {
    return tagLibraries.has(lorebookName);
}

/**
 * Get array of tag library names
 * @returns {string[]}
 */
export function getTagLibraryNames() {
    return Array.from(tagLibraries);
}

// =============================================================================
// STATE SNAPSHOT (for debugging)
// =============================================================================

/**
 * Get complete state snapshot for debugging
 * @returns {object} Complete state object
 */
export function getStateSnapshot() {
    return {
        selectedLorebooks: Array.from(selectedLorebooks),
        characterRepoBooks: Array.from(characterRepoBooks),
        tagLibraries: Array.from(tagLibraries),
        scannedCharacters: Array.from(scannedCharacters.entries()),
        lastInjectedCharacters: [...lastInjectedCharacters],
        currentRepoView,
        selectedCharacter,
        selectedRepository,
        _packManagerOpening,
        pendingSheetCommand,
        lastProcessedMessage,
        pendingThinkingBlockData: [...pendingThinkingBlockData],
        stats: {
            selectedLorebooksCount: selectedLorebooks.size,
            characterRepoBooksCount: characterRepoBooks.size,
            tagLibrariesCount: tagLibraries.size,
            scannedCharactersCount: scannedCharacters.size,
            lastInjectedCount: lastInjectedCharacters.length
        }
    };
}

// =============================================================================
// EXTENSION NAME CONSTANT
// =============================================================================

/**
 * Extension name constant - single source of truth
 * Used for extension_settings key
 */
export const EXTENSION_NAME = 'CarrotKernel';

// =============================================================================
// INITIALIZATION
// =============================================================================

console.log('🥕 CarrotKernel: State module loaded');
