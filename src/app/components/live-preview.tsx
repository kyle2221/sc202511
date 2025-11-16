'use client';

import { useState, useEffect, Suspense, memo } from 'react';
import { Loader2 } from 'lucide-react';

const PreviewLoading = () => (
    <div className="w-full h-full flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Compiling preview...</p>
        </div>
    </div>
);

// Memoize the component to prevent re-renders when the parent's state changes,
// but the code prop itself hasn't.
const DynamicComponent = memo(({ code, onError }: { code: string, onError: (error: any) => void }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        
        const transpileAndLoad = async () => {
            if (!code) return;
            try {
                // IMPORTANT: The code needs 'use client' for hooks etc.
                const fullCode = code.trim().startsWith("'use client'") || code.trim().startsWith('"use client"') 
                    ? code 
                    : `'use client';\n${code}`;
                
                const blob = new Blob([fullCode], { type: 'application/javascript' });
                objectUrl = URL.createObjectURL(blob);
                
                // Dynamically import the component from the blob URL
                const loadedModule = await import(/* @vite-ignore */ objectUrl);
                
                if (loadedModule.default && typeof loadedModule.default === 'function') {
                    setComponent(() => loadedModule.default); // Use a function to set state to ensure it gets the latest module
                } else {
                   throw new Error('Component does not have a default export or the export is not a function.');
                }
            } catch (e) {
                console.error("Error loading dynamic component:", e);
                onError(e);
                setComponent(null);
            }
        };

        transpileAndLoad();

        return () => {
            // Clean up the object URL to avoid memory leaks
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [code, onError]);

    if (Component) {
        return <Component />;
    }

    return <PreviewLoading />;
});

DynamicComponent.displayName = 'DynamicComponent';


export function LivePreview({ code }: { code: string }) {
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Reset error when new code is provided
        setError(null);
    }, [code]);

    const handleError = (e: any) => {
        setError(e instanceof Error ? e : new Error(String(e)));
    }

    if (error) {
        return (
            <div className="p-8 h-full w-full flex flex-col items-center justify-center bg-destructive/10 text-destructive">
                <div className="text-lg font-semibold mb-2">Preview Error</div>
                <p className="text-sm font-mono bg-destructive/20 p-4 rounded-md">{error.message}</p>
            </div>
        );
    }
    
    return (
        <Suspense fallback={<PreviewLoading />}>
            <DynamicComponent code={code} onError={handleError} />
        </Suspense>
    );
}