import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function CatalogPage() {
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
            Sube un archivo en formato CSV con las columnas: productId, productName, y searchKeywords (separadas por comas).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center gap-2">
            {/* El input real para subir el archivo irá aquí */}
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Seleccionar archivo CSV
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Ejemplo de formato CSV:</strong></p>
            <pre className="mt-2 rounded-md bg-muted p-2 text-xs">
              {`productId,productName,searchKeywords
prod-001,"Cuaderno Profesional 100 Hojas Raya","cuaderno,libreta,raya"
prod-002,"Lápiz Mirado No. 2","lapiz,grafito,mirado"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
