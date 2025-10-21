'use client';

import { useState } from 'react';
import { GridSpace as GridSpaceType, ChartComponent, ChartComponentType, DataSource } from '@/lib/types/constructor';
import { ChartComponentPreview } from '@/components/constructor/chart-component-preview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function to get default title for component type
function getDefaultTitle(componentType: ChartComponentType): string {
  const titles = {
    'generation-mix': 'Mix de Generación',
    'demand-trend': 'Tendencia de Demanda',
    'cost-comparison': 'Comparación de Costos',
    'multi-series': 'Gráfico Multi-Series',
    'custom-bar': 'Gráfico de Barras',
    'custom-line': 'Gráfico de Líneas',
    'custom-pie': 'Gráfico Circular'
  };
  return titles[componentType] || 'Gráfico';
}

// Helper function to get default data source for component type
function getDefaultDataSource(componentType: ChartComponentType): DataSource {
  const dataSources: Partial<Record<ChartComponentType, DataSource>> = {
    'generation-mix': {
      id: 'energy-generation',
      name: 'Generación de Energía',
      type: 'energy-generation' as const,
      fields: [
        { id: 'thermal', name: 'Térmica', type: 'percentage' as const, required: true },
        { id: 'hydraulic', name: 'Hidráulica', type: 'percentage' as const, required: true },
        { id: 'nuclear', name: 'Nuclear', type: 'percentage' as const, required: true },
        { id: 'renewable', name: 'Renovable', type: 'percentage' as const, required: true },
      ],
      sampleData: [{ thermal: 45, hydraulic: 25, nuclear: 15, renewable: 15 }]
    },
    'demand-trend': {
      id: 'demand-trend',
      name: 'Tendencia de Demanda',
      type: 'demand' as const,
      fields: [
        { id: 'month', name: 'Mes', type: 'string' as const, required: true },
        { id: 'demand', name: 'Demanda (MWh)', type: 'number' as const, required: true },
        { id: 'variation', name: 'Variación (%)', type: 'percentage' as const, required: false },
      ],
      sampleData: [
        { month: 'Ene', demand: 1200, variation: 5.2 },
        { month: 'Feb', demand: 1150, variation: -2.1 },
        { month: 'Mar', demand: 1300, variation: 8.7 },
      ]
    },
    'cost-comparison': {
      id: 'cost-comparison',
      name: 'Comparación de Costos',
      type: 'cost' as const,
      fields: [
        { id: 'category', name: 'Categoría', type: 'string' as const, required: true },
        { id: 'cost', name: 'Costo (USD/MWh)', type: 'number' as const, required: true },
        { id: 'budget', name: 'Presupuesto', type: 'number' as const, required: false },
      ],
      sampleData: [
        { category: 'CAMMESA', cost: 45.2, budget: 50.0 },
        { category: 'PLUS', cost: 38.7, budget: 40.0 },
        { category: 'Renovable', cost: 42.1, budget: 45.0 },
      ]
    }
  };

  // Default data source for custom components
  const defaultDataSource: DataSource = {
    id: 'custom-data',
    name: 'Datos Personalizados',
    type: 'custom',
    fields: [
      { id: 'category', name: 'Categoría', type: 'string', required: true },
      { id: 'value', name: 'Valor', type: 'number', required: true },
    ],
    sampleData: [
      { category: 'A', value: 100 },
      { category: 'B', value: 200 },
      { category: 'C', value: 150 },
    ]
  };

  return dataSources[componentType] || defaultDataSource;
}

// Helper function to validate component compatibility
function validateComponentCompatibility(componentType: ChartComponentType, targetSpace: GridSpaceType, columnIndex: number): { isValid: boolean; message?: string } {
  // Check if column index is valid
  if (columnIndex >= targetSpace.columns) {
    return {
      isValid: false,
      message: `No se puede colocar en la columna ${columnIndex + 1} de un espacio de ${targetSpace.columns} columna(s)`
    };
  }

  // Allow multiple components per column - just check if we have space
  // Maximum of 3 components per column to avoid overcrowding
  const componentsInColumn = targetSpace.components.filter(c => c.columnIndex === columnIndex);
  if (componentsInColumn.length >= 3) {
    return {
      isValid: false,
      message: 'Esta columna ya tiene el máximo de componentes (3)'
    };
  }

  return { isValid: true };
}

interface GridSpaceProps {
  space: GridSpaceType;
  onComponentDrop: (component: ChartComponent, columnIndex: number) => void;
  onComponentRemove: (componentId: string) => void;
  onComponentSelect?: (component: ChartComponent) => void;
  selectedComponentId?: string;
  className?: string;
}

interface DropZoneProps {
  columnIndex: number;
  isActive: boolean;
  space: GridSpaceType;
  onDrop: (component: ChartComponent, columnIndex: number) => void;
  children?: React.ReactNode;
}

