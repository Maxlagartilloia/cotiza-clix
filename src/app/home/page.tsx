'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processSchoolList } from '@/app/actions';
import type { NormalizeAndMatchSchoolSuppliesOutput } from '@/ai/flows/normalize-and-match-school-supplies';
import { QuoteTable } from '@/components/cotiza-clix/QuoteTable';
import { Header } from '@/components/cotiza-clix/Header';

const formSchema = z.object({
  file: z
    .instanceof(File, { message: 'Se requiere un archivo.' })
    .refine((file) => file.size > 0, 'El archivo no puede estar vacío.')
    .refine(
      (file) =>
        [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ].includes(file.type),
      'El formato del archivo no es válido. Sube un PDF, DOCX, JPG o PNG.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<NormalizeAndMatchSchoolSuppliesOutput | null>(
    null
  );
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsProcessing(true);
    setQuoteResult(null);

    const formData = new FormData();
    formData.append('file', data.file);

    try {
      const result = await processSchoolList(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setQuoteResult(result.data);
        toast({
          title: result.fromCache ? 'Cotización recuperada de la caché' : '¡Cotización generada!',
          description: result.fromCache ? 'Esta lista ya había sido procesada anteriormente.' : 'Hemos procesado tu lista de útiles escolares.',
          className: 'bg-green-100 border-green-300 text-green-800'
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      toast({
        title: 'Error al procesar la lista',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue('file', file, { shouldValidate: true });
    } else {
      setFileName('');
      form.resetField('file');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 gap-12">
          {!quoteResult && (
            <Card className="max-w-xl mx-auto w-full shadow-2xl animate-fade-in-up">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-3xl">
                  Cotiza tu Lista de Útiles Escolares
                </CardTitle>
                <CardDescription className="text-base">
                  Sube una foto o documento de tu lista y deja que nuestra IA
                  haga el trabajo por ti. ¡Rápido y fácil!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <FormLabel
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">
                                  Haz clic para subir
                                </span>{' '}
                                o arrastra y suelta
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PDF, DOCX, PNG o JPG
                              </p>
                            </div>
                            <FormControl>
                                <Input 
                                    id="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                                />
                            </FormControl>
                          </FormLabel>
                          {fileName && <p className="text-sm text-center text-muted-foreground mt-2">Archivo seleccionado: {fileName}</p>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full text-lg py-6"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      {isProcessing
                        ? 'Analizando tu lista...'
                        : 'Generar Cotización'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="text-center text-xs text-muted-foreground">
                <p>
                  Tu lista es procesada de forma segura y no se comparte con
                  nadie.
                </p>
              </CardFooter>
            </Card>
          )}

          {isProcessing && !quoteResult && (
             <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold font-headline">Estamos procesando tu lista...</h2>
                <p className="text-muted-foreground max-w-md">Nuestra IA está leyendo y buscando los mejores productos para ti. Esto puede tardar unos segundos, por favor no cierres la ventana.</p>
             </div>
          )}

          {quoteResult && (
            <div className="animate-fade-in">
                <QuoteTable quoteResult={quoteResult} />
                <div className="text-center mt-6">
                    <Button onClick={() => setQuoteResult(null)}>
                        Procesar otra lista
                    </Button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
