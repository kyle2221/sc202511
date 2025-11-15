'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Copy, Check, Wand2, Loader2, Code, Eye } from 'lucide-react';
import { generateCode, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const initialCss = `/* Your generated CSS will appear here. */

.preview-button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.preview-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.preview-card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
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
  cssSnippet: initialCss,
  designTokens: initialTokens,
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

export function MainInterface() {
  const [state, formAction] = useFormState(generateCode, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [css, setCss] = useState(state.cssSnippet || '');
  const [tokens, setTokens] = useState(state.designTokens || '');
  const [activeTab, setActiveTab] = useState('preview');


  useEffect(() => {
    if (state.error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: state.error });
    }
    if (state.success) {
      toast({ title: 'Success!', description: 'New styles have been generated.' });
      if (state.cssSnippet) setCss(state.cssSnippet);
      if (state.designTokens) setTokens(state.designTokens);

      const styleElement = document.getElementById('preview-styles');
      if (styleElement) {
        // A temporary fix to extract the root variables from the tokens
        // and apply them to the preview scope.
        const rootVariables = state.designTokens?.match(/:root\s*{([^}]+)}/)?.[1] || '';
        styleElement.innerHTML = `
          .preview-scope {
            ${rootVariables}
          }
          ${state.cssSnippet || ''}
        `;
      }
    }
  }, [state, toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };


  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <style id="preview-styles">{`
        .preview-scope {
          ${tokens.match(/:root\s*{([^}]+)}/)?.[1] || ''}
        }
        ${css}
      `}</style>
      
      {/* --- CENTER PANEL: INPUT FORM --- */}
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
              <SubmitButton />
            </form>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* --- RIGHT PANEL: OUTPUT --- */}
      <ResizablePanel defaultSize={65}>
        <div className="flex flex-col h-full">
            <div className="flex items-center p-2 border-b">
                 <Button variant={activeTab === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTabChange('preview')}>
                    <Eye className="mr-2 h-4 w-4" />
                    Prototype
                </Button>
                 <Button variant={activeTab === 'code' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTabChange('code')}>
                    <Code className="mr-2 h-4 w-4" />
                    Code
                </Button>
            </div>
            <div className="flex-1 overflow-auto">
                 {activeTab === 'preview' ? (
                     <div className="preview-scope p-8 h-full flex flex-col items-center justify-center bg-background">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">Your Awesome App</h1>
                            <p className="text-lg text-muted-foreground mt-2 mb-8">This is how your components could look.</p>
                            <div className="flex gap-6 justify-center items-center">
                                <button className="preview-button">Primary Action</button>
                                <div className="preview-card text-left">
                                    <h3 className="text-xl font-bold mb-2">Card Title</h3>
                                    <p className="text-muted-foreground">This is a sample card component.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                  <Tabs defaultValue="css" className="flex flex-col h-full bg-secondary/30">
                    <TabsList className="m-2">
                      <TabsTrigger value="css">CSS</TabsTrigger>
                      <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
                    </TabsList>
                    <TabsContent value="css" className="flex-1 flex flex-col m-2 mt-0 relative">
                      <Textarea
                        value={css}
                        readOnly
                        className="font-code text-sm h-full resize-none bg-background/50 border-input"
                        aria-label="CSS Output"
                      />
                      <div className="absolute top-2 right-2">
                        <CopyButton textToCopy={css} />
                      </div>
                    </TabsContent>
                    <TabsContent value="tokens" className="flex-1 flex flex-col m-2 mt-0 relative">
                      <Textarea
                        value={tokens}
                        readOnly
                        className="font-code text-sm h-full resize-none bg-background/50 border-input"
                        aria-label="Design Tokens Output"
                      />
                        <div className="absolute top-2 right-2">
                        <CopyButton textToCopy={tokens} />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
            </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
