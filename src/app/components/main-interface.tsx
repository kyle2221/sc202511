'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useActionState } from 'react';
import { Copy, Check, Wand2, Loader2, Code, Eye, Bot, Terminal, Download } from 'lucide-react';
import { generateCode, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileTree } from '@/app/components/file-tree';
import { Skeleton } from '@/components/ui/skeleton';

const initialTokens = `:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 5.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 205 90% 61%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 195 90% 45%;
  --accent-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 205 90% 61%;
  --radius: 0.75rem;
}
`;

type TerminalLine = {
  type: 'input' | 'output';
  content: string;
};

const initialTerminalHistory: TerminalLine[] = [
    { type: 'output', content: 'Terminal is ready. Try `generate retro cyberpunk` or `clear`.' },
];

const initialState: FormState = {
  tsxCode: '',
  designTokens: initialTokens,
  terminalOutput: '',
  componentKey: 0,
};

const PreviewLoading = () => (
    <div className="w-full h-full flex items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4 mt-8 w-full">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-24" />
            </div>
        </div>
    </div>
);


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full text-base py-6 font-bold tracking-wide">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
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


export function MainInterface() {
  const [state, formAction] = useActionState(generateCode, initialState);
  const { toast } = useToast();
  const terminalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [DynamicVibeComponent, setDynamicVibeComponent] = useState(() => () => <PreviewLoading />);
  const [isPending, startTransition] = useTransition();

  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>(initialTerminalHistory);
  const [terminalInput, setTerminalInput] = useState('');

  const handleTerminalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;

    const newHistory: TerminalLine[] = [...terminalHistory, { type: 'input', content: command }];
    setTerminalHistory(newHistory);
    setTerminalInput('');

    const [commandName, ...args] = command.split(' ');
    const vibe = args.join(' ');

    if (commandName === 'generate' && vibe) {
        const formData = new FormData();
        formData.append('vibe', vibe);
        // You can also append the selected model if you have it in state
        // formData.append('model', selectedModel);
        formAction(formData);
    } else if (commandName === 'clear') {
        setTerminalHistory([]);
    } else {
        setTerminalHistory(prev => [...prev, { type: 'output', content: `Command not found: ${commandName}. Try 'generate <your vibe>' or 'clear'.` }]);
    }
  };


  useEffect(() => {
    if (state.error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: state.error });
      setTerminalHistory(prev => [...prev, {type: 'output', content: `Error: ${state.error}`}]);
    }
    if (state.success) {
      toast({ title: 'Success!', description: 'New component has been generated.' });
      
      if(state.terminalOutput) {
         setTerminalHistory(prev => [...prev, {type: 'output', content: state.terminalOutput!}]);
      }
      
      if (state.designTokens) {
           const styleElement = document.getElementById('preview-styles');
            if (styleElement) {
                const rootVariables = state.designTokens?.match(/:root\s*{([^}]+)}/)?.[1] || '';
                styleElement.innerHTML = `
                .preview-scope {
                    ${rootVariables}
                }
                `;
            }
      }

      startTransition(() => {
        setDynamicVibeComponent(() => dynamic(() => import('@/app/components/vibe-component'), {
            ssr: false,
            loading: () => <PreviewLoading />,
        }));
      });
    }
  }, [state, toast]);

   useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <style id="preview-styles">{`
        .preview-scope {
          ${initialState.designTokens.match(/:root\s*{([^}]+)}/)?.[1] || ''}
        }
      `}</style>
      
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="bg-secondary/30">
        <FileTree />
      </ResizablePanel>
      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="flex flex-col h-full p-6 border-r">
                <form ref={formRef} action={formAction} className="flex flex-col gap-4 flex-1">
                  <Label htmlFor="vibe" className="text-base text-muted-foreground font-medium">Describe your vibe</Label>
                  <Textarea
                    id="vibe"
                    name="vibe"
                    placeholder="e.g., retro cyberpunk, minimalist workspace, vaporwave dream..."
                    className="flex-1 text-base font-code bg-background/50 border-input focus:border-primary/50 text-foreground/90 p-4"
                    rows={8}
                    required
                  />
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="model" className="text-sm text-muted-foreground">Select AI Model</Label>
                    <Select name="model" defaultValue="auto">
                      <SelectTrigger className="w-full bg-background/50 border-input">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <span>Auto</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="googleai/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="googleai/gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="fox-code-b1.2">fox code b1.2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <SubmitButton />
                </form>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-t flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Terminal</h3>
              </div>
               <div ref={terminalRef} className="p-4 flex-1 bg-black text-white font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                  {terminalHistory.map((line, index) => (
                    <div key={index} className="flex gap-2">
                        {line.type === 'input' && <span className="text-green-400 flex-shrink-0">&gt;</span>}
                        <p className={line.type === 'output' ? 'text-gray-300' : ''}>{line.content}</p>
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

      <ResizablePanel defaultSize={45}>
        <Tabs defaultValue="preview" className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 border-b">
                 <TabsList>
                    <TabsTrigger value="preview">
                        <Eye className="mr-2 h-4 w-4" />
                        Prototype
                    </TabsTrigger>
                    <TabsTrigger value="code">
                        <Code className="mr-2 h-4 w-4" />
                        Code
                    </TabsTrigger>
                 </TabsList>
            </div>
            <div className="flex-1 overflow-auto">
                 <TabsContent value="preview" className="mt-0 h-full">
                     <div className="preview-scope p-8 h-full flex flex-col items-center justify-center bg-background">
                       <DynamicVibeComponent key={state.componentKey} />
                    </div>
                </TabsContent>
                <TabsContent value="code" className="flex flex-col h-full m-0 bg-secondary/30">
                  <Tabs defaultValue="tsx" className="flex flex-col h-full bg-transparent p-2">
                    <div className="flex items-center justify-between">
                      <TabsList>
                        <TabsTrigger value="tsx">Component.tsx</TabsTrigger>
                        <TabsTrigger value="tokens">tokens.css</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="tsx" className="flex-1 flex flex-col mt-2 relative">
                      <Textarea
                        value={state.tsxCode}
                        readOnly
                        className="font-code text-sm h-full resize-none bg-background/50 border-input"
                        aria-label="TSX Output"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <CopyButton textToCopy={state.tsxCode || ''} />
                        <DownloadButton textToDownload={state.tsxCode || ''} filename="VibeComponent.tsx" />
                      </div>
                    </TabsContent>
                    <TabsContent value="tokens" className="flex-1 flex flex-col mt-2 relative">
                      <Textarea
                        value={state.designTokens}
                        readOnly
                        className="font-code text-sm h-full resize-none bg-background/50 border-input"
                        aria-label="Design Tokens Output"
                      />
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <CopyButton textToCopy={state.designTokens || ''} />
                          <DownloadButton textToDownload={state.designTokens || ''} filename="tokens.css" />
                        </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
            </div>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
