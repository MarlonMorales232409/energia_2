import { Company, User, ReportData, SharedLink, ProcessingJob, ReportFilters } from '../../types';
import { generateCompanies, generateCompanyUsers, generateBackofficeUsers } from '../generators/companies';
import { generateReportsForCompany } from '../generators/reports';
import { LocalStorageManager } from '../../utils/localStorage';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  type: 'user_flow' | 'data_showcase' | 'error_demo' | 'feature_demo';
  steps: Array<{
    action: string;
    description: string;
    expectedResult: string;
  }>;
  testData: {
    companyId?: string;
    userId?: string;
    reportPeriod?: string;
    filters?: any;
  };
}

export interface MockDataMetadata {
  version: string;
  totalRecords: number;
  dataQuality: 'low' | 'medium' | 'high';
  coherenceLevel: 'basic' | 'realistic' | 'production-like';
  seasonalVariations: boolean;
  crossReferences: boolean;
}

export interface MockDataSet {
  companies: Company[];
  users: User[];
  reports: ReportData[];
  sharedLinks: SharedLink[];
  processingJobs: ProcessingJob[];
  generatedAt: Date;
  demoScenarios?: DemoScenario[];
  metadata: MockDataMetadata;
}

export function generateMockDataSet(): MockDataSet {
  console.log('🌱 Generating comprehensive mock data set...');
  
  // Generate companies with realistic data
  const companies = generateCompanies();
  console.log(`✅ Generated ${companies.length} companies`);
  
  // Generate users with proper role distribution
  const companyUsers = generateCompanyUsers(companies);
  const backofficeUsers = generateBackofficeUsers();
  const users = [...companyUsers, ...backofficeUsers];
  console.log(`✅ Generated ${users.length} users (${companyUsers.length} company + ${backofficeUsers.length} backoffice)`);
  
  // Generate comprehensive reports (18 months of coherent data)
  const reports: ReportData[] = [];
  const startDate = new Date(2023, 0, 1); // January 2023
  const monthsCount = 18;
  
  companies
    .filter(company => company.status === 'active')
    .forEach(company => {
      const companyReports = generateReportsForCompany(company, startDate, monthsCount);
      reports.push(...companyReports);
      console.log(`  📊 Generated ${companyReports.length} reports for ${company.name}`);
    });
  
  console.log(`✅ Generated ${reports.length} total reports with seasonal variations`);
  
  // Generate realistic shared links with various states
  const sharedLinks = generateSampleSharedLinks(companies, users);
  console.log(`✅ Generated ${sharedLinks.length} shared links (active/expired/revoked)`);
  
  // Generate processing jobs with different statuses
  const processingJobs = generateSampleProcessingJobs();
  console.log(`✅ Generated ${processingJobs.length} processing jobs (completed/failed/running)`);
  
  // Add demo scenarios
  const demoScenarios = generateDemoScenarios(companies, users, reports);
  console.log(`✅ Generated ${demoScenarios.length} demo scenarios`);
  
  const dataSet: MockDataSet = {
    companies,
    users,
    reports,
    sharedLinks,
    processingJobs,
    generatedAt: new Date(),
    demoScenarios,
    metadata: {
      version: '1.0.0',
      totalRecords: companies.length + users.length + reports.length + sharedLinks.length + processingJobs.length,
      dataQuality: 'high',
      coherenceLevel: 'realistic',
      seasonalVariations: true,
      crossReferences: true,
    },
  };
  
  console.log('🎉 Mock data set generation completed successfully');
  console.log(`📈 Total records: ${dataSet.metadata.totalRecords}`);
  return dataSet;
}

export function seedMockData(): MockDataSet {
  const dataSet = generateMockDataSet();
  
  // Store in localStorage
  LocalStorageManager.setMockData(dataSet);
  console.log('Mock data seeded to localStorage');
  
  return dataSet;
}

export function getMockData(): MockDataSet | null {
  const stored = LocalStorageManager.getMockData();
  
  if (!stored) {
    console.log('No mock data found in localStorage, generating new set...');
    return seedMockData();
  }
  
  // Type guard to check if stored data is a valid MockDataSet
  if (!isValidMockDataSet(stored)) {
    console.log('Invalid mock data structure, regenerating...');
    return seedMockData();
  }

  // Check if data is older than 24 hours and regenerate if needed
  const generatedAt = new Date(stored.generatedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    console.log('Mock data is older than 24 hours, regenerating...');
    return seedMockData();
  }
  
  console.log(`Loaded mock data from localStorage (generated ${Math.round(hoursDiff)} hours ago)`);
  return stored;
}

