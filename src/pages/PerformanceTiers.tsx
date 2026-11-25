import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TierOverviewCard from '@/components/performance/TierOverviewCard';
import StudentTierCard from '@/components/performance/StudentTierCard';
import TierActivityTimeline from '@/components/performance/TierActivityTimeline';
import TeacherMonitoringPanel from '@/components/performance/TeacherMonitoringPanel';
import ImprovementTracker from '@/components/performance/ImprovementTracker';
import {
  performanceTiers,
  getStudentsByTier,
  getTierStatistics,
  StudentTierProfile
} from '@/mocks/performanceTiers';

type ViewMode = 'overview' | 'monitoring' | 'student-detail';

export default function PerformanceTiers() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedStudent, setSelectedStudent] = useState<StudentTierProfile | null>(null);

  const bestTierStats = getTierStatistics('BEST');
  const mediumTierStats = getTierStatistics('MEDIUM');
  const worstTierStats = getTierStatistics('WORST');

  const handleStudentClick = (student: StudentTierProfile) => {
    setSelectedStudent(student);
    setViewMode('student-detail');
  };

  const handleBackClick = () => {
    if (viewMode === 'student-detail') {
      setViewMode('monitoring');
      setSelectedStudent(null);
    } else if (viewMode === 'monitoring') {
      setViewMode('overview');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white">Performance Tiers</h1>
              <p className="text-sm text-gray-400 mt-1">
                {viewMode === 'overview' && 'Track student performance across tiers'}
                {viewMode === 'monitoring' && 'Monitor all students by tier'}
                {viewMode === 'student-detail' && selectedStudent?.name}
              </p>
            </div>
            {viewMode !== 'student-detail' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === 'overview'
                      ? 'bg-[#9586F2] text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('monitoring')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === 'monitoring'
                      ? 'bg-[#9586F2] text-black'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Monitoring
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Tier Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TierOverviewCard tier="BEST" statistics={bestTierStats} />
              <TierOverviewCard tier="MEDIUM" statistics={mediumTierStats} />
              <TierOverviewCard tier="WORST" statistics={worstTierStats} />
            </div>

            {/* Best Tier Students Spotlight */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-[#9586F2]" />
                <h2 className="text-2xl font-black text-white">Top Performers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getStudentsByTier('BEST').map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StudentTierCard
                      student={student}
                      onClick={() => handleStudentClick(student)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Students Needing Support */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-[#6DAEDB]" />
                <h2 className="text-2xl font-black text-white">Students Needing Support</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getStudentsByTier('WORST').map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StudentTierCard
                      student={student}
                      onClick={() => handleStudentClick(student)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'monitoring' && (
          <TeacherMonitoringPanel
            students={performanceTiers.students}
            onStudentClick={handleStudentClick}
          />
        )}

        {viewMode === 'student-detail' && selectedStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ImprovementTracker student={selectedStudent} />
            </div>
            <div>
              <TierActivityTimeline history={selectedStudent.tierHistory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
