'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, AlertTriangle, Upload, Image as ImageIcon, FileText, ShieldOff, Users, HeartPulse, Flag } from 'lucide-react';
import { analyzeUrl, analyzeImage } from '@/app/actions';
import type { AnalysisState, ImageAnalysisState, ReportState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AnalysisResults from '@/components/factlens/analysis-results';
import ImageAnalysisResult from '@/components/factlens/image-analysis-result';
import { Header } from '@/components/factlens/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DisinformationStats } from '@/components/factlens/disinformation-stats';
import NewsSection from '@/components/factlens/news-section';
import { useUser, useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Textarea } from '@/components/ui/textarea';
import { collection } from 'firebase/firestore';

const initialUrlState: AnalysisState = {};
const initialImageState: ImageAnalysisState = {};
const initialReportState: ReportState = {};

function ImageUploadForm({ language }: { language: string }) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [imageState, setImageState] = useState<ImageAnalysisState>(initialImageState);

  useEffect(() => {
    if (imageState.error) {
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: imageState.error,
      });
    }
  }, [imageState, toast, t]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageState(initialImageState);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        handleImageChange({ target: fileInputRef.current } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setImageState(initialImageState); 

    const formData = new FormData(event.currentTarget);
    const file = formData.get('image-file') as File;
    
    if (!file || !file.type.startsWith('image/')) {
      setImageState({ error: 'No image selected.' });
      setIsPending(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      const analysisFormData = new FormData();
      analysisFormData.append('image', dataUri);
      analysisFormData.append('language', language);
      
      const result = await analyzeImage(initialImageState, analysisFormData);
      setImageState(result);
      setIsPending(false);
    };
    reader.onerror = () => {
      setImageState({ error: 'Failed to read image file.' });
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Upload className="h-10 w-10" />
            <p>{t('dragAndDrop')}</p>
            <p className="text-sm">{t('orClickToUpload')}</p>
          </div>
        )}
      </label>
      <Input
        id="image-upload"
        ref={fileInputRef}
        name="image-file"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="flex justify-center">
         <Button type="submit" disabled={isPending || !imagePreview} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('analyzingImage')}
            </>
          ) : (
            t('analyzeImage')
          )}
        </Button>
      </div>
      
      {isPending && <LoadingSkeleton />}
      {!isPending && imageState.data && <ImageAnalysisResult result={imageState.data} preview={imagePreview} />}
      {!isPending && imageState.error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {imageState.error}
        </p>
      )}
    </form>
  );
}

