# Settings Page Implementation Plan

## Overview

This document outlines the implementation plan for a centralized settings page to consolidate user preferences, prepare for E2EE integration, and improve overall user experience.

## Current State Analysis

### Existing Settings (Scattered)
- **Theme toggle**: Currently in header (ThemeToggle component)
- **User auth**: Logout button in header 
- **Keyboard shortcuts**: Help interface
- **No centralized preferences** management
- **Mobile UX issues**: Header crowding on small screens

### Problems to Solve
1. Settings scattered across different UI areas
2. No dedicated space for user profile information
3. Theme toggle takes valuable header space on mobile
4. No scalable architecture for adding new preferences
5. E2EE settings need a secure, prominent location

---

## Implementation Plan

### Timeline: 2 weeks before E2EE implementation

---

## Week 1: Settings Infrastructure & Basic UI

### Day 1-2: Settings Data Architecture

#### Settings Data Structure
```typescript
// Enhanced settings interface
interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  fontFamily: 'mono' | 'sans'
  showLineNumbers: boolean
  
  // Editor
  autoSave: boolean
  autoSaveDelay: number // milliseconds
  spellCheck: boolean
  wordWrap: boolean
  defaultView: 'edit' | 'preview'
  
  // Security (E2EE ready)
  encryptionEnabled: boolean
  autoLogout: 30 | 60 | 0 // minutes, 0 = never
  
  // Advanced
  developer: boolean
  analytics: boolean
}

// User profile information
interface UserProfile {
  id: string
  name?: string
  email: string
  avatar?: string
  createdAt: string
  storageUsed: number // bytes
  noteCount: number
  lastActive: string
}
```

#### Settings Storage & Sync
```typescript
// Settings persistence layer
class SettingsManager {
  // Local storage for immediate access
  private localStorage: LocalStorageAdapter
  
  // API sync for cross-device persistence
  private apiSync: SettingsAPI
  
  async getSettings(): Promise<UserSettings>
  async updateSettings(partial: Partial<UserSettings>): Promise<void>
  async resetToDefaults(): Promise<void>
  async exportSettings(): Promise<string>
  async importSettings(data: string): Promise<void>
}
```

### Day 3-4: Settings Page Component Structure

#### Main Settings Component
```tsx
// src/components/app3/SettingsInterface.tsx
interface SettingsInterfaceProps {
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
}

export function SettingsInterface({ ... }: SettingsInterfaceProps) {
  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      <SettingsHeader />
      <div className="flex-1 flex overflow-hidden">
        <SettingsSidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <SettingsContent category={activeCategory} />
      </div>
    </div>
  )
}
```

#### Settings Categories Structure
```tsx
// Settings category definitions
const SETTINGS_CATEGORIES = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    component: ProfileSettings
  },
  {
    id: 'appearance',
    label: 'Appearance', 
    icon: Palette,
    component: AppearanceSettings
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: Edit,
    component: EditorSettings
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    component: SecuritySettings // E2EE ready
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: Settings,
    component: AdvancedSettings
  }
] as const
```

### Day 5: Navigation Integration

#### Add Settings to App Navigation
```tsx
// Update AppShell3.tsx header
<button
  onClick={() => {
    layout.setSelection({ mode: 'settings', folderId: null, fileId: null })
    if (layout.isMobile || layout.isTablet) {
      layout.setActivePane(3)
    }
  }}
  className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-active rounded transition-colors"
  title="Settings (Ctrl+,)"
>
  <Settings className="w-4 h-4" />
  <span className="hidden sm:inline">Settings</span>
</button>
```

#### Mobile Tab Integration
```tsx
// Update mobile tab bar to include settings
const tabs = [
  { key: 'notebooks', label: 'Notebooks', icon: BookOpen, pane: 1 },
  { key: 'notes', label: 'Notes', icon: FileText, pane: 2 },
  { key: 'search', label: 'Search', icon: Search, pane: 3 },
  { key: 'settings', label: 'Settings', icon: Settings, pane: 3 } // New
]
```

---

## Week 2: Settings Categories Implementation

### Day 1-2: Profile & Appearance Settings

#### Profile Settings Component
```tsx
// Profile section with user info and account management
function ProfileSettings() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-bg-primary rounded-lg">
        <Avatar user={user} size="lg" />
        <div>
          <h3 className="font-medium">{user.name || 'User'}</h3>
          <p className="text-sm text-text-secondary">{user.email}</p>
          <p className="text-xs text-text-secondary">
            Member since {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Account Stats */}
      <StatsGrid>
        <StatCard label="Notes" value={user.noteCount} />
        <StatCard label="Storage" value={formatBytes(user.storageUsed)} />
        <StatCard label="Last active" value={formatRelativeTime(user.lastActive)} />
      </StatsGrid>

      {/* Account Actions */}
      <div className="space-y-3">
        <Button variant="outline" onClick={handleExportData}>
          Export All Data
        </Button>
        <Button variant="destructive" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </div>
  )
}
```