function isValidMockDataSet(data: unknown): data is MockDataSet {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  return (
    !!obj.generatedAt &&
    Array.isArray(obj.companies) &&
    Array.isArray(obj.users) &&
    Array.isArray(obj.reports) &&
    Array.isArray(obj.sharedLinks) &&
    Array.isArray(obj.processingJobs)
  );
}

function generateSampleSharedLinks(companies: Company[], users: User[]): SharedLink[] {
  const links: SharedLink[] = [];
  const clientUsers = users.filter(u => u.role !== 'backoffice');
  
  // Generate 3-5 shared links
  for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
    const user = clientUsers[Math.floor(Math.random() * clientUsers.length)];
    const createdAt = new Date(2024, 10, Math.floor(Math.random() * 30) + 1);
    const expiresAt = new Date(createdAt);
    
    // Random expiration (1 day to 1 month)
    const expirationDays = 1 + Math.floor(Math.random() * 30);
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    const isExpired = expiresAt < new Date();
    const isRevoked = Math.random() < 0.1; // 10% chance of being revoked
    
    links.push({
      id: `link-${i + 1}`,
      createdBy: user.id,
      companyIds: user.companyId ? [user.companyId] : [],
      origin: Math.random() > 0.5 ? 'home' : 'reports',
      filters: Math.random() > 0.5 ? {
        period: {
          type: 'range',
          value: { start: '2024-01', end: '2024-06' }
        },
        mode: 'compare'
      } : undefined,
      createdAt,
      expiresAt,
      status: isRevoked ? 'revoked' : (isExpired ? 'expired' : 'active'),
      url: `https://portal.energeia.com.ar/shared/${generateRandomToken()}`,
      accessCount: Math.floor(Math.random() * 20),
    });
  }
  
  return links;
}

function generateSampleProcessingJobs(): ProcessingJob[] {
  const jobs: ProcessingJob[] = [];
  
  // Generate 2-4 processing jobs with different statuses
  // Solo estados exitosos, nunca 'failed' ni 'processing'
  const statuses: ProcessingJob['status'][] = ['completed', 'completed', 'completed'];

  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const startedAt = new Date(2024, 11, Math.floor(Math.random() * 15) + 1);
    const completedAt = new Date(startedAt.getTime() + (30 + Math.random() * 120) * 60 * 1000); // 30-150 minutes later

    const steps: ProcessingJob['steps'] = [
      {
        name: 'Extrayendo datos',
        status: 'completed',
        duration: 15000 + Math.random() * 10000,
      },
      {
        name: 'Mapeando información',
        status: 'completed',
        duration: 25000 + Math.random() * 15000,
      },
      {
        name: 'Generando informes',
        status: 'completed',
        duration: 45000 + Math.random() * 20000,
      },
      {
        name: 'Render PDF',
        status: 'completed',
        duration: 20000 + Math.random() * 10000,
      },
      {
        name: 'Publicando',
        status: 'completed',
        duration: 5000 + Math.random() * 5000,
      },
    ];

    jobs.push({
      id: `job-${i + 1}`,
      fileName: `datos_energeticos_${2024}_${String(11 + i).padStart(2, '0')}.xlsx`,
      fileSize: 2048000 + Math.random() * 5120000, // 2-7 MB
      status,
      steps,
      currentStep: 4,
      startedAt,
      completedAt,
      result: {
        companiesProcessed: 4 + Math.floor(Math.random() * 2),
        reportsGenerated: 4 + Math.floor(Math.random() * 2),
        totalDuration: completedAt ? completedAt.getTime() - startedAt.getTime() : 0,
      },
    });
  }
  
  return jobs;
}

function generateRandomToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateDemoScenarios(companies: Company[], users: User[], reports: ReportData[]): DemoScenario[] {
  const scenarios: DemoScenario[] = [];
  
  // Client user flow scenario
  const clientUser = users.find(u => u.role === 'client_user');
  const clientCompany = clientUser ? companies.find(c => c.id === clientUser.companyId) : companies[0];
  
  scenarios.push({
    id: 'client-user-flow',
    name: 'Flujo Completo Usuario Cliente',
    description: 'Demuestra el flujo completo de un usuario cliente desde login hasta descarga de informes',
    type: 'user_flow',
    steps: [
      {
        action: 'Login',
        description: 'Iniciar sesión con credenciales de usuario cliente',
        expectedResult: 'Redirección al dashboard del cliente con último informe visible',
      },
      {
        action: 'Navegar a Informes',
        description: 'Acceder a la sección de informes con filtros',
        expectedResult: 'Panel de filtros cargado con opciones de período y modo',
      },
      {
        action: 'Aplicar Filtros',
        description: 'Filtrar informes por rango de fechas y modo comparación',
        expectedResult: 'Gráficos actualizados con datos filtrados y comparación entre períodos',
      },
      {
        action: 'Compartir Informe',
        description: 'Crear enlace compartido con vencimiento de 7 días',
        expectedResult: 'Enlace generado y copiado al portapapeles con confirmación',
      },
      {
        action: 'Descargar PDF',
        description: 'Simular descarga de informe en formato PDF',
        expectedResult: 'Proceso de descarga simulado con notificación de éxito',
      },
    ],
    testData: {
      companyId: clientCompany?.id,
      userId: clientUser?.id,
      reportPeriod: '2024-11',
      filters: {
        period: { type: 'range', value: { start: '2024-06', end: '2024-11' } },
        mode: 'compare',
      },
    },
  });

  // Admin user scenario
  const adminUser = users.find(u => u.role === 'client_admin');
  
  scenarios.push({
    id: 'admin-user-management',
    name: 'Gestión de Usuarios por Admin',
    description: 'Demuestra las capacidades de gestión de usuarios de un administrador de empresa',
    type: 'feature_demo',
    steps: [
      {
        action: 'Acceder a Usuarios',
        description: 'Navegar a la sección de gestión de usuarios de la empresa',
        expectedResult: 'Lista de usuarios de la empresa con opciones de gestión',
      },
      {
        action: 'Crear Usuario',
        description: 'Crear un nuevo usuario con rol de usuario estándar',
        expectedResult: 'Usuario creado exitosamente y agregado a la lista',
      },
      {
        action: 'Editar Usuario',
        description: 'Modificar información de un usuario existente',
        expectedResult: 'Cambios guardados y reflejados en la lista',
      },
      {
        action: 'Cambiar Estado',
        description: 'Pausar temporalmente un usuario',
        expectedResult: 'Estado actualizado con notificación de confirmación',
      },
    ],
    testData: {
      companyId: adminUser?.companyId,
      userId: adminUser?.id,
    },
  });

  // Backoffice scenario
  const backofficeUser = users.find(u => u.role === 'backoffice');
  
  scenarios.push({
    id: 'backoffice-processing',
    name: 'Procesamiento de Archivos Backoffice',
    description: 'Demuestra el flujo de procesamiento de archivos mensuales desde el backoffice',
    type: 'user_flow',
    steps: [
      {
        action: 'Subir Archivo',
        description: 'Cargar archivo mensual de datos energéticos',
        expectedResult: 'Archivo validado y listo para procesamiento',
      },
      {
        action: 'Iniciar Procesamiento',
        description: 'Ejecutar pipeline de procesamiento de datos',
        expectedResult: 'Progreso visible con pasos: Extrayendo → Mapeando → Generando → Publicando',
      },
      {
        action: 'Monitorear Estado',
        description: 'Seguir el progreso en tiempo real con ETA',
        expectedResult: 'Barra de progreso actualizada con tiempo estimado',
      },
      {
        action: 'Revisar Resultados',
        description: 'Verificar informes generados y empresas procesadas',
        expectedResult: 'Resumen de procesamiento con estadísticas de éxito',
      },
    ],
    testData: {
      userId: backofficeUser?.id,
    },
  });

  // Data showcase scenario
  scenarios.push({
    id: 'data-showcase',
    name: 'Showcase de Datos y Gráficos',
    description: 'Muestra la variedad y calidad de los datos mock generados',
    type: 'data_showcase',
    steps: [
      {
        action: 'Gráfico Mix Energético',
        description: 'Visualizar distribución de fuentes de energía',
        expectedResult: 'Gráfico de torta con colores distintivos por tipo de energía',
      },
      {
        action: 'Tendencia de Demanda',
        description: 'Mostrar evolución temporal de la demanda energética',
        expectedResult: 'Gráfico de líneas con variaciones estacionales realistas',
      },
      {
        action: 'Comparación de Costos',
        description: 'Analizar diferencias de costos entre períodos',
        expectedResult: 'Gráfico combinado con barras y líneas de tendencia',
      },
      {
        action: 'Datos Tabulares',
        description: 'Revisar tablas con datos numéricos detallados',
        expectedResult: 'Tablas con formato consistente y datos coherentes',
      },
    ],
    testData: {
      companyId: companies[0]?.id,
      reportPeriod: '2024-11',
    },
  });

  // Error handling demo
  scenarios.push({
    id: 'error-handling-demo',
    name: 'Demostración de Manejo de Errores',
    description: 'Muestra cómo la aplicación maneja diferentes tipos de errores',
    type: 'error_demo',
    steps: [
      {
        action: 'Error de Red',
        description: 'Simular falla de conexión durante carga de datos',
        expectedResult: 'Mensaje de error amigable con opción de reintentar',
      },
      {
        action: 'Error de Validación',
        description: 'Intentar crear usuario con datos inválidos',
        expectedResult: 'Validación en tiempo real con mensajes específicos',
      },
      {
        action: 'Error de Procesamiento',
        description: 'Simular falla durante procesamiento de archivo',
        expectedResult: 'Error capturado con detalles y opciones de recuperación',
      },
      {
        action: 'Recuperación Automática',
        description: 'Demostrar recuperación automática de errores temporales',
        expectedResult: 'Sistema se recupera automáticamente con notificación',
      },
    ],
    testData: {},
  });

  // Responsive design demo
  scenarios.push({
    id: 'responsive-demo',
    name: 'Diseño Responsivo',
    description: 'Demuestra la adaptabilidad de la interfaz en diferentes dispositivos',
    type: 'feature_demo',
    steps: [
      {
        action: 'Vista Desktop',
        description: 'Mostrar interfaz completa en pantalla grande',
        expectedResult: 'Sidebar expandido, gráficos en grid, tablas completas',
      },
      {
        action: 'Vista Tablet',
        description: 'Adaptar interfaz para pantalla mediana',
        expectedResult: 'Sidebar colapsable, gráficos apilados, navegación optimizada',
      },
      {
        action: 'Vista Mobile',
        description: 'Optimizar para dispositivos móviles',
        expectedResult: 'Navegación móvil, gráficos responsivos, tablas scrolleables',
      },
      {
        action: 'Accesibilidad',
        description: 'Demostrar navegación por teclado y lectores de pantalla',
        expectedResult: 'Focus visible, ARIA labels, navegación secuencial',
      },
    ],
    testData: {},
  });

  return scenarios;
}

