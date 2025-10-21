'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Zap, Factory, TrendingUp, TrendingDown, Calendar, MapPin } from 'lucide-react';
import { 
  simulateEnergyData, 
  getReportTitle, 
  getPeriodDisplayText, 
  calculatePercentageChanges,
  EnergyDataFilters 
} from '@/lib/utils/energy-data-simulator';

interface EnergyReportProps {
  period: string;
  company: string;
  companies?: string[];
  supplyPoint?: string;
  isBackoffice?: boolean;
}

export function EnergyReport({ 
  period, 
  company, 
  companies = ['santa-rita'], 
  supplyPoint = 'all',
  isBackoffice = false 
}: EnergyReportProps) {
  const [selectedSupplyPoint, setSelectedSupplyPoint] = useState('Todas');
  const [selectedType, setSelectedType] = useState('GUME');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('agosto');

  // Generate simulated data based on filters
  const simulatedData = useMemo(() => {
    const filters: EnergyDataFilters = {
      companies,
      period,
      supplyPoint,
      isBackoffice,
    };
    return simulateEnergyData(filters);
  }, [companies, period, supplyPoint, isBackoffice]);

  // Generate dynamic data for charts
  const demandData = useMemo(() => [
    { month: 'febrero de 2025', value: simulatedData.demandMonthly[0], label: 'feb 2025' },
    { month: 'marzo de 2025', value: simulatedData.demandMonthly[1], label: 'mar 2025' },
    { month: 'abril de 2025', value: simulatedData.demandMonthly[2], label: 'abr 2025' },
    { month: 'mayo de 2025', value: simulatedData.demandMonthly[3], label: 'may 2025' },
    { month: 'junio de 2025', value: simulatedData.demandMonthly[4], label: 'jun 2025' },
    { month: 'julio de 2025', value: simulatedData.demandMonthly[5], label: 'jul 2025' },
    { month: 'agosto de 2025', value: simulatedData.demandMonthly[6], label: 'ago 2025' },
  ], [simulatedData.demandMonthly]);

  const costData = useMemo(() => [
    { month: 'sep 2024', value: simulatedData.costData[0] },
    { month: 'nov 2024', value: simulatedData.costData[1] },
    { month: 'dic 2024', value: simulatedData.costData[2] },
    { month: 'ene 2025', value: simulatedData.costData[3] },
    { month: 'feb 2025', value: simulatedData.costData[4] },
    { month: 'mar 2025', value: simulatedData.costData[5] },
    { month: 'abr 2025', value: simulatedData.costData[6] },
    { month: 'may 2025', value: simulatedData.costData[7] },
    { month: 'jun 2025', value: simulatedData.costData[8] },
    { month: 'jul 2025', value: simulatedData.costData[9] },
    { month: 'ago 2025', value: simulatedData.costData[10] },
    { month: 'sep 2025', value: simulatedData.costData[11] },
  ], [simulatedData.costData]);

  const generationMixData = [
    { name: 'Térmica', value: 55.37, color: '#FF6B35' },
    { name: 'Hidráulica', value: 20.36, color: '#4ECDC4' },
    { name: 'Renovable', value: 16.43, color: '#45B7D1' },
    { name: 'Nuclear', value: 7.84, color: '#96CEB4' },
  ];

  const demandDistributionData = useMemo(() => [
    { name: 'MATER', value: 59, color: '#45B7D1' },
    { name: 'SPOT', value: 29, color: '#FF6B35' },
    { name: 'PLUS', value: 12, color: '#96CEB4' },
  ], []);

  const supplyCompanies = useMemo(() => [
    { name: 'CAMMESA', renewable: 76.08, total: 120 },
    { name: 'PLUS', renewable: 77.29, total: 120 },
  ], []);

  const argentineProvinces = [
    { name: 'BUENOS AIRES', value: -2.81 },
    { name: 'CATAMARCA', value: -6.64 },
    { name: 'CHACO', value: -2.81 },
    { name: 'CHUBUT', value: -6.64 },
    { name: 'CÓRDOBA', value: -12.18 },
    { name: 'CORRIENTES', value: -4.64 },
    { name: 'ENTRE RÍOS', value: -6.09 },
    { name: 'FORMOSA', value: -18.09 },
    { name: 'JUJUY', value: -19.15 },
    { name: 'LA PAMPA', value: -6.64 },
    { name: 'LA RIOJA', value: -36.36 },
    { name: 'MENDOZA', value: -6.64 },
    { name: 'MISIONES', value: -2.81 },
    { name: 'NEUQUÉN', value: -6.64 },
    { name: 'RÍO NEGRO', value: -2.81 },
    { name: 'SALTA', value: -6.64 },
    { name: 'SAN JUAN', value: -2.81 },
    { name: 'SAN LUIS', value: -6.64 },
    { name: 'SANTA CRUZ', value: -6.09 },
    { name: 'SANTA FE', value: -6.64 },
    { name: 'SANTIAGO DEL ESTERO', value: -18.09 },
    { name: 'TIERRA DEL FUEGO', value: -6.64 },
    { name: 'TUCUMÁN', value: -6.64 },
  ];

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informe energético</h1>
            <p className="text-gray-600">{getPeriodDisplayText(period)}</p>
            <p className="text-sm text-gray-500">{getReportTitle({ companies, period, supplyPoint, isBackoffice })}</p>
            {isBackoffice && simulatedData.totalCompanies > 1 && (
              <p className="text-xs text-blue-600">
                Datos consolidados de {simulatedData.totalCompanies} empresa{simulatedData.totalCompanies > 1 ? 's' : ''} 
                • {simulatedData.periodMonths} mes{simulatedData.periodMonths > 1 ? 'es' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <img src="/api/placeholder/120/40" alt="Energeia Logo" className="h-10" />
        </div>
      </div>

      {/* First Section - Demand Chart */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Demanda año móvil</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Punto de Suministro</span>
                <span className="text-sm font-medium">SARIPÓN</span>
              </div>
            </div>
          </div>
          <Select value={selectedSupplyPoint} onValueChange={setSelectedSupplyPoint}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="SARIPÓN">SARIPÓN</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#FF6B35" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Second Section - KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">{simulatedData.agreementEnergyMonth} MWh</h3>
            <p className="text-gray-600">Acuerdo Energía Mes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">{simulatedData.agreementEnergyYear} MWh</h3>
            <p className="text-gray-600">Acuerdo Energía Año</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative w-32 h-32 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: 100 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#45B7D1"
                    dataKey="value"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{simulatedData.demandMonth} GWh</span>
                <span className="text-xs text-gray-600">Demanda Mes</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-600">MATER 100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative w-32 h-32 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demandDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {demandDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{simulatedData.demandYearMobile} GWh</span>
                <span className="text-xs text-gray-600">Demanda Año Móvil</span>
              </div>
            </div>
            <div className="flex justify-around text-xs text-gray-600 mt-2">
              <span>SPOT 29%</span>
              <span>MATER 71%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Section - Renewable Percentage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Porcentaje de Renovable en el Año</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SARIPÓN</span>
                <span className="text-sm font-medium">71 %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div className="bg-green-400 h-6 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Porcentaje de Renovable en el Año - Total Sociedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">71 %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div className="bg-blue-600 h-6 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fourth Section - Cost Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Costos MEM - USD / MWh - Año móvil</CardTitle>
          </div>
          <div className="flex space-x-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GUME">GUME</SelectItem>
                <SelectItem value="GUDI">GUDI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSupplyPoint} onValueChange={setSelectedSupplyPoint}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="SARIPÓN">SARIPÓN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#FF6B35" 
                strokeWidth={3}
                dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fifth Section - Supply Cost Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Costos de Abastecimiento - USD / MWh</CardTitle>
            <p className="text-sm text-gray-600">agosto de 2025</p>
            <Badge variant="secondary" className="w-fit">Renovable</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplyCompanies.map((company, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{company.name}</span>
                    <span className="text-sm">{company.renewable}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-orange-400 h-4 rounded-full" 
                      style={{ width: `${(company.renewable / company.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Costos de Abastecimiento - USD / MWh</CardTitle>
            <p className="text-sm text-gray-600">Año Móvil</p>
            <Badge variant="secondary" className="w-fit">Renovable</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplyCompanies.map((company, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{company.name}</span>
                    <span className="text-sm">{company.renewable}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-orange-400 h-4 rounded-full" 
                      style={{ width: `${(company.renewable / company.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sixth Section - Generation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Factory className="h-5 w-5 mr-2" />
              Generación por Tipo
            </CardTitle>
            <p className="text-sm text-gray-600">agosto de 2025</p>
          </CardHeader>
          <CardContent>
            <div className="relative w-48 h-48 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={generationMixData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {generationMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              {generationMixData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Ingreso Potencia MATER
            </CardTitle>
            <p className="text-sm text-gray-600">septiembre de 2025 a noviembre de 2025</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold">{simulatedData.ingresoPotenciaMATER} MW</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Factory className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold">{simulatedData.ingresoPotenciaIndustrial} MW</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Grandes Usuarios
              </h4>
              <p className="text-sm text-gray-600">agosto de 2025</p>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-medium">GUDI</span>
                  <span className="text-xl font-bold ml-4">{simulatedData.gudi.toLocaleString()} GWh</span>
                </div>
                <div>
                  <span className="font-medium">GUMA / GUME</span>
                  <span className="text-xl font-bold ml-4">{simulatedData.gumaGume.toLocaleString()} GWh</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Precios MEM vs Distribuidor
            </CardTitle>
            <p className="text-sm text-gray-600">agosto de 2025</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Simplified Argentina map representation */}
              <div className="bg-orange-400 rounded-lg p-4 relative h-64 overflow-hidden">
                <div className="absolute inset-0 flex flex-wrap justify-center items-center">
                  {argentineProvinces.slice(0, 12).map((province, index) => (
                    <div 
                      key={index} 
                      className="bg-white/90 rounded-full px-2 py-1 m-1 text-xs font-medium shadow-sm"
                      style={{
                        color: province.value < -10 ? '#dc2626' : province.value < -5 ? '#ea580c' : '#059669'
                      }}
                    >
                      {province.name.split(' ')[0]} {province.value}%
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seventh Section - Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Factory className="h-5 w-5 mr-2" />
              Generación total MEM
            </CardTitle>
            <p className="text-sm text-gray-600">agosto de 2025</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <h3 className="text-4xl font-bold text-gray-900">{simulatedData.totalGenerationMEM.toLocaleString()} GWh</h3>
              <div className="flex justify-center space-x-8 mt-4">
                {(() => {
                  const changes = calculatePercentageChanges(simulatedData.totalGenerationMEM, 12030);
                  return (
                    <>
                      <div className="text-center">
                        <div className={`flex items-center ${changes.mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {changes.mom >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="text-lg font-semibold">{changes.mom >= 0 ? '+' : ''}{changes.mom} %</span>
                        </div>
                        <span className="text-xs text-gray-600">MoM</span>
                      </div>
                      <div className="text-center">
                        <div className={`flex items-center ${changes.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {changes.yoy >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="text-lg font-semibold">{changes.yoy >= 0 ? '+' : ''}{changes.yoy} %</span>
                        </div>
                        <span className="text-xs text-gray-600">YoY</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Generación MATER
            </CardTitle>
            <p className="text-sm text-gray-600">agosto de 2025</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <h3 className="text-4xl font-bold text-gray-900">{simulatedData.generationMATER.toLocaleString()} GWh</h3>
              <div className="flex justify-center space-x-8 mt-4">
                {(() => {
                  const changes = calculatePercentageChanges(simulatedData.generationMATER, 814);
                  return (
                    <>
                      <div className="text-center">
                        <div className={`flex items-center ${changes.mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {changes.mom >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="text-lg font-semibold">{changes.mom >= 0 ? '+' : ''}{changes.mom} %</span>
                        </div>
                        <span className="text-xs text-gray-600">MoM</span>
                      </div>
                      <div className="text-center">
                        <div className={`flex items-center ${changes.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {changes.yoy >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="text-lg font-semibold">{changes.yoy >= 0 ? '+' : ''}{changes.yoy} %</span>
                        </div>
                        <span className="text-xs text-gray-600">YoY</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eighth Section - Demand Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'PLUS', value: 12, color: '#4ECDC4' },
                      { name: 'SPOT', value: 32, color: '#FF6B35' },
                      { name: 'MATER', value: 56, color: '#45B7D1' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill="#4ECDC4" />
                    <Cell fill="#FF6B35" />
                    <Cell fill="#45B7D1" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="font-semibold">Demanda GUMA</p>
              <p className="text-2xl font-bold">{simulatedData.demandGUMA.toLocaleString()} GWh</p>
              <div className="flex justify-around text-xs text-gray-600 mt-2">
                <span>PLUS 12%</span>
                <span>SPOT 32%</span>
                <span>MATER 56%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'PLUS', value: 16, color: '#4ECDC4' },
                      { name: 'SPOT', value: 52, color: '#FF6B35' },
                      { name: 'MATER', value: 32, color: '#45B7D1' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill="#4ECDC4" />
                    <Cell fill="#FF6B35" />
                    <Cell fill="#45B7D1" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <p className="font-semibold">Demanda GUME</p>
              <p className="text-2xl font-bold">{simulatedData.demandGUME.toLocaleString()} GWh</p>
              <div className="flex justify-around text-xs text-gray-600 mt-2">
                <span>PLUS 16%</span>
                <span>SPOT 52%</span>
                <span>MATER 32%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer with date selectors */}
      <div className="flex justify-end space-x-4 pt-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enero">enero</SelectItem>
            <SelectItem value="febrero">febrero</SelectItem>
            <SelectItem value="marzo">marzo</SelectItem>
            <SelectItem value="abril">abril</SelectItem>
            <SelectItem value="mayo">mayo</SelectItem>
            <SelectItem value="junio">junio</SelectItem>
            <SelectItem value="julio">julio</SelectItem>
            <SelectItem value="agosto">agosto</SelectItem>
            <SelectItem value="septiembre">septiembre</SelectItem>
            <SelectItem value="octubre">octubre</SelectItem>
            <SelectItem value="noviembre">noviembre</SelectItem>
            <SelectItem value="diciembre">diciembre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}