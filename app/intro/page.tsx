"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Upload, Linkedin, ArrowRight, CheckCircle2, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Step = "hero" | "question1" | "question2" | "question3" | "question4" | "generating" | "redirecting";

export default function IntroducePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("hero");
  const [cvUploaded, setCvUploaded] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dynamic questions mock state
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
  });

  const nextStep = () => {
    if (step === "hero") setStep("question1");
    else if (step === "question1") setStep("question2");
    else if (step === "question2") setStep("question3");
    else if (step === "question3") setStep("question4");
    else if (step === "question4") {
      setStep("generating");
      startGeneration();
    }
  };

  const skipHero = () => {
    setStep("question1");
  };

  const startGeneration = () => {
    setIsGenerating(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setStep("redirecting");
          router.push("/");
        }, 800);
      }
      setProgress(currentProgress);
    }, 400);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0d14] text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Brain className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-center mb-2">
            {step === "hero" ? "Let's personalize your journey" : 
             step === "generating" ? "Generating your course" : 
             "Tell us more about you"}
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            {step === "hero" ? "Upload your CV or link your LinkedIn to help MentorAI understand your background and goals." : 
             step === "generating" ? "We're analyzing your profile and crafting the perfect learning path for your career goals." :
             `Question ${step.replace("question", "")} of 4: Help us tailor your experience.`}
          </p>
        </div>

        {/* Step Content */}
        <div className="relative min-h-[350px]">
          {step === "hero" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CV Upload Mock */}
                <div 
                  onClick={() => setCvUploaded(!cvUploaded)}
                  className={cn(
                    "group relative p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center",
                    cvUploaded ? "border-green-500/50 bg-green-500/5" : "border-white/10 hover:border-indigo-500/30 hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                    cvUploaded ? "bg-green-500/20" : "bg-white/5 group-hover:bg-indigo-500/20"
                  )}>
                    {cvUploaded ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Upload className="w-6 h-6 text-indigo-400" />}
                  </div>
                  <h3 className="font-semibold mb-1">{cvUploaded ? "CV Uploaded" : "Upload CV"}</h3>
                  <p className="text-xs text-muted-foreground">PDF, DOCX up to 10MB</p>
                </div>

                {/* LinkedIn Field */}
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-semibold">LinkedIn Profile</h3>
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="linkedin.com/in/username" 
                      className="pl-10 bg-black/40 border-white/10 focus:border-indigo-500/50 transition-all"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
                  onClick={nextStep}
                >
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-white"
                  onClick={skipHero}
                >
                  I'll do this later
                </Button>
              </div>
            </div>
          )}

          {step.startsWith("question") && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
               <h2 className="text-2xl font-semibold mb-6">
                {step === "question1" && "What is your primary career goal?"}
                {step === "question2" && "Which technologies are you most interested in?"}
                {step === "question3" && "How much time can you dedicate weekly?"}
                {step === "question4" && "What is your current experience level?"}
              </h2>
              
              <div className="space-y-4 mb-10">
                <Input 
                  autoFocus
                  placeholder="Type your answer here..." 
                  className="h-14 text-lg bg-black/20 border-white/10 focus:border-indigo-500/50"
                  value={answers[step.replace("question", "q") as keyof typeof answers]}
                  onChange={(e) => setAnswers({...answers, [step.replace("question", "q")]: e.target.value})}
                  onKeyDown={(e) => e.key === "Enter" && nextStep()}
                />
                <p className="text-xs text-muted-foreground text-right">Press Enter to continue</p>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
                onClick={nextStep}
              >
                Next <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {step === "generating" && (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" 
                  style={{ animationDuration: '1.5s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-indigo-400 animate-pulse" />
                </div>
              </div>
              
              <div className="w-full max-w-sm space-y-4">
                <Progress value={progress} className="h-2 bg-white/5" />
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span className="animate-pulse">
                    {progress < 30 ? "Initializing AI engine..." : 
                     progress < 60 ? "Parsing your profile..." : 
                     progress < 90 ? "Mapping career nodes..." : "Finalizing your path..."}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          )}

          {step === "redirecting" && (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-muted-foreground">Welcome to your personalized career journey.</p>
              <Loader2 className="mt-8 w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
           <div className="flex justify-center gap-1 mb-2">
            {[...Array(6)].map((_, i) => {
              const isActive = (step === "hero" && i === 0) || 
                               (step.startsWith("question") && i === parseInt(step.replace("question", ""))) ||
                               ((step === "generating" || step === "redirecting") && i === 5);
              return (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    isActive ? "w-8 bg-indigo-500" : "w-2 bg-white/10"
                  )} 
                />
              );
            })}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium">MentorAI Personalization Engine v1.0</p>
        </div>
      </div>
    </main>
  );
}