function ReportWebsiteForm() {
  const { t } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const [state, setState] = useState<ReportState>(initialReportState);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const reportWebsite = async (formData: FormData): Promise<ReportState> => {
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;

    if (!user) {
      return { error: 'Authentication is required to submit a report.' };
    }
     if (!url || !description) {
      return { error: 'Please fill out all fields.' };
    }

    try {
      const reportRef = collection(firestore, `users/${user.uid}/websiteReports`);
      const newReport = {
        url,
        description,
        reporterId: user.uid,
        reportDate: new Date().toISOString(),
        reason: 'User-reported',
        status: 'pending',
      };
      
      const docRef = await addDocumentNonBlocking(reportRef, newReport);
      
      // Update with the generated ID.
      // This is a non-blocking update as well.
      // updateDocumentNonBlocking(docRef, { id: docRef.id });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { error: message };
    }
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState(initialReportState);
    const formData = new FormData(event.currentTarget);
    const result = await reportWebsite(formData);
    setState(result);
    setIsPending(false);
  };
  
  useEffect(() => {
    if (state?.success) {
      toast({
        title: t('reportSuccessTitle'),
        description: t('reportSuccessDescription'),
      });
      formRef.current?.reset();
    } else if (state?.error) {
      toast({
        variant: 'destructive',
        title: t('reportErrorTitle'),
        description: state.error,
      });
    }
  }, [state, toast, t]);
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="url"
        type="url"
        placeholder={t('reportUrlPlaceholder')}
        required
        className="text-base"
      />
      <Textarea
        name="description"
        placeholder={t('reportDescriptionPlaceholder')}
        required
        className="text-base"
      />
       <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('submittingReport')}
          </>
        ) : (
          t('submitReport')
        )}
      </Button>
       {state?.error && !isPending && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {state.error}
        </p>
      )}
    </form>
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
  const [urlState, setUrlState] = useState<AnalysisState>(initialUrlState);
  const [isUrlPending, setIsUrlPending] = useState(false);
  const { toast } = useToast();
  const urlFormRef = React.useRef<HTMLFormElement>(null);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleUrlSubmit = async (formData: FormData) => {
    setIsUrlPending(true);
    const result = await analyzeUrl(initialUrlState, formData);
    setUrlState(result);
    setIsUrlPending(false);
  };
  
  useEffect(() => {
    if (urlState.error) {
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: urlState.error,
      });
    }
  }, [urlState, toast, t]);
  
  useEffect(() => {
    if (urlState.data && !isUrlPending) {
      urlFormRef.current?.reset();
    }
  }, [urlState.data, isUrlPending]);

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

        <Tabs defaultValue="url" className="max-w-3xl mx-auto mt-8 fade-in-up" style={{ animationDelay: '0.6s' }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url">
              <FileText className="mr-2 h-4 w-4" />
              {t('analyzeUrl')}
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="mr-2 h-4 w-4" />
              {t('analyzeImage')}
            </TabsTrigger>
             <TabsTrigger value="report">
              <Flag className="mr-2 h-4 w-4" />
              {t('reportWebsite')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <Card>
              <CardContent className="p-6">
                <form ref={urlFormRef} action={handleUrlSubmit} className="space-y-4">
                  <input type="hidden" name="language" value={language} />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      name="url"
                      type="url"
                      placeholder={t('placeholder')}
                      required
                      className="flex-grow text-base"
                    />
                     <Button type="submit" disabled={isUrlPending} className="w-full sm:w-auto">
                      {isUrlPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('analyzing')}
                        </>
                      ) : (
                        t('analyze')
                      )}
                    </Button>
                  </div>
                  {urlState.error && !isUrlPending && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {urlState.error}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="image">
             <Card>
              <CardContent className="p-6">
                <ImageUploadForm language={language} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="report">
             <Card>
              <CardContent className="p-6">
                {isUserLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : user ? (
                   <ReportWebsiteForm />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>{t('authRequiredToReport')}</p>
                    <Button onClick={() => initiateAnonymousSignIn(auth)} className="mt-4">{t('signInAnonymously')}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div
          className="max-w-6xl mx-auto mt-8 fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          {isUrlPending ? <LoadingSkeleton /> : urlState.data && <AnalysisResults result={urlState.data} />}
        </div>
        
        <section className="max-w-5xl mx-auto mt-16 md:mt-24 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-headline">
              {t('consequencesTitle')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {t('consequencesSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <ShieldOff className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('erosionOfTrust')}</h3>
              <p className="text-muted-foreground">{t('erosionOfTrustText')}</p>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('socialPolarization')}</h3>
              <p className="text-muted-foreground">{t('socialPolarizationText')}</p>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <HeartPulse className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('publicHealthRisks')}</h3>
              <p className="text-muted-foreground">{t('publicHealthRisksText')}</p>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mt-16 md:mt-24 py-12">
          <DisinformationStats />
        </section>

        <section className="max-w-5xl mx-auto mt-16 md:mt-24 py-12">
          <NewsSection />
        </section>

        <section className="max-w-5xl mx-auto mt-16 md:mt-24 py-12 text-center">
          <div className="bg-card border rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight">{t('developedBy')}</h3>
            <p className="mt-3 max-w-3xl mx-auto text-muted-foreground">
              {t('xyberclanMission')}
            </p>
            <Button asChild className="mt-6">
              <a href="https://xyberclan-saas-website.vercel.app/" target="_blank" rel="noopener noreferrer">
                {t('visitXyberclan')}
              </a>
            </Button>
          </div>
        </section>

      </div>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t('xyberfact')}. {t('allRightsReserved')}
      </footer>
    </main>
  );
}
