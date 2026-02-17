"use client";

import { useState, useEffect } from "react";
import { Settings, Download, Upload, RotateCcw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptConfigStore, type PromptConfig } from "@/lib/prompt-config";
import { useToast } from "@/hooks/use-toast";

export function PromptConfigPanel() {
  const [config, setConfig] = useState<PromptConfig>(
    PromptConfigStore.getDefaultConfig(),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setConfig(PromptConfigStore.getConfig());
    }
  }, [isOpen]);

  const handleSave = () => {
    PromptConfigStore.saveConfig(config);
    setShowSaveConfirm(false);
    setIsOpen(false);
    toast({
      title: "Prompts Saved",
      description:
        "Configuration updated successfully. Changes will apply to new conversations.",
    });
  };

  const handleReset = () => {
    const defaultConfig = PromptConfigStore.getDefaultConfig();
    setConfig(defaultConfig);
    PromptConfigStore.resetToDefaults();
    toast({
      title: "Reset to Defaults",
      description: "All prompts reset to original values",
    });
  };

  const handleExport = () => {
    const json = PromptConfigStore.exportConfig();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Config Exported",
      description: "Configuration downloaded as JSON",
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = PromptConfigStore.importConfig(text);
        if (success) {
          setConfig(PromptConfigStore.getConfig());
          toast({
            title: "Config Imported",
            description: "Configuration loaded successfully",
          });
        } else {
          toast({
            title: "Import Failed",
            description: "Invalid configuration file",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 gap-2 shadow-lg z-50"
        >
          <Settings className="h-4 w-4" />
          Dev: Edit Prompts
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Prompt Configuration (Dev Mode)</SheetTitle>
          <SheetDescription>
            Edit AI prompts in real-time for testing and development
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowSaveConfirm(true)}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={handleImport}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>

          <Tabs defaultValue="teacher" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="advisor">Advisor</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            </TabsList>

            <TabsContent value="teacher" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-prompt">Teacher System Prompt</Label>
                <Textarea
                  id="teacher-prompt"
                  value={config.teacherSystemPrompt}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      teacherSystemPrompt: e.target.value,
                    })
                  }
                  rows={20}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Used by the teacher agent when guiding students through
                  lessons
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advisor" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advisor-prompt">Advisor System Prompt</Label>
                <Textarea
                  id="advisor-prompt"
                  value={config.advisorSystemPrompt}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      advisorSystemPrompt: e.target.value,
                    })
                  }
                  rows={20}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Used by the advisor agent when creating learning paths
                </p>
              </div>
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guidelines">Lesson Generation Guidelines</Label>
                <Textarea
                  id="guidelines"
                  value={config.lessonGenerationGuidelines}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      lessonGenerationGuidelines: e.target.value,
                    })
                  }
                  rows={20}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Guidelines for how lessons should be structured and formatted
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>Last updated: {new Date(config.lastUpdated).toLocaleString()}</p>
            <p className="mt-1">
              Changes are saved to localStorage and will persist across sessions
            </p>
          </div>
        </div>
      </SheetContent>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Prompt Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the AI prompts for both the teacher and advisor
              agents. Changes will take effect immediately for new conversations
              or messages.
              <br />
              <br />
              The configuration will be saved to your browser&apos;s
              localStorage and persist across sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
