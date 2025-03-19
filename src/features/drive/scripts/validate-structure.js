/**
 * Script para validar la estructura del proyecto
 * Verifica que los archivos estén en los directorios correctos
 * y sigan las convenciones de nomenclatura
 */

const fs = require("fs");
const path = require("path");

// Directorios esperados
const expectedDirs = [
  "src/app/[lang]/(marketing)/drive/components",
  "src/features/drive/services",
  "src/features/drive/utils",
  "src/features/drive/types",
  "src/features/drive/hooks",
];

// Archivos requeridos
const requiredFiles = [
  "src/app/[lang]/(marketing)/drive/page.tsx",
  "src/app/[lang]/(marketing)/drive/components/HierarchyViewer.tsx",
  "src/features/drive/types/drive.ts",
  "src/features/drive/types/hierarchy.ts",
  "src/features/drive/services/drive/GoogleDriveService.ts",
  "src/features/drive/services/hierarchy/HierarchyService.ts",
  "src/features/drive/hooks/useHierarchy.ts",
];

// Convenciones de nombres
const namingConventions = {
  components: /^[A-Z][a-zA-Z0-9]*\.tsx$/,
  hooks: /^use[A-Z][a-zA-Z0-9]*\.ts$/,
  services: /^[A-Z][a-zA-Z0-9]*Service\.ts$/,
  utils: /^[a-z][a-zA-Z0-9]*\.ts$/,
  types: /^[a-z][a-zA-Z0-9]*\.ts$/,
};

// Verificar si un archivo es un page.tsx
function isPageFile(filePath) {
  return filePath.endsWith("page.tsx");
}

// Verificar si un archivo cumple con las convenciones de nombres
function checkNamingConvention(filePath, convention) {
  const fileName = path.basename(filePath);
  return convention.test(fileName);
}

// Validar estructura
function validateStructure() {
  const issues = [];

  // Verificar directorios
  expectedDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      issues.push(`❌ Directorio no encontrado: ${dir}`);
    }
  });

  // Verificar archivos requeridos
  requiredFiles.forEach((file) => {
    if (!fs.existsSync(file)) {
      issues.push(`❌ Archivo requerido no encontrado: ${file}`);
    }
  });

  // Verificar convenciones de nombres en componentes
  const componentsDir = "src/app/[lang]/(marketing)/drive/components";
  if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach((file) => {
      if (
        !isPageFile(file) &&
        !checkNamingConvention(file, namingConventions.components)
      ) {
        issues.push(
          `⚠️ El archivo ${file} no cumple con la convención de nombres para componentes`
        );
      }
    });
  }

  // Verificar convenciones en hooks
  const hooksDir = "src/features/drive/hooks";
  if (fs.existsSync(hooksDir)) {
    fs.readdirSync(hooksDir).forEach((file) => {
      if (!checkNamingConvention(file, namingConventions.hooks)) {
        issues.push(
          `⚠️ El archivo ${file} no cumple con la convención de nombres para hooks`
        );
      }
    });
  }

  // Verificar convenciones en servicios
  const servicesDir = "src/features/drive/services";
  if (fs.existsSync(servicesDir)) {
    fs.readdirSync(servicesDir).forEach((file) => {
      if (!checkNamingConvention(file, namingConventions.services)) {
        issues.push(
          `⚠️ El archivo ${file} no cumple con la convención de nombres para servicios`
        );
      }
    });
  }

  // Verificar convenciones en utils
  const utilsDir = "src/features/drive/utils";
  if (fs.existsSync(utilsDir)) {
    fs.readdirSync(utilsDir).forEach((file) => {
      if (!checkNamingConvention(file, namingConventions.utils)) {
        issues.push(
          `⚠️ El archivo ${file} no cumple con la convención de nombres para utilidades`
        );
      }
    });
  }

  // Verificar convenciones en types
  const typesDir = "src/features/drive/types";
  if (fs.existsSync(typesDir)) {
    fs.readdirSync(typesDir).forEach((file) => {
      if (!checkNamingConvention(file, namingConventions.types)) {
        issues.push(
          `⚠️ El archivo ${file} no cumple con la convención de nombres para tipos`
        );
      }
    });
  }

  return issues;
}

// Ejecutar validación
const issues = validateStructure();

// Mostrar resultados
console.log("Validación de estructura del proyecto:");
console.log("--------------------------------------");
if (issues.length === 0) {
  console.log("✅ La estructura del proyecto es correcta");
} else {
  issues.forEach((issue) => console.log(issue));
  console.log("\n⚠️ Se encontraron problemas en la estructura del proyecto");
}

process.exit(issues.length > 0 ? 1 : 0);
