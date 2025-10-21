'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConstructorStore } from '@/lib/state/constructor';
import { ChartComponent, ChartComponentType, GridPosition } from '@/lib/types/constructor';
import { DesignCanvas } from './design-canvas';
import { ComponentPalette } from './component-palette';
import { ChartComponentConfig } from './chart-component-config';
import { ClientSelector } from './client-selector';
import { ConfigStatus } from './config-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Undo, Redo, HelpCircle } from 'lucide-react';
import { SaveManager } from './save-manager';
import { cn } from '@/lib/utils';

export function ReportBuilder() {
  const {
    currentConfig,
    isLoading,
    error,
    validationErrors,
    availableDataSources,
    createNewConfig,
    addGridSpace,
    removeGridSpace,
    reorderGridSpaces,
    removeComponent,
    updateComponent,
    validateConfig,
    clearError,
    addComponent,
    loadClientConfig,
  } = useConstructorStore();

  // Estado local para el componente seleccionado para configuración
  const [selectedComponent, setSelectedComponent] = useState<ChartComponent | null>(null);

  // Initialize with global config on mount
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        if (!currentConfig) {
          createNewConfig();
        }
      } catch (error) {
        console.error('Failed to initialize config:', error);
      }
    };

    initializeConfig();
  }, [currentConfig, createNewConfig]);

  const handleClientChange = (clientId?: string) => {
    console.log('Client changed to:', clientId);
  };

  const handleSaveSuccess = useCallback(() => {
    console.log('Configuración guardada exitosamente');
  }, []);

  const handleSaveError = (error: string) => {
    console.error('Error al guardar:', error);
  };

  const handleAddSpace = useCallback((columns: 1 | 2 | 3) => {
    addGridSpace(columns);
  }, [addGridSpace]);

  const handleRemoveSpace = useCallback((spaceId: string) => {
    removeGridSpace(spaceId);
  }, [removeGridSpace]);

  const handleReorderSpaces = (spaceIds: string[]) => {
    reorderGridSpaces(spaceIds);
  };

  const handleDropComponent = (component: ChartComponent, position: GridPosition) => {
    try {
      addComponent(position.spaceId, position.columnIndex, component);
    } catch (error) {
      console.error('Failed to add component:', error);
    }
  };

  const handleRemoveComponent = useCallback((componentId: string) => {
    // Si el componente que se está eliminando es el seleccionado, deseleccionarlo
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
    removeComponent(componentId);
  }, [selectedComponent?.id, removeComponent]);

  const handleSelectComponent = (component: ChartComponent) => {
    setSelectedComponent(component);
  };

  const handleConfigChange = (componentId: string, updates: Partial<ChartComponent>) => {
    updateComponent(componentId, updates);
    
    // Actualizar el componente seleccionado si es el mismo
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleCloseConfig = () => {
    setSelectedComponent(null);
  };

  const handlePreview = () => {
    if (!currentConfig) return;
    
    try {
      // Encode the current config to pass it to the preview page
      const configData = encodeURIComponent(JSON.stringify(currentConfig));
      const previewUrl = `/preview-informe?config=${configData}`;
      
      // Open in new tab
      const newWindow = window.open(previewUrl, '_blank');
      
      if (!newWindow) {
        alert('Por favor, permite las ventanas emergentes para ver la vista previa');
      }
    } catch (error) {
      console.error('Error opening preview:', error);
      alert('Error al abrir la vista previa. Por favor, intenta de nuevo.');
    }
  };

  const handleDragStart = (componentType: ChartComponentType) => {
    // Drag started
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Constructor de Informes</CardTitle>
              <p className="text-gray-600 mt-1">
                Crea y personaliza informes usando el constructor visual de arrastrar y soltar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={handlePreview}
                disabled={!currentConfig || currentConfig.spaces.length === 0}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                title={
                  !currentConfig || currentConfig.spaces.length === 0 
                    ? "Añade al menos un componente para ver la vista previa" 
                    : "Abrir vista previa en nueva pestaña con datos simulados"
                }
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Previa
              </Button>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Ayuda
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Selector */}
          <ClientSelector onClientChange={handleClientChange} />

          {/* Save Manager */}
          <div className="flex justify-end">
            <SaveManager 
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="mt-2"
              >
                Cerrar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <ConfigStatus />

      {/* Main Layout with Palette, Canvas and Config */}
      {currentConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Component Palette - Left Sidebar - Sticky and larger */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <ComponentPalette onDragStart={handleDragStart} />
            </div>
          </div>

          {/* Design Canvas - Main Area */}
          <div className={selectedComponent ? "lg:col-span-5" : "lg:col-span-8"}>
            <DesignCanvas
              spaces={currentConfig.spaces || []}
              onAddSpace={handleAddSpace}
              onRemoveSpace={handleRemoveSpace}
              onReorderSpaces={handleReorderSpaces}
              onDropComponent={handleDropComponent}
              onRemoveComponent={handleRemoveComponent}
              onSelectComponent={handleSelectComponent}
              selectedComponentId={selectedComponent?.id}
            />
          </div>

          {/* Configuration Panel - Right Sidebar */}
          {selectedComponent && (
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <ChartComponentConfig
                  component={selectedComponent}
                  availableDataSources={availableDataSources}
                  onConfigChange={handleConfigChange}
                  onClose={handleCloseConfig}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}