'use client'

import { useState } from 'react'
import { User, Palette, Edit, Shield, Settings as SettingsIcon, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import type { AppSelection } from './types'

interface SettingsInterfaceProps {
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
}

type SettingsCategory = 'appearance' | 'profile' | 'editor' | 'security' | 'advanced'

const SETTINGS_CATEGORIES = [
  {
    id: 'appearance' as const,
    label: 'Appearance',
    icon: Palette,
    description: 'Theme, fonts, and visual preferences'
  },
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: User,
    description: 'Account information and preferences'
  },
  {
    id: 'editor' as const,
    label: 'Editor',
    icon: Edit,
    description: 'Writing and editing preferences'
  },
  {
    id: 'security' as const,
    label: 'Security',
    icon: Shield,
    description: 'Privacy and security settings'
  },
  {
    id: 'advanced' as const,
    label: 'Advanced',
    icon: SettingsIcon,
    description: 'Developer and advanced options'
  }
]

export function SettingsInterface({ 
  className = '', 
  selection: _selection,
  onSelectionChange: _onSelectionChange,
  onMobileAdvance: _onMobileAdvance
}: SettingsInterfaceProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance')

  return (
    <div className={`flex flex-col h-full bg-bg-secondary ${className}`}>
      {/* Settings Header */}
      <div className="flex-shrink-0 p-6 border-b border-border-dark bg-bg-secondary">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
          <p className="text-text-secondary">Manage your preferences and account settings</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar - Desktop */}
        <div className="hidden md:flex flex-col w-64 border-r border-border-dark bg-bg-primary">
          <nav className="p-4 space-y-1">
            {SETTINGS_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-accent-blue text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-active'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{category.label}</div>
                  <div className="text-xs opacity-75 truncate">{category.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Category Tabs */}
        <div className="md:hidden flex overflow-x-auto border-b border-border-dark bg-bg-primary">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeCategory === category.id
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <SettingsContent category={activeCategory} />
          </div>
        </div>
      </div>
    </div>
  )
}

interface SettingsContentProps {
  category: SettingsCategory
}

function SettingsContent({ category }: SettingsContentProps) {
  switch (category) {
    case 'appearance':
      return <AppearanceSettings />
    case 'profile':
      return <ProfileSettings />
    case 'editor':
      return <EditorSettings />
    case 'security':
      return <SecuritySettings />
    case 'advanced':
      return <AdvancedSettings />
    default:
      return <div>Settings category not found</div>
  }
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun
    },
    {
      id: 'dark', 
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon
    },
    {
      id: 'system',
      name: 'System',
      description: 'Matches your device settings',
      icon: Monitor
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary mb-2">Appearance</h2>
        <p className="text-text-secondary mb-6">Customize the look and feel of your workspace</p>
      </div>
      
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-text-primary mb-2">Theme</h3>
            <p className="text-sm text-text-secondary mb-4">Choose your preferred color scheme</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  theme === themeOption.id
                    ? 'border-accent-blue bg-accent-blue/10 ring-2 ring-accent-blue/20'
                    : 'border-border-dark bg-bg-primary hover:bg-bg-secondary hover:border-border-light'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <themeOption.icon className={`w-5 h-5 ${
                    theme === themeOption.id ? 'text-accent-blue' : 'text-text-secondary'
                  }`} />
                  <span className={`font-medium ${
                    theme === themeOption.id ? 'text-accent-blue' : 'text-text-primary'
                  }`}>
                    {themeOption.name}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  {themeOption.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Appearance Settings Placeholder */}
        <div className="p-4 bg-bg-primary rounded-lg border border-border-dark">
          <h3 className="font-medium text-text-primary mb-2">Typography</h3>
          <p className="text-sm text-text-secondary mb-4">Font and text preferences (coming soon)</p>
          
          <div className="space-y-3 opacity-50">
            <div className="flex items-center justify-between">
              <span className="text-sm">Font size</span>
              <span className="text-sm text-text-secondary">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Font family</span>
              <span className="text-sm text-text-secondary">Sans-serif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary mb-2">Profile</h2>
        <p className="text-text-secondary mb-6">Manage your account information and preferences</p>
      </div>
      
      <div className="p-4 bg-bg-primary rounded-lg border border-border-dark">
        <p className="text-text-secondary">Profile settings coming soon...</p>
      </div>
    </div>
  )
}

function EditorSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary mb-2">Editor</h2>
        <p className="text-text-secondary mb-6">Customize your writing and editing experience</p>
      </div>
      
      <div className="p-4 bg-bg-primary rounded-lg border border-border-dark">
        <p className="text-text-secondary">Editor settings coming soon...</p>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary mb-2">Security</h2>
        <p className="text-text-secondary mb-6">Privacy and security preferences</p>
      </div>
      
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-text-primary">End-to-End Encryption</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">Coming Soon</span>
        </div>
        <p className="text-sm text-text-secondary">
          Encrypt all your notes with a master password. Only you can decrypt and read your data.
        </p>
      </div>
    </div>
  )
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-text-primary mb-2">Advanced</h2>
        <p className="text-text-secondary mb-6">Developer and power user options</p>
      </div>
      
      <div className="p-4 bg-bg-primary rounded-lg border border-border-dark">
        <p className="text-text-secondary">Advanced settings coming soon...</p>
      </div>
    </div>
  )
}