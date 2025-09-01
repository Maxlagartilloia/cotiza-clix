'use client';

import { useState, useMemo } from 'react';
import type { NormalizeAndMatchSchoolSuppliesOutput } from '@/ai/flows/normalize-and-match-school-supplies';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileDown, Replace, Share2, Trash2, XCircle } from 'lucide-react';

type QuoteItem = NormalizeAndMatchSchoolSuppliesOutput['matchedItems'][0] & {
  quantity: number;
  price?: number;
};

type QuoteTableProps = {
  quoteResult: NormalizeAndMatchSchoolSuppliesOutput;
};

export function QuoteTable({ quoteResult }: QuoteTableProps) {
  const [items, setItems] = useState<QuoteItem[]>(
    quoteResult.matchedItems.map((item) => ({ ...item, quantity: 1 }))
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    const newQuantity = Math.max(0, quantity);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const handleRemoveItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };
  
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
    const tax = subtotal * 0.16; // Assuming 16% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const handleShare = () => {
    let message = '¡Hola! He generado una cotización con Cotiza Clix:\n\n';
    items.forEach(item => {
      if (item.quantity > 0) {
        message += `* ${item.quantity}x ${item.productName || item.normalizedName} - ${formatCurrency((item.price || 0) * item.quantity)}\n`;
      }
    });
    message += `\n*Subtotal:* ${formatCurrency(subtotal)}\n`;
    message += `*IVA (16%):* ${formatCurrency(tax)}\n`;
    message += `*Total:* ${formatCurrency(total)}\n\n`;
    message += `Genera tu propia cotización en: ${window.location.origin}`;
  
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Tu Cotización está Lista</CardTitle>
        <CardDescription>
          Hemos analizado tu lista. Aquí tienes el resultado. Puedes ajustar las cantidades o cambiar los productos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead>Producto Sugerido</TableHead>
                <TableHead className="text-center">Confianza</TableHead>
                <TableHead className="w-[100px] text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.normalizedName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        {item.productName}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.confidence > 0.8 ? 'default' : 'secondary'} className={item.confidence > 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.confidence > 0.8 ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                      {`${Math.round(item.confidence * 100)}%`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId!, parseInt(e.target.value, 10))}
                      className="w-20 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price || 0)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency((item.price || 0) * item.quantity)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label="Sustituir producto">
                            <Replace className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Eliminar ítem" onClick={() => handleRemoveItem(item.productId!)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-semibold">Subtotal</TableCell>
                <TableCell colSpan={2} className="text-right font-bold">{formatCurrency(subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-semibold">IVA (16%)</TableCell>
                <TableCell colSpan={2} className="text-right font-bold">{formatCurrency(tax)}</TableCell>
              </TableRow>
              <TableRow className="text-lg">
                <TableCell colSpan={5} className="text-right font-extrabold">Total</TableCell>
                <TableCell colSpan={2} className="text-right font-extrabold">{formatCurrency(total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Descargar PDF
            </Button>
            <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Descargar Excel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir por WhatsApp
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
