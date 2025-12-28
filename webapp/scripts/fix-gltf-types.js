#!/usr/bin/env node

/**
 * Post-processes gltfjsx generated files to fix TypeScript errors
 * Fixes:
 * 1. Remove invalid GLTFAction type
 * 2. Replace JSX.IntrinsicElements with React.ComponentProps
 * 3. Fix type assertion to use 'as unknown as'
 */

const fs = require('fs');
const path = require('path');

function fixGltfTypes(filePath) {
  console.log(`🔧 Fixing GLTF types in ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Remove the animations: GLTFAction[] line
  const animationsRegex = /\s*animations:\s*GLTFAction\[\]\s*\n/g;
  if (animationsRegex.test(content)) {
    content = content.replace(animationsRegex, '\n');
    console.log('  ✅ Removed GLTFAction type');
    changes++;
  }

  // 2. Replace JSX.IntrinsicElements['group'] with React.ComponentProps<'group'>
  const jsxRegex = /JSX\.IntrinsicElements\[['"]group['"]\]/g;
  if (jsxRegex.test(content)) {
    content = content.replace(jsxRegex, "React.ComponentProps<'group'>");
    console.log('  ✅ Fixed JSX.IntrinsicElements to React.ComponentProps');
    changes++;
  }

  // 3. Fix type assertion: add 'as unknown as' before GLTFResult
  // Match: useGLTF('/path') as GLTFResult
  // Replace: useGLTF('/path') as unknown as GLTFResult
  const assertionRegex = /useGLTF\(([^)]+)\)\s+as\s+GLTFResult/g;
  const matches = content.match(assertionRegex);
  if (matches) {
    content = content.replace(assertionRegex, 'useGLTF($1) as unknown as GLTFResult');
    console.log('  ✅ Fixed type assertion with "as unknown as"');
    changes++;
  }

  // 4. Ensure React is imported if we're using React.ComponentProps
  if (!content.includes("import React") && content.includes("React.ComponentProps")) {
    // Add React import after the existing imports
    const importInsertPoint = content.indexOf("import { useGLTF }");
    if (importInsertPoint !== -1) {
      const beforeImport = content.substring(0, importInsertPoint);
      const afterImport = content.substring(importInsertPoint);
      content = beforeImport + "import React from 'react'\n" + afterImport;
      console.log('  ✅ Added React import');
      changes++;
    }
  }

  // 5. Fix model paths - ensure they point to /models/ directory
  // Match patterns like: useGLTF('/city_01.glb') or useGLTF('/taxi.glb')
  // But NOT if already correct: useGLTF('/models/...')
  const pathRegex = /useGLTF\(['"]\/(?!models\/)([^'"]+\.glb)['"]\)/g;
  const pathMatches = content.match(pathRegex);
  if (pathMatches) {
    content = content.replace(pathRegex, "useGLTF('/models/$1')");
    console.log('  ✅ Fixed model path to use /models/ directory');
    changes++;
  }

  // Also fix preload paths
  const preloadRegex = /useGLTF\.preload\(['"]\/(?!models\/)([^'"]+\.glb)['"]\)/g;
  const preloadMatches = content.match(preloadRegex);
  if (preloadMatches) {
    content = content.replace(preloadRegex, "useGLTF.preload('/models/$1')");
    console.log('  ✅ Fixed preload path to use /models/ directory');
    changes++;
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changes} issue(s) in ${filePath}`);
  } else {
    console.log(`✨ No fixes needed in ${filePath}`);
  }
}

// Get file path from command line or use default
const filePath = process.argv[2] || path.join(__dirname, '../components/CityModelGenerated.tsx');

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

fixGltfTypes(filePath);
