'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { useActionState } from 'react';
import { Copy, Check, Wand2, Loader2, Code, Eye, Bot, Terminal, Download } from 'lucide-react';
import { generateCode, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const initialTsx = `/* 
  Your generated TSX component will appear here. 
  The AI will create a component that uses ShadCN UI and Tailwind CSS.
*/
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function VibeComponent() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold font-headline mb-2">
          Your Awesome App
        </h1>
        <p className="text-lg text-muted-foreground">
          This is how your components could look.
        </p>
      </div>
      <div className="flex gap-6 justify-center items-center">
        <Button size="lg">Primary Action</Button>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>This is a sample card component.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The AI will generate content here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`;

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

const initialState: FormState = {
  tsxCode: initialTsx,
  designTokens: initialTokens,
  terminalOutput: '> Terminal is ready.',
};

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
  const formRef = useRef<HTMLFormElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const [tsx, setTsx] = useState(state.tsxCode || '');
  const [tokens, setTokens] = useState(state.designTokens || '');
  const [terminalOutput, setTerminalOutput] = useState(state.terminalOutput || '');

  useEffect(() => {
    if (state.error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: state.error });
    }
    if (state.success) {
      toast({ title: 'Success!', description: 'New component has been generated.' });
      if (state.tsxCode) setTsx(state.tsxCode);
      if (state.designTokens) {
          setTokens(state.designTokens);
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
      if (state.terminalOutput) setTerminalOutput(state.terminalOutput);
    }
  }, [state, toast]);

   useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <style id="preview-styles">{`
        .preview-scope {
          ${tokens.match(/:root\s*{([^}]+)}/)?.[1] || ''}
        }
      `}</style>
      
      <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
        <div className="flex flex-col h-full p-6 border-r bg-secondary/30">
            <form action={formAction} ref={formRef} className="flex flex-col gap-4 flex-1">
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
                  </SelectContent>
                </Select>
              </div>
              <SubmitButton />
            </form>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65}>
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
                    <TabsTrigger value="terminal">
                        <Terminal className="mr-2 h-4 w-4" />
                        Terminal
                    </TabsTrigger>
                 </TabsList>
            </div>
            <div className="flex-1 overflow-auto">
                 <TabsContent value="preview" className="mt-0">
                     <div className="preview-scope p-8 h-full flex flex-col items-center justify-center bg-background">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary to-accent">Your Awesome App</h1>
                            <p className="text-lg text-muted-foreground mt-2 mb-8">This is how your components could look.</p>
                            <div className="flex gap-6 justify-center items-center">
                                <Button>Primary Action</Button>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card Title</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">This is a sample card component.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
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
                        value={tsx}
                        readOnly
                        className="font-code text-sm h-full resize-none bg-background/50 border-input"
                        aria-label="TSX Output"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <CopyButton textToCopy={tsx} />
                        <DownloadButton textToDownload={tsx} filename="VibeComponent.tsx" />
                      </div>
                    </TabsContent>
                    <TabsContent value="tokens" className="flex-1 flex flex-col mt-2 relative">
                      <Textarea
                        value={tokens}
                        readOnly
                        className="font-code text-sm h-full resize-none bg-background/50 border-input"
                        aria-label="Design Tokens Output"
                      />
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <CopyButton textToCopy={tokens} />
                          <DownloadButton textToDownload={tokens} filename="tokens.css" />
                        </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                 <TabsContent value="terminal" className="mt-0 h-full">
                     <div ref={terminalRef} className="p-4 h-full bg-black text-white font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                        <p>{terminalOutput}</p>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
