// =============================================================================
// CARROT GITHUB BROWSER 🥕
// GitHub repository browser with rate limiting and update detection
// =============================================================================

import { saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { CarrotDebug } from './debugger.js';
import { EXTENSION_NAME } from './carrot-state.js';

// Use consistent extension name from carrot-state.js
const extensionName = EXTENSION_NAME;

export class CarrotGitHubBrowser {
    constructor() {
        this.githubRepo = 'Coneja-Chibi/BunnyMo';
        this.githubBranch = 'BunnyMo';
        this.currentPath = '/';
        this.currentItems = [];
        this.pathCache = new Map();
        this.installedPacks = this.loadInstalledPacks();
        this.updateCache = new Map();

        // Rate limit management
        this.requestQueue = [];
        this.processingQueue = false;
        this.rateLimitInfo = {
            limit: 60,
            remaining: 60,
            resetTime: Date.now() + 3600000,
            lastUpdated: Date.now()
        };
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2
        };
    }

    // Load installed pack tracking from extension settings
    loadInstalledPacks() {
        const settings = extension_settings[extensionName];
        return settings.installedBunnyMoPacks || {};
    }

    // Save installed pack tracking to extension settings
    saveInstalledPacks() {
        // CRITICAL: Never overwrite extension_settings completely
        if (!extension_settings[extensionName]) {
            console.warn('⚠️ PACK MANAGER: extension_settings not initialized - this should not happen');
            extension_settings[extensionName] = {};
        }
        extension_settings[extensionName].installedBunnyMoPacks = this.installedPacks;
        saveSettingsDebounced();
    }

    // Rate-limit aware GitHub API fetch with retry logic
    async fetchWithRateLimit(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ url, options, resolve, reject });
            this.processQueue();
        });
    }

    // Process the request queue with rate limit awareness
    async processQueue() {
        if (this.processingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.processingQueue = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();

            try {
                await this.checkRateLimit();
                const response = await this.makeRequestWithRetry(request.url, request.options);
                this.updateRateLimitInfo(response);
                request.resolve(response);
                await this.delay(100);
            } catch (error) {
                request.reject(error);
            }
        }

        this.processingQueue = false;
    }

    // Check rate limit and wait if necessary
    async checkRateLimit() {
        const now = Date.now();
        if (now - this.rateLimitInfo.lastUpdated > 60000) {
            this.rateLimitInfo.remaining = this.rateLimitInfo.limit;
        }

        if (this.rateLimitInfo.remaining <= 5) {
            const waitTime = Math.max(0, this.rateLimitInfo.resetTime - now);
            if (waitTime > 0) {
                CarrotDebug.repo(`⏳ GitHub Browser rate limit approaching, waiting ${Math.ceil(waitTime/1000)}s...`);
                await this.delay(waitTime);
                this.rateLimitInfo.remaining = this.rateLimitInfo.limit;
            }
        }
    }

    // Make request with exponential backoff retry
    async makeRequestWithRetry(url, options = {}, retryCount = 0) {
        try {
            const response = await fetch(url, options);

            if (response.status === 403) {
                const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
                const rateLimitReset = response.headers.get('x-ratelimit-reset');

                if (rateLimitRemaining === '0' && retryCount < this.retryConfig.maxRetries) {
                    const resetTime = parseInt(rateLimitReset) * 1000;
                    const waitTime = Math.max(0, resetTime - Date.now()) + 1000;

                    CarrotDebug.repo(`⏳ GitHub Browser rate limit hit, waiting ${Math.ceil(waitTime/1000)}s for reset...`);
                    await this.delay(waitTime);

                    return this.makeRequestWithRetry(url, options, retryCount + 1);
                }
            }

            if (!response.ok && this.isRetryableError(response.status) && retryCount < this.retryConfig.maxRetries) {
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount),
                    this.retryConfig.maxDelay
                );

                CarrotDebug.repo(`⚠️ GitHub Browser request failed (${response.status}), retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
                await this.delay(delay);

                return this.makeRequestWithRetry(url, options, retryCount + 1);
            }

            return response;

        } catch (error) {
            if (this.isRetryableNetworkError(error) && retryCount < this.retryConfig.maxRetries) {
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount),
                    this.retryConfig.maxDelay
                );

                CarrotDebug.repo(`⚠️ GitHub Browser network error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
                await this.delay(delay);

                return this.makeRequestWithRetry(url, options, retryCount + 1);
            }

            throw error;
        }
    }

    // Update rate limit info from response headers
    updateRateLimitInfo(response) {
        const limit = response.headers.get('x-ratelimit-limit');
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');

        if (limit) this.rateLimitInfo.limit = parseInt(limit);
        if (remaining) this.rateLimitInfo.remaining = parseInt(remaining);
        if (reset) this.rateLimitInfo.resetTime = parseInt(reset) * 1000;
        this.rateLimitInfo.lastUpdated = Date.now();

        CarrotDebug.repo(`📊 GitHub Browser rate limit: ${this.rateLimitInfo.remaining}/${this.rateLimitInfo.limit} remaining`);
    }

    // Check if error status is retryable
    isRetryableError(status) {
        return [429, 502, 503, 504].includes(status);
    }

    // Check if network error is retryable
    isRetryableNetworkError(error) {
        return error.name === 'TypeError' ||
               error.message.includes('fetch') ||
               error.message.includes('network') ||
               error.message.includes('timeout');
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Track a pack installation with its SHA hash
    trackPackInstallation(filename, sha, size) {
        this.installedPacks[filename] = {
            sha: sha,
            size: size,
            installedDate: Date.now(),
            lastChecked: Date.now()
        };
        this.saveInstalledPacks();
    }

    // Check if a file has updates available (different SHA)
    hasUpdates(filename, currentSha) {
        const installed = this.installedPacks[filename];
        if (!installed) return false; // Not installed, so no update needed
        return installed.sha !== currentSha; // Different SHA = update available
    }

    // Check if folder contains any files with updates
    async folderHasUpdates(folderPath) {
        try {
            if (this.updateCache.has(folderPath)) {
                return this.updateCache.get(folderPath);
            }

            // Get all JSON files in this folder (recursively)
            const folderFiles = await this.getAllJsonFilesInFolder(folderPath);

            for (const file of folderFiles) {
                if (this.hasUpdates(file.name, file.sha)) {
                    this.updateCache.set(folderPath, true);
                    return true;
                }
            }

            this.updateCache.set(folderPath, false);
            return false;
        } catch (error) {
            CarrotDebug.error('Error checking folder updates:', error);
            return false;
        }
    }

    // Get all JSON files in a folder (for update checking)
    async getAllJsonFilesInFolder(folderPath) {
        try {
            const apiUrl = `https://api.github.com/repos/${this.githubRepo}/contents${folderPath ? '/' + encodeURIComponent(folderPath) : ''}`;
            const response = await this.fetchWithRateLimit(apiUrl);

            if (!response.ok) return [];

            const data = await response.json();
            let jsonFiles = [];

            for (const item of data) {
                if (item.type === 'file' && item.name.endsWith('.json')) {
                    jsonFiles.push(item);
                } else if (item.type === 'dir') {
                    // Recursively check subdirectories
                    const subFiles = await this.getAllJsonFilesInFolder(item.path);
                    jsonFiles = jsonFiles.concat(subFiles);
                }
            }

            return jsonFiles;
        } catch (error) {
            CarrotDebug.error('Error getting JSON files:', error);
            return [];
        }
    }

    // Load repository structure
    async loadRepository() {
        CarrotDebug.repo('🔍 Loading BunnyMo repository structure...');

        try {
            // Load root directory
            await this.navigateToPath('/');

            CarrotDebug.repo('✅ Repository structure loaded successfully');
        } catch (error) {
            CarrotDebug.error('❌ Failed to load repository:', error);
            throw error;
        }
    }

    // Navigate to specific path in repository
    async navigateToPath(path) {
        // Normalize path
        path = path === '/' ? '' : path.replace(/^\/+|\/+$/g, '');
        this.currentPath = path ? '/' + path : '/';

        // Check cache first
        if (this.pathCache.has(path)) {
            this.currentItems = this.pathCache.get(path);
            CarrotDebug.repo(`📂 Loaded ${this.currentItems.length} items from cache for: ${this.currentPath}`);
            return;
        }

        try {
            const apiUrl = `https://api.github.com/repos/${this.githubRepo}/contents${path ? '/' + encodeURIComponent(path) : ''}`;
            CarrotDebug.repo(`🌐 Fetching: ${apiUrl}`);

            const response = await this.fetchWithRateLimit(apiUrl);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(`GitHub API rate limit exceeded. Please wait and try again later.`);
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();

            // Process items
            this.currentItems = Array.isArray(data) ? data.map(item => ({
                name: item.name,
                path: item.path,
                type: item.type,
                size: item.size,
                download_url: item.download_url,
                sha: item.sha
            })) : [];

            // Cache the results
            this.pathCache.set(path, this.currentItems);

            CarrotDebug.repo(`📂 Loaded ${this.currentItems.length} items for: ${this.currentPath}`);

        } catch (error) {
            CarrotDebug.error('❌ Failed to navigate to path:', error);
            throw error;
        }
    }

    // Get download URL for a file
    async getDownloadUrl(path) {
        const item = this.currentItems.find(item => item.path === path);
        if (item && item.download_url) {
            return item.download_url;
        }

        // Fallback: make API call to get download URL
        try {
            const apiUrl = `https://api.github.com/repos/${this.githubRepo}/contents/${encodeURIComponent(path)}`;
            const response = await this.fetchWithRateLimit(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.download_url;

        } catch (error) {
            CarrotDebug.error('❌ Failed to get download URL:', error);
            throw error;
        }
    }

    // Clear cache (for refresh)
    clearCache() {
        this.pathCache.clear();
    }
}