#### Appearance Settings Component
```tsx
// Theme, font, and visual preferences
function AppearanceSettings() {
  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <SettingGroup title="Theme" description="Choose your preferred color scheme">
        <ThemeSelector />
      </SettingGroup>

      {/* Font Settings */}
      <SettingGroup title="Typography" description="Customize text appearance">
        <FontSizeSelector />
        <FontFamilySelector />
      </SettingGroup>

      {/* Editor Appearance */}
      <SettingGroup title="Editor" description="Editor-specific visual settings">
        <ToggleSetting
          label="Show line numbers"
          value={settings.showLineNumbers}
          onChange={updateSetting('showLineNumbers')}
        />
      </SettingGroup>
    </div>
  )
}
```

### Day 3-4: Editor & Security Settings

#### Editor Settings Component
```tsx
// Editor behavior and preferences
function EditorSettings() {
  return (
    <div className="space-y-6">
      {/* Auto-save */}
      <SettingGroup title="Auto-save" description="Automatic saving preferences">
        <ToggleSetting
          label="Enable auto-save"
          value={settings.autoSave}
          onChange={updateSetting('autoSave')}
        />
        <DelaySelector
          label="Auto-save delay"
          value={settings.autoSaveDelay}
          onChange={updateSetting('autoSaveDelay')}
          disabled={!settings.autoSave}
        />
      </SettingGroup>

      {/* Writing Experience */}
      <SettingGroup title="Writing" description="Text editing preferences">
        <ToggleSetting label="Spell check" {...bindSetting('spellCheck')} />
        <ToggleSetting label="Word wrap" {...bindSetting('wordWrap')} />
        <SelectSetting
          label="Default view"
          options={[
            { value: 'edit', label: 'Edit Mode' },
            { value: 'preview', label: 'Preview Mode' }
          ]}
          {...bindSetting('defaultView')}
        />
      </SettingGroup>
    </div>
  )
}
```

#### Security Settings Component (E2EE Ready)
```tsx
// Security and privacy preferences - prepared for E2EE
function SecuritySettings() {
  return (
    <div className="space-y-6">
      {/* Encryption Section - Ready for V1 */}
      <SettingGroup 
        title="Encryption" 
        description="End-to-end encryption for your notes"
      >
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium">End-to-End Encryption</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            Encrypt all your notes with a master password. Only you can decrypt and read your data.
          </p>
          <ToggleSetting
            label="Enable encryption for all notes"
            value={settings.encryptionEnabled}
            onChange={updateSetting('encryptionEnabled')}
            disabled={true} // Enable in E2EE implementation
          />
        </div>
      </SettingGroup>

      {/* Session Security */}
      <SettingGroup title="Session" description="Login and session preferences">
        <SelectSetting
          label="Auto-logout after"
          options={[
            { value: 30, label: '30 minutes' },
            { value: 60, label: '1 hour' },
            { value: 0, label: 'Never' }
          ]}
          {...bindSetting('autoLogout')}
        />
      </SettingGroup>
    </div>
  )
}
```

### Day 5: Advanced Settings & Polish

#### Advanced Settings Component
```tsx
// Developer and advanced user preferences
function AdvancedSettings() {
  return (
    <div className="space-y-6">
      {/* Developer Options */}
      <SettingGroup title="Developer" description="Options for developers and power users">
        <ToggleSetting
          label="Developer mode"
          description="Enable advanced features and debugging"
          {...bindSetting('developer')}
        />
      </SettingGroup>

      {/* Privacy */}
      <SettingGroup title="Privacy" description="Data collection preferences">
        <ToggleSetting
          label="Anonymous analytics"
          description="Help improve the app by sharing usage data"
          {...bindSetting('analytics')}
        />
      </SettingGroup>

      {/* Data Management */}
      <SettingGroup title="Data" description="Import and export your settings">
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportSettings}>
            Export Settings
          </Button>
          <Button variant="outline" onClick={handleImportSettings}>
            Import Settings
          </Button>
        </div>
        <Button variant="outline" onClick={handleResetSettings}>
          Reset to Defaults
        </Button>
      </SettingGroup>
    </div>
  )
}
```

---

## Mobile Optimization

### Responsive Design Strategy
```tsx
// Mobile-first settings layout
function SettingsInterface() {
  const [activeCategory, setActiveCategory] = useState('profile')
  const isMobile = useBreakpoint('mobile')

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Mobile: Stack categories and content */}
        <CategoryTabs />
        <SettingsContent category={activeCategory} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Desktop: Sidebar + content */}
      <SettingsSidebar />
      <SettingsContent />
    </div>
  )
}
```

