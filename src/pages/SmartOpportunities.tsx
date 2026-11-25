import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  OpportunityCategory,
  MOCK_OPPORTUNITIES,
  getOpportunitiesByCategory,
  getHighMatchOpportunities,
  Opportunity
} from '@/mocks/opportunities';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import RecommendationFeed from '@/components/opportunities/RecommendationFeed';
import AutoApplicationModal from '@/components/opportunities/AutoApplicationModal';
import OpportunityCardSkeleton from '@/components/opportunities/OpportunityCardSkeleton';
import OpportunitiesEmptyState from '@/components/opportunities/OpportunitiesEmptyState';
import { useToast } from '@/hooks/use-toast';

type TabOption = 'ALL' | OpportunityCategory;

export default function SmartOpportunities() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabOption>('ALL');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tabs: { id: TabOption; label: string }[] = [
    { id: 'ALL', label: 'All Opportunities' },
    { id: 'SCHOLARSHIP', label: 'Scholarships' },
    { id: 'SCHEME', label: 'Gov Schemes' },
    { id: 'COMPETITION', label: 'Competitions' },
    { id: 'INTERNSHIP', label: 'Internships' },
    { id: 'GRANT', label: 'Grants' }
  ];

  const displayedOpportunities =
    activeTab === 'ALL'
      ? MOCK_OPPORTUNITIES
      : getOpportunitiesByCategory(activeTab as OpportunityCategory);

  const topRecommendations = getHighMatchOpportunities();

  const handleAutoJudge = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const handleAutoApply = () => {
    toast({
      title: 'Application Started! 🚀',
      description: `Auto-applying for ${selectedOpportunity?.title}. You'll be notified when ready for review.`,
      duration: 5000
    });
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    toast({
      title: 'Opening Application Portal',
      description: `Redirecting to ${opportunity.provider}...`,
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-[#9586F2]" />
                <div>
                  <h1 className="text-3xl font-black text-white">Smart Opportunities</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    AI-powered scholarship, grant & competition recommender
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#9586F2]/20 to-[#C27BA0]/20 rounded-lg px-4 py-2 border border-[#9586F2]/30">
              <TrendingUp className="w-5 h-5 text-[#9586F2]" />
              <div>
                <p className="text-xs text-gray-400">Your Match Score</p>
                <p className="text-lg font-black text-white">92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#9586F2] to-[#C27BA0] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <OpportunityCardSkeleton key={i} />
                ))}
              </div>
            ) : displayedOpportunities.length === 0 ? (
              <OpportunitiesEmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedOpportunities.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OpportunityCard
                      opportunity={opportunity}
                      onAutoJudge={handleAutoJudge}
                      onViewDetails={handleViewDetails}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RecommendationFeed
                opportunities={topRecommendations}
                onSelect={opportunity => {
                  setSelectedOpportunity(opportunity);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto Application Modal */}
      <AutoApplicationModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOpportunity(null);
        }}
        onSubmit={handleAutoApply}
      />
    </div>
  );
}
