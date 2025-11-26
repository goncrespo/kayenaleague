// Script para identificar errores comunes de React/Next.js
const fs = require('fs');
const path = require('path');

function findReactErrors() {
  console.log('🔍 Buscando errores comunes de React/Next.js...\n');

  const componentsDir = path.join(__dirname, '..', 'src', 'components', 'admin');
  
  if (!fs.existsSync(componentsDir)) {
    console.log('❌ No se encuentra el directorio de componentes admin');
    return;
  }

  const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));
  
  console.log(`📁 Analizando ${files.length} archivos de componentes:\n`);

  const issues = [];

  files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🔍 Analizando: ${file}`);
    
    // Buscar problemas comunes
    const fileIssues = [];

    // 1. Verificar imports de React
    if (!content.includes("import React") && !content.includes("'react'")) {
      fileIssues.push("⚠️  No se detecta import de React (puede causar errores con JSX)");
    }

    // 2. Verificar uso de useState, useEffect
    if (content.includes("useState") && !content.includes("import { useState")) {
      fileIssues.push("❌ useState usado sin importar");
    }
    if (content.includes("useEffect") && !content.includes("import { useEffect")) {
      fileIssues.push("❌ useEffect usado sin importar");
    }

    // 3. Verificar problemas con tipos null/undefined
    if (content.includes("handicap: number") && !content.includes("handicap: number | null")) {
      fileIssues.push("⚠️  Handicap puede ser null, pero no está tipado como number | null");
    }

    // 4. Verificar uso de fetch sin try-catch
    const fetchMatches = content.match(/fetch\(/g);
    const tryMatches = content.match(/try\s*{/g);
    if (fetchMatches && (!tryMatches || fetchMatches.length > tryMatches.length)) {
      fileIssues.push("⚠️  fetch usado sin manejo de errores adecuado");
    }

    // 5. Verificar uso de async/await sin async
    if (content.includes("await ") && !content.includes("async ")) {
      fileIssues.push("❌ await usado sin función async");
    }

    // 6. Verificar problemas con fechas
    if (content.includes("new Date(") && content.includes(".toISOString()")) {
      fileIssues.push("ℹ️  Uso de fechas detectado - verificar formato correcto");
    }

    // 7. Verificar uso de localStorage/sessionStorage en componentes servidor
    if (content.includes("localStorage") || content.includes("sessionStorage")) {
      fileIssues.push("⚠️  localStorage/sessionStorage pueden causar errores en SSR");
    }

    // 8. Verificar imports de Prisma/client
    if (content.includes("@prisma/client") && !content.includes("'use client'")) {
      fileIssues.push("ℹ️  Import de Prisma en componente cliente - verificar si es correcto");
    }

    // 9. Verificar uso de window/document
    if (content.includes("window.") || content.includes("document.")) {
      fileIssues.push("⚠️  Uso de window/document puede causar errores en SSR");
    }

    if (fileIssues.length > 0) {
      issues.push({ file, issues: fileIssues });
      console.log(`   ❌ Encontrados ${fileIssues.length} problemas`);
    } else {
      console.log(`   ✅ Sin problemas detectados`);
    }
    console.log('');
  });

  console.log('='.repeat(60));
  console.log('\n📊 RESUMEN DE PROBLEMAS ENCONTRADOS:\n');

  if (issues.length === 0) {
    console.log('🎉 No se encontraron problemas en los componentes!');
  } else {
    issues.forEach(({ file, issues }) => {
      console.log(`📄 ${file}:`);
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    });
  }

  console.log('\n💡 RECOMENDACIONES GENERALES:');
  console.log('1. Verificar todos los imports de React/hooks');
  console.log('2. Asegurar manejo de errores en todas las llamadas API');
  console.log('3. Verificar tipos de datos nullables');
  console.log('4. Usar "use client" en componentes que usen hooks/browser APIs');
  console.log('5. Verificar consola del navegador para errores específicos');
}

// Buscar errores específicos en el código
findReactErrors();