"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Save,
  Database,
  Trash2,
} from "lucide-react";
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
import { StorageManager } from "@/lib/storage-manager";
import { useToast } from "@/hooks/use-toast";

export function PromptConfigPanel() {
  const [config, setConfig] = useState<PromptConfig>(
    PromptConfigStore.getDefaultConfig(),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showExportAllDialog, setShowExportAllDialog] = useState(false);
  const [showImportAllDialog, setShowImportAllDialog] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<string | null>(
    null,
  );
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load config when panel opens - using queueMicrotask to avoid sync setState in effect
      queueMicrotask(() => {
        const currentConfig = PromptConfigStore.getConfig();
        setConfig(currentConfig);
      });
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

  const handleExportAll = () => {
    setShowExportAllDialog(true);
  };

  const confirmExportAll = () => {
    const json = StorageManager.exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportAllDialog(false);
    toast({
      title: "Data Exported",
      description: "All localStorage data downloaded successfully",
    });
  };

  const handleImportAll = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        setPendingImportData(text);
        setShowImportAllDialog(true);
      }
    };
    input.click();
  };

  const confirmImportAll = (merge: boolean) => {
    if (!pendingImportData) return;

    const result = StorageManager.importAll(pendingImportData, { merge });

    if (result.success) {
      setConfig(PromptConfigStore.getConfig());
      setShowImportAllDialog(false);
      setPendingImportData(null);
      toast({
        title: "Data Imported",
        description: `Successfully imported ${result.keysImported} items. Page will reload to apply changes.`,
      });
      // Reload to refresh all components with new data
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast({
        title: "Import Failed",
        description: result.error || "Invalid data file",
        variant: "destructive",
      });
      setShowImportAllDialog(false);
      setPendingImportData(null);
    }
  };

  const handleClearAll = () => {
    setShowClearAllDialog(true);
  };

  const confirmClearAll = () => {
    StorageManager.clearAll();
    setShowClearAllDialog(false);
    toast({
      title: "Data Cleared",
      description: "All localStorage data has been cleared. Page will reload.",
    });
    setTimeout(() => window.location.reload(), 1500);
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
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Prompt Configuration</h3>
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
                  Export Prompts
                </Button>
                <Button
                  onClick={handleImport}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Prompts
                </Button>
              </div>
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
                  <Label htmlFor="guidelines">
                    Lesson Generation Guidelines
                  </Label>
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
                    Guidelines for how lessons should be structured and
                    formatted
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2 pt-2 border-t">
              <h3 className="text-sm font-semibold">All Application Data</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleExportAll}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  Export All Data
                </Button>
                <Button
                  onClick={handleImportAll}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import All Data
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Export/import all sessions, learning paths, and settings. Use
                for backup or migration.
              </p>
            </div>
          </div>

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

      {/* Export All Confirmation Dialog */}
      <AlertDialog
        open={showExportAllDialog}
        onOpenChange={setShowExportAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export All Application Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will export all your application data including:
              <br />
              <br />
              • All advisor sessions and conversations
              <br />
              • All teacher sessions and learning progress
              <br />
              • Prompt configurations
              <br />
              • All stored settings
              <br />
              <br />
              The data will be downloaded as a JSON file that you can import
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExportAll}>
              Export Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import All Confirmation Dialog */}
      <AlertDialog
        open={showImportAllDialog}
        onOpenChange={(open) => {
          setShowImportAllDialog(open);
          if (!open) setPendingImportData(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Application Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will import data from your backup file.
              <br />
              <br />
              <strong>Warning:</strong> By default, this will replace all
              existing data. You can choose to merge instead, which will keep
              existing data and add imported items.
              <br />
              <br />
              After import, the page will reload to apply changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmImportAll(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Merge Data
            </AlertDialogAction>
            <AlertDialogAction onClick={() => confirmImportAll(false)}>
              Replace All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog
        open={showClearAllDialog}
        onOpenChange={setShowClearAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Application Data?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-destructive">
                This action cannot be undone!
              </strong>
              <br />
              <br />
              This will permanently delete:
              <br />
              • All advisor sessions and conversations
              <br />
              • All teacher sessions and learning progress
              <br />
              • All prompt configurations
              <br />
              • All stored settings
              <br />
              <br />
              Consider exporting your data first as a backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAll}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
