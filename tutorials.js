// =============================================================================
// CARROT TUTORIALS SYSTEM 🥕
// Interactive tutorial system with step-by-step guides
// =============================================================================

import { CarrotDebug } from './debugger.js';
import { extension_settings } from '../../../extensions.js';
import { EXTENSION_NAME } from './carrot-state.js';

// Use consistent extension name from carrot-state.js
const extensionName = EXTENSION_NAME;

// Tutorial system state
let currentTutorial = null;
let currentStep = 0;
let tutorialSteps = [];
let resizeHandler = null;

// Tutorial definitions - 5 comprehensive tutorials with 40+ steps total
const tutorials = {
    'basic-setup': {
        title: 'System Configuration Tutorial',
        steps: [
            {
                target: '.carrot-setting-item:first-child',
                title: 'Master Enable',
                content: `
                    Turn on CarrotKernel. Must be enabled for all functionality.
                `
            },
            {
                target: '.carrot-setting-item:nth-child(2)',
                title: 'AI Injection',
                content: `
                    Send character data to AI automatically when characters are mentioned.
                `
            },
            {
                target: '.carrot-setting-item:nth-child(3)',
                title: 'Display Mode',
                content: `
                    How character data appears in chats:
                    No Display (recommended), Thinking Box, or Character Cards
                `
            },
            {
                target: '.carrot-search-container',
                title: 'Search Lorebooks',
                content: `
                    Type to filter your lorebook list quickly.
                `
            },
            {
                target: '.carrot-lorebook-item',
                title: 'Select Lorebooks',
                content: `
                    Check boxes next to lorebooks you want to use.
                `
            },
            {
                target: '#carrot-scan-btn',
                title: 'Scan Selected',
                content: `
                    Click to scan and index character data from selected lorebooks.
                `
            }
        ]
    },

    'repository-management': {
        title: 'Repository Management Tutorial',
        steps: [
            {
                target: 'button#carrot-scan-btn',
                title: 'Start Here: Scan Button',
                content: `
                    🔍 CLICK "SCAN SELECTED LOREBOOKS" to begin!

                    This scans your lorebooks for character data and creates a searchable repository.
                    After scanning, you'll see character cards that you can click to view details.

                    ✨ The scan finds <BunnymoTags> blocks and organizes character information automatically.
                `
            },
            {
                target: '#carrot-lorebook-management',
                title: 'Two Types of Lorebooks',
                content: `
                    👤 CHARACTER REPOSITORIES: Contain individual character data
                    📚 TAG LIBRARIES: Contain tag definitions (species, personality, etc.)

                    You need both types for complete functionality.
                `
            },
            {
                target: '.carrot-lorebook-item',
                title: 'Mark Repository Types',
                content: `
                    Use the 👤/📚 buttons to mark lorebook types.

                    Character repos have <BunnymoTags> blocks with character names.
                    Tag libraries have definitions like "TSUNDERE: Hostile but caring..."
                `
            }
        ]
    },

    'injection-system': {
        title: 'AI Injection System Tutorial',
        steps: [
            {
                target: '.carrot-status-injection',
                title: 'How Injection Works',
                content: `
                    When you mention "Alice" in chat:
                    1. CarrotKernel detects the character name
                    2. Sends Alice's data to AI context
                    3. AI maintains character consistency
                    4. Your chat stays clean (ephemeral injection)
                `
            },
            {
                target: 'select#carrot_display_mode',
                title: 'Display Modes',
                content: `
                    Choose how character data appears:

                    NO DISPLAY: Silent injection (recommended)
                    THINKING BOX: Shows in expandable boxes
                    CHARACTER CARDS: Visual character cards
                `
            },
            {
                target: 'input#carrot_injection_depth',
                title: 'Injection Depth',
                content: `
                    Controls priority in AI context.

                    Depth 4 (recommended): Same as GuidedGenerations
                    Lower = higher priority but may interfere
                    Higher = lower priority, may be ignored
                `
            }
        ]
    },

    'template-editor': {
        title: 'Template Editor Tutorial',
        steps: [
            {
                target: 'select#bmt_template_selector',
                title: 'Select Template',
                content: `
                    Choose which template to edit. Templates control how character data is formatted for the AI.
                `
            },
            {
                target: 'textarea#prompt',
                title: 'Edit Template Content',
                content: `
                    Write your injection prompt using {{MACRO_NAME}} variables:
                    {{TRIGGERED_CHARACTER_TAGS}} - Character data
                    {{CHARACTER_LIST}} - Character names
                `
            },
            {
                target: '.bmt-button-group',
                title: 'Template Actions',
                content: `
                    👁️ Preview: See template with real data
                    💾 Save: Save your changes
                    📋 Duplicate: Copy template for experiments
                `
            }
        ]
    }
};

