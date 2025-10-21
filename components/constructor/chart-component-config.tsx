'use client';

import { useState, useEffect } from 'react';
import { ChartComponent, ChartConfig, DataSource, ChartComponentType } from '@/lib/types/constructor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Palette, Settings, Eye } from 'lucide-react';

interface ChartComponentConfigProps {
  component: ChartComponent | null;
  availableDataSources: DataSource[];
  onConfigChange: (componentId: string, updates: Partial<ChartComponent>) => void;
  onClose: () => void;
}

// Colores predefinidos para los gráficos
const PRESET_COLORS = [
  ['#FF7A00', '#64748B', '#3B82F6', '#8B5CF6'], // Naranja principal
  ['#EF4444', '#F97316', '#EAB308', '#22C55E'], // Colores cálidos
  ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6'], // Colores fríos
  ['#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'], // Escala de grises
];

// Configuraciones por defecto según el tipo de gráfico
const DEFAULT_CONFIGS: Record<ChartComponentType, Partial<ChartConfig>> = {
  'generation-mix': {
    height: 300,
    colors: PRESET_COLORS[0],
    showLegend: true,
    showTooltip: true,
  },
  'demand-trend': {
    height: 300,
    colors: ['#FF7A00', '#64748B'],
    showLegend: false,
    showTooltip: true,
  },
  'cost-comparison': {
    height: 350,
    colors: ['#64748B', '#94A3B8', '#FF7A00', '#EF4444'],
    showLegend: true,
    showTooltip: true,
  },
  'multi-series': {
    height: 300,
    colors: PRESET_COLORS[0],
    showLegend: true,
    showTooltip: true,
  },
  'custom-bar': {
    height: 300,
    colors: PRESET_COLORS[0],
    showLegend: true,
    showTooltip: true,
  },
  'custom-line': {
    height: 300,
    colors: PRESET_COLORS[0],
    showLegend: false,
    showTooltip: true,
  },
  'custom-pie': {
    height: 300,
    colors: PRESET_COLORS[0],
    showLegend: true,
    showTooltip: true,
  },
};

// Etiquetas amigables para los tipos de gráfico
const CHART_TYPE_LABELS: Record<ChartComponentType, string> = {
  'generation-mix': 'Mix de Generación',
  'demand-trend': 'Tendencia de Demanda',
  'cost-comparison': 'Comparación de Costos',
  'multi-series': 'Gráfico Multi-Serie',
  'custom-bar': 'Gráfico de Barras',
  'custom-line': 'Gráfico de Líneas',
  'custom-pie': 'Gráfico Circular',
};

export function ChartComponentConfig({
  component,
  availableDataSources,
  onConfigChange,
  onClose
}: ChartComponentConfigProps) {
  const [localConfig, setLocalConfig] = useState<ChartConfig | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');

  // Inicializar configuración local cuando cambia el componente
  useEffect(() => {
    if (component) {
      setLocalConfig(component.config);
      setSelectedDataSource(component.dataSource.id);
    } else {
      setLocalConfig(null);
      setSelectedDataSource('');
    }
  }, [component]);

  if (!component || !localConfig) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuración de Componente</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Selecciona un componente para configurar
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleConfigUpdate = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    // Aplicar cambios inmediatamente
    onConfigChange(component.id, { config: newConfig });
  };

  const handleDataSourceChange = (dataSourceId: string) => {
    const dataSource = availableDataSources.find(ds => ds.id === dataSourceId);
    if (dataSource) {
      setSelectedDataSource(dataSourceId);
      onConfigChange(component.id, { dataSource });
    }
  };

  const handleColorPresetChange = (colors: string[]) => {
    handleConfigUpdate({ colors });
  };

  const handleHeightChange = (height: string) => {
    const numHeight = parseInt(height);
    if (!isNaN(numHeight) && numHeight >= 200 && numHeight <= 800) {
      handleConfigUpdate({ height: numHeight });
    }
  };

  const compatibleDataSources = availableDataSources.filter(ds => {
    // Filtrar fuentes de datos compatibles según el tipo de gráfico
    switch (component.type) {
      case 'generation-mix':
        return ds.type === 'energy-generation';
      case 'demand-trend':
        return ds.type === 'demand';
      case 'cost-comparison':
        return ds.type === 'cost';
      default:
        return true; // Los tipos personalizados pueden usar cualquier fuente
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información del componente */}
        <div>
          <Label className="text-sm font-medium">Tipo de Gráfico</Label>
          <Badge variant="secondary" className="mt-1">
            {CHART_TYPE_LABELS[component.type]}
          </Badge>
        </div>

        <Separator />

        {/* Configuración básica */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={localConfig.title || ''}
              onChange={(e) => handleConfigUpdate({ title: e.target.value })}
              placeholder="Título del gráfico"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={localConfig.subtitle || ''}
              onChange={(e) => handleConfigUpdate({ subtitle: e.target.value })}
              placeholder="Subtítulo opcional"
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* Fuente de datos */}
        <div>
          <Label>Fuente de Datos</Label>
          <Select value={selectedDataSource} onValueChange={handleDataSourceChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar fuente de datos" />
            </SelectTrigger>
            <SelectContent>
              {compatibleDataSources.map((dataSource) => (
                <SelectItem key={dataSource.id} value={dataSource.id}>
                  <div>
                    <div className="font-medium">{dataSource.name}</div>
                    <div className="text-xs text-gray-500">
                      {dataSource.fields.length} campos disponibles
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDataSource && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 mb-1">Campos disponibles:</p>
              <div className="flex flex-wrap gap-1">
                {availableDataSources
                  .find(ds => ds.id === selectedDataSource)
                  ?.fields.map((field) => (
                    <Badge key={field.id} variant="outline" className="text-xs">
                      {field.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Configuración visual */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Colores</span>
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {PRESET_COLORS.map((colorSet, index) => (
              <button
                key={index}
                onClick={() => handleColorPresetChange(colorSet)}
                className={`p-2 border rounded-md hover:border-orange-500 transition-colors ${
                  JSON.stringify(localConfig.colors) === JSON.stringify(colorSet)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex space-x-1">
                  {colorSet.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Altura del gráfico */}
        <div>
          <Label htmlFor="height">Altura (px)</Label>
          <Select
            value={localConfig.height.toString()}
            onValueChange={handleHeightChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="200">200px - Compacto</SelectItem>
              <SelectItem value="250">250px - Pequeño</SelectItem>
              <SelectItem value="300">300px - Estándar</SelectItem>
              <SelectItem value="350">350px - Mediano</SelectItem>
              <SelectItem value="400">400px - Grande</SelectItem>
              <SelectItem value="500">500px - Extra Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opciones de visualización */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-legend">Mostrar Leyenda</Label>
            <Switch
              id="show-legend"
              checked={localConfig.showLegend}
              onCheckedChange={(checked) => handleConfigUpdate({ showLegend: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-tooltip">Mostrar Tooltips</Label>
            <Switch
              id="show-tooltip"
              checked={localConfig.showTooltip}
              onCheckedChange={(checked) => handleConfigUpdate({ showTooltip: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Vista previa */}
        <div className="text-center">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa en Tiempo Real
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Los cambios se aplican automáticamente
          </p>
        </div>
      </CardContent>
    </Card>
  );
}