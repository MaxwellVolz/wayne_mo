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

  // 5. Add getAssetPath import after other imports
  if (!content.includes("import { getAssetPath }")) {
    // Find the last import statement
    const importLines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      importLines.splice(lastImportIndex + 1, 0, "import { getAssetPath } from '@/lib/assetPath'");
      content = importLines.join('\n');
      console.log('  ✅ Added getAssetPath import');
      changes++;
    }
  }

  // 6. Fix model paths - replace hardcoded paths with getAssetPath()
  // Match: useGLTF('/models/...')
  // Replace: useGLTF(getAssetPath('models/...'))
  const pathRegex = /useGLTF\(['"]\/models\/([^'"]+\.glb)['"]\)/g;
  const pathMatches = content.match(pathRegex);
  if (pathMatches) {
    content = content.replace(pathRegex, "useGLTF(getAssetPath('models/$1'))");
    console.log('  ✅ Fixed useGLTF paths to use getAssetPath()');
    changes++;
  }

  // Also fix paths that don't have /models/ prefix yet
  const pathRegex2 = /useGLTF\(['"]\/(?!models\/)([^'"]+\.glb)['"]\)/g;
  const pathMatches2 = content.match(pathRegex2);
  if (pathMatches2) {
    content = content.replace(pathRegex2, "useGLTF(getAssetPath('models/$1'))");
    console.log('  ✅ Fixed missing /models/ prefix and added getAssetPath()');
    changes++;
  }

  // Fix preload paths
  const preloadRegex = /useGLTF\.preload\(['"]\/models\/([^'"]+\.glb)['"]\)/g;
  const preloadMatches = content.match(preloadRegex);
  if (preloadMatches) {
    content = content.replace(preloadRegex, "useGLTF.preload(getAssetPath('models/$1'))");
    console.log('  ✅ Fixed preload paths to use getAssetPath()');
    changes++;
  }

  // Also fix preload paths without /models/ prefix
  const preloadRegex2 = /useGLTF\.preload\(['"]\/(?!models\/)([^'"]+\.glb)['"]\)/g;
  const preloadMatches2 = content.match(preloadRegex2);
  if (preloadMatches2) {
    content = content.replace(preloadRegex2, "useGLTF.preload(getAssetPath('models/$1'))");
    console.log('  ✅ Fixed preload missing /models/ prefix and added getAssetPath()');
    changes++;
  }

  // 7. Fix useRef missing null argument
  // Match: React.useRef<THREE.Group>()
  // Replace: React.useRef<THREE.Group>(null)
  const useRefRegex = /React\.useRef<THREE\.Group>\(\)/g;
  if (useRefRegex.test(content)) {
    content = content.replace(useRefRegex, 'React.useRef<THREE.Group>(null)');
    console.log('  ✅ Fixed useRef missing null argument');
    changes++;
  }

  // 8. Fix useGraph type assertion
  // Match: useGraph(clone) as GLTFResult (but not already 'as unknown as')
  // Replace: useGraph(clone) as unknown as GLTFResult
  const useGraphRegex = /useGraph\(clone\)\s+as\s+(?!unknown)GLTFResult/g;
  if (useGraphRegex.test(content)) {
    content = content.replace(useGraphRegex, 'useGraph(clone) as unknown as GLTFResult');
    console.log('  ✅ Fixed useGraph type assertion');
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
