import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSoundPlayer } from '@/hooks/useSoundPlayer';
// TODO [Phase 35]: Integrate AI-powered roadmap generation
// import { useAIContext } from '@/hooks/useAIContext';
// const aiContext = useAIContext({ contextType: 'roadmap' });
// Use aiContext.sendMessage() to generate personalized learning paths based on goals/skills
import { TranslatedText } from '@/components/TranslatedText';
import { GridScan } from '@/components/3D/GridScan';
import { ThreeDFallback } from '@/components/3D/ThreeDFallback';
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Link as LinkIcon,
  Zap,
  Trophy,
  TrendingUp,
  Lock,
  Star,
  ChevronRight,
  X,
  Download,
  Brain,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { MOCK_ROADMAPS } from '@/mocks/roadmaps';
import type { MockRoadmap, MockMilestone, MockResource } from '@/mocks/roadmaps';

// Helper function to get difficulty badge color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'hard':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
};

// Helper function to get resource icon
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'article':
      return <FileText className="h-4 w-4" />;
    case 'course':
      return <BookOpen className="h-4 w-4" />;
    case 'book':
      return <BookOpen className="h-4 w-4" />;
    case 'practice':
      return <Brain className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
};

export default function Roadmap() {
  const [selectedRoadmaps, setSelectedRoadmaps] = useState<Set<string>>(new Set());
  const [activeRoadmap, setActiveRoadmap] = useState<MockRoadmap | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<MockMilestone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showRoadmapGrid, setShowRoadmapGrid] = useState(true);
  const [completedMilestonesByRoadmap, setCompletedMilestonesByRoadmap] = useState<Record<string, Set<string>>>({});
  
  const { toast } = useToast();
  const { playSound } = useSoundPlayer();

  // Load saved roadmap selections and progress from localStorage
  useEffect(() => {
    const savedSelections = localStorage.getItem('selected_roadmaps');
    if (savedSelections) {
      try {
        const selections = JSON.parse(savedSelections);
        setSelectedRoadmaps(new Set(selections));
      } catch (e) {
        console.error('Error loading roadmap selections:', e);
      }
    }

    // Load progress for all roadmaps
    const progressData: Record<string, Set<string>> = {};
    MOCK_ROADMAPS.forEach(roadmap => {
      const savedProgress = localStorage.getItem(`roadmap_progress_${roadmap.id}`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          progressData[roadmap.id] = new Set(progress.completedMilestones || []);
        } catch (e) {
          console.error('Error loading roadmap progress:', e);
        }
      } else {
        // Set initial completed milestones based on mock data
        const initialCompleted = roadmap.milestones
          .filter(m => m.completed)
          .map(m => m.id);
        progressData[roadmap.id] = new Set(initialCompleted);
      }
    });
    setCompletedMilestonesByRoadmap(progressData);
  }, []);

  // Toggle roadmap selection
  const handleToggleRoadmap = (roadmapId: string) => {
    const newSelections = new Set(selectedRoadmaps);
    if (newSelections.has(roadmapId)) {
      newSelections.delete(roadmapId);
    } else {
      newSelections.add(roadmapId);
    }
    setSelectedRoadmaps(newSelections);
    
    // Save selections
    localStorage.setItem('selected_roadmaps', JSON.stringify(Array.from(newSelections)));
  };

  // View a specific roadmap
  const handleViewRoadmap = (roadmap: MockRoadmap) => {
    setActiveRoadmap(roadmap);
    setShowRoadmapGrid(false);
  };

  // Go back to grid view
  const handleBackToGrid = () => {
    setShowRoadmapGrid(true);
    setActiveRoadmap(null);
  };
  // Handle milestone completion
  const handleCompleteMilestone = (roadmapId: string, milestoneId: string) => {
    const newCompleted = new Set(completedMilestonesByRoadmap[roadmapId] || new Set());
    newCompleted.add(milestoneId);
    
    const updatedProgress = {
      ...completedMilestonesByRoadmap,
      [roadmapId]: newCompleted
    };
    setCompletedMilestonesByRoadmap(updatedProgress);

    // Save progress
    const progressData = {
      completedMilestones: Array.from(newCompleted),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(`roadmap_progress_${roadmapId}`, JSON.stringify(progressData));

    // Play success sound
    playSound('success');

    toast({
      title: 'Milestone Completed!',
      description: `You've earned XP. Keep going!`,
    });

    // Close drawer
    setIsDrawerOpen(false);
  };

  // Open milestone drawer
  const handleMilestoneClick = (milestone: MockMilestone) => {
    setSelectedMilestone(milestone);
    setIsDrawerOpen(true);
  };

  // Get completed milestones for active roadmap
  const getCompletedMilestones = (roadmapId: string): Set<string> => {
    return completedMilestonesByRoadmap[roadmapId] || new Set();
  };

  // Calculate progress for a roadmap
  const calculateProgress = (roadmap: MockRoadmap) => {
    const completedMilestones = getCompletedMilestones(roadmap.id);
    const totalMilestones = roadmap.milestones.length;
    const completedCount = completedMilestones.size;
    return totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;
  };

  // Get next milestone for a roadmap
  const getNextMilestone = (roadmap: MockRoadmap): MockMilestone | null => {
    const completedMilestones = getCompletedMilestones(roadmap.id);
    return roadmap.milestones.find(m => !completedMilestones.has(m.id)) || null;
  };

  // Get selected roadmap objects
  const selectedRoadmapObjects = MOCK_ROADMAPS.filter(r => selectedRoadmaps.has(r.id));

  // Calculate stats for active roadmap
  const activeRoadmapStats = activeRoadmap ? {
    totalMilestones: activeRoadmap.milestones.length,
    completedCount: getCompletedMilestones(activeRoadmap.id).size,
    progressPercentage: calculateProgress(activeRoadmap),
    nextMilestone: getNextMilestone(activeRoadmap)
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Header */}
      <div className="relative border-b-4 border-black bg-gradient-to-br from-[#9586F2]/10 via-[#C27BA0]/10 to-[#6DAEDB]/10 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ThreeDFallback fallbackColor="from-[#9586F2]/5 to-[#C27BA0]/5">
            <GridScan />
          </ThreeDFallback>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Learning Roadmaps</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {showRoadmapGrid 
                    ? 'Select roadmaps to start your learning journey. Track milestones, earn XP, and level up your skills.'
                    : 'Follow structured learning paths to achieve your goals. Complete milestones and track your progress.'
                  }
                </p>
              </div>
              
              {!showRoadmapGrid && (
                <Button
                  onClick={handleBackToGrid}
                  variant="outline"
                  className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  All Roadmaps
                </Button>
              )}
            </div>

            {/* Stats Summary */}
            {selectedRoadmaps.size > 0 && showRoadmapGrid && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#9586F2]/10 border-2 border-black flex items-center justify-center">
                        <Target className="h-5 w-5 text-[#9586F2]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Roadmaps</p>
                        <p className="text-2xl font-bold">{selectedRoadmaps.size}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 border-2 border-black flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Milestones</p>
                        <p className="text-2xl font-bold">
                          {selectedRoadmapObjects.reduce((acc, r) => acc + getCompletedMilestones(r.id).size, 0)}/
                          {selectedRoadmapObjects.reduce((acc, r) => acc + r.milestones.length, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#C27BA0]/10 border-2 border-black flex items-center justify-center">
                        <Zap className="h-5 w-5 text-[#C27BA0]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                        <p className="text-2xl font-bold text-[#9586F2]">
                          {selectedRoadmapObjects.reduce((acc, r) => acc + getCompletedMilestones(r.id).size * 100, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showRoadmapGrid ? (
          /* Roadmap Grid View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Roadmaps</h2>
              {selectedRoadmaps.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedRoadmaps.size} roadmap{selectedRoadmaps.size !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_ROADMAPS.map((roadmap, index) => {
                const isSelected = selectedRoadmaps.has(roadmap.id);
                const progress = calculateProgress(roadmap);
                const completedMilestones = getCompletedMilestones(roadmap.id);
                const nextMilestone = getNextMilestone(roadmap);

                return (
                  <motion.div
                    key={roadmap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-4 border-black transition-all ${
                      isSelected
                        ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-[#9586F2]/5 to-[#C27BA0]/5'
                        : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                    }`}>
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleRoadmap(roadmap.id)}
                            className="mt-1 border-2 border-black data-[state=checked]:bg-[#9586F2] data-[state=checked]:border-[#9586F2]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getDifficultyColor(roadmap.difficulty)} border-2`}>
                                {roadmap.difficulty.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="border-2 border-black">
                                {roadmap.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2">{roadmap.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{roadmap.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold text-[#9586F2]">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-muted border-2 border-black rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#9586F2] to-[#C27BA0] transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{completedMilestones.size}/{roadmap.milestones.length} milestones</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{roadmap.estimatedDuration}</span>
                          </div>
                        </div>

                        {/* Next Milestone */}
                        {nextMilestone && (
                          <div className="p-3 rounded-lg bg-muted border-2 border-black">
                            <p className="text-xs text-muted-foreground mb-1">Next Milestone</p>
                            <p className="text-sm font-semibold line-clamp-1">{nextMilestone.title}</p>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => handleViewRoadmap(roadmap)}
                          className="w-full bg-[#9586F2] hover:bg-[#AA9DF8] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          disabled={!isSelected}
                        >
                          {isSelected ? (
                            <>
                              View Roadmap
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Select to Start
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : activeRoadmap && activeRoadmapStats ? (
          /* Individual Roadmap View */
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar: Progress & Stats */}
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#9586F2]" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Circular Progress */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#9586F2"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 352 }}
                          animate={{ strokeDashoffset: 352 - (352 * activeRoadmapStats.progressPercentage) / 100 }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          style={{
                            strokeDasharray: 352,
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{Math.round(activeRoadmapStats.progressPercentage)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                      <p className="text-2xl font-bold">{activeRoadmapStats.completedCount}/{activeRoadmapStats.totalMilestones}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Zap className="h-4 w-4" />
                        <span>XP Earned</span>
                      </div>
                      <p className="text-2xl font-bold text-[#9586F2]">{activeRoadmapStats.completedCount * 100}</p>
                    </div>
                  </div>

                  <Separator className="bg-black" />

                  {/* Roadmap Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge className={`${getDifficultyColor(activeRoadmap.difficulty)} border-2`}>
                        {activeRoadmap.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{activeRoadmap.estimatedDuration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold">{activeRoadmap.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Milestone Card */}
              {activeRoadmapStats.nextMilestone && (
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-[#9586F2]/5 to-[#C27BA0]/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#9586F2]" />
                      Next Milestone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h3 className="font-bold">{activeRoadmapStats.nextMilestone.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activeRoadmapStats.nextMilestone.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{activeRoadmapStats.nextMilestone.estimatedHours}h</span>
                      </div>
                      <Badge className={`${getDifficultyColor(activeRoadmapStats.nextMilestone.difficulty)} border-2`}>
                        {activeRoadmapStats.nextMilestone.difficulty}
                      </Badge>
                    </div>
                    <Button
                      className="w-full bg-[#9586F2] hover:bg-[#AA9DF8] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      onClick={() => handleMilestoneClick(activeRoadmapStats.nextMilestone!)}
                    >
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Skills Card */}
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="text-lg">Skills Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {activeRoadmap.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center: Timeline */}
            <div className="lg:col-span-2">
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="text-2xl">{activeRoadmap.title}</CardTitle>
                  <CardDescription>{activeRoadmap.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Milestones Timeline */}
                  <div className="relative space-y-8 pl-8">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                    {activeRoadmap.milestones.map((milestone, index) => {
                      const completedMilestones = getCompletedMilestones(activeRoadmap.id);
                      const isCompleted = completedMilestones.has(milestone.id);
                      const isNext = activeRoadmapStats.nextMilestone?.id === milestone.id;
                      const isLocked = !isCompleted && !isNext && index > 0 && !completedMilestones.has(activeRoadmap.milestones[index - 1].id);

                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          {/* Milestone Node */}
                          <div className="absolute left-[-34px] top-2">
                            {isCompleted ? (
                              <div className="h-8 w-8 rounded-full bg-green-500 border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              </div>
                            ) : isNext ? (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-8 w-8 rounded-full bg-[#9586F2] border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              />
                            ) : isLocked ? (
                              <div className="h-8 w-8 rounded-full bg-muted border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                            )}
                          </div>

                          {/* Milestone Card */}
                          <button
                            onClick={() => !isLocked && handleMilestoneClick(milestone)}
                            disabled={isLocked}
                            className={`w-full text-left p-6 rounded-lg border-4 border-black transition-all ${
                              isLocked
                                ? 'bg-muted opacity-60 cursor-not-allowed'
                                : isNext
                                ? 'bg-gradient-to-br from-[#9586F2]/10 to-[#C27BA0]/10 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                : isCompleted
                                ? 'bg-green-500/5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold text-muted-foreground">
                                      Milestone {index + 1}
                                    </span>
                                    {isCompleted && (
                                      <Badge className="bg-green-500 text-white border-2 border-black text-xs">
                                        Completed
                                      </Badge>
                                    )}
                                    {isNext && (
                                      <Badge className="bg-[#9586F2] text-white border-2 border-black text-xs">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold mb-2">{milestone.title}</h3>
                                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{milestone.estimatedHours}h</span>
                                </div>
                                <Badge className={`${getDifficultyColor(milestone.difficulty)} border-2`}>
                                  {milestone.difficulty}
                                </Badge>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{milestone.resources.length} resources</span>
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {milestone.skills.slice(0, 3).map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground border-2 border-black"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {milestone.skills.length > 3 && (
                                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground border-2 border-black">
                                    +{milestone.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        ) : (
          /* No selection message */
          <div className="text-center py-20">
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
              <CardContent className="p-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Roadmap Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Select a roadmap from the grid above to start your learning journey.
                </p>
                <Button
                  onClick={handleBackToGrid}
                  className="bg-[#9586F2] hover:bg-[#AA9DF8] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  View All Roadmaps
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Milestone Detail Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl border-l-4 border-black overflow-y-auto">
          {selectedMilestone && (
            <>
              <SheetHeader className="border-b-4 border-black pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <SheetTitle className="text-2xl mb-2">{selectedMilestone.title}</SheetTitle>
                    <SheetDescription className="text-base">{selectedMilestone.description}</SheetDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDrawerOpen(false)}
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <Badge className={`${getDifficultyColor(selectedMilestone.difficulty)} border-2`}>
                    {selectedMilestone.difficulty.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedMilestone.estimatedHours} hours</span>
                  </div>
                  {activeRoadmap && getCompletedMilestones(activeRoadmap.id).has(selectedMilestone.id) && (
                    <Badge className="bg-green-500 text-white border-2 border-black">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Skills */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#9586F2]" />
                    Skills You'll Learn
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMilestone.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="bg-black h-1" />

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#C27BA0]" />
                    Learning Resources
                  </h3>
                  <div className="space-y-3">
                    {selectedMilestone.resources.map((resource) => (
                      <Card key={resource.id} className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#6DAEDB]/10 border-2 border-black flex items-center justify-center flex-shrink-0">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold line-clamp-1">{resource.title}</h4>
                                {resource.isFree && (
                                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                    FREE
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="capitalize">{resource.type}</span>
                                {resource.duration && (
                                  <>
                                    <span>â€¢</span>
                                    <span>{resource.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              onClick={() => window.open(resource.url, '_blank')}
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {activeRoadmap && !getCompletedMilestones(activeRoadmap.id).has(selectedMilestone.id) && (
                  <>
                    <Separator className="bg-black h-1" />
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      size="lg"
                      onClick={() => activeRoadmap && handleCompleteMilestone(activeRoadmap.id, selectedMilestone.id)}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Mark as Complete
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
