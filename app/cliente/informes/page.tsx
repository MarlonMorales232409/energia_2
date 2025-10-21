'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { CustomizableEnergyReport } from '@/components/reports/customizable-energy-report';
import { ReportUpdateNotifications } from '@/components/reports/report-update-notifications';
import { ClientEnergyFilters } from '@/components/reports/client-energy-filters';
import { Button } from '@/components/ui/button';
import { 
  FileBarChart, 
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

export default function InformesPage() {
  const { user } = useAuthStore();
  const [energyFilters, setEnergyFilters] = useState({
    period: '2025-08',
    companies: ['all'],
    supplyPoint: 'all',
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      toast.loading(`Generando archivo ${format.toUpperCase()}...`);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate download
      const filename = `informes_filtrados_${new Date().toISOString().slice(0, 10)}.${format}`;
      
      toast.dismiss();
      toast.success(`Archivo ${filename} generado correctamente`);
      
      // In a real app, this would trigger an actual download
      console.log(`Exporting filtered reports as ${format}`, {
        filters: energyFilters,
        filename
      });
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Error al generar archivo ${format.toUpperCase()}`);
    }
  };

  const handleShare = async () => {
    try {
      toast.loading('Generando enlace compartido...');
      
      // Simulate share delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock shared link
      const token = Math.random().toString(36).substring(2, 15);
      const shareUrl = `${window.location.origin}/shared/${token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast.dismiss();
      toast.success('Enlace copiado al portapapeles');
      
      console.log('Shared filtered reports', {
        filters: energyFilters,
        shareUrl
      });
      
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar enlace compartido');
    }
  };



  return (
    <div className="space-y-6">
      {/* Report Update Notifications */}
      <ReportUpdateNotifications 
        clientId={user?.companyId || 'santa-rita'}
      />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileBarChart className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
            <p className="text-gray-600">
              Filtra y analiza informes energéticos con diferentes modos de visualización
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

      {/* Energy Report Filters */}
      <ClientEnergyFilters
        companyId={user?.companyId || 'santa-rita'}
        onFiltersChange={setEnergyFilters}
      />

      {/* Energy Report Display */}
      <CustomizableEnergyReport 
        period={energyFilters.period}
        company={'SANTA RITA METALÚRGICA S.A.'}
        companies={energyFilters.companies}
        supplyPoint={energyFilters.supplyPoint}
        isBackoffice={false}
      />
    </div>
  );
}