// Tutorial launcher methods
export function openSystemTutorial() {
    console.log('🎓 openSystemTutorial called');
    startTutorial('basic-setup');
}

export function openRepositoryTutorial() {
    console.log('🎓 openRepositoryTutorial called');
    startTutorial('repository-management');
}

export function openInjectionTutorial() {
    console.log('🎓 openInjectionTutorial called');
    startTutorial('injection-system');
}

export function openTemplateEditorTutorial() {
    startTutorial('template-editor');
}

// Start a tutorial by ID - using confirm() dialogs
export async function startTutorial(tutorialId) {
    console.log(`🎓 startTutorial called with ID: ${tutorialId}`);
    const tutorial = tutorials[tutorialId];
    if (!tutorial) {
        alert(`Tutorial "${tutorialId}" not found`);
        return;
    }

    const steps = tutorial.steps;

    // Show each step with browser confirm dialog
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Highlight the target element
        const target = document.querySelector(step.target);
        if (target) {
            // Remove previous highlights
            document.querySelectorAll('.carrot-tutorial-highlight')
                .forEach(el => el.classList.remove('carrot-tutorial-highlight'));

            // Add highlight to current target
            target.classList.add('carrot-tutorial-highlight');

            // Scroll to target
            const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
            const scrollOptions = {
                behavior: 'smooth',
                block: isMobile ? 'start' : 'center',
                inline: 'nearest'
            };

            target.scrollIntoView(scrollOptions);

            // Wait for scroll to complete
            await new Promise(resolve => setTimeout(resolve, isMobile ? 800 : 500));
        }

        // Clean up HTML tags and format text nicely
        const cleanContent = step.content
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Fix HTML entities
            .replace(/&amp;/g, '&') // Fix ampersands
            .trim();

        // Format text with proper line breaks for readability
        const formattedContent = cleanContent
            .replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2') // Add breaks after sentences
            .replace(/([:])\s*([A-Z•])/g, '$1\n$2') // Add breaks after colons
            .replace(/•\s/g, '\n• ') // Put bullets on new lines
            .replace(/(\d+\.)\s/g, '\n$1 ') // Put numbered items on new lines
            .replace(/\n\n\n+/g, '\n\n') // Clean up multiple line breaks
            .trim();

        // Show step as confirm dialog
        const continueClicked = confirm(
            `Step ${i + 1} of ${steps.length}: ${step.title}\n\n${formattedContent}\n\nClick OK for next step, Cancel to exit tutorial.`
        );

        if (!continueClicked) {
            break; // User cancelled
        }
    }

    // Clean up highlights
    document.querySelectorAll('.carrot-tutorial-highlight')
        .forEach(el => el.classList.remove('carrot-tutorial-highlight'));

    alert('Tutorial completed! 🎉');
}

// Show current tutorial step
export function showTutorialStep() {
    console.log(`🎓 showTutorialStep called, currentStep: ${currentStep}`);
    if (!tutorialSteps || tutorialSteps.length === 0) {
        console.warn('⚠️ No tutorial steps, closing');
        closeTutorial();
        return;
    }

    const step = tutorialSteps[currentStep];
    const tutorial = tutorials[currentTutorial];

    console.log(`🎓 Looking for target element: ${step.target}`);
    // Find target element
    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
        console.warn(`⚠️ Tutorial target not found: ${step.target}, skipping step`);
        CarrotDebug.ui(`⚠️ Tutorial target not found: ${step.target}, skipping step`);
        // Try next step
        if (currentStep < tutorialSteps.length - 1) {
            currentStep++;
            showTutorialStep();
        } else {
            closeTutorial();
        }
        return;
    }

    console.log(`✅ Found target element, showing tutorial overlay`);
    // Highlight the target element
    highlightElement(targetElement, step);

    // Show tutorial overlay with step content
    showTutorialOverlay(tutorial, step, targetElement);
}

