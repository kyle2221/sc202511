
'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef, useActionState } from 'react';
import { Copy, Check, Wand2, Loader2, Code, Eye, Terminal, Download, Languages } from 'lucide-react';
import { generateCode, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LivePreview } from '@/app/components/live-preview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Generate
    </Button>
  );
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="ghost" size="icon" onClick={onCopy} aria-label="Copy code">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function DownloadButton({ textToDownload, filename }: { textToDownload: string, filename: string }) {
  const onDownload = () => {
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="ghost" size="icon" onClick={onDownload} aria-label="Download code">
      <Download className="h-4 w-4" />
    </Button>
  );
}

type TerminalLine = {
  type: 'input' | 'output';
  content: string;
};

const initialCode = `"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AppComponent() {
  return (
    <Card className="p-8 text-center bg-transparent border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground mb-2">
          Build something now
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Make the dream happen by typing the prompt.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}`;

const initialState: FormState = {
  generatedCode: initialCode,
  terminalOutput: '',
  componentKey: 0,
};

const initialTerminalHistory: TerminalLine[] = [
    { type: 'output', content: "Terminal is ready. Type `generate` to create a component from the prompt." },
];

const randomAppPrompts = [
  "A futuristic music player with a glowing equalizer and playlist controls.",
  "A retro-style weather app with pixel art icons and a CRT screen effect.",
  "An elegant dashboard for a smart home, with controls for lights, temperature, and security.",
  "A minimalist to-do list application with satisfying check animations.",
  "A cyberpunk-themed login form with neon borders and glitch effects.",
  "A coffee shop's online ordering page, with a cozy and warm aesthetic.",
  "A user profile card for a social media app, featuring a sleek design and stats.",
  "A file upload component that shows a progress bar and a preview of the uploaded image.",
  "A pricing table for a SaaS product with three tiers and highlighted features.",
  "A movie ticket booking interface with a seat selection map."
];

const languageOptions = {
    'TypeScript (React) (recommended)': 'AppComponent.tsx',
    'Python': 'script.py',
    'HTML': 'index.html',
    'JavaScript': 'script.js',
    'CSS': 'styles.css'
};

type Language = keyof typeof languageOptions;

