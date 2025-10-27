// =============================================================================
// CARROT UI UPDATES SYSTEM 🥕
// Status panel updates and UI state management
// =============================================================================

import { CarrotDebug } from './debugger.js';
import { extension_settings } from '../../../extensions.js';
import { EXTENSION_NAME } from './carrot-state.js';

// Use consistent extension name from carrot-state.js
const extensionName = EXTENSION_NAME;

// Module-level references to data collections
let scannedCharacters = null;
let selectedLorebooks = null;
let characterRepoBooks = null;

// Initialize UI updates with data collections
export function initializeUIUpdates(scannedCharsMap, selectedLoreBooksSet, characterRepoBooksSet) {
    scannedCharacters = scannedCharsMap;
    selectedLorebooks = selectedLoreBooksSet;
    characterRepoBooks = characterRepoBooksSet;
    CarrotDebug.init('✅ UI Updates initialized with data collections');
}

function updateStatusPanels() {
    const settings = extension_settings[extensionName];

    // Safety check - if settings not initialized yet, skip update
    if (!settings) {
        CarrotDebug.ui('Settings not initialized yet, skipping status panel update');
        return;
    }

    // System Status Panel
    const systemStatus = $('#carrot-system-status');
    const systemDetail = $('#carrot-system-detail');
    const systemIndicator = $('#carrot-system-indicator');

    if (settings.enabled) {
        systemStatus.text('Active and Ready');
        systemDetail.text('Click to open tutorial');
        systemIndicator.removeClass('error warning').addClass('success');
        $('.carrot-status-system').addClass('initialized');
    } else {
        systemStatus.text('Disabled');
        systemDetail.text('Click to learn how to enable');
        systemIndicator.removeClass('success warning').addClass('error');
        $('.carrot-status-system').removeClass('initialized');
    }

    // Repository Status Panel
    const repoStatus = $('#carrot-repo-status');
    const repoDetail = $('#carrot-repo-detail');
    const repoIndicator = $('#carrot-repo-indicator');

    const characterCount = scannedCharacters.size;
    const selectedCount = selectedLorebooks.size;
    const repoCount = characterRepoBooks.size;

    if (characterCount > 0) {
        repoStatus.text(`${characterCount} characters indexed`);
        repoDetail.text(`From ${repoCount} repositories`);
        repoIndicator.removeClass('error warning').addClass('success');
        $('.carrot-status-repository').addClass('loaded');
    } else if (selectedCount > 0) {
        repoStatus.text(`${selectedCount} lorebooks selected`);
        repoDetail.text('Click to scan for characters');
        repoIndicator.removeClass('error success').addClass('warning');
        $('.carrot-status-repository').removeClass('loaded');
    } else {
        repoStatus.text('0 characters indexed');
        repoDetail.text('Click to manage repositories');
        repoIndicator.removeClass('success warning').addClass('error');
        $('.carrot-status-repository').removeClass('loaded');
    }

    // AI Injection Status Panel
    const injectionStatus = $('#carrot-injection-status');
    const injectionDetail = $('#carrot-injection-detail');
    const injectionIndicator = $('#carrot-injection-indicator');
    const injectionTooltipStatus = $('#carrot-injection-tooltip-status');

    if (!settings.enabled) {
        injectionStatus.text('Disabled');
        injectionDetail.text('System disabled');
        injectionIndicator.removeClass('success warning active').addClass('error');
        if (injectionTooltipStatus.length) injectionTooltipStatus.text('System Disabled');
        $('.carrot-status-injection').removeClass('injecting');
    } else if (!settings.sendToAI) {
        injectionStatus.text('AI Injection Off');
        injectionDetail.text('Hover for details');
        injectionIndicator.removeClass('success error active').addClass('warning');
        if (injectionTooltipStatus.length) injectionTooltipStatus.text('AI Injection Disabled');
        $('.carrot-status-injection').removeClass('injecting');
    } else if (characterCount === 0) {
        injectionStatus.text('Standby');
        injectionDetail.text('No characters to inject');
        injectionIndicator.removeClass('success error active').addClass('warning');
        if (injectionTooltipStatus.length) injectionTooltipStatus.text('Waiting for character data');
        $('.carrot-status-injection').removeClass('injecting');
    } else {
        injectionStatus.text('Ready');
        injectionDetail.text(`${characterCount} characters available`);
        injectionIndicator.removeClass('error warning').addClass('success');
        if (injectionTooltipStatus.length) injectionTooltipStatus.text(`Ready to inject ${characterCount} characters`);
        $('.carrot-status-injection').removeClass('injecting');
    }

    // Pack Manager Status Panel
    const packStatus = $('#carrot-pack-status');
    const packDetail = $('#carrot-pack-detail');
    const packIndicator = $('#carrot-pack-indicator');

    if (!settings.enabled) {
        packStatus.text('Disabled');
        packDetail.text('System disabled');
        packIndicator.removeClass('success warning').addClass('error');
        $('.carrot-status-packs').removeClass('initialized');
    } else {
        // Initialize with default ready state
        packStatus.text('Ready for management');
        packDetail.text('Click to install and update packs');
        packIndicator.removeClass('error warning').addClass('success');
        $('.carrot-status-packs').addClass('initialized');

        // If we have cached pack data, show more specific status
        if (window.CarrotKernel && window.CarrotKernel.cachedPackSummary) {
            const summary = window.CarrotKernel.cachedPackSummary;
            if (summary.hasUpdates) {
                packStatus.text('Updates available');
                packDetail.text('Click to install updates');
                packIndicator.removeClass('success error').addClass('warning');
            } else if (summary.totalInstalled > 0) {
                packStatus.text(`${summary.totalInstalled} packs installed`);
                packDetail.text('Click to manage packs');
                packIndicator.removeClass('error warning').addClass('success');
            }
        }
    }
}

// Export UI update function
export { updateStatusPanels };
