import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Maximize2, Minimize2, Settings, Save, Grid3x3, 
  Code, FileText, Brain, BookOpen, Video, MessageSquare, 
  Calculator, Terminal, Database, Globe, ChevronLeft, Sparkles,
  Layers, Split, LayoutGrid, Eye, Target, Zap, CheckCircle, 
  Circle, Calendar, Clock, AlertCircle, Briefcase, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GridScan from '@/components/3D/GridScan';
import { ThreeDFallback } from '@/components/3D/ThreeDFallback';
import IDE from '@/components/IDE';
import { MentorChat } from '@/components/MentorChat';
import { TranslatedText } from '@/components/TranslatedText';
import { AITutorPanel, AITutorTrigger } from '@/components/AITutorPanel';
import { ToolAIHelper } from '@/components/ToolAIHelper';

type ToolType = 
  | 'code-editor' 
  | 'ai-tutor' 
  | 'documentation' 
  | 'notes' 
  | 'terminal'
  | 'database-viewer'
  | 'api-tester'
  | 'video-player'
  | 'whiteboard'
  | 'calculator'
  | 'file-explorer'
  | 'browser'
  | 'roadmap'
  | 'institution-tasks'
  | 'saved-notes'
  | 'session-notes';

interface Tool {
  id: string;
  type: ToolType;
  title: string;
  isMaximized: boolean;
  position: { x: number; y: number };
  data?: Record<string, unknown>; // For storing tool-specific data like tasks
}

interface WorkspaceTab {
  id: string;
  name: string;
  type: keyof WorkspaceConfig;
  tools: Tool[];
  isActive: boolean;
}

interface WorkspaceConfig {
  frontend: {
    name: 'Frontend Development';
    defaultTools: ToolType[];
    availableTools: ToolType[];
    theme: 'gold';
  };
  backend: {
    name: 'Backend Development';
    defaultTools: ToolType[];
    availableTools: ToolType[];
    theme: 'pink';
  };
  ml: {
    name: 'Machine Learning';
    defaultTools: ToolType[];
    availableTools: ToolType[];
    theme: 'blue';
  };
  datascience: {
    name: 'Data Science';
    defaultTools: ToolType[];
    availableTools: ToolType[];
    theme: 'gold';
  };
  cybersecurity: {
    name: 'Cybersecurity';
    defaultTools: ToolType[];
    availableTools: ToolType[];
    theme: 'pink';
  };
}

const WORKSPACE_CONFIGS: WorkspaceConfig = {
  frontend: {
    name: 'Frontend Development',
    defaultTools: ['roadmap'],
    availableTools: ['code-editor', 'browser', 'ai-tutor', 'documentation', 'notes', 'terminal', 'file-explorer', 'whiteboard', 'institution-tasks', 'video-player', 'saved-notes'],
    theme: 'gold',
  },
  backend: {
    name: 'Backend Development',
    defaultTools: ['roadmap'],
    availableTools: ['code-editor', 'terminal', 'database-viewer', 'api-tester', 'ai-tutor', 'documentation', 'notes', 'file-explorer', 'institution-tasks', 'video-player', 'saved-notes'],
    theme: 'pink',
  },
  ml: {
    name: 'Machine Learning',
    defaultTools: ['roadmap'],
    availableTools: ['code-editor', 'ai-tutor', 'calculator', 'notes', 'terminal', 'documentation', 'whiteboard', 'file-explorer', 'institution-tasks', 'video-player', 'saved-notes'],
    theme: 'blue',
  },
  datascience: {
    name: 'Data Science',
    defaultTools: ['roadmap'],
    availableTools: ['code-editor', 'calculator', 'database-viewer', 'whiteboard', 'ai-tutor', 'notes', 'terminal', 'documentation', 'institution-tasks', 'video-player', 'saved-notes'],
    theme: 'gold',
  },
  cybersecurity: {
    name: 'Cybersecurity',
    defaultTools: ['roadmap'],
    availableTools: ['terminal', 'code-editor', 'browser', 'notes', 'ai-tutor', 'documentation', 'database-viewer', 'file-explorer', 'institution-tasks', 'video-player', 'saved-notes'],
    theme: 'pink',
  },
};

const TOOL_METADATA = {
  'code-editor': { icon: <Code />, title: 'Code Editor', color: 'gold' },
  'ai-tutor': { icon: <Brain />, title: 'AI Tutor', color: 'pink' },
  'documentation': { icon: <BookOpen />, title: 'Documentation', color: 'blue' },
  'notes': { icon: <FileText />, title: 'Notes', color: 'gold' },
  'terminal': { icon: <Terminal />, title: 'Terminal', color: 'pink' },
  'database-viewer': { icon: <Database />, title: 'Database', color: 'blue' },
  'api-tester': { icon: <Zap />, title: 'API Tester', color: 'gold' },
  'video-player': { icon: <Video />, title: 'Video Player', color: 'pink' },
  'whiteboard': { icon: <Layers />, title: 'Whiteboard', color: 'blue' },
  'calculator': { icon: <Calculator />, title: 'Calculator', color: 'gold' },
  'file-explorer': { icon: <FileText />, title: 'Files', color: 'pink' },
  'browser': { icon: <Globe />, title: 'Browser', color: 'blue' },
  'roadmap': { icon: <Target />, title: 'Roadmap', color: 'gold' },
  'institution-tasks': { icon: <CheckCircle />, title: 'Institution Tasks', color: 'pink' },
  'saved-notes': { icon: <Save />, title: 'Saved Notes', color: 'gold' },
  'session-notes': { icon: <FileText />, title: 'Session Notes', color: 'pink' },
};