export function MainInterface() {
  const [state, formAction] = useActionState(generateCode, initialState);
  const [editableCode, setEditableCode] = useState(initialState.generatedCode || '');

  const { toast } = useToast();
  const terminalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [model, setModel] = useState('openrouter/sherlock-dash-alpha');
  const [language, setLanguage] = useState<Language>('TypeScript (React) (recommended)');
  
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>(initialTerminalHistory);
  const [terminalInput, setTerminalInput] = useState('');
  const [app, setApp] = useState('');

  const handleTerminalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;

    const newHistory: TerminalLine[] = [...terminalHistory, { type: 'input', content: command }];
    setTerminalHistory(newHistory);
    setTerminalInput('');

    if (command.toLowerCase() === 'generate') {
      if (!app) {
        setTerminalHistory(prev => [...prev, {type: 'output', content: `Error: Please describe the component you want to build in the prompt area first.`}]);
        return;
      }
      const formData = new FormData(formRef.current!);
      formAction(formData);
    } else if (command.toLowerCase() === 'generate: random_app') {
      const randomPrompt = randomAppPrompts[Math.floor(Math.random() * randomAppPrompts.length)];
      setApp(randomPrompt);
      setTerminalHistory(prev => [...prev, {type: 'output', content: `Selected random prompt: "${randomPrompt}"\nGenerating...`}]);
      setTimeout(() => {
        const formData = new FormData(formRef.current!);
        formAction(formData);
      }, 100);
    } else {
        setTerminalHistory(prev => [...prev, {type: 'output', content: `Command not found: ${command}.`}]);
    }
  };

  useEffect(() => {
    if (state.error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: state.error });
      setTerminalHistory(prev => [...prev, {type: 'output', content: `Error: ${state.error}`}]);
    }
    if (state.success && state.generatedCode) {
      toast({ title: 'Success!', description: 'New component has been generated.' });
      setEditableCode(state.generatedCode); // Update the editor with newly generated code
      
      if(state.terminalOutput) {
         setTerminalHistory(prev => [...prev, {type: 'output', content: state.terminalOutput!}]);
      }
    }
  }, [state, toast]);

   useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        document.getElementById('app')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showPreview = language === 'TypeScript (React) (recommended)';
  const filename = languageOptions[language] || 'code.txt';

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1 border-t-zinc-700/50 border-t">
      
      <ResizablePanel defaultSize={40} minSize={30} maxSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="flex flex-col h-full p-4 md:p-6">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">Prompt</h2>
                    <p className="text-muted-foreground text-sm">Describe what you want to build and in which language.</p>
                  </div>
                  <form ref={formRef} action={formAction} className="flex-1 flex flex-col gap-4">
                    <Textarea
                      id="app"
                      name="app"
                      placeholder="e.g., A login form with a dark theme and a subtle glow effect on focus..."
                      className="flex-1 bg-zinc-900/50 border-zinc-700 focus:border-primary/50 text-foreground/90 p-4 resize-none"
                      required
                      value={app}
                      onChange={(e) => setApp(e.target.value)}
                    />
                    <input type="hidden" name="model" value={model} />
                    <input type="hidden" name="language" value={language} />
                    <div className="flex flex-wrap items-center gap-2">
                       <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-full sm:w-[240px] h-9">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openrouter/sherlock-dash-alpha">Sherlock Dash Alpha</SelectItem>
                          <SelectItem value="openrouter/sherlock-think-alpha">Sherlock Think Alpha</SelectItem>
                          <SelectItem value="kwaipilot/kat-coder-pro:free">Kat Coder Pro (Free)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                        <SelectTrigger className="w-full sm:w-[200px] h-9">
                           <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            <SelectValue placeholder="Select language" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(languageOptions).map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="ml-auto">
                        <SubmitButton />
                      </div>
                    </div>
                  </form>
                </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="h-full flex flex-col bg-black">
              <div className="p-2 border-b border-zinc-700 flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Terminal</h3>
              </div>
               <div ref={terminalRef} className="p-4 flex-1 bg-black text-white font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                  {terminalHistory.map((line, index) => (
                    <div key={index} className="flex gap-2 items-start">
                        {line.type === 'input' && <span className="text-green-400 flex-shrink-0 mt-px">&gt;</span>}
                        <p className={`flex-1 ${line.type === 'output' ? 'text-gray-300' : ''}`}>{line.content}</p>
                    </div>
                  ))}
                   <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                        <span className="text-green-400">&gt;</span>
                        <input
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 flex-1 p-0 text-white font-mono text-sm"
                            autoFocus
                        />
                   </form>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={60}>
        <Tabs defaultValue="preview" value={showPreview ? "preview" : "code"} className="flex flex-col h-full w-full">
            <div className="flex items-center p-2 border-b border-zinc-700">
                 <TabsList className="grid grid-cols-2 h-auto bg-zinc-900">
                    <TabsTrigger value="preview" disabled={!showPreview}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </TabsTrigger>
                    <TabsTrigger value="code">
                        <Code className="mr-2 h-4 w-4" />
                        Code
                    </TabsTrigger>
                 </TabsList>
            </div>
            <div className="flex-1 overflow-auto bg-zinc-950">
                 <TabsContent value="preview" className="mt-0 h-full">
                    {showPreview ? (
                      <div className="preview-scope h-full flex flex-col items-center justify-center bg-background">
                        <LivePreview code={editableCode} />
                      </div>
                    ) : (
                      <div className="p-8 h-full w-full flex flex-col items-center justify-center">
                        <Alert>
                          <Languages className="h-4 w-4" />
                          <AlertTitle>Preview Not Available</AlertTitle>
                          <AlertDescription>
                            Live preview is only available for TypeScript (React). You can view the generated code in the "Code" tab.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                </TabsContent>
                <TabsContent value="code" className="flex flex-col h-full m-0 p-0 relative bg-black">
                      <Textarea
                        value={editableCode}
                        onChange={(e) => setEditableCode(e.target.value)}
                        className="font-mono text-sm h-full resize-none bg-transparent border-0 rounded-none focus-visible:ring-0"
                        aria-label="Generated Code Output"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <CopyButton textToCopy={editableCode || ''} />
                        <DownloadButton textToDownload={editableCode || ''} filename={filename} />
                      </div>
                </TabsContent>
            </div>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

    