'use client';

import { useState, type ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Loader, Upload } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { uploadCatalog } from './actions';

export default function CatalogPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        toast({
          title: 'Archivo no válido',
          description: 'Por favor, selecciona un archivo con formato CSV.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un archivo CSV.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadCatalog(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: 'Éxito',
        description: `Catálogo actualizado. Se procesaron ${result.processedCount} productos.`,
        className: 'bg-green-100 border-green-300 text-green-800'
      });
      setFile(null);
      setFileName('');
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
       toast({
        title: 'Error al cargar el catálogo',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold font-headline">Catálogo de Productos</h1>
        <p className="text-muted-foreground">
          Aquí puedes administrar tu catálogo de productos. Sube un archivo CSV para agregar o actualizar productos en lote.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Cargar Catálogo</CardTitle>
          <CardDescription>
            Sube un archivo en formato CSV con las columnas: productId y productName. Las palabras clave se generarán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar archivo CSV
                  </label>
              </Button>
              <Input id="csv-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
              {fileName && <p className="text-sm text-muted-foreground truncate">{fileName}</p>}
            </div>
            <Button onClick={handleSubmit} disabled={loading || !file}>
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Procesando...' : 'Cargar y Actualizar Catálogo'}
            </Button>
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            <p><strong>Ejemplo de formato CSV:</strong></p>
            <pre className="mt-2 rounded-md bg-muted p-2 text-xs">
              {`productId,productName
prod-001,"Cuaderno Profesional 100 Hojas Raya"
prod-002,"Lápiz Mirado No. 2"`}
            </pre>
             <p className="mt-2 text-xs">
              Nota: El sistema procesará el archivo en lotes. Si el archivo es muy grande, puede tardar unos minutos. Los `productId` existentes se actualizarán, los nuevos se crearán.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
