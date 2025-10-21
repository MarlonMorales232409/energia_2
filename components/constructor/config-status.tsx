'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Users, 
  ArrowDown, 
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react';
import { useConstructorStore } from '@/lib/state/constructor';

export function ConfigStatus() {
  const {
    selectedClientId,
    currentConfig,
  } = useConstructorStore();

  const isGlobalConfig = !selectedClientId;
  const hasCustomConfig = currentConfig && currentConfig.clientId === selectedClientId;

  if (isGlobalConfig) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Globe className="h-5 w-5" />
            Configuración Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert className="border-blue-200 bg-blue-100">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                Esta es la configuración por defecto que heredarán todos los clientes 
                que no tengan una configuración personalizada.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Globe className="h-4 w-4" />
              <span>Configuración base del sistema</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={hasCustomConfig ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 ${hasCustomConfig ? 'text-green-900' : 'text-orange-900'}`}>
          <Users className="h-5 w-5" />
          Configuración del Cliente
          {hasCustomConfig ? (
            <Badge variant="default" className="bg-green-600">
              Personalizada
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-orange-600 text-white">
              Heredada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hasCustomConfig ? (
            <>
              <Alert className="border-green-200 bg-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  Este cliente tiene una configuración personalizada que sobrescribe 
                  la configuración global.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <Users className="h-4 w-4" />
                  <span>Configuración específica para este cliente</span>
                </div>
                <div className="text-xs text-green-600">
                  Creada: {currentConfig?.createdAt?.toLocaleDateString()}
                </div>
                <div className="text-xs text-green-600">
                  Última modificación: {currentConfig?.updatedAt?.toLocaleDateString()}
                </div>
              </div>
            </>
          ) : (
            <>
              <Alert className="border-orange-200 bg-orange-100">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-orange-800">
                  Este cliente está usando la configuración global por defecto. 
                  Los cambios aquí afectarán solo a este cliente.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Globe className="h-4 w-4" />
                    <span>Configuración Global</span>
                  </div>
                  <ArrowDown className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-1 text-orange-600">
                    <Users className="h-4 w-4" />
                    <span>Cliente Actual</span>
                  </div>
                </div>
                
                <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                  <strong>Lógica de herencia:</strong> Si no existe configuración personalizada, 
                  el cliente hereda automáticamente la configuración global.
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}