import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle } from 'lucide-react';
import { CourseInfo } from '@/mocks/verifiedSources';

interface VerificationBannerProps {
  course: CourseInfo;
  mode: 'verified' | 'general';
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ course, mode }) => {
  if (mode !== 'verified') return null;

  return (
    <Card className="border-4 border-black bg-gradient-to-r from-[#9586F2]/30 via-gold/30 to-[#9586F2]/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
      <div className="p-4 flex items-center gap-3 bg-obsidian">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#9586F2] border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <Shield className="w-6 h-6 text-black" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-white">{course.name}</h3>
            <Badge className="bg-[#9586F2] text-black border-2 border-black font-black">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
          <p className="text-sm text-white/90 font-bold">
            Instructor: {course.instructor} • Answers sourced from verified course materials
          </p>
        </div>
      </div>
    </Card>
  );
};
