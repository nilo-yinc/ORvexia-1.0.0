const fs = require('fs');

const path = 'd:/Desktop/ORvexia-1.0.0/frontend/src/pages/Landing.jsx';
let content = fs.readFileSync(path, 'utf8');

const blueprintStart = content.indexOf('{/* Blueprint Showcase Section */}');
const featuresStart = content.indexOf('{/* --- FEATURES GRID --- */}');
const kineticStart = content.indexOf('{/* --- KINETIC CTA --- */}');

if (blueprintStart !== -1 && featuresStart !== -1 && kineticStart !== -1) {
  const blueprintSection = content.slice(blueprintStart, featuresStart);
  const featuresSection = content.slice(featuresStart, kineticStart);
  
  const newContent = content.slice(0, blueprintStart) + featuresSection + blueprintSection + content.slice(kineticStart);
  
  fs.writeFileSync(path, newContent);
  console.log('Swapped successfully!');
} else {
  console.log('Could not find sections.');
}
