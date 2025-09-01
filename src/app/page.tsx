'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader, Share2, FileDown, UploadCloud, FileText, Bot, ListChecks, LinkIcon } from 'lucide-react';
import { processSchoolList } from './actions';
import type { NormalizeAndMatchSchoolSuppliesOutput } from '@/ai/flows/normalize-and-match-school-supplies';
import { Header } from '@/components/cotiza-listo/Header';
import { QuoteTable } from '@/components/cotiza-listo/QuoteTable';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NormalizeAndMatchSchoolSuppliesOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setResult(null); // Reset result when a new file is selected
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un archivo primero.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await processSchoolList(formData);
      if (res.error) {
        throw new Error(res.error);
      }
      setResult(res.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      toast({
        title: 'Error en el procesamiento',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Cotiza tu lista de útiles en segundos
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Sube tu lista en cualquier formato (PDF, DOCX, JPG) y nuestra IA la procesará para darte la mejor cotización.
                  </p>
                </div>
                <Card 
                  className="w-full max-w-lg border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <UploadCloud className="h-12 w-12 text-primary" />
                    <div className="space-y-2">
                      <p className="font-semibold">Arrastra y suelta tu archivo o</p>
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Selecciona un archivo
                        </label>
                      </Button>
                      <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" />
                    </div>
                    {fileName && <p className="text-sm text-muted-foreground">Archivo: {fileName}</p>}
                  </CardContent>
                </Card>
                <div className="w-full max-w-lg">
                  <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSubmit} disabled={loading || !file}>
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : 'Cotizar Ahora'}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <div className="w-full max-w-md rounded-xl bg-gradient-to-br from-teal-50 to-yellow-50 p-8 shadow-lg">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-white rounded-full shadow-md">
                            <Bot className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold font-headline text-center">¿Cómo funciona?</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start">
                                <FileText className="w-5 h-5 mr-3 mt-1 text-primary shrink-0" />
                                <span><span className="font-semibold">1. Carga tu lista:</span> Sube el archivo con tus útiles escolares.</span>
                            </li>
                            <li className="flex items-start">
                                <Bot className="w-5 h-5 mr-3 mt-1 text-primary shrink-0" />
                                <span><span className="font-semibold">2. Magia de IA:</span> Extraemos y comparamos cada artículo con nuestro catálogo.</span>
                            </li>
                            <li className="flex items-start">
                                <ListChecks className="w-5 h-5 mr-3 mt-1 text-primary shrink-0" />
                                <span><span className="font-semibold">3. Recibe tu cotización:</span> Revisa, ajusta y comparte tu cotización final.</span>
                            </li>
                        </ul>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generando tu cotización...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-5/6" />
                  <Skeleton className="h-8 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {result && (
          <section id="quote" className="w-full py-12 md:py-24 bg-primary/5">
            <div className="container px-4 md:px-6">
              <QuoteTable quoteResult={result} />
            </div>
          </section>
        )}
      </main>
      <footer className="flex items-center justify-center w-full h-16 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Cotiza Listo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
