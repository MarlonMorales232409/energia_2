'use client';

import { useState } from 'react';
import { GridSpace as GridSpaceType, ChartComponent, GridPosition } from '@/lib/types/constructor';
import { GridSpace } from '@/components/constructor/grid-space';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignCanvasProps {
  spaces: GridSpaceType[];
  onAddSpace: (columns: 1 | 2 | 3) => void;
  onRemoveSpace: (spaceId: string) => void;
  onReorderSpaces: (spaceIds: string[]) => void;
  onDropComponent: (component: ChartComponent, position: GridPosition) => void;
  onRemoveComponent: (componentId: string) => void;
  onSelectComponent?: (component: ChartComponent) => void;
  selectedComponentId?: string;
  className?: string;
}

export function DesignCanvas({
  spaces,
  onAddSpace,
  onRemoveSpace,
  onReorderSpaces,
  onDropComponent,
  onRemoveComponent,
  onSelectComponent,
  selectedComponentId,
  className,
}: DesignCanvasProps) {
  const [draggedSpaceId, setDraggedSpaceId] = useState<string | null>(null);
  const [dragOverSpaceId, setDragOverSpaceId] = useState<string | null>(null);
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);

  const handleSpaceDragStart = (e: React.DragEvent, spaceId: string) => {
    setDraggedSpaceId(spaceId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', spaceId);
  };

  const handleSpaceDragOver = (e: React.DragEvent, spaceId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSpaceId(spaceId);
  };

  const handleSpaceDragLeave = () => {
    setDragOverSpaceId(null);
  };

  const handleSpaceDrop = (e: React.DragEvent, targetSpaceId: string) => {
    e.preventDefault();
    setDragOverSpaceId(null);
    
    if (!draggedSpaceId || draggedSpaceId === targetSpaceId) {
      setDraggedSpaceId(null);
      return;
    }

    // Reorder spaces
    const currentOrder = spaces.map(space => space.id);
    const draggedIndex = currentOrder.indexOf(draggedSpaceId);
    const targetIndex = currentOrder.indexOf(targetSpaceId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSpaceId(null);
      return;
    }

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSpaceId);

    onReorderSpaces(newOrder);
    setDraggedSpaceId(null);
  };

  const handleSpaceDragEnd = () => {
    setDraggedSpaceId(null);
    setDragOverSpaceId(null);
  };

  // Handle component drag from palette
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if it's a component being dragged from palette
    const dragData = e.dataTransfer.types.includes('application/json');
    if (dragData) {
      setIsDraggingComponent(true);
    }
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    // Only hide if we're leaving the entire canvas area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingComponent(false);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingComponent(false);
    
    // Handle drop on empty canvas - create new space with component
    if (spaces.length === 0) {
      try {
        const dragData = e.dataTransfer.getData('application/json');
        if (dragData) {
          const parsedData = JSON.parse(dragData);
          
          if (parsedData.type === 'chart-component' && parsedData.componentType) {
            // Create new space first
            onAddSpace(1);
            
            // The component will be added by the GridSpace component
            // We need to wait for the space to be created, then add the component
            // This is handled by the drop zone in GridSpace
          }
        }
      } catch (error) {
        console.error('Error handling canvas drop:', error);
      }
    }
  };

  const handleRemoveSpace = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (space && space.components.length > 0) {
      // Show confirmation for spaces with components
      if (window.confirm('Este espacio contiene componentes. ¿Estás seguro de que quieres eliminarlo?')) {
        onRemoveSpace(spaceId);
      }
    } else {
      onRemoveSpace(spaceId);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Add Space Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Añadir Nuevo Espacio</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSpace(1)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              1 Columna
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSpace(2)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              2 Columnas
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSpace(3)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              3 Columnas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lienzo de Diseño</CardTitle>
          <p className="text-sm text-muted-foreground">
            Arrastra los espacios para reordenarlos. Arrastra componentes desde la paleta a los espacios.
          </p>
        </CardHeader>
        <CardContent
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          role="region"
          aria-label="Lienzo de diseño del informe"
          aria-describedby="canvas-instructions"
        >
          {/* Screen reader instructions */}
          <div id="canvas-instructions" className="sr-only">
            Área principal para diseñar tu informe. Arrastra componentes desde la paleta o usa el teclado para navegar y colocar elementos.
          </div>
          {spaces.length === 0 ? (
            <div className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300",
              "transform-gpu", // Enable hardware acceleration
              isDraggingComponent 
                ? "border-primary bg-primary/5 border-solid scale-105 shadow-lg" 
                : "border-muted-foreground/25 hover:border-muted-foreground/40"
            )}>
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {isDraggingComponent ? 'Suelta el componente aquí' : 'Lienzo vacío'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isDraggingComponent 
                  ? 'Se creará automáticamente un espacio para el componente'
                  : 'Añade un espacio para comenzar a diseñar tu informe'
                }
              </p>
              {!isDraggingComponent && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddSpace(1)}
                  >
                    Añadir espacio de 1 columna
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddSpace(2)}
                  >
                    Añadir espacio de 2 columnas
                  </Button>
                </div>
              )}
              
              {/* Drop indicator for empty canvas */}
              {isDraggingComponent && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
                    Soltar componente para crear nuevo espacio
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {spaces
                .sort((a, b) => a.order - b.order)
                .map((space, index) => (
                  <div
                    key={space.id}
                    className={cn(
                      'relative group border rounded-lg transition-all duration-200',
                      draggedSpaceId === space.id && 'opacity-50',
                      dragOverSpaceId === space.id && 'border-primary bg-primary/5',
                      isDraggingComponent && 'border-primary/30 bg-primary/5',
                      'hover:border-primary/50'
                    )}
                    draggable
                    onDragStart={(e) => handleSpaceDragStart(e, space.id)}
                    onDragOver={(e) => handleSpaceDragOver(e, space.id)}
                    onDragLeave={handleSpaceDragLeave}
                    onDrop={(e) => handleSpaceDrop(e, space.id)}
                    onDragEnd={handleSpaceDragEnd}
                  >
                    {/* Space Header */}
                    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="font-medium text-sm">
                          Espacio {index + 1} - {space.columns} columna{space.columns > 1 ? 's' : ''}
                        </span>
                        {space.components.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {space.components.length} componente{space.components.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpace(space.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Grid Space Content */}
                    <div className="p-4">
                      <GridSpace
                        space={space}
                        onComponentDrop={(component, columnIndex) => {
                          onDropComponent(component, { spaceId: space.id, columnIndex });
                        }}
                        onComponentRemove={onRemoveComponent}
                        onComponentSelect={onSelectComponent}
                        selectedComponentId={selectedComponentId}
                      />
                    </div>

                    {/* Drop indicator */}
                    {dragOverSpaceId === space.id && (
                      <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
                          Soltar aquí para reordenar
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}