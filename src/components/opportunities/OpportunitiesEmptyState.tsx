import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export default function OpportunitiesEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center"
    >
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#9586F2]/20 to-[#C27BA0]/20 rounded-full flex items-center justify-center border-2 border-[#9586F2]/30">
          <Search className="w-10 h-10 text-[#9586F2]" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3">No Opportunities Found</h3>
        <p className="text-gray-400 mb-6">
          We couldn't find any opportunities matching your criteria. Try adjusting your filters or check back later for new opportunities.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-[#9586F2]">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">We're always adding new opportunities!</span>
        </div>
      </div>
    </motion.div>
  );
}
