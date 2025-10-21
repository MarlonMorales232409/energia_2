'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { EnergyReport } from '@/components/reports/energy-report';
import { ClientEnergyFilters } from '@/components/reports/client-energy-filters';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientHomePage() {
  const { user } = useAuthStore();
  const [energyFilters, setEnergyFilters] = useState({
    period: '2025-08',
    companies: [user?.companyId || 'santa-rita'],
    supplyPoint: 'all',
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      toast.loading(`Generando archivo ${format.toUpperCase()}...`);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filename = `informe_empresa_${new Date().toISOString().slice(0, 10)}.${format}`;
      
      toast.dismiss();
      toast.success(`Archivo ${filename} generado correctamente`);
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Error al generar archivo ${format.toUpperCase()}`);
    }
  };

  const handleShare = async () => {
    try {
      toast.loading('Generando enlace compartido...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const token = Math.random().toString(36).substring(2, 15);
      const shareUrl = `${window.location.origin}/shared/${token}`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      toast.dismiss();
      toast.success('Enlace copiado al portapapeles');
      
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar enlace compartido');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Energético</h1>
            <p className="text-gray-600">
              Informe personalizado de tu empresa
            </p>
          </div>
        </div>

        {/* Export and Share Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Energy Report Filters - Simplified for client */}
      <ClientEnergyFilters
        companyId={user?.companyId || 'santa-rita'}
        onFiltersChange={setEnergyFilters}
      />

      {/* Energy Report Display */}
      <EnergyReport 
        period={energyFilters.period}
        company={'SANTA RITA METALÚRGICA S.A.'}
        companies={[user?.companyId || 'santa-rita']}
        supplyPoint={energyFilters.supplyPoint}
        isBackoffice={false}
      />
    </div>
  );
}