// Highlight target element
function highlightElement(element, step) {
    // Remove existing highlights
    document.querySelectorAll('.carrot-tutorial-highlight').forEach(el => {
        el.classList.remove('carrot-tutorial-highlight');
    });

    // Add highlight to target
    element.classList.add('carrot-tutorial-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show tutorial overlay
function showTutorialOverlay(tutorial, step, targetElement) {
    console.log(`🎓 showTutorialOverlay called`);
    // Get or create overlay
    let overlay = getTutorialOverlay();
    console.log(`🎓 Overlay element:`, overlay);

    // Create tutorial popup content
    const totalSteps = tutorialSteps.length;
    const stepNumber = currentStep + 1;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const popupHTML = `
        <div class="carrot-tutorial-popup" id="carrot-tutorial-popup">
            <div class="carrot-tutorial-header">
                <h3 class="carrot-tutorial-title">${tutorial.title}</h3>
                <button class="carrot-tutorial-close" onclick="window.closeTutorial()">×</button>
            </div>
            <div class="carrot-tutorial-progress">
                <div class="carrot-tutorial-progress-bar" style="width: ${progress}%"></div>
                <span class="carrot-tutorial-progress-text">Step ${stepNumber} of ${totalSteps}</span>
            </div>
            <div class="carrot-tutorial-step-header">
                <h4>${step.title}</h4>
            </div>
            <div class="carrot-tutorial-content">
                ${step.content}
            </div>
            <div class="carrot-tutorial-navigation">
                ${currentStep > 0 ? '<button class="carrot-tutorial-btn carrot-tutorial-prev" onclick="window.previousTutorialStep()">← Previous</button>' : '<span></span>'}
                ${currentStep < totalSteps - 1
                    ? '<button class="carrot-tutorial-btn carrot-tutorial-next" onclick="window.nextTutorialStep()">Next →</button>'
                    : '<button class="carrot-tutorial-btn carrot-tutorial-finish" onclick="window.closeTutorial()">Finish</button>'}
            </div>
        </div>
    `;

    overlay.innerHTML = popupHTML;
    overlay.style.display = 'flex';
    overlay.classList.add('active'); // Make overlay visible
    console.log(`🎓 Set overlay display to flex and added active class`);

    // Position popup near target
    const targetRect = targetElement.getBoundingClientRect();
    const popup = document.getElementById('carrot-tutorial-popup');
    console.log(`🎓 Tutorial popup element:`, popup);
    positionTutorialPopup(popup, targetRect);

    // Add resize handler
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
    }
    resizeHandler = () => {
        const newRect = targetElement.getBoundingClientRect();
        positionTutorialPopup(popup, newRect);
    };
    window.addEventListener('resize', resizeHandler);
}

// Get or create tutorial overlay
function getTutorialOverlay() {
    let overlay = document.getElementById('carrot-tutorial-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'carrot-tutorial-overlay';
        overlay.className = 'carrot-tutorial-overlay';
        document.body.appendChild(overlay);
    }
    return overlay;
}

// Position tutorial popup near target element
function positionTutorialPopup(popup, targetRect) {
    if (!popup) return;

    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Try to position to the right of target
    let left = targetRect.right + 20;
    let top = targetRect.top;

    // If it goes off right edge, position to the left
    if (left + popupRect.width > viewportWidth - 20) {
        left = targetRect.left - popupRect.width - 20;
    }

    // If still off screen, center horizontally
    if (left < 20) {
        left = (viewportWidth - popupRect.width) / 2;
    }

    // Adjust vertical position to keep in viewport
    if (top + popupRect.height > viewportHeight - 20) {
        top = viewportHeight - popupRect.height - 20;
    }
    if (top < 20) {
        top = 20;
    }

    popup.style.left = Math.max(20, left) + 'px';
    popup.style.top = Math.max(20, top) + 'px';
}

// Navigate to next tutorial step
export function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showTutorialStep();
    } else {
        closeTutorial();
    }
}

// Navigate to previous tutorial step
export function previousTutorialStep() {
    if (currentStep > 0) {
        currentStep--;
        showTutorialStep();
    }
}

// Close tutorial
export function closeTutorial() {
    CarrotDebug.ui('Closing tutorial');

    // Remove highlight
    document.querySelectorAll('.carrot-tutorial-highlight').forEach(el => {
        el.classList.remove('carrot-tutorial-highlight');
    });

    // Remove overlay
    const overlay = document.getElementById('carrot-tutorial-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Remove resize handler
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }

    // Reset state
    currentTutorial = null;
    currentStep = 0;
    tutorialSteps = [];
}

// Export navigation functions to window for onclick handlers
if (typeof window !== 'undefined') {
    window.nextTutorialStep = nextTutorialStep;
    window.previousTutorialStep = previousTutorialStep;
    window.closeTutorial = closeTutorial;
}

// Initialize tutorial system
export function initializeTutorials() {
    CarrotDebug.init('✅ Tutorials system initialized');
}
