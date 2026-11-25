import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAccessibilityStore, ColorblindMode, TextScale, SignLanguage } from '@/store/accessibilityStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignAvatar } from '@/components/accessibility/SignAvatar';
import { 
  Accessibility,
  Type, 
  Eye, 
  Subtitles, 
  Contrast,
  Hand,
  User,
  Bell,
  Lock,
  Palette,
  RefreshCw
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export default function Settings() {
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'accessibility' | 'notifications' | 'privacy'>('accessibility');
  const [showSignAvatar, setShowSignAvatar] = useState(false);

  const {
    dyslexiaFont,
    setDyslexiaFont,
    colorblindMode,
    setColorblindMode,
    textScale,
    setTextScale,
    highContrast,
    setHighContrast,
    captionsEnabled,
    setCaptionsEnabled,
    signLanguage,
    setSignLanguage,
    resetSettings,
  } = useAccessibilityStore();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  const colorblindModes: { mode: ColorblindMode; label: string; description: string }[] = [
    { mode: 'none', label: 'None', description: 'Standard colors' },
    { mode: 'protanopia', label: 'Protanopia', description: 'Red-blind' },
    { mode: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind' },
    { mode: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9586F2]/10 via-[#C27BA0]/10 to-[#6DAEDB]/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black mb-2">Settings</h1>
          <p className="text-lg text-black/60">Customize your EDUMITE experience</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-4 border-black whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#9586F2] hover:bg-[#AA9DF8] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Accessibility Section */}
        {activeTab === 'accessibility' && (
          <motion.div
            id="accessibility-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visual Accessibility */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-[#9586F2]" />
                <h2 className="text-2xl font-black text-white">Visual Accessibility</h2>
              </div>

              <div className="space-y-6">
                {/* Dyslexia Font */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                      <Type className="w-5 h-5" />
                      Dyslexia-Friendly Font
                    </h3>
                    <p className="text-sm text-white/70">Use OpenDyslexic font</p>
                  </div>
                  <Switch
                    checked={dyslexiaFont}
                    onCheckedChange={setDyslexiaFont}
                  />
                </div>

                {/* Text Scale */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-white">Text Scale</h3>
                      <p className="text-sm text-white/70">Adjust text size</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTextScale(Math.max(0.8, textScale - 0.1) as TextScale)}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        A-
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTextScale(Math.min(1.4, textScale + 0.1) as TextScale)}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        A+
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[textScale]}
                    onValueChange={(value) => setTextScale(value[0] as TextScale)}
                    min={0.8}
                    max={1.4}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>80%</span>
                    <span>100%</span>
                    <span>140%</span>
                  </div>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                      <Contrast className="w-5 h-5" />
                      High Contrast Mode
                    </h3>
                    <p className="text-sm text-white/70">Increase visual contrast</p>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>

                {/* Colorblind Modes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-5 h-5" />
                    <h3 className="font-bold text-lg text-white">Colorblind Mode</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {colorblindModes.map((mode) => (
                      <button
                        key={mode.mode}
                        onClick={() => setColorblindMode(mode.mode)}
                        className={`p-4 rounded-lg border-4 border-black text-left transition-all font-bold ${
                          colorblindMode === mode.mode
                            ? 'bg-[#9586F2] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-black/50 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                        }`}
                      >
                        <div className="font-bold">{mode.label}</div>
                        <div className="text-sm text-white/70">{mode.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Audio & Captions */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian">
              <div className="flex items-center gap-3 mb-6">
                <Subtitles className="w-6 h-6 text-[#C27BA0]" />
                <h2 className="text-2xl font-black text-white">Audio & Captions</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">Live Captions</h3>
                    <p className="text-sm text-white/70">Real-time speech-to-text</p>
                  </div>
                  <Switch
                    checked={captionsEnabled}
                    onCheckedChange={setCaptionsEnabled}
                  />
                </div>

                {captionsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-black/50 rounded-lg border-4 border-[#9586F2]"
                  >
                    <p className="text-sm font-mono text-white">
                      [Live captions will appear here during video lectures and discussions]
                    </p>
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Sign Language Support */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian">
              <div className="flex items-center gap-3 mb-6">
                <Hand className="w-6 h-6 text-[#6DAEDB]" />
                <h2 className="text-2xl font-black text-white">Sign Language Support</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-white">Sign Language</label>
                  <Select
                    value={signLanguage}
                    onValueChange={(value) => setSignLanguage(value as SignLanguage)}
                  >
                    <SelectTrigger className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="asl">ASL (American Sign Language)</SelectItem>
                      <SelectItem value="bsl">BSL (British Sign Language)</SelectItem>
                      <SelectItem value="isl">ISL (Indian Sign Language)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {signLanguage !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={() => setShowSignAvatar(!showSignAvatar)}
                      className="w-full border-4 border-black bg-[#6DAEDB] hover:bg-[#5C9DCA] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {showSignAvatar ? 'Hide' : 'Show'} Sign Language Avatar
                    </Button>

                    {showSignAvatar && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4"
                      >
                        <SignAvatar language={signLanguage} text="Welcome to EDUMITE accessibility settings" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Reset All Settings */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                    <RefreshCw className="w-5 h-5" />
                    Reset All Settings
                  </h3>
                  <p className="text-sm text-white/70">Restore default accessibility settings</p>
                </div>
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  className="border-4 border-black bg-[#C27BA0] text-white font-black hover:bg-[#B16A8F] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Reset
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Profile Section */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">Profile Settings</h2>
              <p className="text-black/60">Profile settings coming soon...</p>
            </Card>
          </motion.div>
        )}

        {/* Notifications Section */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">Notification Settings</h2>
              <p className="text-black/60">Notification settings coming soon...</p>
            </Card>
          </motion.div>
        )}

        {/* Privacy Section */}
        {activeTab === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">Privacy Settings</h2>
              <p className="text-black/60">Privacy settings coming soon...</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
