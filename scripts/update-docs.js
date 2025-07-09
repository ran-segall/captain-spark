#!/usr/bin/env node

/**
 * Automated Documentation Updater for Captain Spark
 * 
 * This script automatically updates PROJECT_CONTEXT.md and .cursorrules
 * based on the current codebase structure and dependencies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Read package.json to get current dependencies
function getDependencies() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  return {
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
    scripts: packageJson.scripts || {}
  };
}

// Scan project structure
function scanProjectStructure() {
  const structure = {
    components: [],
    pages: [],
    hooks: [],
    utils: [],
    context: [],
    data: [],
    styles: [],
    public: {
      videos: [],
      images: [],
      audio: []
    }
  };

  function scanDirectory(dirPath, relativePath = '') {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (item === 'node_modules' || item === 'dist' || item === '.git') continue;
          
          if (relativePath === '' && ['components', 'pages', 'hooks', 'utils', 'context', 'data', 'styles'].includes(item)) {
            scanDirectory(fullPath, relativeItemPath);
          } else if (relativePath === 'pages' && item === 'onboarding') {
            scanDirectory(fullPath, relativeItemPath);
          } else if (relativePath === 'public') {
            if (['videos', 'images', 'audio'].includes(item)) {
              scanDirectory(fullPath, relativeItemPath);
            }
          } else {
            scanDirectory(fullPath, relativeItemPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
            const category = relativePath.split(path.sep)[0];
            if (structure[category] && Array.isArray(structure[category])) {
              structure[category].push(relativeItemPath);
            }
          } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
            structure.public.videos.push(relativeItemPath);
          } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
            structure.public.images.push(relativeItemPath);
          } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
            structure.public.audio.push(relativeItemPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
    }
  }

  scanDirectory(path.join(projectRoot, 'src'));
  scanDirectory(path.join(projectRoot, 'public'));
  
  return structure;
}

// Update PROJECT_CONTEXT.md
function updateProjectContext(structure, dependencies) {
  const contextPath = path.join(projectRoot, 'PROJECT_CONTEXT.md');
  let content = fs.readFileSync(contextPath, 'utf8');
  
  // Update dependencies section
  const depsList = Object.entries(dependencies.dependencies)
    .map(([name, version]) => `- \`${name}\` - ${getPackageDescription(name)}`)
    .join('\n');
  
  content = content.replace(
    /### Key Libraries[\s\S]*?(?=##)/,
    `### Key Libraries\n- \`@supabase/supabase-js\` - Backend data management\n- \`react-router-dom\` - Client-side routing\n- \`uuid\` - Unique identifier generation\n\n**Current Dependencies:**\n${depsList}\n\n`
  );
  
  // Update project structure
  const structureSection = generateStructureSection(structure);
  content = content.replace(
    /## 📁 Project Structure[\s\S]*?(?=## 🎨)/,
    `## 📁 Project Structure\n\n\`\`\`\n${structureSection}\n\`\`\`\n\n`
  );
  
  // Update last modified date
  const lastModified = new Date().toISOString().split('T')[0];
  content = content.replace(
    /(\*This document serves as the single source of truth.*)/,
    `$1\n\n*Last updated: ${lastModified}*`
  );
  
  fs.writeFileSync(contextPath, content);
  console.log('✅ Updated PROJECT_CONTEXT.md');
}

// Update .cursorrules
function updateCursorRules(structure, dependencies) {
  const rulesPath = path.join(projectRoot, '.cursorrules');
  let content = fs.readFileSync(rulesPath, 'utf8');
  
  // Update dependencies section
  const depsList = Object.entries(dependencies.dependencies)
    .map(([name, version]) => `- \`${name}\` - ${getPackageDescription(name)}`)
    .join('\n');
  
  content = content.replace(
    /### Dependencies[\s\S]*?(?=### Browser)/,
    `### Dependencies\n${depsList}\n\n`
  );
  
  // Update last modified date
  const lastModified = new Date().toISOString().split('T')[0];
  content = content.replace(
    /(## 🎯 Success Metrics[\s\S]*)/,
    `$1\n\n## 📝 Last Updated\n\n*Rules last updated: ${lastModified}*`
  );
  
  fs.writeFileSync(rulesPath, content);
  console.log('✅ Updated .cursorrules');
}

// Generate project structure section
function generateStructureSection(structure) {
  let output = 'captain-spark/\n';
  
  // Add src structure
  output += '  - src/\n';
  for (const [category, files] of Object.entries(structure)) {
    if (Array.isArray(files) && files.length > 0) {
      output += `    - ${category}/\n`;
      files.slice(0, 5).forEach(file => {
        output += `      - ${path.basename(file)}\n`;
      });
      if (files.length > 5) {
        output += `      - ... (${files.length - 5} more files)\n`;
      }
    }
  }
  
  // Add public structure
  output += '  - public/\n';
  for (const [category, files] of Object.entries(structure.public)) {
    if (files.length > 0) {
      output += `    - ${category}/\n`;
      files.slice(0, 3).forEach(file => {
        output += `      - ${path.basename(file)}\n`;
      });
      if (files.length > 3) {
        output += `      - ... (${files.length - 3} more files)\n`;
      }
    }
  }
  
  return output;
}

// Get package descriptions
function getPackageDescription(packageName) {
  const descriptions = {
    '@supabase/supabase-js': 'Backend data management and authentication',
    'react': 'UI library for building user interfaces',
    'react-dom': 'React rendering for web',
    'react-router-dom': 'Client-side routing for React',
    'uuid': 'Unique identifier generation',
    'vite': 'Build tool and development server',
    'typescript': 'Type-safe JavaScript',
    'eslint': 'Code linting and quality',
    '@types/react': 'TypeScript definitions for React',
    '@types/react-dom': 'TypeScript definitions for React DOM',
    '@types/uuid': 'TypeScript definitions for UUID',
    '@vitejs/plugin-react': 'Vite plugin for React',
    'typescript-eslint': 'TypeScript ESLint rules'
  };
  
  return descriptions[packageName] || 'Utility library';
}

// Main execution
function main() {
  console.log('🔄 Updating project documentation...');
  
  try {
    const dependencies = getDependencies();
    const structure = scanProjectStructure();
    
    updateProjectContext(structure, dependencies);
    updateCursorRules(structure, dependencies);
    
    console.log('✅ Documentation update complete!');
    console.log(`📊 Found ${Object.values(structure).flat().length} files in project structure`);
    console.log(`📦 Found ${Object.keys(dependencies.dependencies).length} dependencies`);
    
  } catch (error) {
    console.error('❌ Error updating documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as updateDocs }; 