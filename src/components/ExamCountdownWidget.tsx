/**
 * EXAM COUNTDOWN WIDGET
 * Dashboard widget showing nearest upcoming exam
 * Reuses useExamCountdown hook for consistency
 */

import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useExamCountdown } from '@/hooks/useExamCountdown';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function ExamCountdownWidget() {
  const { nearestExam, upcomingCount, isLoading } = useExamCountdown();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#0F1115] to-[#151823] border-4 border-black rounded-none p-6 shadow-brutal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!nearestExam) {
    return (
      <div className="bg-gradient-to-br from-[#0F1115] to-[#151823] border-4 border-black rounded-none p-6 shadow-brutal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white/50" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg uppercase">No Upcoming Exams</h3>
            <p className="text-sm text-white/50">Import your exam schedule</p>
          </div>
        </div>
        
        <Link
          to="/study-planner"
          className="flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-[#9586F2] to-[#C27BA0] text-white font-bold uppercase text-sm hover:opacity-90 transition-opacity"
        >
          <span>Add Exams</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Determine visual style based on urgency
  const getUrgencyStyles = () => {
    switch (nearestExam.urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-br from-red-900/40 to-red-950/40',
          border: 'border-red-500',
          badge: 'bg-red-500',
          icon: 'text-red-400',
        };
      case 'urgent':
        return {
          bg: 'bg-gradient-to-br from-orange-900/40 to-orange-950/40',
          border: 'border-orange-500',
          badge: 'bg-orange-500',
          icon: 'text-orange-400',
        };
      case 'moderate':
        return {
          bg: 'bg-gradient-to-br from-yellow-900/40 to-yellow-950/40',
          border: 'border-yellow-500',
          badge: 'bg-yellow-500',
          icon: 'text-yellow-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-[#9586F2]/20 to-[#C27BA0]/20',
          border: 'border-[#9586F2]',
          badge: 'bg-[#9586F2]',
          icon: 'text-[#9586F2]',
        };
    }
  };

  const styles = getUrgencyStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-4 border-black rounded-none p-6 shadow-brutal relative overflow-hidden",
        styles.bg
      )}
    >
      {/* Decorative Corner */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 opacity-20",
        styles.badge
      )} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={nearestExam.urgencyLevel === 'critical' ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              styles.badge
            )}
          >
            <AlertCircle className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-black text-white text-lg uppercase">Exam Countdown</h3>
            <p className="text-sm text-white/70">
              {upcomingCount} upcoming {upcomingCount === 1 ? 'exam' : 'exams'}
            </p>
          </div>
        </div>

        {/* Days Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "px-4 py-2 rounded-full font-black text-2xl text-white border-2 border-black shadow-medium",
            styles.badge
          )}
        >
          {nearestExam.daysLeft}
          <span className="text-xs ml-1">
            {nearestExam.daysLeft === 1 ? 'DAY' : 'DAYS'}
          </span>
        </motion.div>
      </div>

      {/* Exam Details */}
      <div className="space-y-3 mb-4">
        <div>
          <h4 className="font-black text-white text-2xl uppercase mb-1">
            {nearestExam.exam.exam_name}
          </h4>
          {nearestExam.exam.subject && (
            <p className="text-sm text-white/70 font-semibold">
              {nearestExam.exam.subject}
            </p>
          )}
        </div>

        {/* Countdown Message */}
        <p className={cn(
          "font-bold text-lg",
          styles.icon
        )}>
          {nearestExam.message}
        </p>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-white/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {new Date(nearestExam.exam.exam_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          {nearestExam.exam.exam_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {nearestExam.exam.exam_time}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <Link
        to="/study-planner"
        className="flex items-center justify-between px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors border-2 border-white/20 font-bold uppercase text-sm text-white"
      >
        <span>View Study Plan</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
