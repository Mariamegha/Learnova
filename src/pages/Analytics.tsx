import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart as BarChartIcon, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TranslatedText } from '@/components/TranslatedText';
import { getAnalyticsData, AnalyticsData, getFallbackAnalytics } from '@/services/analyticsService';
import { getMockAnalytics, USE_MOCK_DATA, mockDelay } from '@/mocks';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => getFallbackAnalytics());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (USE_MOCK_DATA) {
          await mockDelay(500);
          const mockData = getMockAnalytics();
          if (isActive) {
            setAnalytics(mockData as any);
          }
        } else {
          const data = await getAnalyticsData();
          if (isActive) {
            setAnalytics(data);
          }
        }
      } catch (err) {
        console.error('Analytics load error:', err);
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load analytics right now.');
          // Keep fallback data visible on error
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();
    
    return () => {
      isActive = false;
    };
  }, []);

  const summary = analytics?.summary;
  const hasProvisionalData = Boolean(summary);
  const showSkeleton = loading && !hasProvisionalData;
  const trendPoints = analytics?.weeklyTrend?.length ? analytics.weeklyTrend : [];
  const trendLabels = trendPoints.length
    ? trendPoints.map((point) => point.label)
    : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const focusEntries = analytics?.focusByDay?.length ? analytics.focusByDay : [];
  const subjectEntries = analytics?.subjects?.length ? analytics.subjects : [];
  const timeBlockEntries = analytics?.timeBlocks?.length ? analytics.timeBlocks : [];

  const overviewCards = [
    {
      label: 'Study Time',
      value: summary ? `${summary.studyHours.toFixed(1)}h` : '--',
      delta: summary ? `${summary.studyHoursChange >= 0 ? '+' : ''}${summary.studyHoursChange}%` : '',
      deltaLabel: 'this week',
      deltaClass: summary && summary.studyHoursChange >= 0 ? 'text-success' : 'text-destructive',
      icon: Clock,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Focus Score',
      value: summary ? `${summary.focusScore}%` : '--',
      delta: summary ? `${summary.focusChange >= 0 ? '+' : ''}${summary.focusChange}%` : '',
      deltaLabel: 'vs last week',
      deltaClass: summary && summary.focusChange >= 0 ? 'text-success' : 'text-destructive',
      icon: Target,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      label: 'Streak',
      value: summary ? `${summary.streak} days` : '--',
      delta: 'Keep it up!',
      deltaLabel: '',
      translateDelta: true,
      deltaClass: 'text-muted-foreground',
      icon: TrendingUp,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      label: 'Completed',
      value: summary ? summary.completedModules.toString() : '--',
      delta: 'modules',
      deltaLabel: '',
      translateDelta: true,
      deltaClass: 'text-muted-foreground',
      icon: Award,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  ];

  // Show loading state if no data available yet
  if (loading && !hasProvisionalData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <BarChartIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center p-20">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <BarChartIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold"><TranslatedText text="Analytics" /></h1>
        </div>
      </motion.div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && !loading && analytics?.isFallback && (
        <div className="mb-4 rounded-lg border border-muted/40 bg-muted/20 p-4 text-sm text-muted-foreground">
          Showing sample insights until you log study sessions.
        </div>
      )}

      {/* Overview Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-full ${card.iconBg} p-3`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <TranslatedText text={card.label} />
                </p>
                {showSkeleton ? (
                  <Skeleton className="mt-2 h-6 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{card.value}</p>
                )}
                {!showSkeleton && card.delta && (
                  <p className={`text-xs ${card.deltaClass}`}>
                    {card.translateDelta ? <TranslatedText text={card.delta} /> : card.delta}
                    {card.deltaLabel && (
                      <span className="text-muted-foreground">
                        {' '}
                        <TranslatedText text={card.deltaLabel} />
                      </span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview"><TranslatedText text="Overview" /></TabsTrigger>
          <TabsTrigger value="subjects"><TranslatedText text="By Subject" /></TabsTrigger>
          <TabsTrigger value="time"><TranslatedText text="Time Analysis" /></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle><TranslatedText text="Study Time Trend" /></CardTitle>
                <CardDescription><TranslatedText text="Your weekly study hours over the last month" /></CardDescription>
              </CardHeader>
              <CardContent>
                {showSkeleton ? (
                  <Skeleton className="h-64 w-full rounded" />
                ) : trendPoints.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256}>
                    <BarChart data={trendPoints}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value} hours`, 'Study Time']}
                      />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Start a study session to see your weekly trend.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><TranslatedText text="Focus Score" /></CardTitle>
                <CardDescription><TranslatedText text="Your concentration levels throughout the week" /></CardDescription>
              </CardHeader>
              <CardContent>
                {showSkeleton ? (
                  <Skeleton className="h-64 w-full rounded" />
                ) : focusEntries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256}>
                    <AreaChart data={focusEntries}>
                      <defs>
                        <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" className="text-xs text-muted-foreground" />
                      <YAxis className="text-xs text-muted-foreground" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Focus Score']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#focusGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Complete study sessions to track your focus.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Progress Multi-Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle><TranslatedText text="3-Month Progress Overview" /></CardTitle>
              <CardDescription><TranslatedText text="XP gained, hours studied, and modules completed" /></CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-80 w-full rounded" />
              ) : analytics?.monthlyProgress && analytics.monthlyProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={analytics.monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#9586F2" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="XP Earned"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#C27BA0" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Study Hours"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#6DAEDB" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Modules Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Your progress over the months will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle><TranslatedText text="Subject Distribution" /></CardTitle>
                <CardDescription><TranslatedText text="Time spent per subject" /></CardDescription>
              </CardHeader>
              <CardContent>
                {showSkeleton ? (
                  <Skeleton className="mx-auto h-64 w-64 rounded-full" />
                ) : subjectEntries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={subjectEntries}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="score"
                      >
                        {subjectEntries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Log some course progress to see subject distribution.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><TranslatedText text="Performance by Subject" /></CardTitle>
                <CardDescription><TranslatedText text="Your strongest and weakest areas" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectEntries.map((subject, i) => {
                    // Fix: Mock data has 'hours' not 'score', 'color' not 'colorClass'
                    const hours = (subject as any).hours || 0;
                    const maxHours = Math.max(...subjectEntries.map((s: any) => s.hours || 0), 1);
                    const percentage = Math.round((hours / maxHours) * 100);
                    const color = (subject as any).color || 'hsl(var(--primary))';
                    
                    return (
                      <motion.div
                        key={subject.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="mb-2 flex justify-between">
                          <span className="font-semibold">{subject.name}</span>
                          <span className="text-sm text-muted-foreground">{hours}h</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            style={{ backgroundColor: color }}
                            className="h-full"
                          />
                        </div>
                      </motion.div>
                    );
                  })}

                  {subjectEntries.length === 0 && (
                    <p className="text-sm text-muted-foreground">Log some course progress to see subject performance.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle><TranslatedText text="Best Study Times" /></CardTitle>
                <CardDescription><TranslatedText text="When you're most productive" /></CardDescription>
              </CardHeader>
              <CardContent>
                {showSkeleton ? (
                  <Skeleton className="h-64 w-full rounded" />
                ) : timeBlockEntries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256}>
                    <BarChart data={timeBlockEntries} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" />
                      <YAxis type="category" dataKey="label" className="text-xs text-muted-foreground" width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Productivity']}
                      />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Study sessions will reveal your peak hours.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><TranslatedText text="Time Block Details" /></CardTitle>
                <CardDescription><TranslatedText text="Productivity breakdown by time of day" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeBlockEntries.map((block, idx) => {
                    // Fix: Mock data has 'hours' not 'score', missing 'description', 'bgClass', 'textClass'
                    const hours = (block as any).hours || 0;
                    const maxHours = Math.max(...timeBlockEntries.map((b: any) => b.hours || 0), 1);
                    const percentage = Math.round((hours / maxHours) * 100);
                    const colors = ['bg-blue-500/10', 'bg-gold/10', 'bg-pink/10'];
                    const textColors = ['text-blue-500', 'text-gold', 'text-pink'];
                    
                    return (
                      <div
                        key={block.label}
                        className={`flex items-center justify-between rounded-lg p-4 ${colors[idx % 3]}`}
                      >
                        <div>
                          <p className="font-semibold"><TranslatedText text={block.label} /></p>
                          <p className="text-sm text-muted-foreground">{hours} hours studied</p>
                        </div>
                        <div className={`text-2xl font-bold ${textColors[idx % 3]}`}>{percentage}%</div>
                      </div>
                    );
                  })}
                  {timeBlockEntries.length === 0 && (
                    <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                      We'll highlight your most productive hours once we detect enough study sessions.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
