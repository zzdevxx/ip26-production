const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'archive.html',
  'archive/index.html',
  'inventory.html',
  'inventory/index.html',
  'switcher.html',
  'switcher/index.html',
  'presenter.html',
  'presenter/index.html'
];

const EXPECTED_DRAWER = ['Home', 'Archive', 'Inventory', 'Switcher', 'Presenter'];

let allPassed = true;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log('--- Checking:', file, '---');
  
  // 1. Check toggle button
  if (!content.includes('id="mobile-menu-toggle"')) {
    console.error('FAIL: missing #mobile-menu-toggle in', file);
    allPassed = false;
  }
  
  // 2. Check no nav-cta-btn
  if (content.includes('nav-cta-btn')) {
    console.error('FAIL: lingering nav-cta-btn in', file);
    allPassed = false;
  }
  
  // 3. Check drawer and backdrop
  if (!content.includes('id="mobile-nav-drawer"')) {
    console.error('FAIL: missing #mobile-nav-drawer in', file);
    allPassed = false;
  }
  if (!content.includes('id="mobile-drawer-backdrop"')) {
    console.error('FAIL: missing #mobile-drawer-backdrop in', file);
    allPassed = false;
  }
  if (!content.includes('id="drawer-close-btn"')) {
    console.error('FAIL: missing #drawer-close-btn in', file);
    allPassed = false;
  }
  
  // 4. Extract drawer items
  const drawerMatch = content.match(/<aside id="mobile-nav-drawer"[\s\S]*?<\/aside>/);
  if (!drawerMatch) {
    console.error('FAIL: could not extract drawer in', file);
    allPassed = false;
  } else {
    const drawerHtml = drawerMatch[0];
    const linkMatches = [...drawerHtml.matchAll(/<strong>(.*?)<\/strong>/g)].map(m => m[1]);
    console.log('  Drawer menus in ' + file + ':', linkMatches.join(', '));
    const expected = EXPECTED_DRAWER;
    if (JSON.stringify(linkMatches) !== JSON.stringify(expected)) {
      console.error('FAIL: expected [' + expected.join(', ') + '] but got [' + linkMatches.join(', ') + ']');
      allPassed = false;
    }
    
    // Check href resolution
    const dir = path.dirname(file);
    const hrefMatches = [...drawerHtml.matchAll(/<a href="([^"#]+)(?:#[^"]*)?"/g)].map(m => m[1]);
    hrefMatches.forEach(href => {
      const resolved = path.resolve(dir, href);
      if (!fs.existsSync(resolved)) {
        console.error('FAIL: href does not exist:', href, 'in', file, 'resolved to', resolved);
        allPassed = false;
      }
    });
  }
});

console.log('\n================================');
if (allPassed) {
  console.log('SUCCESS: ALL 7 PAGES PASSED NAVIGATION AUDIT 100%!');
} else {
  console.error('ERROR: AUDIT FAILED!');
  process.exit(1);
}