// Utility functions for getting specific data
export function getCompanyById(companyId: string): Company | null {
  const data = getMockData();
  return data?.companies.find(c => c.id === companyId) || null;
}

export function getUserById(userId: string): User | null {
  const data = getMockData();
  return data?.users.find(u => u.id === userId) || null;
}

export function getUserByEmail(email: string): User | null {
  const data = getMockData();
  return data?.users.find(u => u.email === email) || null;
}

export function getReportsForCompany(companyId: string): ReportData[] {
  const data = getMockData();
  return data?.reports.filter(r => r.companyId === companyId) || [];
}

export function getReportByPeriod(companyId: string, period: string): ReportData | null {
  const data = getMockData();
  return data?.reports.find(r => r.companyId === companyId && r.period === period) || null;
}

export function getLatestReportForCompany(companyId: string): ReportData | null {
  const reports = getReportsForCompany(companyId);
  if (reports.length === 0) return null;
  
  return reports.sort((a, b) => b.period.localeCompare(a.period))[0];
}

export function getUsersForCompany(companyId: string): User[] {
  const data = getMockData();
  return data?.users.filter(u => u.companyId === companyId) || [];
}

export function getBackofficeUsers(): User[] {
  const data = getMockData();
  return data?.users.filter(u => u.role === 'backoffice') || [];
}

export function getReportsByCompany(companyId: string): ReportData[] {
  return getReportsForCompany(companyId);
}

export function getReportsByFilters(filters: ReportFilters): ReportData[] {
  const data = getMockData();
  if (!data) return [];
  
  let reports = [...data.reports];
  
  // Filter by companies if specified (for backoffice)
  if (filters.companies && filters.companies.length > 0) {
    reports = reports.filter(r => filters.companies!.includes(r.companyId));
  }
  
  // Filter by period
  if (filters.period.type === 'month') {
    const targetPeriod = filters.period.value as string;
    reports = reports.filter(r => r.period === targetPeriod);
  } else if (filters.period.type === 'range') {
    const range = filters.period.value as { start: string; end: string };
    reports = reports.filter(r => r.period >= range.start && r.period <= range.end);
  } else if (filters.period.type === 'preset') {
    const now = new Date();
    let monthsBack = 3;
    
    switch (filters.period.preset) {
      case 'last3':
        monthsBack = 3;
        break;
      case 'last6':
        monthsBack = 6;
        break;
      case 'last12':
        monthsBack = 12;
        break;
    }
    
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const startPeriod = startDate.toISOString().slice(0, 7);
    const endPeriod = now.toISOString().slice(0, 7);
    
    reports = reports.filter(r => r.period >= startPeriod && r.period <= endPeriod);
  }
  
  // Sort by period descending
  reports.sort((a, b) => b.period.localeCompare(a.period));
  
  return reports;
}