export default function WorkspaceView() {
  const { workspaceType } = useParams<{ workspaceType: keyof WorkspaceConfig }>();
  const navigate = useNavigate();
  
  const config = workspaceType && WORKSPACE_CONFIGS[workspaceType];
  const [workspaceTabs, setWorkspaceTabs] = useState<WorkspaceTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'split' | 'freeform'>('grid');
  
  // Session tracking state
  const [sessionActivities, setSessionActivities] = useState<Record<string, {
    toolsUsed: string[];
    prompts: string[];
    activities: string[];
    timeSpent: number;
    lastUpdated: Date;
  }>>({});
  
  const [savedNotes, setSavedNotes] = useState<{
    id: string;
    sessionId: string;
    sessionTitle: string;
    content: string;
    savedAt: Date;
  }[]>([]);
  
  const [sessionNotesContent, setSessionNotesContent] = useState<Record<string, string>>({});
  
  // AI Tutor state (non-intrusive)
  const [showAITutor, setShowAITutor] = useState(false);
  
  const activeTab = workspaceTabs.find(tab => tab.id === activeTabId);
  const tools = activeTab?.tools || [];

  useEffect(() => {
    if (config && workspaceType) {
      // Initialize with first workspace tab
      const defaultTools: Tool[] = config.defaultTools.map((type, index) => ({
        id: `tool-${Date.now()}-${index}`,
        type,
        title: TOOL_METADATA[type].title,
        isMaximized: false,
        position: { x: 0, y: 0 },
      }));
      
      const initialTab: WorkspaceTab = {
        id: `tab-${Date.now()}`,
        name: config.name,
        type: workspaceType,
        tools: defaultTools,
        isActive: true,
      };
      
      setWorkspaceTabs([initialTab]);
      setActiveTabId(initialTab.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceType]);

  if (!config || !workspaceType) {
    return (
      <div className="min-h-screen bg-deepblack flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gold mb-4">Workspace Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const addWorkspaceTab = (type: keyof WorkspaceConfig) => {
    const newConfig = WORKSPACE_CONFIGS[type];
    const defaultTools: Tool[] = newConfig.defaultTools.map((toolType, index) => ({
      id: `tool-${Date.now()}-${index}`,
      type: toolType,
      title: TOOL_METADATA[toolType].title,
      isMaximized: false,
      position: { x: 0, y: 0 },
    }));
    
    const newTab: WorkspaceTab = {
      id: `tab-${Date.now()}`,
      name: newConfig.name,
      type: type,
      tools: defaultTools,
      isActive: false,
    };
    
    setWorkspaceTabs([...workspaceTabs, newTab]);
    setActiveTabId(newTab.id);
    setShowAddWorkspace(false);
  };

  const removeWorkspaceTab = (tabId: string) => {
    const updatedTabs = workspaceTabs.filter(t => t.id !== tabId);
    setWorkspaceTabs(updatedTabs);
    if (activeTabId === tabId && updatedTabs.length > 0) {
      setActiveTabId(updatedTabs[0].id);
    }
  };

  const addTool = (type: ToolType, data?: Record<string, unknown>) => {
    if (!activeTab) return;
    
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      type,
      title: data?.title as string || TOOL_METADATA[type].title,
      isMaximized: false,
      position: { x: 0, y: 0 },
      data,
    };
    
    const updatedTabs = workspaceTabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, tools: [...tab.tools, newTool] }
        : tab
    );
    
    setWorkspaceTabs(updatedTabs);
    setShowAddTool(false);
  };

  const removeTool = (id: string) => {
    if (!activeTab) return;
    
    const updatedTabs = workspaceTabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, tools: tab.tools.filter(t => t.id !== id) }
        : tab
    );
    
    setWorkspaceTabs(updatedTabs);
  };

  const toggleMaximize = (id: string) => {
    if (!activeTab) return;
    
    const updatedTabs = workspaceTabs.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            tools: tab.tools.map(t => 
              t.id === id ? { ...t, isMaximized: !t.isMaximized } : { ...t, isMaximized: false }
            )
          }
        : tab
    );
    
    setWorkspaceTabs(updatedTabs);
  };

  // Session Activity Tracking
  const trackActivity = (sessionId: string, activity: string, toolUsed?: string, prompt?: string) => {
    setSessionActivities(prev => {
      const current = prev[sessionId] || {
        toolsUsed: [],
        prompts: [],
        activities: [],
        timeSpent: 0,
        lastUpdated: new Date(),
      };
      
      return {
        ...prev,
        [sessionId]: {
          ...current,
          toolsUsed: toolUsed && !current.toolsUsed.includes(toolUsed) 
            ? [...current.toolsUsed, toolUsed] 
            : current.toolsUsed,
          prompts: prompt ? [...current.prompts, prompt] : current.prompts,
          activities: [...current.activities, `${new Date().toLocaleTimeString()}: ${activity}`],
          lastUpdated: new Date(),
        },
      };
    });
  };

  // Save Note Function
  const saveNote = (sessionId: string, sessionTitle: string, content: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      sessionId,
      sessionTitle,
      content,
      savedAt: new Date(),
    };
    setSavedNotes(prev => [...prev, newNote]);
    trackActivity(sessionId, `Saved note: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
  };

  const maximizedTool = tools.find(t => t.isMaximized);

  const renderToolContent = (tool: Tool) => {
    switch (tool.type) {
      case 'code-editor':
        return (
          <div className="h-full bg-black/90 rounded-lg overflow-hidden relative">
            <IDE courseId="workspace" moduleNumber={1} />
            {workspaceType && (
              <ToolAIHelper 
                toolName="Code Editor" 
                toolType="code-editor" 
                workspaceType={workspaceType} 
              />
            )}
          </div>
        );
      case 'ai-tutor':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg overflow-hidden">
            <MentorChat mentor={{ 
              id: 'ai-tutor', 
              user_id: 'ai-system',
              name: 'AI Tutor', 
              avatar: '🤖',
              specialization: [workspaceType || 'general'],
              bio: `AI assistant specialized in ${config.name}`,
              rating: 5,
              students_count: 0,
              is_connected: true
            }} />
          </div>
        );
      case 'documentation':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6 overflow-y-auto relative">
            <h3 className="text-2xl font-black text-gold mb-4">📚 Documentation</h3>
            <div className="space-y-4 text-white/80">
              <div className="p-4 border-2 border-gold/30 rounded bg-black/30">
                <h4 className="font-bold text-gold mb-2">Getting Started</h4>
                <p>Learn the basics of {config.name}</p>
              </div>
              <div className="p-4 border-2 border-pink/30 rounded bg-black/30">
                <h4 className="font-bold text-pink mb-2">Best Practices</h4>
                <p>Industry-standard approaches and patterns</p>
              </div>
              <div className="p-4 border-2 border-blue/30 rounded bg-black/30">
                <h4 className="font-bold text-blue mb-2">Advanced Topics</h4>
                <p>Deep dive into complex concepts</p>
              </div>
            </div>
            {workspaceType && (
              <ToolAIHelper 
                toolName="Documentation" 
                toolType="documentation" 
                workspaceType={workspaceType} 
              />
            )}
          </div>
        );
      case 'notes':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6">
            <textarea 
              className="w-full h-full bg-black/50 text-white p-4 rounded border-2 border-gold/30 focus:border-gold outline-none resize-none font-mono"
              placeholder="Type your notes here..."
            />
          </div>
        );
      case 'terminal':
        return (
          <div className="h-full bg-black rounded-lg p-4 font-mono text-green-400 relative">
            <div className="mb-2">$ Welcome to {config.name} Terminal</div>
            <div className="mb-2 text-green-300">$ Type commands here...</div>
            <div className="flex items-center">
              <span className="text-gold mr-2">{'>'}</span>
              <input 
                type="text" 
                className="flex-1 bg-transparent outline-none text-white"
                placeholder="Enter command..."
              />
            </div>
            {workspaceType && (
              <ToolAIHelper 
                toolName="Terminal" 
                toolType="terminal" 
                workspaceType={workspaceType} 
              />
            )}
          </div>
        );
      case 'database-viewer':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6 overflow-y-auto relative">
            <h3 className="text-2xl font-black text-pink mb-4">🗄️ Database Viewer</h3>
            <div className="space-y-2">
              <div className="p-3 bg-black/50 border-2 border-pink/30 rounded">
                <div className="font-bold text-pink">Users Table</div>
                <div className="text-xs text-white/60 mt-1">125 records</div>
              </div>
              <div className="p-3 bg-black/50 border-2 border-gold/30 rounded">
                <div className="font-bold text-gold">Products Table</div>
                <div className="text-xs text-white/60 mt-1">543 records</div>
              </div>
            </div>
            {workspaceType && (
              <ToolAIHelper 
                toolName="Database Viewer" 
                toolType="database-viewer" 
                workspaceType={workspaceType} 
              />
            )}
          </div>
        );
      case 'api-tester':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6 relative">
            <h3 className="text-2xl font-black text-gold mb-4">⚡ API Tester</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <select className="px-4 py-2 bg-black border-2 border-gold text-white rounded font-bold">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
                <input 
                  type="text" 
                  placeholder="https://api.example.com/endpoint"
                  className="flex-1 px-4 py-2 bg-black border-2 border-gold/30 text-white rounded"
                />
                <Button className="bg-gold text-black font-black hover:bg-gold/80">
                  Send
                </Button>
              </div>
              <div className="p-4 bg-black/50 border-2 border-pink/30 rounded font-mono text-sm text-white/80">
                Response will appear here...
              </div>
            </div>
            {workspaceType && (
              <ToolAIHelper 
                toolName="API Tester" 
                toolType="api-tester" 
                workspaceType={workspaceType} 
              />
            )}
          </div>
        );
      case 'whiteboard':
        return (
          <div className="h-full bg-white rounded-lg relative">
            <div className="absolute top-4 left-4 flex gap-2">
              {['black', 'red', 'blue', 'green'].map(color => (
                <div 
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 border-black cursor-pointer`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Draw your ideas here...
            </div>
          </div>
        );
      case 'calculator':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6">
            <h3 className="text-2xl font-black text-blue mb-4">🔢 Calculator</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-black border-2 border-blue text-white text-right text-2xl rounded font-mono"
                placeholder="0"
              />
              <div className="grid grid-cols-4 gap-2">
                {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
                  <button 
                    key={btn}
                    className="p-4 bg-black border-2 border-blue/30 text-white font-bold rounded hover:bg-blue/20 transition-colors"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'file-explorer':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6 overflow-y-auto">
            <h3 className="text-2xl font-black text-pink mb-4">📁 File Explorer</h3>
            <div className="space-y-2">
              <div className="p-2 hover:bg-black/50 cursor-pointer rounded">📂 src/</div>
              <div className="pl-4 space-y-2">
                <div className="p-2 hover:bg-black/50 cursor-pointer rounded">📄 index.tsx</div>
                <div className="p-2 hover:bg-black/50 cursor-pointer rounded">📄 App.tsx</div>
              </div>
              <div className="p-2 hover:bg-black/50 cursor-pointer rounded">📂 components/</div>
              <div className="p-2 hover:bg-black/50 cursor-pointer rounded">📄 package.json</div>
            </div>
          </div>
        );
      case 'browser':
        return (
          <div className="h-full bg-white rounded-lg flex flex-col">
            <div className="bg-gray-100 border-b-2 border-gray-300 p-2 flex items-center gap-2 flex-shrink-0">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <input 
                type="text" 
                className="flex-1 px-3 py-1 bg-white border border-gray-300 rounded"
                placeholder="https://example.com"
                defaultValue={(tool.data?.url as string) || ''}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              {tool.data?.url ? (
                <iframe
                  src={tool.data.url as string}
                  className="w-full h-full border-0"
                  title="Browser Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Enter a URL to preview
                </div>
              )}
            </div>
          </div>
        );
      case 'video-player':
        return (
          <div className="h-full bg-black rounded-lg flex flex-col">
            <div className="p-3 border-b-2 border-pink flex items-center justify-between bg-obsidian/50">
              <h4 className="text-white font-bold text-sm">{(tool.data?.title as string) || 'Video Player'}</h4>
              <Badge className="bg-pink text-white text-xs">
                <Video className="w-3 h-3 mr-1" />
                Lesson Video
              </Badge>
            </div>
            <div className="flex-1 overflow-hidden">
              {tool.data?.url ? (
                <iframe
                  src={tool.data.url as string}
                  className="w-full h-full border-0"
                  title="Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-3 text-pink" />
                    <p>No video loaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'roadmap': {
        // Domain-specific roadmaps with real YouTube content
        const getRoadmapData = () => {
          const workspaceType = activeTab?.type;
          
          if (workspaceType === 'frontend') {
            return {
              totalSessions: 48,
              completedSessions: 18,
              totalTime: '72h 45m',
              overallProgress: 38,
              phases: [
                { 
                  phase: '🎨 Foundation', 
                  progress: 100, 
                  sessions: [
                    { 
                      title: 'HTML & CSS Crash Course', 
                      duration: '2h 15m', 
                      video: 'https://www.youtube.com/embed/mU6anWqZJcc',
                      notes: 'Master HTML5 semantics, CSS Grid, Flexbox, and responsive design principles',
                      completed: true,
                      resources: ['MDN Docs', 'Can I Use', 'CSS Tricks', 'Codepen']
                    },
                    { 
                      title: 'JavaScript Fundamentals', 
                      duration: '3h 30m', 
                      video: 'https://www.youtube.com/embed/PkZNo7MFNFg',
                      notes: 'ES6+ features, async/await, promises, closures, and functional programming',
                      completed: true,
                      resources: ['JavaScript.info', 'MDN JS Guide', 'Eloquent JavaScript']
                    },
                    { 
                      title: 'Git & GitHub Essentials', 
                      duration: '1h 45m', 
                      video: 'https://www.youtube.com/embed/RGOj5yH7evk',
                      notes: 'Version control, branching strategies, pull requests, and collaboration workflows',
                      completed: true,
                      resources: ['Git Docs', 'GitHub Learning Lab', 'Oh My Git!']
                    },
                    { 
                      title: 'Chrome DevTools Mastery', 
                      duration: '1h 20m', 
                      video: 'https://www.youtube.com/embed/gTVpBbFWry8',
                      notes: 'Debugging, performance profiling, network analysis, and lighthouse audits',
                      completed: true,
                      resources: ['Chrome DevTools', 'Web.dev', 'Lighthouse']
                    }
                  ]
                },
                { 
                  phase: '⚛️ React Ecosystem', 
                  progress: 75, 
                  sessions: [
                    { 
                      title: 'React 18 Complete Guide', 
                      duration: '4h 30m', 
                      video: 'https://www.youtube.com/embed/bMknfKXIFA8',
                      notes: 'Hooks, Context API, Suspense, Concurrent Mode, Server Components',
                      completed: true,
                      resources: ['React Docs', 'React Beta Docs', 'React Patterns']
                    },
                    { 
                      title: 'TypeScript for React Devs', 
                      duration: '3h 15m', 
                      video: 'https://www.youtube.com/embed/30LWjhZzg50',
                      notes: 'Type-safe React components, generics, utility types, and advanced patterns',
                      completed: true,
                      resources: ['TypeScript Handbook', 'React TypeScript Cheatsheet']
                    },
                    { 
                      title: 'State Management: Redux Toolkit', 
                      duration: '2h 45m', 
                      video: 'https://www.youtube.com/embed/9zySeP5vH9c',
                      notes: 'RTK Query, Thunks, Slices, DevTools, and best practices',
                      completed: true,
                      resources: ['Redux Docs', 'RTK Tutorial', 'Redux DevTools']
                    },
                    { 
                      title: 'Next.js 14 App Router', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/wm5gMKuwSYk',
                      notes: 'Server components, streaming, parallel routes, intercepting routes, middleware',
                      completed: false,
                      resources: ['Next.js Docs', 'Vercel Learn', 'Next.js Blog']
                    }
                  ]
                },
                { 
                  phase: '🎯 Advanced Patterns', 
                  progress: 30, 
                  sessions: [
                    { 
                      title: 'Design Systems & Component Libraries', 
                      duration: '3h 20m', 
                      video: 'https://www.youtube.com/embed/wATvvZCf6_o',
                      notes: 'Radix UI, Headless UI, Tailwind CSS, Storybook, design tokens',
                      completed: true,
                      resources: ['Shadcn UI', 'Radix Docs', 'Storybook']
                    },
                    { 
                      title: 'Testing: Jest, RTL, Playwright', 
                      duration: '4h', 
                      video: 'https://www.youtube.com/embed/8Xwq35cPwYg',
                      notes: 'Unit tests, integration tests, E2E tests, test-driven development',
                      completed: false,
                      resources: ['Testing Library', 'Playwright Docs', 'Vitest']
                    },
                    { 
                      title: 'Performance Optimization Deep Dive', 
                      duration: '2h 30m', 
                      video: 'https://www.youtube.com/embed/qCfBoe8dBss',
                      notes: 'Code splitting, lazy loading, memoization, web vitals, performance budgets',
                      completed: false,
                      resources: ['Web.dev Performance', 'Lighthouse', 'WebPageTest']
                    },
                    { 
                      title: 'Advanced Animation: Framer Motion', 
                      duration: '2h 15m', 
                      video: 'https://www.youtube.com/embed/znbCa4Rr054',
                      notes: 'Layout animations, gestures, variants, orchestration, SVG animations',
                      completed: false,
                      resources: ['Framer Motion Docs', 'Motion One', 'GSAP']
                    }
                  ]
                },
                { 
                  phase: '🚀 Production Ready', 
                  progress: 0, 
                  sessions: [
                    { 
                      title: 'CI/CD with GitHub Actions', 
                      duration: '2h', 
                      video: 'https://www.youtube.com/embed/R8_veQiYBjI',
                      notes: 'Automated testing, deployment pipelines, semantic versioning, changelog generation',
                      completed: false,
                      resources: ['GitHub Actions', 'Semantic Release', 'Changesets']
                    },
                    { 
                      title: 'Web Security Best Practices', 
                      duration: '2h 45m', 
                      video: 'https://www.youtube.com/embed/5JJrJGZ_LjM',
                      notes: 'XSS, CSRF, CSP, CORS, authentication, authorization, OWASP Top 10',
                      completed: false,
                      resources: ['OWASP', 'Web Security Academy', 'Auth0 Docs']
                    },
                    { 
                      title: 'Micro-Frontends Architecture', 
                      duration: '3h 30m', 
                      video: 'https://www.youtube.com/embed/lKKsjpH09dU',
                      notes: 'Module federation, single-spa, monorepo strategies, shared dependencies',
                      completed: false,
                      resources: ['Module Federation', 'Single-SPA', 'Turbo']
                    },
                    { 
                      title: 'Monitoring & Error Tracking', 
                      duration: '1h 50m', 
                      video: 'https://www.youtube.com/embed/VwADyKlNgBc',
                      notes: 'Sentry, LogRocket, analytics, performance monitoring, user feedback',
                      completed: false,
                      resources: ['Sentry Docs', 'LogRocket', 'PostHog']
                    }
                  ]
                }
              ]
            };
          } else if (workspaceType === 'backend') {
            return {
              totalSessions: 52,
              completedSessions: 15,
              totalTime: '86h 30m',
              overallProgress: 29,
              phases: [
                { 
                  phase: '🔧 Backend Fundamentals', 
                  progress: 100, 
                  sessions: [
                    { 
                      title: 'Node.js Complete Guide', 
                      duration: '4h', 
                      video: 'https://www.youtube.com/embed/Oe421EPjeBE',
                      notes: 'Event loop, streams, buffers, file system, child processes, clusters',
                      completed: true,
                      resources: ['Node.js Docs', 'NodeSchool', 'Node Best Practices']
                    },
                    { 
                      title: 'Express.js & RESTful APIs', 
                      duration: '3h 20m', 
                      video: 'https://www.youtube.com/embed/pKd0Rpw7O48',
                      notes: 'Middleware, routing, error handling, validation, rate limiting',
                      completed: true,
                      resources: ['Express Docs', 'REST API Tutorial', 'Postman']
                    },
                    { 
                      title: 'Database Design & SQL Mastery', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/HXV3zeQKqGY',
                      notes: 'PostgreSQL, normalization, indexing, transactions, query optimization',
                      completed: true,
                      resources: ['PostgreSQL Docs', 'SQL Zoo', 'Database Design']
                    },
                    { 
                      title: 'MongoDB & NoSQL Databases', 
                      duration: '3h 30m', 
                      video: 'https://www.youtube.com/embed/-56x56UppqQ',
                      notes: 'Document modeling, aggregation, indexing, replication, sharding',
                      completed: true,
                      resources: ['MongoDB Docs', 'Mongoose', 'NoSQL Patterns']
                    }
                  ]
                },
                { 
                  phase: '🏗️ Advanced Architecture', 
                  progress: 40, 
                  sessions: [
                    { 
                      title: 'GraphQL with Apollo Server', 
                      duration: '4h 15m', 
                      video: 'https://www.youtube.com/embed/ed8SzALpx1Q',
                      notes: 'Schema design, resolvers, DataLoader, subscriptions, federation',
                      completed: true,
                      resources: ['GraphQL Docs', 'Apollo Docs', 'GraphQL Voyager']
                    },
                    { 
                      title: 'Microservices with NestJS', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/GHTA143_b-s',
                      notes: 'Dependency injection, modules, guards, interceptors, microservice communication',
                      completed: false,
                      resources: ['NestJS Docs', 'Microservices Patterns', 'gRPC']
                    },
                    { 
                      title: 'Authentication & Authorization', 
                      duration: '3h 45m', 
                      video: 'https://www.youtube.com/embed/mbsmsi7l3r4',
                      notes: 'JWT, OAuth 2.0, RBAC, ABAC, session management, refresh tokens',
                      completed: true,
                      resources: ['Auth0 Docs', 'JWT.io', 'OWASP Auth']
                    },
                    { 
                      title: 'Caching Strategies: Redis', 
                      duration: '2h 30m', 
                      video: 'https://www.youtube.com/embed/jgpVdJB2sKQ',
                      notes: 'Cache invalidation, Redis data structures, pub/sub, distributed caching',
                      completed: false,
                      resources: ['Redis Docs', 'Redis University', 'Caching Guide']
                    }
                  ]
                },
                { 
                  phase: '☁️ Cloud & DevOps', 
                  progress: 25, 
                  sessions: [
                    { 
                      title: 'Docker & Containerization', 
                      duration: '4h', 
                      video: 'https://www.youtube.com/embed/3c-iBn73dDE',
                      notes: 'Dockerfile, multi-stage builds, Docker Compose, volumes, networking',
                      completed: true,
                      resources: ['Docker Docs', 'Docker Hub', 'Docker Patterns']
                    },
                    { 
                      title: 'Kubernetes Orchestration', 
                      duration: '6h', 
                      video: 'https://www.youtube.com/embed/X48VuDVv0do',
                      notes: 'Pods, services, deployments, ingress, ConfigMaps, Secrets, Helm',
                      completed: false,
                      resources: ['Kubernetes Docs', 'K8s Patterns', 'Helm Charts']
                    },
                    { 
                      title: 'AWS for Backend Developers', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/JIbIYCM48to',
                      notes: 'EC2, ECS, Lambda, RDS, S3, CloudFront, API Gateway, CloudFormation',
                      completed: false,
                      resources: ['AWS Docs', 'AWS Well-Architected', 'Serverless']
                    },
                    { 
                      title: 'Monitoring & Observability', 
                      duration: '3h 15m', 
                      video: 'https://www.youtube.com/embed/6Sj6a3T3qiY',
                      notes: 'Prometheus, Grafana, ELK Stack, distributed tracing, alerting',
                      completed: false,
                      resources: ['Prometheus Docs', 'Grafana', 'Jaeger']
                    }
                  ]
                },
                { 
                  phase: '🔥 Expert Level', 
                  progress: 0, 
                  sessions: [
                    { 
                      title: 'Event-Driven Architecture', 
                      duration: '4h 30m', 
                      video: 'https://www.youtube.com/embed/STKCRSUsyP0',
                      notes: 'Message queues, Kafka, RabbitMQ, event sourcing, CQRS',
                      completed: false,
                      resources: ['Kafka Docs', 'RabbitMQ', 'Event Sourcing']
                    },
                    { 
                      title: 'High-Performance APIs', 
                      duration: '3h 45m', 
                      video: 'https://www.youtube.com/embed/jT3CQuuCQko',
                      notes: 'Load balancing, rate limiting, circuit breakers, bulkheads',
                      completed: false,
                      resources: ['API Design Patterns', 'Load Balancing', 'Resilience']
                    },
                    { 
                      title: 'Distributed Systems Design', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/UEAMfLPZZhE',
                      notes: 'CAP theorem, consistency patterns, distributed transactions, consensus',
                      completed: false,
                      resources: ['DDIA Book', 'System Design Primer', 'Raft']
                    },
                    { 
                      title: 'Advanced Security & Compliance', 
                      duration: '3h 30m', 
                      video: 'https://www.youtube.com/embed/HzN3Z3APQO0',
                      notes: 'GDPR, HIPAA, SOC 2, penetration testing, security audits',
                      completed: false,
                      resources: ['OWASP Top 10', 'CWE/SANS', 'Security Checklist']
                    }
                  ]
                }
              ]
            };
          } else if (workspaceType === 'ml') {
            return {
              totalSessions: 56,
              completedSessions: 12,
              totalTime: '94h 15m',
              overallProgress: 21,
              phases: [
                { 
                  phase: '🧠 ML Foundations', 
                  progress: 100, 
                  sessions: [
                    { 
                      title: 'Python for Data Science', 
                      duration: '4h 30m', 
                      video: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
                      notes: 'NumPy, Pandas, Matplotlib, Jupyter, data manipulation and visualization',
                      completed: true,
                      resources: ['Python Docs', 'NumPy Tutorial', 'Pandas Guide']
                    },
                    { 
                      title: 'Mathematics for ML', 
                      duration: '6h', 
                      video: 'https://www.youtube.com/embed/1VSZtNYMntM',
                      notes: 'Linear algebra, calculus, probability, statistics, optimization',
                      completed: true,
                      resources: ['Khan Academy', 'MIT OpenCourseWare', '3Blue1Brown']
                    },
                    { 
                      title: 'Machine Learning Fundamentals', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/7eh4d6sabA0',
                      notes: 'Supervised learning, regression, classification, model evaluation',
                      completed: true,
                      resources: ['Scikit-learn Docs', 'ML Crash Course', 'Kaggle Learn']
                    },
                    { 
                      title: 'Data Preprocessing & Feature Engineering', 
                      duration: '3h 45m', 
                      video: 'https://www.youtube.com/embed/0Mpc1o25Ksw',
                      notes: 'Missing data, scaling, encoding, feature selection, dimensionality reduction',
                      completed: true,
                      resources: ['Feature Engineering', 'Data Cleaning', 'Pandas Profiling']
                    }
                  ]
                },
                { 
                  phase: '🤖 Deep Learning', 
                  progress: 35, 
                  sessions: [
                    { 
                      title: 'Neural Networks from Scratch', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/aircAruvnKk',
                      notes: 'Perceptrons, backpropagation, activation functions, loss functions',
                      completed: true,
                      resources: ['Neural Networks and Deep Learning', 'Coursera DL']
                    },
                    { 
                      title: 'TensorFlow & Keras Complete Guide', 
                      duration: '6h 30m', 
                      video: 'https://www.youtube.com/embed/tPYj3fFJGjk',
                      notes: 'Sequential API, Functional API, custom layers, callbacks, training pipelines',
                      completed: false,
                      resources: ['TensorFlow Docs', 'Keras Tutorial', 'TensorFlow Hub']
                    },
                    { 
                      title: 'PyTorch Deep Dive', 
                      duration: '7h', 
                      video: 'https://www.youtube.com/embed/c36lUUr864M',
                      notes: 'Tensors, autograd, custom datasets, DataLoaders, distributed training',
                      completed: true,
                      resources: ['PyTorch Docs', 'PyTorch Lightning', 'Torchvision']
                    },
                    { 
                      title: 'Computer Vision with CNNs', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/ArPaAX_PhIs',
                      notes: 'Convolutional layers, pooling, ResNet, YOLO, semantic segmentation',
                      completed: false,
                      resources: ['CV Algorithms', 'Papers With Code', 'Roboflow']
                    }
                  ]
                },
                { 
                  phase: '🚀 Advanced ML', 
                  progress: 15, 
                  sessions: [
                    { 
                      title: 'Natural Language Processing', 
                      duration: '6h', 
                      video: 'https://www.youtube.com/embed/8rXD5-xhemo',
                      notes: 'Transformers, BERT, GPT, tokenization, attention mechanisms',
                      completed: true,
                      resources: ['HuggingFace', 'NLP Course', 'Transformers Docs']
                    },
                    { 
                      title: 'Reinforcement Learning', 
                      duration: '7h 30m', 
                      video: 'https://www.youtube.com/embed/2pWv7GOvuf0',
                      notes: 'Q-learning, policy gradients, actor-critic, PPO, DQN',
                      completed: false,
                      resources: ['OpenAI Gym', 'Stable Baselines', 'RL Book']
                    },
                    { 
                      title: 'Generative AI & Diffusion Models', 
                      duration: '5h 45m', 
                      video: 'https://www.youtube.com/embed/-lz30by8-sU',
                      notes: 'GANs, VAEs, Stable Diffusion, DALL-E, latent spaces',
                      completed: false,
                      resources: ['Stable Diffusion', 'GANs in Action', 'Diffusion Models']
                    },
                    { 
                      title: 'MLOps & Model Deployment', 
                      duration: '4h 30m', 
                      video: 'https://www.youtube.com/embed/Mq6v9vP9Bp4',
                      notes: 'MLflow, model versioning, A/B testing, monitoring, drift detection',
                      completed: false,
                      resources: ['MLflow Docs', 'Kubeflow', 'Model Serving']
                    }
                  ]
                },
                { 
                  phase: '🎯 Production ML', 
                  progress: 0, 
                  sessions: [
                    { 
                      title: 'Large Language Models (LLMs)', 
                      duration: '8h', 
                      video: 'https://www.youtube.com/embed/zjkBMFhNj_g',
                      notes: 'Fine-tuning, prompt engineering, RAG, LangChain, vector databases',
                      completed: false,
                      resources: ['LangChain Docs', 'OpenAI API', 'Vector Databases']
                    },
                    { 
                      title: 'Scalable ML Systems', 
                      duration: '6h 30m', 
                      video: 'https://www.youtube.com/embed/Q1zLXA2dZ3s',
                      notes: 'Distributed training, model parallelism, data parallelism, inference optimization',
                      completed: false,
                      resources: ['Ray', 'Horovod', 'DeepSpeed']
                    },
                    { 
                      title: 'ML Research & Paper Implementation', 
                      duration: '7h', 
                      video: 'https://www.youtube.com/embed/733m6qBH-jI',
                      notes: 'Reading papers, reproducing results, experimental design, publication',
                      completed: false,
                      resources: ['Papers With Code', 'ArXiv', 'ML Research Guide']
                    },
                    { 
                      title: 'Ethics & Responsible AI', 
                      duration: '3h 30m', 
                      video: 'https://www.youtube.com/embed/tjz7thfCpkM',
                      notes: 'Bias detection, fairness metrics, explainability, privacy, regulations',
                      completed: false,
                      resources: ['AI Ethics Guidelines', 'Fairness Indicators', 'GDPR AI']
                    }
                  ]
                }
              ]
            };
          } else if (workspaceType === 'datascience') {
            return {
              totalSessions: 50,
              completedSessions: 14,
              totalTime: '78h 20m',
              overallProgress: 28,
              phases: [
                { 
                  phase: '📊 Data Fundamentals', 
                  progress: 100, 
                  sessions: [
                    { 
                      title: 'Python Data Analysis Bootcamp', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/r-uOLxNrNk8',
                      notes: 'Pandas mastery, data wrangling, groupby operations, time series',
                      completed: true,
                      resources: ['Pandas Docs', 'Data Analysis Guide', 'Kaggle']
                    },
                    { 
                      title: 'SQL for Data Science', 
                      duration: '4h 30m', 
                      video: 'https://www.youtube.com/embed/HXV3zeQKqGY',
                      notes: 'Complex queries, window functions, CTEs, performance optimization',
                      completed: true,
                      resources: ['Mode SQL Tutorial', 'SQL Zoo', 'PostgreSQL']
                    },
                    { 
                      title: 'Data Visualization with Python', 
                      duration: '3h 45m', 
                      video: 'https://www.youtube.com/embed/0P7QnIQDBJY',
                      notes: 'Matplotlib, Seaborn, Plotly, interactive dashboards, storytelling',
                      completed: true,
                      resources: ['Matplotlib Gallery', 'Seaborn Tutorial', 'Plotly']
                    },
                    { 
                      title: 'Statistics for Data Science', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/xxpc-HPKN28',
                      notes: 'Hypothesis testing, A/B testing, confidence intervals, p-values',
                      completed: true,
                      resources: ['StatQuest', 'Statistics Course', 'Scipy']
                    }
                  ]
                },
                { 
                  phase: '🔍 Advanced Analytics', 
                  progress: 50, 
                  sessions: [
                    { 
                      title: 'Exploratory Data Analysis', 
                      duration: '3h 20m', 
                      video: 'https://www.youtube.com/embed/xi0vhXFPegw',
                      notes: 'Data profiling, outlier detection, correlation analysis, distributions',
                      completed: true,
                      resources: ['Pandas Profiling', 'Sweetviz', 'YData Profiling']
                    },
                    { 
                      title: 'Feature Engineering Masterclass', 
                      duration: '4h 15m', 
                      video: 'https://www.youtube.com/embed/6WDFfaYtN6s',
                      notes: 'Creating features, transformations, encoding, binning, interactions',
                      completed: true,
                      resources: ['Feature Tools', 'Category Encoders', 'Sklearn']
                    },
                    { 
                      title: 'Time Series Analysis', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/e8Yw4alG16Q',
                      notes: 'ARIMA, Prophet, seasonal decomposition, forecasting',
                      completed: false,
                      resources: ['Prophet Docs', 'Statsmodels', 'Time Series Guide']
                    },
                    { 
                      title: 'Big Data with PySpark', 
                      duration: '6h 30m', 
                      video: 'https://www.youtube.com/embed/_C8kWso4ne4',
                      notes: 'Spark DataFrames, RDDs, distributed computing, Spark SQL',
                      completed: false,
                      resources: ['PySpark Docs', 'Databricks', 'Spark Guide']
                    }
                  ]
                },
                { 
                  phase: '🎯 Business Analytics', 
                  progress: 20, 
                  sessions: [
                    { 
                      title: 'Dashboard Design with Tableau', 
                      duration: '4h', 
                      video: 'https://www.youtube.com/embed/6xv1KvCMF1Q',
                      notes: 'Interactive dashboards, calculated fields, LOD expressions, storytelling',
                      completed: true,
                      resources: ['Tableau Public', 'Tableau Training', 'Viz Gallery']
                    },
                    { 
                      title: 'Power BI for Analysts', 
                      duration: '3h 45m', 
                      video: 'https://www.youtube.com/embed/y3WszBE1Hzs',
                      notes: 'DAX formulas, data modeling, custom visuals, Power Query',
                      completed: false,
                      resources: ['Power BI Docs', 'DAX Guide', 'Power BI Community']
                    },
                    { 
                      title: 'Predictive Analytics', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/7O4dpR9QMIM',
                      notes: 'Regression, classification, ensemble methods, model evaluation',
                      completed: false,
                      resources: ['Scikit-learn', 'XGBoost', 'LightGBM']
                    },
                    { 
                      title: 'Customer Analytics & Segmentation', 
                      duration: '3h 20m', 
                      video: 'https://www.youtube.com/embed/bDa4GxGJk3k',
                      notes: 'RFM analysis, clustering, cohort analysis, churn prediction',
                      completed: false,
                      resources: ['Customer Analytics', 'Clustering Algorithms', 'Lifetimes']
                    }
                  ]
                },
                { 
                  phase: '💼 Enterprise Data', 
                  progress: 0, 
                  sessions: [
                    { 
                      title: 'Data Warehousing & ETL', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/j952oCmHzqA',
                      notes: 'Snowflake, Redshift, dimensional modeling, star schema, ETL pipelines',
                      completed: false,
                      resources: ['Snowflake Docs', 'dbt', 'Airflow']
                    },
                    { 
                      title: 'Data Engineering Fundamentals', 
                      duration: '6h 30m', 
                      video: 'https://www.youtube.com/embed/qWru-b6m030',
                      notes: 'Data pipelines, orchestration, data quality, monitoring',
                      completed: false,
                      resources: ['Apache Airflow', 'Prefect', 'Great Expectations']
                    },
                    { 
                      title: 'Cloud Analytics: AWS/Azure', 
                      duration: '4h 45m', 
                      video: 'https://www.youtube.com/embed/JIbIYCM48to',
                      notes: 'S3, Athena, Glue, Lambda, cost optimization',
                      completed: false,
                      resources: ['AWS Analytics', 'Azure Synapse', 'Google BigQuery']
                    },
                    { 
                      title: 'Real-time Analytics & Streaming', 
                      duration: '5h 15m', 
                      video: 'https://www.youtube.com/embed/avi-TZI9t2I',
                      notes: 'Kafka, real-time dashboards, stream processing, event analytics',
                      completed: false,
                      resources: ['Kafka Docs', 'Flink', 'Stream Processing']
                    }
                  ]
                }
              ]
            };
          } else if (workspaceType === 'cybersecurity') {
            return {
              totalSessions: 46,
              completedSessions: 10,
              totalTime: '68h 45m',
              overallProgress: 22,
              phases: [
                { 
                  phase: '🔐 Security Foundations', 
                  progress: 100, 
                  sessions: [
                    { 
                      title: 'Cybersecurity Fundamentals', 
                      duration: '3h 30m', 
                      video: 'https://www.youtube.com/embed/inWWhr5tnEA',
                      notes: 'CIA triad, threat modeling, security principles, risk management',
                      completed: true,
                      resources: ['OWASP', 'NIST Framework', 'Security+']
                    },
                    { 
                      title: 'Network Security Essentials', 
                      duration: '4h 45m', 
                      video: 'https://www.youtube.com/embed/qiQR5rTSshw',
                      notes: 'TCP/IP, firewalls, VPNs, IDS/IPS, network protocols',
                      completed: true,
                      resources: ['Wireshark', 'Network Security', 'Packet Analysis']
                    },
                    { 
                      title: 'Linux for Hackers', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/wBp0Rb-ZJak',
                      notes: 'Command line, bash scripting, permissions, SSH, system hardening',
                      completed: true,
                      resources: ['Linux Journey', 'OverTheWire', 'Linux Security']
                    },
                    { 
                      title: 'Cryptography Crash Course', 
                      duration: '3h 15m', 
                      video: 'https://www.youtube.com/embed/jhXCTbFnK8o',
                      notes: 'Encryption, hashing, digital signatures, PKI, TLS/SSL',
                      completed: true,
                      resources: ['Cryptopals', 'Crypto 101', 'OpenSSL']
                    }
                  ]
                },
                { 
                  phase: '⚔️ Offensive Security', 
                  progress: 35, 
                  sessions: [
                    { 
                      title: 'Ethical Hacking Bootcamp', 
                      duration: '6h 30m', 
                      video: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
                      notes: 'Reconnaissance, scanning, exploitation, post-exploitation, reporting',
                      completed: true,
                      resources: ['CEH', 'Kali Linux', 'Metasploit']
                    },
                    { 
                      title: 'Web Application Penetration Testing', 
                      duration: '5h 45m', 
                      video: 'https://www.youtube.com/embed/X4eRbHgRawI',
                      notes: 'OWASP Top 10, SQL injection, XSS, CSRF, authentication bypass',
                      completed: false,
                      resources: ['OWASP WebGoat', 'Burp Suite', 'PortSwigger Academy']
                    },
                    { 
                      title: 'Buffer Overflows & Binary Exploitation', 
                      duration: '4h 30m', 
                      video: 'https://www.youtube.com/embed/1S0aBV-Waeo',
                      notes: 'Stack/heap overflows, shellcode, ROP chains, exploit development',
                      completed: true,
                      resources: ['Exploit Education', 'pwn.college', 'GDB']
                    },
                    { 
                      title: 'Wireless Security & Wi-Fi Hacking', 
                      duration: '3h 20m', 
                      video: 'https://www.youtube.com/embed/WfYxrLaqlN8',
                      notes: 'WPA/WPA2, evil twin, deauth attacks, wireless protocols',
                      completed: false,
                      resources: ['Aircrack-ng', 'WiFi Security', 'Wireless Tools']
                    }
                  ]
                },
                { 
                  phase: '🛡️ Defensive Security', 
                  progress: 15, 
                  sessions: [
                    { 
                      title: 'Security Operations Center (SOC)', 
                      duration: '5h', 
                      video: 'https://www.youtube.com/embed/JfZ7Uu8I3N4',
                      notes: 'SIEM, log analysis, incident response, threat hunting',
                      completed: true,
                      resources: ['Splunk', 'ELK Stack', 'SOC Analyst']
                    },
                    { 
                      title: 'Malware Analysis & Reverse Engineering', 
                      duration: '6h 30m', 
                      video: 'https://www.youtube.com/embed/IEaAnEjhwQk',
                      notes: 'Static/dynamic analysis, debuggers, sandboxes, indicators of compromise',
                      completed: false,
                      resources: ['IDA Pro', 'Ghidra', 'Malware Traffic Analysis']
                    },
                    { 
                      title: 'Digital Forensics & Incident Response', 
                      duration: '5h 15m', 
                      video: 'https://www.youtube.com/embed/0YQbwfSF8jY',
                      notes: 'Evidence collection, chain of custody, disk/memory forensics, timeline analysis',
                      completed: false,
                      resources: ['Autopsy', 'Volatility', 'DFIR Tools']
                    },
                    { 
                      title: 'Cloud Security Architecture', 
                      duration: '4h 45m', 
                      video: 'https://www.youtube.com/embed/Ul2a2mXj_8w',
                      notes: 'AWS/Azure security, IAM, encryption, compliance, zero trust',
                      completed: false,
                      resources: ['AWS Security', 'Azure Security', 'Cloud Security Alliance']
                    }
                  ]
                },
                { 
                  phase: '🎯 Advanced Security', 
                  progress: 0, 
                  sessions: [
                    { 
                      title: 'Advanced Persistent Threats (APT)', 
                      duration: '5h 30m', 
                      video: 'https://www.youtube.com/embed/ddN2hKbX0Gs',
                      notes: 'Threat intelligence, MITRE ATT&CK, red team operations, adversary simulation',
                      completed: false,
                      resources: ['MITRE ATT&CK', 'Red Team Field Manual', 'Atomic Red Team']
                    },
                    { 
                      title: 'Security Automation & DevSecOps', 
                      duration: '4h 20m', 
                      video: 'https://www.youtube.com/embed/nrhxNNH5lt0',
                      notes: 'CI/CD security, SAST/DAST, container security, infrastructure as code',
                      completed: false,
                      resources: ['DevSecOps', 'Snyk', 'Trivy']
                    },
                    { 
                      title: 'Zero Trust Architecture', 
                      duration: '3h 45m', 
                      video: 'https://www.youtube.com/embed/FMMWSLIZLsw',
                      notes: 'Identity verification, microsegmentation, least privilege, continuous monitoring',
                      completed: false,
                      resources: ['Zero Trust', 'NIST Zero Trust', 'BeyondCorp']
                    },
                    { 
                      title: 'Security Leadership & Governance', 
                      duration: '4h', 
                      video: 'https://www.youtube.com/embed/vh8pVjYUbBE',
                      notes: 'CISO responsibilities, compliance (SOC 2, ISO 27001), security metrics, budget',
                      completed: false,
                      resources: ['CISM', 'ISO 27001', 'Security Frameworks']
                    }
                  ]
                }
              ]
            };
          }
          
          // Default fallback
          return {
            totalSessions: 48,
            completedSessions: 12,
            totalTime: '72h',
            overallProgress: 25,
            phases: []
          };
        };

        const roadmapData = getRoadmapData();
        
        return (
          <div className="h-full bg-obsidian/90 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b-2 border-gold/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-gold flex items-center gap-2">
                  <Target className="w-7 h-7" />
                  Interactive Roadmap - {activeTab?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white font-black">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {roadmapData.completedSessions}/{roadmapData.totalSessions} Sessions
                  </Badge>
                  <Badge className="bg-gold text-black font-black">
                    {roadmapData.totalTime} Total
                  </Badge>
                </div>
              </div>
              {/* Overall Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 font-bold">Overall Progress</span>
                  <span className="text-gold font-black">{roadmapData.overallProgress}%</span>
                </div>
                <div className="h-3 bg-black rounded-full overflow-hidden border-2 border-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-gold via-pink to-gold animate-pulse"
                    style={{ width: `${roadmapData.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Roadmap Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {roadmapData.phases.map((phase, phaseIndex) => (
                <motion.div
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: phaseIndex * 0.1 }}
                  className="border-2 border-gold/30 rounded-lg bg-black/30"
                >
                  {/* Phase Header */}
                  <div className="p-4 border-b-2 border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full border-3 ${
                          phase.progress === 100 ? 'bg-green-500 border-green-500' : 
                          phase.progress > 0 ? 'bg-gold/20 border-gold' : 
                          'bg-transparent border-white/30'
                        } flex items-center justify-center font-black text-white`}>
                          {phase.progress === 100 ? <CheckCircle className="w-6 h-6" /> : 
                           phase.progress > 0 ? `${phase.progress}%` : 
                           <Circle className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gold">{phase.phase}</h4>
                          <p className="text-xs text-white/60 font-bold">
                            {phase.sessions.filter(s => s.completed).length}/{phase.sessions.length} Sessions Completed
                          </p>
                        </div>
                      </div>
                      <Badge className={`${
                        phase.progress === 100 ? 'bg-green-500' : 
                        phase.progress > 0 ? 'bg-gold' : 
                        'bg-white/20'
                      } text-black font-black px-4 py-2`}>
                        {phase.progress === 100 ? '✓ COMPLETED' : 
                         phase.progress > 0 ? '⚡ IN PROGRESS' : 
                         '🔒 LOCKED'}
                      </Badge>
                    </div>
                  </div>

                  {/* Sessions List */}
                  <div className="p-4 space-y-3">
                    {phase.sessions.map((session, sessionIndex) => (
                      <div
                        key={sessionIndex}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          session.completed 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : phase.progress > 0 || phaseIndex === 0
                            ? 'border-pink/30 bg-black/20 hover:border-pink cursor-pointer'
                            : 'border-white/10 bg-black/10 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            session.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gold/50 hover:border-gold'
                          }`}>
                            {session.completed && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>

                          {/* Session Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className={`font-bold ${
                                  session.completed ? 'text-green-400' : 'text-white'
                                }`}>
                                  {session.title}
                                </h5>
                                <p className="text-xs text-white/60 mt-1">{session.notes}</p>
                              </div>
                              <Badge className="bg-blue text-white text-xs font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {session.duration}
                              </Badge>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {session.video && (
                                <Button
                                  size="sm"
                                  className="bg-pink text-white font-bold hover:bg-pink/80 text-xs"
                                  onClick={() => {
                                    addTool('video-player', { 
                                      url: session.video, 
                                      title: session.title 
                                    });
                                  }}
                                >
                                  <Video className="w-3 h-3 mr-1" />
                                  Watch Video
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="bg-gold text-black font-bold hover:bg-gold/80 text-xs"
                                onClick={() => {
                                  addTool('session-notes', {
                                    sessionId: `session-${phaseIndex}-${sessionIndex}`,
                                    sessionTitle: session.title,
                                    phase: phase.phase,
                                  });
                                }}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                My Notes
                              </Button>
                              {session.resources.map((resource, i) => (
                                <Badge key={i} className="bg-blue/20 text-blue border border-blue/50 text-xs cursor-pointer hover:bg-blue/30">
                                  📎 {resource}
                                </Badge>
                              ))}
                            </div>

                            {/* Progress for incomplete sessions */}
                            {!session.completed && phase.progress > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-white/60">Session Progress</span>
                                  <span className="text-gold font-bold">0%</span>
                                </div>
                                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-gold w-[0%]"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      }
      case 'institution-tasks':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-pink flex items-center gap-2">
                <Briefcase className="w-7 h-7" />
                Institution Tasks
              </h3>
              <Badge className="bg-pink text-black font-black">
                4 ACTIVE
              </Badge>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Physics Assignment - Chapter 5', type: 'ASSIGNMENT', deadline: '2025-12-15', priority: 'high', institution: 'School', status: 'pending' },
                { title: 'Mathematics Final Exam', type: 'EXAM', deadline: '2025-12-20', priority: 'high', institution: 'School', status: 'pending' },
                { title: 'History Research Project', type: 'PROJECT', deadline: '2025-12-18', priority: 'medium', institution: 'College', status: 'in-progress' },
                { title: 'Chemistry Lab Report', type: 'LAB', deadline: '2025-12-14', priority: 'high', institution: 'School', status: 'pending' },
              ].map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-4 border-black rounded-lg p-4 ${
                    task.priority === 'high' ? 'bg-obsidian shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]' : 
                    'bg-obsidian shadow-[6px_6px_0px_0px_rgba(251,146,60,1)]'
                  } hover:translate-x-1 hover:translate-y-1 transition-transform`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className={`${
                        task.type === 'EXAM' ? 'bg-red-500' :
                        task.type === 'ASSIGNMENT' ? 'bg-blue-500' :
                        task.type === 'PROJECT' ? 'bg-purple-500' :
                        'bg-green-500'
                      } text-white font-black mb-2`}>
                        {task.type}
                      </Badge>
                      <h4 className="text-lg font-bold text-white">{task.title}</h4>
                    </div>
                    <button className="text-white/60 hover:text-pink transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/70 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {task.deadline}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {task.institution}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      className={`${task.status === 'in-progress' ? 'bg-gold' : 'bg-pink'} text-black font-black hover:opacity-80`}
                    >
                      {task.status === 'in-progress' ? 'Continue' : 'Start Working'}
                    </Button>
                    {task.priority === 'high' && (
                      <Badge className="bg-red-500 text-white font-black">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        HIGH PRIORITY
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      
      case 'session-notes': {
        const sessionId = tool.data?.sessionId as string || '';
        const sessionTitle = tool.data?.sessionTitle as string || 'Session Notes';
        const phase = tool.data?.phase as string || '';
        const noteContent = sessionNotesContent[sessionId] || '';
        const activities = sessionActivities[sessionId];

        return (
          <div className="h-full bg-obsidian/90 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b-2 border-pink/30 p-4 bg-black/30">
              <h3 className="text-lg font-black text-pink mb-1">{sessionTitle}</h3>
              <p className="text-xs text-white/60 font-bold">{phase}</p>
            </div>

            {/* Activity Tracker */}
            <div className="border-b-2 border-gold/20 p-4 bg-black/20 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-pink/10 border border-pink/30 rounded p-2">
                  <p className="text-xs text-pink font-bold mb-1">Tools Used</p>
                  <div className="flex flex-wrap gap-1">
                    {activities?.toolsUsed.length ? activities.toolsUsed.map((tool, i) => (
                      <Badge key={i} className="bg-pink/20 text-pink text-xs">{tool}</Badge>
                    )) : <span className="text-xs text-white/40">None yet</span>}
                  </div>
                </div>
                <div className="bg-gold/10 border border-gold/30 rounded p-2">
                  <p className="text-xs text-gold font-bold mb-1">Prompts/Queries</p>
                  <p className="text-lg font-black text-gold">{activities?.prompts.length || 0}</p>
                </div>
                <div className="bg-blue/10 border border-blue/30 rounded p-2">
                  <p className="text-xs text-blue font-bold mb-1">Activities</p>
                  <p className="text-lg font-black text-blue">{activities?.activities.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Notes Editor */}
            <div className="flex-1 p-4 overflow-y-auto">
              <label className="text-sm font-bold text-gold mb-2 block">Your Notes</label>
              <textarea
                value={noteContent}
                onChange={(e) => setSessionNotesContent(prev => ({ ...prev, [sessionId]: e.target.value }))}
                placeholder="Write your notes here... What did you learn? Key concepts? Questions?"
                className="w-full h-48 bg-black/50 border-2 border-gold/30 rounded-lg p-3 text-white placeholder-white/30 focus:border-gold focus:outline-none resize-none font-mono text-sm"
              />
              
              <div className="mt-4">
                <label className="text-sm font-bold text-pink mb-2 block">Log Activity</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="What tool did you use?"
                    className="flex-1 bg-black/50 border-2 border-pink/30 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-pink focus:outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        trackActivity(sessionId, `Used tool: ${e.currentTarget.value}`, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="bg-pink text-white font-bold"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="What tool did you use?"]') as HTMLInputElement;
                      if (input?.value) {
                        trackActivity(sessionId, `Used tool: ${input.value}`, input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Log Tool
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Add a prompt or query you tried..."
                  className="w-full bg-black/50 border-2 border-blue/30 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-blue focus:outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      trackActivity(sessionId, `Tried prompt: ${e.currentTarget.value}`, undefined, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            {/* Activity Log */}
            <div className="border-t-2 border-white/10 p-4 bg-black/20 max-h-32 overflow-y-auto">
              <p className="text-xs font-bold text-white/60 mb-2">Activity Timeline</p>
              <div className="space-y-1">
                {activities?.activities.length ? activities.activities.slice(-5).reverse().map((activity, i) => (
                  <p key={i} className="text-xs text-white/70 font-mono">{activity}</p>
                )) : (
                  <p className="text-xs text-white/40">No activities yet</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t-2 border-gold/30 p-4 bg-black/30">
              <Button
                className="w-full bg-gold text-black font-black hover:bg-gold/80"
                onClick={() => {
                  if (noteContent.trim()) {
                    saveNote(sessionId, sessionTitle, noteContent);
                    setSessionNotesContent(prev => ({ ...prev, [sessionId]: '' }));
                    alert('Note saved! Check "Saved Notes" tool.');
                  }
                }}
                disabled={!noteContent.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>
        );
      }

      case 'saved-notes':
        return (
          <div className="h-full bg-obsidian/90 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b-2 border-gold/30 p-4 bg-black/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gold flex items-center gap-2">
                  <Save className="w-6 h-6" />
                  Saved Notes
                </h3>
                <Badge className="bg-gold text-black font-black">
                  {savedNotes.length} NOTES
                </Badge>
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {savedNotes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50 font-bold">No saved notes yet</p>
                    <p className="text-white/30 text-sm mt-2">Open a session and save your notes!</p>
                  </div>
                </div>
              ) : (
                savedNotes.slice().reverse().map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-gold/30 rounded-lg p-4 bg-black/30 hover:border-gold transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{note.sessionTitle}</h4>
                        <p className="text-xs text-white/50">
                          {new Date(note.savedAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          setSavedNotes(prev => prev.filter(n => n.id !== note.id));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="bg-black/40 rounded p-3 border border-white/10">
                      <p className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                        {note.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full bg-obsidian/90 rounded-lg flex items-center justify-center text-white/50">
            Tool content
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-deepblack text-white">
      {/* GridScan Background */}
      <div className="fixed inset-0 z-0">
        <ThreeDFallback fallbackColor={`from-${config.theme}/5 to-${config.theme}/10`}>
          <GridScan
            linesColor={config.theme === 'gold' ? '#9586F2' : config.theme === 'pink' ? '#C27BA0' : '#6DAEDB'}
            scanColor={config.theme === 'pink' ? '#9586F2' : config.theme === 'gold' ? '#C27BA0' : '#9586F2'}
            scanOpacity={0.3}
            gridScale={0.12}
            lineThickness={1.0}
            bloomIntensity={0.2}
            scanGlow={0.4}
            scanDuration={2.5}
            scanDelay={1.5}
          />
        </ThreeDFallback>
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className={`border-b-4 border-${config.theme} bg-obsidian/90 backdrop-blur-sm`}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-white hover:text-gold"
                >
                  <ChevronLeft className="mr-2" /> Dashboard
                </Button>
                <Sparkles className={`w-6 h-6 text-${config.theme}`} />
                <h1 className={`text-2xl font-black text-${config.theme}`}>
                  WORKSPACE
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Layout Modes */}
                <div className="flex gap-2 border-2 border-white/20 rounded p-1">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      layoutMode === 'grid' ? `bg-${config.theme} text-black` : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('split')}
                    className={`p-2 rounded transition-colors ${
                      layoutMode === 'split' ? `bg-${config.theme} text-black` : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Split className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('freeform')}
                    className={`p-2 rounded transition-colors ${
                      layoutMode === 'freeform' ? `bg-${config.theme} text-black` : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Tutor Trigger Button (Non-intrusive) */}
                <AITutorTrigger
                  onClick={() => setShowAITutor(true)}
                  variant="button"
                  themeColor={config.theme}
                  label="AI Tutor"
                />

                <Button
                  onClick={() => setShowAddTool(true)}
                  className={`bg-${config.theme} text-black font-black hover:opacity-80`}
                >
                  <Plus className="mr-2" /> Add Tool
                </Button>
              </div>
            </div>

            {/* WORKSPACE TABS */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {workspaceTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    px-4 py-2 rounded-t-lg border-2 border-b-0 font-bold flex items-center gap-2 whitespace-nowrap
                    ${tab.id === activeTabId 
                      ? `bg-${WORKSPACE_CONFIGS[tab.type].theme} text-black border-${WORKSPACE_CONFIGS[tab.type].theme}` 
                      : 'bg-obsidian/50 text-white/70 border-white/20 hover:bg-obsidian/80'
                    }
                  `}
                >
                  {tab.name}
                  <Badge className="bg-black/20 text-white text-xs">
                    {tab.tools.length}
                  </Badge>
                  {workspaceTabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWorkspaceTab(tab.id);
                      }}
                      className="ml-1 hover:text-pink transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowAddWorkspace(true)}
                className="px-4 py-2 rounded-t-lg border-2 border-dashed border-white/30 text-white/60 hover:border-gold hover:text-gold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Workspace
              </button>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="container mx-auto px-6 py-6 h-[calc(100vh-180px)]">
          {!activeTab || tools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex items-center justify-center"
            >
              <Card className="border-4 border-black bg-obsidian/90 shadow-gold-brutal p-12 text-center">
                <Target className={`w-16 h-16 text-${config.theme} mx-auto mb-4`} />
                <h2 className="text-3xl font-black text-white mb-4">Your Workspace is Ready!</h2>
                <p className="text-white/70 mb-6">Add tools to customize your {config.name} environment</p>
                <Button
                  onClick={() => setShowAddTool(true)}
                  className={`bg-${config.theme} text-black font-black hover:opacity-80`}
                  size="lg"
                >
                  <Plus className="mr-2" /> Add Your First Tool
                </Button>
              </Card>
            </motion.div>
          ) : maximizedTool ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <Card className="border-4 border-black bg-obsidian/90 h-full flex flex-col">
                <CardHeader className={`border-b-4 border-${config.theme} flex-row items-center justify-between py-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`text-${config.theme}`}>
                      {TOOL_METADATA[maximizedTool.type].icon}
                    </div>
                    <CardTitle className="text-white font-black">{maximizedTool.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMaximize(maximizedTool.id)}
                      className="text-white hover:text-gold"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  {renderToolContent(maximizedTool)}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div 
              className={`h-full ${
                layoutMode === 'grid' 
                  ? `grid gap-4 ${tools.length === 1 ? 'grid-cols-1' : tools.length === 2 ? 'grid-cols-2' : tools.length === 3 ? 'grid-cols-3' : 'grid-cols-2 grid-rows-2'}`
                  : layoutMode === 'split'
                  ? 'flex gap-4'
                  : 'relative'
              }`}
            >
              <AnimatePresence>
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className={layoutMode === 'split' ? 'flex-1' : ''}
                  >
                    <Card className={`border-4 border-black bg-obsidian/90 shadow-${TOOL_METADATA[tool.type].color}-heavy hover:shadow-${TOOL_METADATA[tool.type].color}-brutal transition-all h-full flex flex-col`}>
                      <CardHeader className={`border-b-4 border-${TOOL_METADATA[tool.type].color} flex-row items-center justify-between py-3`}>
                        <div className="flex items-center gap-3">
                          <div className={`text-${TOOL_METADATA[tool.type].color}`}>
                            {TOOL_METADATA[tool.type].icon}
                          </div>
                          <CardTitle className="text-white font-black text-sm">{tool.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMaximize(tool.id)}
                            className="text-white hover:text-gold"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTool(tool.id)}
                            className="text-white hover:text-pink"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-2 overflow-hidden">
                        {renderToolContent(tool)}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ADD TOOL MODAL */}
      <AnimatePresence>
        {showAddTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAddTool(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-obsidian border-4 border-gold rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gold flex items-center gap-3">
                  <Plus className="w-8 h-8" />
                  Add Tool to Workspace
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddTool(false)}
                  className="text-white hover:text-pink"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {config.availableTools.map((toolType) => {
                  const metadata = TOOL_METADATA[toolType];
                  const isAdded = tools.some(t => t.type === toolType);
                  
                  return (
                    <button
                      key={toolType}
                      onClick={() => !isAdded && addTool(toolType)}
                      disabled={isAdded}
                      className={`
                        p-6 border-4 border-black rounded-lg
                        ${isAdded 
                          ? 'bg-black/50 opacity-50 cursor-not-allowed' 
                          : `bg-obsidian shadow-${metadata.color}-heavy hover:shadow-${metadata.color}-brutal`
                        }
                        transition-all group
                      `}
                    >
                      <div className={`text-${metadata.color} mb-3 mx-auto w-fit group-hover:scale-110 transition-transform`}>
                        {metadata.icon}
                      </div>
                      <div className={`font-black text-sm text-${metadata.color}`}>
                        {metadata.title}
                      </div>
                      {isAdded && (
                        <Badge className="mt-2 bg-green-500 text-black text-xs">
                          ADDED
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD WORKSPACE MODAL */}
      <AnimatePresence>
        {showAddWorkspace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAddWorkspace(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-obsidian border-4 border-gold rounded-lg p-8 max-w-3xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gold flex items-center gap-3">
                  <Plus className="w-8 h-8" />
                  Add New Workspace
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddWorkspace(false)}
                  className="text-white hover:text-pink"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(WORKSPACE_CONFIGS) as Array<keyof WorkspaceConfig>).map((type) => {
                  const wsConfig = WORKSPACE_CONFIGS[type];
                  const isAdded = workspaceTabs.some(tab => tab.type === type);
                  
                  return (
                    <button
                      key={type}
                      onClick={() => !isAdded && addWorkspaceTab(type)}
                      disabled={isAdded}
                      className={`
                        p-6 border-4 border-black rounded-lg text-left
                        ${isAdded 
                          ? 'bg-black/50 opacity-50 cursor-not-allowed' 
                          : `bg-obsidian shadow-${wsConfig.theme}-heavy hover:shadow-${wsConfig.theme}-brutal`
                        }
                        transition-all
                      `}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`text-${wsConfig.theme} text-3xl`}>
                          {type === 'frontend' ? '💻' : 
                           type === 'backend' ? '⚙️' : 
                           type === 'ml' ? '🤖' : 
                           type === 'datascience' ? '📊' : 
                           '🔐'}
                        </div>
                        <div>
                          <div className={`font-black text-lg text-${wsConfig.theme}`}>
                            {wsConfig.name}
                          </div>
                          <div className="text-xs text-white/60">
                            {wsConfig.defaultTools.length} default tools
                          </div>
                        </div>
                      </div>
                      {isAdded && (
                        <Badge className="bg-green-500 text-black text-xs font-black">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          ALREADY ADDED
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global AI Tutor Panel (Workspace-level help) */}
      {showAITutor && workspaceType && (
        <AITutorPanel
          workspaceType={workspaceType}
          sessionContext={activeTab ? `Current tools: ${tools.map(t => t.title).join(', ')}` : undefined}
          position="side"
          themeColor={config.theme}
          onClose={() => setShowAITutor(false)}
        />
      )}
    </div>
  );
}
