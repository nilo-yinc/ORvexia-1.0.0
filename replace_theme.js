const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Landing.jsx', 'utf8');

// The strategy: replace the hardcoded dark theme classes with `light_class dark:dark_class`.

const replacements = [
  { search: /bg-\[\#030303\]/g, replace: 'bg-slate-50 dark:bg-[#030303]' },
  { search: /bg-\[\#0a0a0a\]/g, replace: 'bg-white dark:bg-[#0a0a0a]' },
  { search: /bg-\[\#111\]/g, replace: 'bg-white dark:bg-[#111]' },
  { search: /text-white/g, replace: 'text-slate-900 dark:text-white' },
  { search: /border-white\/10/g, replace: 'border-slate-200 dark:border-white/10' },
  { search: /border-white\/30/g, replace: 'border-slate-300 dark:border-white/30' },
  { search: /bg-white\/5/g, replace: 'bg-slate-100 dark:bg-white/5' },
  { search: /bg-white\/10/g, replace: 'bg-slate-200 dark:bg-white/10' },
  { search: /hover:bg-white\/5/g, replace: 'hover:bg-slate-200 dark:hover:bg-white/5' },
  { search: /hover:bg-white\/10/g, replace: 'hover:bg-slate-300 dark:hover:bg-white/10' },
  { search: /text-slate-400/g, replace: 'text-slate-600 dark:text-slate-400' },
  { search: /text-slate-300/g, replace: 'text-slate-700 dark:text-slate-300' },
  { search: /ring-white\/5/g, replace: 'ring-slate-200 dark:ring-white/5' },
  { search: /stroke-white\/10/g, replace: 'stroke-slate-200 dark:stroke-white/10' },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

// Fix some specific cases that might have doubled up or need special care
// Like text-slate-900 dark:text-slate-900 dark:text-white -> if it matches twice
// But our regex should just match the exact string.

// Special case: `radial-gradient` in background
content = content.replace(
  'bg-[radial-gradient(circle_at_50%_0%,#1a0b02_0%,#030303_60%)]',
  'bg-[radial-gradient(circle_at_50%_0%,#fff5eb_0%,#f8fafc_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,#1a0b02_0%,#030303_60%)]'
);

// Special case: Navbar background opacity
content = content.replace(
  'bg-slate-50 dark:bg-[#030303]/70',
  'bg-white/70 dark:bg-[#030303]/70'
);

// Special case: The auth modal background overlay
content = content.replace(
  'bg-black/80',
  'bg-slate-900/50 dark:bg-black/80'
);

fs.writeFileSync('frontend/src/pages/Landing.jsx', content, 'utf8');
console.log('Replacements complete.');
