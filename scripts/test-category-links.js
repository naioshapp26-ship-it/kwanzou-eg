/**
 * Unit tests: category↔product link repair (prevents missing-category products)
 */
const {
  repairCategoryProductLinks,
  normalizeCategorySlugs,
  repairProductCategoryLinks,
  slugifyLatin,
  isJunkSlug,
  hasArabic
} = require('../lib/category-links');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(isJunkSlug('eeee'), 'eeee is junk');
assert(hasArabic('بروش'), 'arabic detected');
assert(!isJunkSlug('brooch'), 'brooch ok');
assert(slugifyLatin('Free Size') === 'free-size', 'slugify latin');

// Case: piercing products stuck on Arabic name while category slug was eeee/piercing
{
  const data = {
    categories: [
      { id: 'c1', slug: 'eeee', name: 'بيرسينج', nameAr: 'بيرسينج', parentId: null }
    ],
    products: [
      { id: 'p1', categorySlug: 'بيرسينج', category: 'بيرسينج' },
      { id: 'p2', categorySlug: 'eeee', category: 'بيرسينج' }
    ]
  };
  const { changed } = repairCategoryProductLinks(data);
  assert(changed, 'should change');
  assert(data.categories[0].slug === 'piercing', 'category slug normalized to piercing');
  assert(data.products.every(p => p.categorySlug === 'piercing'), 'products remapped to piercing');
}

// Case: brooch Arabic orphan
{
  const data = {
    categories: [
      { id: 'c1', slug: 'brooch', name: 'Brooch', nameAr: 'بروش', parentId: null }
    ],
    products: [
      { id: 'p1', categorySlug: 'بروش', category: 'بروش' }
    ]
  };
  repairProductCategoryLinks(data.products, data.categories);
  assert(data.products[0].categorySlug === 'brooch', 'brooch remapped');
}

// Case: anklet
{
  const data = {
    categories: [
      { id: 'c1', slug: 'anklet', name: 'Anklet', nameAr: 'خلخال', parentId: null }
    ],
    products: [
      { id: 'p1', categorySlug: 'خلخال', category: 'خلخال' }
    ]
  };
  repairCategoryProductLinks(data);
  assert(data.products[0].categorySlug === 'anklet', 'anklet remapped');
}

// Case: already correct — no churn on names when already linked
{
  const data = {
    categories: [
      { id: 'c1', slug: 'watches', name: 'Watches', nameAr: 'ساعات', parentId: null }
    ],
    products: [
      { id: 'p1', categorySlug: 'watches', category: 'Watches' }
    ]
  };
  const before = JSON.stringify(data);
  const { changed } = repairCategoryProductLinks(data);
  assert(!changed, 'no change when already correct');
  assert(JSON.stringify(data) === before, 'stable when correct');
}

// normalize Arabic category slug ساعات → watches without colliding
{
  const cats = [{ id: 'c1', slug: 'ساعات', name: 'ساعات', nameAr: 'ساعات', parentId: null }];
  const changed = normalizeCategorySlugs(cats);
  assert(changed && cats[0].slug === 'watches', 'watches normalized');
}

console.log('CATEGORY_LINKS_TEST_OK');
