// =============================================================================
// CARROT DEBUG MODULE 🥕
// Centralized debug system with organized categories using CARROT 🥕 BNY: naming
// =============================================================================

export class CarrotDebugger {
    constructor() {
        this.enabled = false;
        this.logSequence = 0;
        this.categories = {
            INIT: { emoji: '🌱', color: '#4caf50', name: 'Initialization' },
            SCAN: { emoji: '🔍', color: '#2196f3', name: 'Character Scanning' },
            INJECT: { emoji: '💉', color: '#ff6b35', name: 'AI Injection' },
            UI: { emoji: '🎨', color: '#9c27b0', name: 'User Interface' },
            REPO: { emoji: '📚', color: '#ff9800', name: 'Repository Management' },
            ERROR: { emoji: '❌', color: '#f44336', name: 'Critical Errors' }
        };

        // Performance tracking
        this.timers = new Map();
        this.metrics = new Map();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.init('🥕 CarrotKernel Debug Mode ENABLED');
            this.showDebugInfo();
        } else {
            this.init('🥕 CarrotKernel Debug Mode DISABLED');
        }
    }

    showDebugInfo() {
        console.group('🥕 CARROT BNY: DEBUG SYSTEM');
        console.log('📊 Available Categories:');
        Object.entries(this.categories).forEach(([key, cat]) => {
            console.log(`  ${cat.emoji} ${key}: ${cat.name}`);
        });
        console.log('🎯 Usage: CarrotDebug.[category]("message", data)');
        console.groupEnd();
    }

    _log(category, message, data = null) {
        if (!this.enabled) return;

        const cat = this.categories[category];
        if (!cat) {
            console.error('🥕 CARROT BNY: INVALID CATEGORY', category);
            return;
        }

        const logId = ++this.logSequence;
        const prefix = `🥕 CARROT ${cat.emoji} BNY: ${category}`;

        console.group(`%c${prefix} #${logId}`, `color: ${cat.color}; font-weight: bold;`);
        console.log(`%c${message}`, `color: ${cat.color};`);

        if (data !== null) {
            if (typeof data === 'object') {
                console.table ? console.table(data) : console.log(data);
            } else {
                console.log('📋 Data:', data);
            }
        }

        console.groupEnd();
    }

    // Performance timers
    startTimer(name, category = 'INIT') {
        const key = `${category}:${name}`;
        this.timers.set(key, performance.now());
        this._log(category, `⏱️ Timer Started: ${name}`);
    }

    endTimer(name, category = 'INIT') {
        const key = `${category}:${name}`;
        const startTime = this.timers.get(key);
        if (!startTime) {
            this.error(`Timer '${name}' not found`);
            return;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(key);
        this._log(category, `⏱️ Timer Ended: ${name} (${duration.toFixed(2)}ms)`);
        return duration;
    }

    // Category-specific debug functions
    init(message, data = null) { this._log('INIT', message, data); }
    scan(message, data = null) { this._log('SCAN', message, data); }
    inject(message, data = null) { this._log('INJECT', message, data); }
    ui(message, data = null) { this._log('UI', message, data); }
    repo(message, data = null) { this._log('REPO', message, data); }

    error(message, data = null) {
        // IMPORTANT: Respect enabled/debugMode settings - only log errors if debug is on
        if (!this.enabled) return;

        const cat = this.categories.ERROR;
        const prefix = `🥕 CARROT ${cat.emoji} BNY: ERROR`;

        console.group(`%c${prefix}`, `color: ${cat.color}; font-weight: bold; background: #ffe6e6;`);
        console.error(`%c${message}`, `color: ${cat.color}; font-weight: bold;`);

        if (data !== null) {
            console.error('💥 Error Data:', data);
        }

        console.trace('🥕 Stack Trace');
        console.groupEnd();
    }

    // Specialized debug functions
    characters(detected, context = 'chat') {
        if (!this.enabled) return;
        this.scan(`Character Detection in ${context}`, {
            count: detected.size,
            characters: Array.from(detected),
            context: context
        });
    }

    lorebook(name, type, entries = 0) {
        this.scan(`Lorebook Processed: ${name}`, {
            type: type,
            entries: entries,
            timestamp: new Date().toISOString()
        });
    }

    injection(characters, injectionData) {
        this.inject('AI Injection Process', {
            targetCharacters: Array.from(characters),
            injectionSize: injectionData.length,
            preview: injectionData.substring(0, 100) + '...'
        });
    }

    tutorial(action, tutorialId, step = null) {
        this.ui(`Tutorial ${action}: ${tutorialId}`, {
            step: step,
            timestamp: Date.now()
        });
    }

    popup(positioning, coords) {
        this.ui('Popup Positioning', {
            strategy: positioning,
            coordinates: coords
        });
    }

    setting(key, oldValue, newValue) {
        this.repo('Setting Changed', {
            setting: key,
            from: oldValue,
            to: newValue
        });
    }

    /**
     * Pretty print object data
     */
    inspect(obj, label = 'Object') {
        if (!this.enabled) return;

        console.group(`🥕 CARROT 🔍 BNY: INSPECT - ${label}`);
        console.log('📋 Type:', typeof obj);
        console.log('📋 Constructor:', obj?.constructor?.name || 'Unknown');

        if (typeof obj === 'object' && obj !== null) {
            console.log('📋 Keys:', Object.keys(obj));
            if (Array.isArray(obj)) {
                console.log('📋 Length:', obj.length);
            }
            console.table ? console.table(obj) : console.log(obj);
        } else {
            console.log('📋 Value:', obj);
        }

        console.groupEnd();
    }

    // =========================================================================
    // TEST AND DEBUG FUNCTIONS
    // =========================================================================

    /**
     * Manual trigger for character consistency processing
     */
    testProcessing() {
        this.init('🧪 MANUAL TEST: WORLD_INFO_ACTIVATED System (old processing removed)');
        this.init('Use World Info entries to trigger processing now');
    }

    /**
     * Show current system state
     */
    showState(selectedLorebooks, characterRepoBooks, scannedCharacters) {
        this.inspect({
            selectedLorebooks: Array.from(selectedLorebooks),
            characterRepoBooks: Array.from(characterRepoBooks),
            scannedCharacters: Array.from(scannedCharacters.keys()),
            characterData: Object.fromEntries(scannedCharacters)
        }, 'CarrotKernel System State');
    }

    /**
     * Test character detection (old system removed)
     */
    testDetection() {
        this.init('🧪 MANUAL TEST: Character Detection (OLD SYSTEM REMOVED)');
        this.init('Detection now happens via WORLD_INFO_ACTIVATED event');
        return [];
    }

    /**
     * Test injection only
     */
    async testInjection(characters, injectCharacterDataFn) {
        if (!characters) {
            this.error('Please provide character names array - old detection removed');
            return null;
        }
        if (characters.length === 0) {
            this.error('No characters to inject - provide character names');
            return null;
        }

        this.init('🧪 MANUAL TEST: AI Injection');
        return await injectCharacterDataFn(characters);
    }

    /**
     * Test display only
     */
    testDisplay(characters, displayCharacterDataFn) {
        if (!characters) {
            this.error('Please provide character names array - old detection removed');
            return;
        }
        if (characters.length === 0) {
            this.error('No characters to display - provide character names');
            return;
        }

        this.init('🧪 MANUAL TEST: Display System');
        displayCharacterDataFn(characters);
    }

    /**
     * Force scan lorebooks
     */
    async forceScan(selectedLorebooks, scanSelectedLorebooksFn) {
        this.init('🧪 MANUAL TEST: Force Lorebook Scan');
        if (selectedLorebooks.size === 0) {
            this.error('No lorebooks selected - check settings');
            return null;
        }
        return await scanSelectedLorebooksFn(Array.from(selectedLorebooks));
    }

    /**
     * Test BunnyMoTags filtering system
     */
    testBunnyMoTagsFiltering(removeBunnyMoTagsFromStringFn) {
        this.init('🧪 MANUAL TEST: BunnyMoTags Context Filtering');

        const testContent = `Hello there!

<BunnyMoTags>
Nefertari:
• PHYSICAL: Golden skin, emerald eyes
• PERSONALITY: Regal, proud
</BunnyMoTags>

This is a test message.`;

        const filtered = removeBunnyMoTagsFromStringFn(testContent);

        this.init('🧪 Original content:');
        console.log(testContent);
        this.init('🧪 Filtered content:');
        console.log(filtered);

        return {
            original: testContent,
            filtered: filtered,
            tagsRemoved: testContent !== filtered
        };
    }

    /**
     * Test persistent tags creation
     */
    async testPersistentTags(characterNames, lastInjectedCharacters, generatePersistentTagsBlockFn) {
        if (!characterNames && lastInjectedCharacters.length > 0) {
            characterNames = lastInjectedCharacters;
        }
        if (!characterNames || characterNames.length === 0) {
            this.error('No character names provided or injected - provide array of character names');
            return null;
        }

        this.init('🧪 MANUAL TEST: Persistent BunnyMoTags Generation');

        const tagsBlock = generatePersistentTagsBlockFn(characterNames);
        this.init('🧪 Generated tags block:');
        console.log(tagsBlock);

        return tagsBlock;
    }
}