function DropZone({ columnIndex, isActive, space, onDrop, children }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we have the right data type
    const hasValidData = e.dataTransfer.types.includes('application/json');
    if (hasValidData) {
      e.dataTransfer.dropEffect = 'copy';
      setDragError(null);
      setIsDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set to false if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragError(null);

    try {
      const dragData = e.dataTransfer.getData('application/json');

      if (!dragData) {
        console.error('No drag data found in drop event');
        return;
      }

      const parsedData = JSON.parse(dragData);

      // Check if it's a component type from the palette
      if (parsedData.type === 'chart-component' && parsedData.componentType) {
        // Validate compatibility before creating component
        const validation = validateComponentCompatibility(parsedData.componentType, space, columnIndex);

        if (!validation.isValid) {
          setDragError(validation.message || 'Error desconocido');
          return;
        }

        // Create a new ChartComponent from the component type
        const newComponent: ChartComponent = {
          id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: parsedData.componentType,
          columnIndex: columnIndex,
          config: {
            title: getDefaultTitle(parsedData.componentType),
            subtitle: '',
            height: 300,
            colors: ['#FF7A00', '#64748B', '#3B82F6', '#8B5CF6'],
            showLegend: true,
            showTooltip: true,
          },
          dataSource: getDefaultDataSource(parsedData.componentType),
        };

        onDrop(newComponent, columnIndex);
      } else if (parsedData.id) {
        // It's already a complete ChartComponent (for reordering)
        onDrop(parsedData as ChartComponent, columnIndex);
      } else {
        console.error('Invalid drag data format:', parsedData);
      }
    } catch (error) {
      console.error('Error parsing dropped component:', error);
    }
  };

  return (
    <div
      className={cn(
        'relative min-h-32 rounded-lg border-2 border-dashed transition-all duration-200',
        dragError
          ? 'border-destructive bg-destructive/10 border-solid'
          : isDragOver
            ? 'border-primary bg-primary/10 border-solid'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        !children && 'flex items-center justify-center'
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children || (
        <div className="text-center p-4">
          <div className="mx-auto w-8 h-8 bg-muted rounded-lg flex items-center justify-center mb-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Columna {columnIndex + 1}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Arrastra un componente aquí
          </p>
        </div>
      )}

      {/* Drop indicator overlay */}
      {isDragOver && !dragError && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded text-sm font-medium">
            Soltar componente aquí
          </div>
        </div>
      )}

      {/* Error indicator overlay */}
      {dragError && (
        <div className="absolute inset-0 bg-destructive/20 border-2 border-destructive rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-destructive text-destructive-foreground px-3 py-2 rounded text-sm font-medium max-w-48 text-center">
            {dragError}
          </div>
        </div>
      )}
    </div>
  );
}

export function GridSpace({
  space,
  onComponentDrop,
  onComponentRemove,
  onComponentSelect,
  selectedComponentId,
  className,
}: GridSpaceProps) {
  // Group components by column index
  const componentsByColumn = space.components.reduce((acc, component) => {
    if (!acc[component.columnIndex]) {
      acc[component.columnIndex] = [];
    }
    acc[component.columnIndex].push(component);
    return acc;
  }, {} as Record<number, ChartComponent[]>);

  const handleRemoveComponent = (componentId: string) => {
    const component = space.components.find(c => c.id === componentId);
    if (component) {
      if (window.confirm('¿Estás seguro de que quieres eliminar este componente?')) {
        onComponentRemove(componentId);
      }
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'grid gap-4 w-full',
          space.columns === 1 && 'grid-cols-1',
          space.columns === 2 && 'grid-cols-1 md:grid-cols-2',
          space.columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {Array.from({ length: space.columns }).map((_, columnIndex) => {
          const columnComponents = componentsByColumn[columnIndex] || [];

          return (
            <div key={columnIndex} className="space-y-3">
              {/* Render existing components */}
              {columnComponents.map((component) => (
                <Card
                  key={component.id}
                  className={cn(
                    "relative group cursor-pointer transition-all duration-200",
                    selectedComponentId === component.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => onComponentSelect?.(component)}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveComponent(component.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <ChartComponentPreview component={component} />

                  {/* Selection indicator */}
                  {selectedComponentId === component.id && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      Seleccionado
                    </div>
                  )}
                </Card>
              ))}

              {/* Always show a drop zone at the bottom of each column */}
              <DropZone
                columnIndex={columnIndex}
                isActive={true}
                space={space}
                onDrop={onComponentDrop}
              />
            </div>
          );
        })}
      </div>

      {/* Grid guidelines for visual feedback */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p>
          Espacio de {space.columns} columna{space.columns > 1 ? 's' : ''} •{' '}
          {space.components.length} componente{space.components.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}