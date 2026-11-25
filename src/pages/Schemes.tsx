import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SchemeCard } from '@/components/schemes/SchemeCard';
import { EligibilityPanel } from '@/components/schemes/EligibilityPanel';
import { SchemeFilters } from '@/components/schemes/SchemeFilters';
import { SmartAutoFillPanel } from '@/components/schemes/SmartAutoFillPanel';
import { SchemeLoadingGrid } from '@/components/schemes/SchemeLoadingSkeleton';
import { SchemesEmptyState } from '@/components/schemes/SchemesEmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MOCK_SCHEMES, 
  getRecommendedSchemes, 
  getSchemesByCategory, 
  getActiveSchemes,
  SchemeCategory,
  EducationLevel 
} from '@/mocks/schemes';
import { 
  Award, 
  TrendingUp, 
  Target, 
  Sparkles, 
  ArrowRight,
  GraduationCap,
  Building2
} from 'lucide-react';

const Schemes = () => {
  const [isLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | 'ALL'>('ALL');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<EducationLevel | 'ALL'>('ALL');
  const [selectedState, setSelectedState] = useState<string | 'ALL'>('ALL');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  const recommendedSchemes = useMemo(() => getRecommendedSchemes(), []);
  const activeSchemes = useMemo(() => getActiveSchemes(), []);

  const filteredSchemes = useMemo(() => {
    let schemes = activeSchemes;

    if (selectedCategory !== 'ALL') {
      schemes = schemes.filter(s => s.category === selectedCategory);
    }

    if (selectedEducationLevel !== 'ALL') {
      schemes = schemes.filter(s => 
        s.educationLevel === selectedEducationLevel || s.educationLevel === 'ALL'
      );
    }

    if (selectedState !== 'ALL') {
      schemes = schemes.filter(s => 
        !s.state || s.state === selectedState || s.state === 'Various States'
      );
    }

    return schemes;
  }, [activeSchemes, selectedCategory, selectedEducationLevel, selectedState]);

  const meritBasedSchemes = useMemo(() => 
    getSchemesByCategory('MERIT_BASED').filter(s => s.status === 'ACTIVE'),
    []
  );

  const financialAidSchemes = useMemo(() => 
    [...getSchemesByCategory('FINANCIAL_AID'), ...getSchemesByCategory('FEE_WAIVER')]
      .filter(s => s.status === 'ACTIVE'),
    []
  );

  const careerProgramSchemes = useMemo(() => 
    getSchemesByCategory('CAREER_PROGRAM').filter(s => s.status === 'ACTIVE'),
    []
  );

  const handleCheckEligibility = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    // Scroll to eligibility panel
    setTimeout(() => {
      const panel = document.getElementById('eligibility-panel');
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedEducationLevel('ALL');
    setSelectedState('ALL');
  };

  const hasActiveFilters = 
    selectedCategory !== 'ALL' || 
    selectedEducationLevel !== 'ALL' || 
    selectedState !== 'ALL';

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#9586F2]/10 via-[#C27BA0]/10 to-[#6DAEDB]/10 border-b"
        >
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-8 h-8 text-[#9586F2]" />
                <Badge variant="secondary" className="text-xs">
                  Phase 28
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#9586F2] via-[#C27BA0] to-[#6DAEDB] bg-clip-text text-transparent">
                Opportunities Center
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Personalized government & educational schemes curated for your profile. 
                Discover scholarships, fee waivers, and career programs designed to support your educational journey.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{activeSchemes.length}</strong> Active Schemes
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-[#9586F2]" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{recommendedSchemes.length}</strong> Recommended for You
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Filters */}
              <SchemeFilters
                selectedCategory={selectedCategory}
                selectedEducationLevel={selectedEducationLevel}
                selectedState={selectedState}
                onCategoryChange={setSelectedCategory}
                onEducationLevelChange={setSelectedEducationLevel}
                onStateChange={setSelectedState}
              />

              {/* Recommended Section */}
              {recommendedSchemes.length > 0 && !hasActiveFilters && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#9586F2]" />
                      <h2 className="text-2xl font-bold">Recommended for You</h2>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Top Matches
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {recommendedSchemes.slice(0, 3).map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        onCheckEligibility={handleCheckEligibility}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* All Filtered Schemes */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#6DAEDB]" />
                    <h2 className="text-2xl font-bold">
                      {hasActiveFilters ? 'Filtered Results' : 'All Opportunities'}
                    </h2>
                  </div>
                  <Badge variant="outline">
                    {filteredSchemes.length} {filteredSchemes.length === 1 ? 'Scheme' : 'Schemes'}
                  </Badge>
                </div>

                {isLoading ? (
                  <SchemeLoadingGrid />
                ) : filteredSchemes.length === 0 ? (
                  <SchemesEmptyState 
                    hasFilters={hasActiveFilters} 
                    onClearFilters={clearAllFilters}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredSchemes.map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        onCheckEligibility={handleCheckEligibility}
                      />
                    ))}
                  </div>
                )}
              </motion.section>

              {/* Merit-Based Section */}
              {meritBasedSchemes.length > 0 && !hasActiveFilters && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <h2 className="text-2xl font-bold">Merit-Based Opportunities</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {meritBasedSchemes.slice(0, 4).map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        onCheckEligibility={handleCheckEligibility}
                        variant="compact"
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Financial Aid Section */}
              {financialAidSchemes.length > 0 && !hasActiveFilters && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      <h2 className="text-2xl font-bold">Financial Aid & Fee Waivers</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {financialAidSchemes.slice(0, 4).map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        onCheckEligibility={handleCheckEligibility}
                        variant="compact"
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Career Programs Section */}
              {careerProgramSchemes.length > 0 && !hasActiveFilters && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      <h2 className="text-2xl font-bold">Government Career Programs</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {careerProgramSchemes.map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        onCheckEligibility={handleCheckEligibility}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Eligibility Panel */}
              <div id="eligibility-panel">
                <EligibilityPanel
                  schemeId={selectedSchemeId}
                  onClose={() => setSelectedSchemeId(null)}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Smart Auto-Fill Panel */}
              <SmartAutoFillPanel />

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#9586F2]" />
                      Your Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Applications Started</span>
                        <Badge variant="secondary">3</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Eligible Schemes</span>
                        <Badge variant="secondary">{recommendedSchemes.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Deadlines This Month</span>
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                          5
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      View Application History
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="border-2 bg-gradient-to-br from-[#6DAEDB]/5 to-transparent">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI assistant can help you find the best schemes and guide you through the application process.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-[#6DAEDB]/10 hover:border-[#6DAEDB]"
                      size="sm"
                    >
                      Chat with AI Assistant
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Schemes;
