'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Copy, Check, Wand2, Loader2 } from 'lucide-react';
import { generateCode, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialCss = `/* Your generated CSS will appear here. */

.preview-card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.preview-button-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.preview-button-primary:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.preview-button-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  cursor: pointer;
  transition: background-color 0.2s;
}

.preview-button-secondary:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
`;

const initialTokens = `/* Your design tokens will appear here. */

:root {
  --background: 0 0% 7.1%;
  --foreground: 0 0% 98%;
  --card: 0 0% 10%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 7.1%;
  --popover-foreground: 0 0% 98%;
  --primary: 181 100% 74.3%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 202 100% 84.5%;
  --accent-foreground: 0 0% 9%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 181 100% 74.3%;
  --radius: 0.5rem;
}
`;


const initialState: FormState = {
  cssSnippet: initialCss,
  designTokens: initialTokens,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full lg:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
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
        description: "You can now paste the code in your project.",
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

  useEffect(() => {
    if (state.error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: state.error });
    }
    if (state.success) {
      toast({ title: 'Success!', description: 'New styles have been generated.' });
      if (state.cssSnippet) setCss(state.cssSnippet);
      if (state.designTokens) setTokens(state.designTokens);
    }
  }, [state, toast]);

  const combinedStyles = `
    .preview-scope {
      ${tokens}
    }
    ${css}
  `;

  return (
    <main className="flex-1 grid lg:grid-cols-[380px_1fr] gap-6 p-6">
      <style>{combinedStyles}</style>
      
      {/* --- LEFT COLUMN: INPUT FORM --- */}
      <div className="flex flex-col gap-4">
        <form action={formAction} ref={formRef} className="flex flex-col gap-4 flex-1">
          <Label htmlFor="vibe" className="text-lg font-medium font-headline">Describe your vibe</Label>
          <Textarea
            id="vibe"
            name="vibe"
            placeholder="e.g., retro cyberpunk, minimalist workspace, vaporwave dream..."
            className="flex-1 text-base font-code"
            rows={8}
            required
          />
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW & CODE --- */}
      <div className="flex flex-col gap-6 min-h-0">
        {/* --- PREVIEW PANEL --- */}
        <div className="preview-scope rounded-xl border bg-card text-card-foreground p-6 flex flex-col gap-4 min-h-[300px] justify-center items-center">
            <Card className="preview-card max-w-sm">
                <CardHeader>
                    <CardTitle className="font-headline">Thematic Card</CardTitle>
                    <CardDescription>This is how a card component looks.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <button className="preview-button-primary">Primary</button>
                    <button className="preview-button-secondary">Secondary</button>
                </CardContent>
            </Card>
        </div>

        {/* --- CODE OUTPUT --- */}
        <Tabs defaultValue="css" className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="css" className="flex-1 flex flex-col mt-2 relative">
            <Textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="font-code text-sm h-full resize-none"
              aria-label="CSS Output"
            />
            <div className="absolute top-2 right-2">
              <CopyButton textToCopy={css} />
            </div>
          </TabsContent>
          <TabsContent value="tokens" className="flex-1 flex flex-col mt-2 relative">
            <Textarea
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
              className="font-code text-sm h-full resize-none"
              aria-label="Design Tokens Output"
            />
             <div className="absolute top-2 right-2">
              <CopyButton textToCopy={tokens} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
