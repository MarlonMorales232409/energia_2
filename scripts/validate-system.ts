#!/usr/bin/env tsx
// System Validation Script
// Run with: npx tsx scripts/validate-system.ts

import { SystemValidationService } from '../lib/services/system-validation';
import { DemoInitializationService } from '../lib/services/demo-initialization';

async function main() {
  console.log('🔍 Iniciando validación completa del sistema...\n');

  try {
    // Quick health check first
    console.log('⚡ Verificación rápida de salud del sistema...');
    const healthCheck = await SystemValidationService.quickHealthCheck();
    
    console.log(`   Estado: ${healthCheck.isHealthy ? '✅ Saludable' : '❌ Problemas detectados'}`);
    console.log(`   Puntuación: ${healthCheck.score}%`);
    
    if (healthCheck.issues.length > 0) {
      console.log('   Problemas encontrados:');
      healthCheck.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    console.log();

    // Initialize demo data if needed
    console.log('📊 Verificando datos de demostración...');
    const demoValidation = await DemoInitializationService.validateDemoData();
    
    if (!demoValidation.isValid) {
      console.log('   Inicializando datos de demostración...');
      const initResult = await DemoInitializationService.initializeAllDemoData();
      
      if (initResult.success) {
        console.log(`   ✅ Datos inicializados: ${initResult.configurationsCreated} configuraciones`);
      } else {
        console.log(`   ❌ Error en inicialización: ${initResult.message}`);
        if (initResult.errors) {
          initResult.errors.forEach(error => console.log(`     - ${error}`));
        }
      }
    } else {
      console.log('   ✅ Datos de demostración válidos');
      console.log(`     - Global: ${demoValidation.globalConfigExists ? 'Sí' : 'No'}`);
      console.log(`     - Clientes: ${demoValidation.clientConfigsCount}`);
      console.log(`     - Fuentes de datos: ${demoValidation.dataSourcesCount}`);
    }
    console.log();

    // Full system validation
    console.log('🔬 Ejecutando validación completa del sistema...');
    const validationResult = await SystemValidationService.validateCompleteSystem();
    
    console.log(`\n📊 RESULTADOS DE VALIDACIÓN`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Estado general: ${validationResult.isValid ? '✅ VÁLIDO' : '❌ REQUIERE ATENCIÓN'}`);
    console.log(`Puntuación total: ${validationResult.score}%`);
    console.log();

    // Category results
    console.log('📋 Resultados por categoría:');
    Object.entries(validationResult.categories).forEach(([key, category]) => {
      const statusIcon = {
        excellent: '🟢',
        good: '🔵', 
        warning: '🟡',
        critical: '🔴'
      }[category.status];
      
      console.log(`   ${statusIcon} ${category.name}: ${category.score}% (${category.status})`);
      
      const failedChecks = category.checks.filter(c => !c.passed);
      if (failedChecks.length > 0) {
        failedChecks.forEach(check => {
          const severityIcon = {
            critical: '🔴',
            error: '🟠',
            warning: '🟡',
            info: '🔵'
          }[check.severity];
          console.log(`     ${severityIcon} ${check.name}: ${check.message}`);
        });
      }
    });
    console.log();

    // Critical issues
    if (validationResult.criticalIssues.length > 0) {
      console.log('🚨 PROBLEMAS CRÍTICOS:');
      validationResult.criticalIssues.forEach(issue => {
        console.log(`   🔴 ${issue}`);
      });
      console.log();
    }

    // Recommendations
    if (validationResult.recommendations.length > 0) {
      console.log('💡 RECOMENDACIONES:');
      validationResult.recommendations.forEach(recommendation => {
        console.log(`   💡 ${recommendation}`);
      });
      console.log();
    }

    // Demo scenarios validation
    console.log('🎭 Validando escenarios de demostración...');
    const scenarios = DemoInitializationService.getDemoScenarios();
    console.log(`   Escenarios disponibles: ${scenarios.length}`);
    
    for (const scenario of scenarios) {
      try {
        const scenarioResult = await DemoInitializationService.initializeDemoScenario(scenario.name);
        console.log(`   ${scenarioResult.success ? '✅' : '❌'} ${scenario.name}`);
        if (!scenarioResult.success) {
          console.log(`     Error: ${scenarioResult.message}`);
        }
      } catch (error) {
        console.log(`   ❌ ${scenario.name}: Error durante inicialización`);
      }
    }
    console.log();

    // Client configurations validation
    console.log('👥 Validando configuraciones de clientes...');
    const clientsInfo = DemoInitializationService.getDemoClientsInfo();
    
    for (const client of clientsInfo) {
      try {
        const clientResult = await DemoInitializationService.initializeClientDemo(client.id);
        console.log(`   ${clientResult.success ? '✅' : '❌'} ${client.name} (${client.type})`);
        if (!clientResult.success) {
          console.log(`     Error: ${clientResult.message}`);
        }
      } catch (error) {
        console.log(`   ❌ ${client.name}: Error durante inicialización`);
      }
    }
    console.log();

    // Final summary
    console.log('📈 RESUMEN FINAL');
    console.log(`${'='.repeat(50)}`);
    
    if (validationResult.isValid && healthCheck.isHealthy) {
      console.log('🎉 ¡SISTEMA COMPLETAMENTE VALIDADO!');
      console.log('   El sistema está listo para demostración y uso.');
      console.log(`   Puntuación general: ${Math.min(validationResult.score, healthCheck.score)}%`);
    } else {
      console.log('⚠️  SISTEMA REQUIERE ATENCIÓN');
      console.log('   Se encontraron problemas que deben ser resueltos.');
      console.log(`   Puntuación de salud: ${healthCheck.score}%`);
      console.log(`   Puntuación de validación: ${validationResult.score}%`);
      
      if (validationResult.criticalIssues.length > 0) {
        console.log(`   Problemas críticos: ${validationResult.criticalIssues.length}`);
      }
    }

    console.log('\n✨ Validación completada.');
    
    // Exit with appropriate code
    process.exit(validationResult.isValid && healthCheck.isHealthy ? 0 : 1);

  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO durante la validación:');
    console.error(error);
    process.exit(1);
  }
}

// Run the validation
main().catch(error => {
  console.error('Error ejecutando validación:', error);
  process.exit(1);
});