### Mobile Navigation
```tsx
// Tab-based navigation for mobile
function CategoryTabs() {
  return (
    <div className="flex overflow-x-auto border-b border-border-dark">
      {SETTINGS_CATEGORIES.map(category => (
        <button
          key={category.id}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
            activeCategory === category.id
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary'
          }`}
          onClick={() => setActiveCategory(category.id)}
        >
          <category.icon className="w-4 h-4 mx-auto mb-1" />
          {category.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Migration Strategy

### Phase 1: Create Settings Infrastructure
1. **Settings data models** and storage layer
2. **Settings page routing** in app shell
3. **Basic UI components** for settings

### Phase 2: Migrate Existing Settings
1. **Move theme toggle** from header to settings
2. **Preserve current functionality** during transition
3. **Update all references** to theme settings

### Phase 3: Add New Categories
1. **Profile information** display
2. **Editor preferences** 
3. **Security section** (E2EE placeholder)

### Phase 4: Polish & Optimization
1. **Mobile responsiveness**
2. **Keyboard shortcuts** (Ctrl+,)
3. **Settings import/export**
4. **Accessibility improvements**

---

## Integration with E2EE (Version 1)

### E2EE Settings Preparation
```tsx
// Security settings ready for E2EE implementation
function EncryptionSettings() {
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)

  return (
    <SettingGroup title="Encryption">
      <ToggleSetting
        label="Encrypt all my notes"
        description="Enable end-to-end encryption with master password"
        value={settings.encryptionEnabled}
        onChange={(enabled) => {
          if (enabled) {
            setShowPasswordSetup(true)
          } else {
            handleDisableEncryption()
          }
        }}
      />
      
      {showPasswordSetup && (
        <PasswordSetupModal
          onComplete={handleEncryptionEnabled}
          onCancel={() => setShowPasswordSetup(false)}
        />
      )}
    </SettingGroup>
  )
}
```

---

## File Structure

```
src/components/app3/
├── SettingsInterface.tsx         # Main settings page
├── settings/
│   ├── SettingsHeader.tsx        # Page header
│   ├── SettingsSidebar.tsx       # Category navigation
│   ├── SettingsContent.tsx       # Content area
│   ├── categories/
│   │   ├── ProfileSettings.tsx
│   │   ├── AppearanceSettings.tsx
│   │   ├── EditorSettings.tsx
│   │   ├── SecuritySettings.tsx
│   │   └── AdvancedSettings.tsx
│   └── components/
│       ├── SettingGroup.tsx      # Setting section wrapper
│       ├── ToggleSetting.tsx     # Toggle/switch component
│       ├── SelectSetting.tsx     # Select dropdown
│       ├── StatCard.tsx          # Profile stats display
│       └── ThemeSelector.tsx     # Theme selection UI

src/hooks/
├── useSettings.ts                # Settings management hook
└── useUserProfile.ts             # User info management

src/lib/
└── settings-manager.ts           # Settings persistence layer
```

---

## Testing Strategy

### Unit Tests
- Settings data validation
- Component rendering
- Setting update functions
- Import/export functionality

### Integration Tests
- Settings persistence across sessions
- Theme changes affecting app
- Mobile responsive behavior
- Keyboard navigation

### E2E Tests
- Complete settings workflow
- Migration from header theme toggle
- Settings sync across tabs
- Mobile touch interactions

---

## Success Metrics

### User Experience
- ✅ All settings accessible from one location
- ✅ Mobile-friendly settings interface
- ✅ Header decluttered (theme toggle moved)
- ✅ Professional settings page design

### Technical Foundation
- ✅ Scalable settings architecture
- ✅ E2EE integration ready
- ✅ Cross-device settings sync capability
- ✅ Import/export functionality

### Performance
- ✅ Fast settings page load
- ✅ Smooth category switching
- ✅ Efficient settings persistence

---

## Implementation Priority

### Must Have (Week 1)
1. Settings page structure and navigation
2. Theme toggle migration from header
3. Basic profile information display
4. Mobile responsive design

### Should Have (Week 2) 
1. All settings categories implemented
2. Editor preferences functionality
3. Security section with E2EE placeholder
4. Settings import/export

### Nice to Have (Future)
1. Advanced keyboard shortcuts
2. Settings search functionality
3. Backup/restore settings to cloud
4. Settings version control

---

## Conclusion

This settings page implementation creates a solid foundation for user preferences management while preparing for E2EE integration. The phased approach ensures existing functionality remains stable while adding significant value through better organization and mobile UX.

The architecture is designed to scale with future features and provides a professional, user-friendly interface that matches modern app standards.