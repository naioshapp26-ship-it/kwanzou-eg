/**
 * Verify every category with products actually returns them via shop filter logic.
 */
const CategoryTree = require('../js/category-tree.js');

// Minimal ProductUI.filterByCategory (mirrors js/cart.js)
function filterByCategory(products, categories, slug) {
  if (!slug || slug === 'all') return products;
  const allowed = CategoryTree.getFilterSlugs(categories, slug);
  const cat = CategoryTree.getBySlug(categories, slug);
  if (cat?.nameAr) allowed.add(cat.nameAr);
  if (cat?.name) allowed.add(cat.name);
  return products.filter(p => {
    if (allowed.has(p.categorySlug)) return true;
    if (cat && (p.category === cat.nameAr || p.category === cat.name)) return true;
    return false;
  });
}

async function main() {
  const BASE = process.env.BASE_URL || 'https://kwanzou-eg-production.up.railway.app';
  const store = await (await fetch(`${BASE}/api/store`)).json();
  const categories = store.categories || [];
  const products = store.products || [];

  const rows = [];
  for (const cat of categories) {
    const exact = products.filter(p => p.categorySlug === cat.slug).length;
    const filtered = filterByCategory(products, categories, cat.slug).length;
    const status = exact === 0 && filtered === 0 ? 'EMPTY' : (filtered >= exact ? 'OK' : 'MISMATCH');
    rows.push({
      nameAr: cat.nameAr || cat.name,
      slug: cat.slug,
      parent: cat.parentId ? 'child' : 'top',
      exact,
      filtered,
      status
    });
  }

  rows.sort((a, b) => b.filtered - a.filtered);
  console.log('slug'.padEnd(28), 'exact'.padStart(5), 'shop'.padStart(5), 'status', 'name');
  for (const r of rows) {
    console.log(
      String(r.slug).padEnd(28),
      String(r.exact).padStart(5),
      String(r.filtered).padStart(5),
      r.status.padEnd(8),
      r.nameAr
    );
  }

  const watches = rows.find(r => r.slug === 'ساعات' || r.nameAr === 'ساعات');
  console.log('\nWATCHES:', watches);

  const problems = rows.filter(r => r.status === 'MISMATCH');
  const withProducts = rows.filter(r => r.exact > 0);
  console.log('\nCategories with products:', withProducts.length);
  console.log('Mismatches:', problems.length ? problems : 'none');

  // orphans
  const slugs = new Set(categories.map(c => c.slug));
  const orphans = {};
  for (const p of products) {
    if (!slugs.has(p.categorySlug)) orphans[p.categorySlug] = (orphans[p.categorySlug] || 0) + 1;
  }
  console.log('Orphans:', Object.keys(orphans).length ? orphans : 'none');

  // sum exact should equal total if no duplicates across categories... products can only have one slug
  const sumExact = withProducts.reduce((s, r) => s + r.exact, 0);
  console.log('Sum exact counts:', sumExact, 'total products:', products.length);
  if (sumExact !== products.length) {
    console.log('NOTE: sum!=total can happen if duplicate category slugs share products in exact count');
  }

  if (problems.length || Object.keys(orphans).length) process.exit(1);
  if (!watches || watches.exact < 1) {
    console.error('WATCHES_FAIL');
    process.exit(1);
  }
  console.log('ALL_CATEGORIES_OK');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
