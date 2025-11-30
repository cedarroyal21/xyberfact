'use client';

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { analyzeUrl } from '@/app/actions';
import { generateVideoAction } from '@/app/video-actions';
import type { AnalysisState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AnalysisResults from '@/components/factlens/analysis-results';
import { Header } from '@/components/factlens/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

const initialState: AnalysisState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('analyzing')}
        </>
      ) : (
        t('analyze')
      )}
    </Button>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse mt-12">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-1">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-32" />
            <div className="w-full space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="md:col-span-2 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const { t, language } = useLanguage();
  const [state, formAction] = useFormState(analyzeUrl, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    async function generateVideo() {
      setVideoError(null);
      try {
        const result = await generateVideoAction(language);
        if (result.url) {
          setVideoUrl(result.url);
        } else if (result.error) {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Video generation failed:', error);
        setVideoError(t('videoGenerationFailed'));
      }
    }
    generateVideo();
  }, [language, t]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: state.error,
      });
    }
  }, [state, toast, t]);

  useEffect(() => {
    if (state.data && !pending) {
      formRef.current?.reset();
    }
  }, [state.data, pending]);

  const isVideoLoading = !videoUrl && !videoError;

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground font-headline fade-in-up">
            {t('uncoverTruth')}
          </h1>
          <p
            className="mt-4 text-lg md:text-xl text-muted-foreground fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {t('subheading')}
          </p>
        </section>

        <section className="max-w-4xl mx-auto mt-8 fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Card className="shadow-lg overflow-hidden">
            {isVideoLoading && (
               <div className="aspect-video bg-muted flex flex-col items-center justify-center">
                 <Loader2 className="h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-muted-foreground">{t('generatingVideo')}</p>
               </div>
            )}
            {videoError && (
              <div className="aspect-video bg-muted flex flex-col items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="mt-4 text-destructive">{videoError}</p>
              </div>
            )}
            {videoUrl && (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </Card>
        </section>

        <Card
          className="max-w-3xl mx-auto mt-8 shadow-lg fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <CardContent className="p-6">
            <form ref={formRef} action={formAction} className="space-y-4">
              <input type="hidden" name="language" value={language} />
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  name="url"
                  type="url"
                  placeholder={t('placeholder')}
                  required
                  className="flex-grow text-base"
                />
                <SubmitButton />
              </div>
              {state.error && !pending && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {state.error}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div
          className="max-w-6xl mx-auto mt-8 fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          {pending ? <LoadingSkeleton /> : state.data && <AnalysisResults result={state.data} />}
        </div>
      </div>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t('factlens')}. {t('allRightsReserved')}
      </footer>
    </main>
  );
}
