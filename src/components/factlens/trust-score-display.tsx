'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn, getScoreColor } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface TrustScoreDisplayProps {
  score: number;
  rationale: string;
}

const CircularProgress = ({ score, className }: { score: number; className?: string }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative">
      <svg className="w-32 h-32" viewBox="0 0 120 120">
        <circle
          className="text-border"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={cn('transform -rotate-90 origin-center', className)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke="currentColor"
          fill="transparent"
          strokeLinecap="round"
          r={radius}
          cx="60"
          cy="60"
        />
      </svg>
      <span className="absolute text-3xl font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {score}
      </span>
    </div>
  );
};

export function TrustScoreDisplay({ score, rationale }: TrustScoreDisplayProps) {
  const { t } = useLanguage();
  const colorClass = getScoreColor(score);
  
  const trustLevelKey =
    score >= 70 ? 'highTrust' : score >= 40 ? 'mediumTrust' : 'lowTrust';
  const trustLevel = t(trustLevelKey);

  return (
    <Card className="shadow-lg">
      <CardHeader className="items-center text-center">
        <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary"/>
            {t('trustScore')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center space-y-4">
        <CircularProgress score={score} className={colorClass} />
        <div className="pt-2">
            <p className={cn("text-2xl font-bold", colorClass)}>{trustLevel}</p>
            <p className="text-sm text-muted-foreground">{t('overallReliability')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-left">{t('evaluationRationale')}</h4>
            <p className="text-muted-foreground text-left text-sm mt-1">{rationale}</p>
        </div>
      </CardContent>
    </Card>
  );
}
