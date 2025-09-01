'use client';

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader, Camera, UploadCloud, FileText, Bot, ListChecks, Zap } from 'lucide-react';
import { processSchoolList } from './actions';
import type { NormalizeAndMatchSchoolSuppliesOutput } from '@/ai/flows/normalize-and-match-school-supplies';
import { Header } from '@/components/cotiza-clix/Header';
import { QuoteTable } from '@/components/cotiza-clix/QuoteTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CameraOff, CircleDotDashed } from 'lucide-react';
import Confetti from 'react-canvas-confetti';
import Image from 'next/image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NormalizeAndMatchSchoolSuppliesOutput | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Stop video stream when camera is closed
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    setShowCamera(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera: ", error);
        setHasCameraPermission(false);
        toast({
          title: 'Error de cámara',
          description: 'No se pudo acceder a la cámara. Revisa los permisos en tu navegador.',
          variant: 'destructive',
        });
      }
    } else {
      setHasCameraPermission(false);
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
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
  
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      canvas.toBlob(blob => {
        if (blob) {
          const newFile = new File([blob], 'captura-utiles.jpg', { type: 'image/jpeg' });
          setFile(newFile);
          setFileName(newFile.name);
          setResult(null);
          closeCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un archivo o toma una foto primero.',
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
      
      // Trigger confetti only for new quotes
      if (!res.fromCache) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
      }

      if (res.fromCache) {
        toast({
            title: 'Cotización desde caché',
            description: 'Esta lista ya había sido procesada. Mostrando resultado guardado.',
            className: 'bg-blue-100 border-blue-300 text-blue-800',
            duration: 5000,
            children: <div className="p-2"><Zap className="inline-block mr-2" />Resultado instantáneo</div>
        });
      }
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
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.15} />}
      <Header />
      <main className="flex-1">
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="container flex flex-col items-center px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 max-w-3xl">
              <Image 
                  src="https://i.postimg.cc/SNVkrFmX/361864255-293122636575506-2052512049624583768-n-removebg-preview.webp"
                  alt="Logo de Importadora Clix Copylaser"
                  width={240}
                  height={240}
                  className="h-60 w-60"
                  priority
              />
              <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Cotiza tu lista de útiles en segundos
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                 Sube, arrastra o tómale una foto a tu lista y nuestra IA la procesará para darte la mejor cotización con Cotiza Clix.
              </p>
            </div>
            
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-12 w-full">
              <div className="flex flex-col justify-center items-center space-y-4">
                <Card 
                  className="w-full max-w-lg border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <UploadCloud className="h-12 w-12 text-primary" />
                    <div className="space-y-2">
                      <p className="font-semibold">Arrastra y suelta tu archivo o</p>
                      <div className="flex gap-2 justify-center">
                          <Button asChild variant="outline">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              Selecciona un archivo
                            </label>
                          </Button>
                          <Button variant="outline" onClick={openCamera}>
                              <Camera className="mr-2 h-4 w-4"/>
                              Tomar Foto
                          </Button>
                      </div>
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

        <Dialog open={showCamera} onOpenChange={setShowCamera}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Capturar Lista de Útiles</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
              <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-white">
                  <CameraOff className="h-16 w-16" />
                  <p className="text-center text-lg">Cámara no disponible.</p>
                  <p className="text-center text-sm text-muted-foreground">
                    Asegúrate de haber concedido los permisos en tu navegador.
                  </p>
                </div>
              )}
               {hasCameraPermission === null && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-white">
                  <CircleDotDashed className="h-16 w-16 animate-spin" />
                  <p className="text-center text-lg">Iniciando cámara...</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeCamera}>Cancelar</Button>
              <Button onClick={takePicture} disabled={!hasCameraPermission}>
                <Camera className="mr-2 h-4 w-4" />
                Tomar Foto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {loading && (
          <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Loader className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="text-2xl font-bold font-headline">Generando tu cotización...</h2>
                    <p className="text-muted-foreground">Nuestra IA está trabajando. Esto puede tomar unos segundos.</p>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
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
        <p className="text-xs text-muted-foreground">&copy; 2024 Importadora Clix Copylaser. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
