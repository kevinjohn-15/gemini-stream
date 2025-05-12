'use client';
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Skull } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface GenerateResponse {
  type: 'text' | 'image';
  content: string;
}

interface FormError {
  message: string;
}

const GENERATION_TYPES = ['text', 'image'] as const;
type GenerationType = (typeof GENERATION_TYPES)[number];

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [type, setType] = useState<GenerationType>('text');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FormError | null>(null);

  const isFormValid = useMemo(() => {
    return prompt.trim().length > 0 && GENERATION_TYPES.includes(type);
  }, [prompt, type]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isFormValid) {
        setError({ message: 'A valid incantation and type are required.' });
        toast.error('Forbidden Incantation', {
          description: 'Provide a proper prompt and select a creation type.',
          style: {
            background: 'rgba(69, 10, 10, 0.9)',
            color: '#f87171',
            border: '1px solid rgba(153, 27, 27, 0.5)',
          },
        });
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, type }),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const data: GenerateResponse = await response.json();
        if (!data.type || !data.content) {
          throw new Error('Invalid response from the abyss');
        }

        setResult(data);
        toast.success('Creation Summoned', {
          description: `Your ${data.type} has emerged from the shadows.`,
          style: {
            background: 'rgba(20, 20, 20, 0.9)',
            color: '#d1d5db',
            border: '1px solid rgba(124, 58, 237, 0.5)',
          },
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'The abyss rejected your request.';
        setError({ message: errorMessage });
        toast.error('Ritual Failed', {
          description: errorMessage,
          style: {
            background: 'rgba(69, 10, 10, 0.9)',
            color: '#f87171',
            border: '1px solid rgba(153, 27, 27, 0.5)',
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [prompt, type, isFormValid]
  );

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (error) setError(null);
  };

  const handleTypeChange = (value: GenerationType) => {
    setType(value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10" />
      <Toaster richColors position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-black/50 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-red-900/30"
      >
        <h1 className="text-4xl font-serif font-bold text-gray-100 mb-6 text-center flex items-center justify-center gap-2">
          <Skull className="h-8 w-8 text-red-600" />
          Shadowbinder
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="form-title">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Whisper Your Incantation
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="e.g., 'A haunted castle under a blood moon' or 'Write a dark tale'"
              className="w-full bg-black/70 border-red-900/50 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-red-600/50 transition-all duration-300"
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? 'prompt-error' : undefined}
              maxLength={500}
            />
            {prompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="mt-2 text-sm text-gray-400 italic font-serif animate-pulse"
              >
                Echo: "{prompt.slice(0, 50)}{prompt.length > 50 ? '...' : ''}"
              </motion.div>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Essence of Creation
            </label>
            <Select
              value={type}
              onValueChange={handleTypeChange}
              disabled={loading}
            >
              <SelectTrigger
                id="type"
                className="w-full bg-black/70 border-red-900/50 text-gray-200 focus:ring-2 focus:ring-red-600/50"
                aria-label="Select creation type"
              >
                <SelectValue placeholder="Choose essence" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-gray-200 border-red-900/50">
                <SelectItem value="text">Tome (Text)</SelectItem>
                <SelectItem value="image">Vision (Image)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-red-950 hover:bg-red-900 text-gray-100 font-serif py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-600/30"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-red-600" />
                Summoning...
              </div>
            ) : (
              <div className="flex items-center">
                <Skull className="mr-2 h-5 w-5 text-red-600" />
                Conjure
              </div>
            )}
          </Button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mt-6 p-4 bg-red-950/50 text-red-300 rounded-lg border border-red-900/70 animate-pulse"
              role="alert"
              id="prompt-error"
            >
              <p>{error.message}</p>
            </motion.div>
          )}

          {result && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="mt-8"
              aria-labelledby="result-title"
            >
              <h2
                id="result-title"
                className="text-2xl font-serif font-semibold text-gray-100 mb-4 flex items-center gap-2"
              >
                <Skull className="h-6 w-6 text-red-600" />
                Manifested Creation
              </h2>
              {result.type === 'text' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  className="p-6 bg-black/50 rounded-lg text-gray-300 font-serif prose max-w-none border border-red-900/50"
                >
                  <p>{result.content}</p>
                </motion.div>
              ) : (
                <div className="relative w-full">
                  <img
                    src={`data:image/png;base64,${result.content}`}
                    alt="Manifested vision from the abyss"
                    className="w-full h-auto rounded-lg shadow-lg max-h-[80vh] object-contain border border-red-900/70"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(127, 29, 29, 0.3))' }}
                    loading="lazy"
                  />
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}