// Create and export default instance
export const CarrotDebug = new CarrotDebugger();

// Setup global references and shortcuts
export function initializeDebugger() {
    // Create global debug instance
    window.CarrotDebug = CarrotDebug;

    // Console shortcuts
    if (typeof window !== 'undefined') {
        window.cd = CarrotDebug;
    }
}

// Export test functions for easier access
export const debugTests = {
    testProcessing: () => CarrotDebug.testProcessing(),
    showState: (selectedLorebooks, characterRepoBooks, scannedCharacters) =>
        CarrotDebug.showState(selectedLorebooks, characterRepoBooks, scannedCharacters),
    testDetection: () => CarrotDebug.testDetection(),
    testInjection: (characters, injectFn) => CarrotDebug.testInjection(characters, injectFn),
    testDisplay: (characters, displayFn) => CarrotDebug.testDisplay(characters, displayFn),
    forceScan: (selectedLorebooks, scanFn) => CarrotDebug.forceScan(selectedLorebooks, scanFn),
    testBunnyMoTagsFiltering: (removeFn) => CarrotDebug.testBunnyMoTagsFiltering(removeFn),
    testPersistentTags: (names, lastInjected, generateFn) =>
        CarrotDebug.testPersistentTags(names, lastInjected, generateFn)
};
