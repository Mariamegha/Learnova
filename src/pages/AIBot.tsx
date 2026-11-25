import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { chatWithGemini } from '@/lib/gemini';
// TODO [Phase 35]: Replace chatWithGemini with useAIContext hook
// import { useAIContext } from '@/hooks/useAIContext';
// const aiContext = useAIContext({ contextType: 'study-assistant' });
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslatedText } from '@/hooks/useTranslation';
import { Sparkles, Send, Mic, Volume2, Languages, Loader2, MessageSquare, Clock, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import SpotlightCard from '@/components/3D/SpotlightCard';
import { generateMockAIResponse, MOCK_SUGGESTED_PROMPTS, MOCK_CONVERSATIONS, USE_MOCK_DATA, mockDelay, MOCK_VERIFIED_SOURCES, MOCK_VERIFIED_CONVERSATION, MOCK_COURSE_INFO } from '@/mocks';
import { VerificationBanner } from '@/components/VerificationBanner';
import { ModeToggle } from '@/components/ModeToggle';
import { CitationCard } from '@/components/CitationCard';
import { SourcePanel } from '@/components/SourcePanel';
import { ReasoningDrawer } from '@/components/ReasoningDrawer';
import { InstructorSourceManager } from '@/components/InstructorSourceManager';
import { VerifiedAIMessage } from '@/mocks/verifiedSources';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function AIBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [verifiedMessages, setVerifiedMessages] = useState<VerifiedAIMessage[]>(MOCK_VERIFIED_CONVERSATION);
  const [mode, setMode] = useState<'verified' | 'general'>('verified');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [selectedMessageForReasoning, setSelectedMessageForReasoning] = useState<VerifiedAIMessage | null>(null);
  const [sources, setSources] = useState(MOCK_VERIFIED_SOURCES);
  const { toast } = useToast();
  const placeholderText = useTranslatedText('Ask me anything...');

  const currentMessages = mode === 'verified' ? verifiedMessages : messages;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    };
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (mode === 'verified') {
      // Verified mode: use verified messages
      const newVerifiedUserMsg: VerifiedAIMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: currentInput,
        timestamp: new Date().toISOString(),
      };
      setVerifiedMessages(prev => [...prev, newVerifiedUserMsg]);
      
      try {
        await mockDelay(1200);
        const aiResponse: VerifiedAIMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: generateMockAIResponse(currentInput),
          timestamp: new Date().toISOString(),
          citations: [
            {
              sourceId: sources[0].id,
              sourceTitle: sources[0].title,
              page: Math.floor(Math.random() * 50) + 1,
              confidence: Math.floor(Math.random() * 15) + 85,
              quote: 'Sample quote from verified source supporting this answer.',
            },
          ],
          hallucinationCheck: {
            passed: true,
            confidence: 96,
            flags: [],
          },
          reasoning: {
            confidenceScore: 94,
            sourcesConsulted: [sources[0].id, sources[1]?.id].filter(Boolean),
            methodology: 'Answer generated from verified course materials with cross-referencing.',
          },
        };
        setVerifiedMessages(prev => [...prev, aiResponse]);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to get AI response.';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // General mode: use regular messages
      setMessages((prev) => [...prev, userMessage]);

      try {
        let responseContent: string;
        
        if (USE_MOCK_DATA) {
          await mockDelay(800);
          responseContent = generateMockAIResponse(currentInput);
        } else {
          responseContent = await chatWithGemini([...messages, userMessage]);
        }
        
        const aiMessage: Message = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to get AI response. Please try again.';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        const fallbackMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or rephrase your question.',
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="relative min-h-screen bg-deepblack">
      <div className="container mx-auto h-[calc(100vh-6rem)] px-4 py-6">
      <div className="grid h-full gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat Area */}
        <Card className="flex flex-col border-4 border-black shadow-pink-brutal">
          <div className="flex items-center justify-between border-b-4 border-pink p-4 bg-obsidian">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pink" />
              <h1 className="text-2xl font-black uppercase text-gold"><TranslatedText text="AI Study Assistant" /></h1>
            </div>
            <div className="flex gap-2">
              <ModeToggle mode={mode} onModeChange={setMode} disabled={isLoading} />
              {mode === 'verified' && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSourcePanel(!showSourcePanel)}
                    title="Toggle Sources"
                    className="text-green-500 hover:bg-green-500/20"
                  >
                    <BookOpen className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSourceManager(true)}
                    title="Manage Sources"
                    className="text-[#9586F2] hover:bg-[#9586F2]/20"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" title="Translate" className="text-gold hover:bg-gold/20">
                <Languages className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Read aloud" className="text-pink hover:bg-pink/20">
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 bg-obsidian">
            <div className="space-y-4">
              {mode === 'verified' && <VerificationBanner course={MOCK_COURSE_INFO} mode={mode} />}
              
              {currentMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-white">
                    <Sparkles className="mx-auto mb-4 h-16 w-16 text-gold" />
                    <p className="text-2xl font-black uppercase text-gold mb-2"><TranslatedText text="Start a conversation" /></p>
                    <p className="text-lg font-bold text-white/70"><TranslatedText text="Ask me anything about your studies!" /></p>
                  </div>
                </div>
              ) : (
                currentMessages.map((message, index) => {
                  const isVerified = mode === 'verified' && 'citations' in message;
                  return (
                    <div key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-6 py-4 ${
                            message.role === 'user'
                              ? 'bg-gold text-black border-2 border-black shadow-gold-heavy font-bold'
                              : isVerified
                              ? 'bg-obsidian text-white border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] font-bold'
                              : 'bg-pink text-white border-2 border-black shadow-pink-heavy font-bold'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </motion.div>
                      
                      {/* Citations for verified messages */}
                      {isVerified && message.role === 'assistant' && (message as VerifiedAIMessage).citations && (
                        <div className="ml-12 mt-2 space-y-2">
                          {(message as VerifiedAIMessage).citations!.map((citation, citIndex) => (
                            <CitationCard 
                              key={citIndex} 
                              citation={citation}
                              onClick={() => setSelectedMessageForReasoning(message as VerifiedAIMessage)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="border-t-4 border-gold p-4 bg-obsidian">
            <div className="flex gap-2">
              <Input
                placeholder={placeholderText}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
                className="border-2 border-gold font-bold text-white placeholder:text-white/50 bg-black/50 focus-visible:ring-gold focus-visible:ring-2"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                disabled={isLoading}
                className="border-2 border-gold bg-gold/20 text-gold hover:bg-gold hover:text-black font-black"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="border-2 border-pink bg-pink text-white hover:bg-pink/80 shadow-pink-heavy font-black"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Suggestions Sidebar */}
        <div className="hidden lg:block space-y-4">
          {/* Quick Prompts */}
          <SpotlightCard spotlightColor="rgba(255, 215, 0, 0.3)">
          <Card className="p-6 border-4 border-black shadow-gold-brutal bg-obsidian">
            <h3 className="mb-4 text-xl font-black uppercase text-gold"><TranslatedText text="Quick Prompts" /></h3>
            <div className="space-y-3">
              {MOCK_SUGGESTED_PROMPTS.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="w-full justify-start text-left border-2 border-gold text-gold hover:bg-gold hover:text-black font-bold shadow-gold-medium text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </Button>
              ))}
            </div>
          </Card>
          </SpotlightCard>

          {/* Recent Conversations */}
          <SpotlightCard spotlightColor="rgba(255, 20, 147, 0.3)">
          <Card className="p-6 border-4 border-black shadow-pink-brutal bg-obsidian">
            <h3 className="mb-4 text-xl font-black uppercase text-pink flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <TranslatedText text="History" />
            </h3>
            <div className="space-y-2">
              {MOCK_CONVERSATIONS.map((conv) => (
                <div
                  key={conv.id}
                  className="p-2 border-2 border-pink/30 rounded bg-black/30 hover:bg-pink/10 cursor-pointer transition-colors"
                >
                  <p className="text-xs font-bold text-pink truncate">{conv.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          </SpotlightCard>

          {/* Pro Tips */}
          <SpotlightCard spotlightColor="rgba(109, 174, 219, 0.3)">
          <Card className="p-6 border-4 border-black shadow-brutal bg-obsidian">
            <h3 className="mb-3 text-xl font-black uppercase text-blue"><TranslatedText text="Pro Tips" /></h3>
            <ul className="space-y-3 text-sm text-white font-bold">
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <TranslatedText text="Be specific with your questions" />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <TranslatedText text="Ask for examples and practice problems" />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <TranslatedText text="Request step-by-step explanations" />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <TranslatedText text="Use voice input for faster typing" />
              </li>
            </ul>
          </Card>
          </SpotlightCard>
        </div>
      </div>
      </div>
      
      {/* Source Panel */}
      {mode === 'verified' && (
        <SourcePanel 
          sources={sources}
          isOpen={showSourcePanel}
          onClose={() => setShowSourcePanel(false)}
        />
      )}
      
      {/* Reasoning Drawer */}
      <ReasoningDrawer
        message={selectedMessageForReasoning}
        isOpen={!!selectedMessageForReasoning}
        onClose={() => setSelectedMessageForReasoning(null)}
      />
      
      {/* Instructor Source Manager */}
      <InstructorSourceManager
        sources={sources}
        isOpen={showSourceManager}
        onClose={() => setShowSourceManager(false)}
        onSourcesUpdate={setSources}
      />
    </div>
  );
}

