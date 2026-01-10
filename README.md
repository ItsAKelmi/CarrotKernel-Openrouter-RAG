# 🥕 CarrotKernel
*A spiritual successor to BunnyMoTags - Professional Character Sheet & WorldInfo Management System for SillyTavern*

[![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-orange.svg)](https://github.com/your-repo/CarrotKernel)
[![SillyTavern Extension](https://img.shields.io/badge/SillyTavern-Extension-blue.svg)](https://docs.sillytavern.app/)

---

## 🎭 What is CarrotKernel?

CarrotKernel is your **complete character consistency and lorebook management solution** for SillyTavern. While designed to work seamlessly with BunnyMoTags lorebooks and prompt engines, **you don't need BunnyMoTags to benefit** - the Template Manager, Injection System, and enhanced WorldInfo tracker work with any lorebook setup!

**The core magic:** Automatically detects character mentions in chat and injects their personality data into AI context at the perfect moment. Think of it as having a personal assistant who remembers every character detail and feeds it to your AI exactly when needed - ensuring consistent portrayal across all conversations.

> *"It's like having a character continuity editor who actually knows your lorebooks inside and out!"* 🎯

---

## 🌟 Core System Components

### 🥕 **Smart Character Sheet System**
**Automatic character data injection** - the heart of CarrotKernel:
- **Real-time Detection**: Recognizes character mentions as you type
- **Silent Injection**: Sends character data to AI context without cluttering chat
- **BunnymoTags Parser**: Reads `<BunnymoTags>` blocks from lorebooks and AI messages
- **Baby Bunny Mode**: Guided popup for creating character archives from AI-generated sheets
- **Batch Import**: Process multiple character sheets simultaneously with flexible lorebook options

*Prevents AI hallucination by maintaining consistent character traits from your lorebooks!*

### 🌍 **WorldBook Tracker (Enhanced WorldInfo Display)**
**Advanced lorebook visibility and control** - see exactly what's happening:
- **Real-time Monitoring**: Track which entries are active in current context
- **Detailed Trigger Analysis**: See why entries activated and at what depth
- **Smart Scan Depth**: Visual indicators for scan depth with override capabilities
- **Clean Interface**: Professional design matching SillyTavern's aesthetic
- **Per-Chat Management**: Fine-tuned control for individual conversations

*Like WorldInfoInfo, but modernized and integrated with CarrotKernel's ecosystem!*

### 📝 **Template Manager & Injection System**
**Complete control over how character data reaches your AI**:
- **Custom Templates**: Create injection prompts with powerful macro variables
- **Template Categories**: Different formats for different use cases (fullsheet, tagsheet, quicksheet)
- **Live Preview**: See how templates render with real character data
- **Profile Management**: Save and apply template configurations per character or chat
- **Macro System**: `{{TRIGGERED_CHARACTER_TAGS}}`, `{{CHARACTER_LIST}}`, `{{PERSONALITY_TAGS}}`, and more

*Works with any lorebook format - not just BunnyMoTags!*

### ⚙️ **Context-Aware Loadout System**
**Different settings for different situations**:
- **🌍 Global Settings**: Default configuration for all chats
- **👤 Character Settings**: Per-character overrides (Alice always uses medieval templates)
- **💬 Chat Settings**: Unique configuration for individual conversations
- **🔄 Auto-Switching**: Settings automatically apply based on active context

### 📦 **Pack Manager System**
**Install and manage BunnyMo content packs from GitHub**:
- **GitHub Browser**: Browse and install community-created packs
- **Auto-Updates**: Keep your content current
- **Dependency Management**: Automatically handles pack requirements
- **Core Packs**: Essential personality types, species definitions, linguistic patterns

---

## 🚀 Key Features

### 🎯 **Baby Bunny Mode** *(Character Archive Creator)*
Transform AI-generated character sheets into lorebook entries with a guided popup:
- **Smart Parser**: Detects `<BunnymoTags>` blocks in AI messages with fallback recovery
- **Batch Processing**: Import multiple characters at once with flexible grouping
  - Create single shared lorebook for all characters
  - Create separate lorebook for each character
  - Add all to existing lorebook
  - Process individually through single-character popup
- **Backwards Compatible**: Handles old BunnyMoTags format (standalone Linguistics blocks)
- **Full Configuration**: Name entries, set trigger keys, edit tags, choose activation scope
- **Collapsible Sections**: Clean UI showing all characters with toggle switches to enable/disable

### 📚 **Dual Repository System**
Organize your lorebooks intelligently:
- **👤 Character Repositories**: Lorebooks containing individual character data
- **📖 Tag Libraries**: Lorebooks with tag definitions (species, personality types, etc.)
- **🔍 Smart Scanning**: Automatically categorizes lorebooks by type
- **🎨 Visual Management**: Card-based interface for browsing characters

### 🧠 **Sheet Command System**
Trigger AI to generate character analysis:
- `!fullsheet [character]` - Comprehensive 8-section psychological analysis
- `!tagsheet [character]` - Lightweight tag-only format
- `!quicksheet [character]` - Streamlined 6-section workup
- Works with multiple characters: `!fullsheet Alice, Bob`
- Automatically injects appropriate templates into AI context

---

## 📖 How It Works

```
You type: "Alice walks into the room"
         ↓
CarrotKernel detects: "Alice"
         ↓
Scans lorebooks: Finds Alice's character archive
         ↓
Injects to AI: "<BunnymoTags><NAME:Alice>, <PERSONALITY:Tsundere>, <TRAIT:Shy></BunnymoTags>"
         ↓
AI responds: *Alice's face flushes red as she looks away* "I-It's not like I wanted to see you or anything!"
```

**Baby Bunny Mode Flow:**
```
AI generates: Character sheet with <BunnymoTags>
         ↓
Click carrot button: Baby Bunny popup appears
         ↓
Configure: Entry name, triggers, tags, lorebook, scope
         ↓
Create Archive: Character data saved to lorebook
         ↓
Auto-Activate: Lorebook enabled for character/chat/global
```

---

## 🛠️ Installation & Setup

### Prerequisites
- SillyTavern (latest version recommended)
- (Optional) BunnyMo lorebook for full functionality

### Step 1: Installation
1. Put the git link in the extension URL input.
2. Enable CarrotKernel in Extensions menu

### Step 2: Quick Start
1. **🔧 Enable Master Toggle**: Turn on CarrotKernel in Extension Settings
2. **📚 Select Lorebooks**: Choose which lorebooks contain character data
3. **🔍 Scan Characters**: Click "Scan Selected Lorebooks" to build repository
4. **✅ Test**: Mention a character in chat - their data should inject automatically!

### Step 3: Optional Configuration
- **🎨 Display Mode**: Choose injection visibility (No Display recommended)
- **⚡ Injection Settings**: Fine-tune depth (4 = same priority as GuidedGenerations)
- **📝 Templates**: Customize character data formatting
- **🎯 Loadouts**: Create different profiles for different situations

---

## 🎮 Usage Guide

### 🏁 **Getting Started Tutorial**
CarrotKernel includes interactive tutorials! Click status panels in Extension Settings:

- **🖥️ System Status**: Basic setup and configuration
- **📚 Character Repository**: Managing character data and lorebooks
- **💉 AI Injection**: Understanding the injection system
- **📝 Template Manager**: Creating custom injection templates
- **📦 Pack Manager**: Installing and updating BunnyMo packs

### 📊 **The Dashboard**
Your CarrotKernel dashboard shows:
- **Characters Indexed**: How many characters are in your repository
- **Selected Lorebooks**: Which lorebooks you're currently using
- **Character Repositories**: Number of lorebooks containing character data
- **System Status**: Real-time status of all systems

### 🥕 **Using Baby Bunny Mode**
1. Have AI generate a character sheet using `!fullsheet [character]`
2. Click the **carrot button** (🥕) on the AI's message
3. Configure in popup:
   - **Single Character**: Full configuration with entry name, triggers, tags
   - **Multiple Characters**: Batch import with grouping options
4. Choose lorebook destination and activation scope
5. Click "Create Archive" - done!

---

## 🎨 Character Data Format

CarrotKernel reads `<BunnymoTags>` blocks from lorebooks:

```html
<BunnymoTags>
<Name:Alice Cooper>, <GENRE:Modern Fantasy>
<PHYSICAL>
<SPECIES:Human>, <GENDER:Female>, <BUILD:Slim>, <BUILD:Athletic>,
<SKIN:Fair>, <HAIR:Long Blonde>, <STYLE:School Uniform>
</PHYSICAL>
<PERSONALITY>
<Dere:Tsundere>, <Dere:Kuudere>, <INTJ-U>,
<TRAIT:Intelligent>, <TRAIT:Stubborn>, <TRAIT:Secretly Caring>,
<ATTACHMENT:Fearful-Avoidant>, <CONFLICT:Competing>, <BOUNDARIES:Rigid>
</PERSONALITY>
<NSFW>
<ORIENTATION:Demisexual>, <POWER:Switch>, <KINK:Praise>,
<CHEMISTRY:Intellectual>, <AROUSAL:Responsive>, <TRAUMA:Abandonment>
</NSFW>
</BunnymoTags>

<Linguistics>
Alice uses <LING:Blunt> as her primary mode of speech, often with <LING:Sarcastic> undertones when flustered. Her dialogue is direct and intelligent.
</Linguistics>
```

---

## 🔧 Advanced Features

### 🌍 **WorldBook Tracker**
Enhanced lorebook monitoring:
- **Active Entries Display**: See what's currently injected
- **Trigger Visualization**: Understand why entries activated
- **Depth Indicators**: Color-coded scan depth display
- **Manual Override**: Force enable/disable specific entries
- **Per-Chat Config**: Different tracking for different conversations

### 📝 **Template System Deep Dive**
Powerful macro variables:
- `{{TRIGGERED_CHARACTER_TAGS}}` - Full character data
- `{{CHARACTER_LIST}}` - Just character names
- `{{PERSONALITY_TAGS}}` - Personality-related tags only
- `{{PHYSICAL_TAGS}}` - Appearance-related tags only
- Custom conditions and formatting logic

### ⚙️ **Loadout Management**
Context-aware configuration:
- **Global Default**: Base settings for all chats
- **Character Override**: Specific character always uses certain templates
- **Chat Override**: This conversation has unique settings
- **Auto-Detection**: System switches automatically

---

## 💡 Pro Tips

### 🎯 **Optimal Settings**
- **Display Mode**: "No Display" for cleanest chat experience
- **Injection Depth**: 4 (standard priority, same as GuidedGenerations)
- **Max Characters**: 6 (prevents context overload in group chats)
- **Filter Context**: Enable to hide raw BunnymoTags from AI

### 📚 **Lorebook Organization**
- **Separate by Type**: Character data vs tag definitions in different lorebooks
- **Clear Naming**: "Alice_Characters" vs "Personality_Library"
- **Regular Scanning**: Re-scan after adding new characters
- **Tag Consistency**: Use consistent naming across all characters

### 🔍 **Troubleshooting**
- **No Injection?** Check Master Enable and AI Injection toggles
- **Wrong Characters?** Verify exact name spelling in lorebooks
- **Too Much Data?** Reduce Max Characters or use filtering
- **AI Confusion?** Try lower injection depth or simpler template

---

## 🎭 What Makes CarrotKernel Special?

### 🧠 **Built for Modern AI**
- Optimized injection timing and formatting
- Context-aware priority management
- Minimal performance impact
- Works with any lorebook format

### 🎨 **Beautiful Interface**
- Glassmorphic design matching SillyTavern
- Responsive layout for all devices
- Interactive tutorials with step-by-step guidance
- Real-time status monitoring

### 🔧 **Maximum Flexibility**
- Template system for complete customization
- Context-aware loadouts (global/character/chat)
- Multiple display modes
- Extensive configuration options

### 🚀 **Future-Proof Architecture**
- Modular design for easy expansion
- Regular updates and improvements
- Built to evolve with AI technology

---

## 🤝 Community & Support

### 📢 **Getting Help**
- Built-in tutorials (click status panels in settings)
- Enable Debug Mode for detailed console logging
- Review character data format requirements
- Test with simple characters first

### 🐛 **Found a Bug?**
1. Enable Debug Mode
2. Reproduce the issue
3. Copy console logs
4. Report with steps to reproduce

### 💡 **Feature Requests**
CarrotKernel is actively developed. Suggestions welcome for:
- New template variables
- Additional display modes
- UI/UX improvements
- Integration features

---

## 🎉 Credits & Acknowledgments

CarrotKernel builds upon the foundation laid by **BunnyMoTags** - we're grateful for the innovation and community that made this possible. This is a spiritual successor, designed to push character consistency and lorebook management into the future while honoring what came before.

**Special thanks to:**
- The SillyTavern development team
- BunnyMoTags original creators
- The AI roleplaying community
- Beta testers and feedback providers

---

*CarrotKernel: Where character consistency meets cutting-edge AI technology* 🥕✨

*Built with ❤️ for the SillyTavern community*
