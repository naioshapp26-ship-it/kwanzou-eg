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

// Case: necklace children wrongly sharing parent slug "necklaces"
{
  const data = {
    categories: [
      { id: 'cat-necklaces', slug: 'necklaces', name: 'سلاسل', nameAr: 'سلاسل', parentId: null },
      { id: 'cat-queen', slug: 'necklaces', name: 'سلاسل كوين', nameAr: 'سلاسل كوين', parentId: 'cat-necklaces' },
      { id: 'cat-phar', slug: 'necklaces', name: 'سلاسل فرعوني و اسلامي', nameAr: 'سلاسل فرعوني و اسلامي', parentId: 'cat-necklaces' }
    ],
    products: [
      { id: 'p1', categorySlug: 'necklaces', category: 'سلاسل فرعوني و اسلامي' },
      { id: 'p2', categorySlug: 'necklaces', category: 'سلاسل' },
      { id: 'p3', categorySlug: 'necklaces-statement', category: 'Statement Necklaces' }
    ]
  };
  const { changed } = repairCategoryProductLinks(data);
  assert(changed, 'duplicate necklace slugs should be fixed');
  const queen = data.categories.find(c => c.id === 'cat-queen');
  const phar = data.categories.find(c => c.id === 'cat-phar');
  assert(queen.slug === 'necklaces-queen', 'queen slug unique');
  assert(phar.slug === 'necklaces-pharaonic', 'pharaonic slug unique');
  assert(data.products.find(p => p.id === 'p1').categorySlug === 'necklaces-pharaonic', 'pharaonic product relinked by name');
  assert(data.products.find(p => p.id === 'p2').categorySlug === 'necklaces', 'parent product stays on necklaces');
  assert(data.categories.some(c => c.slug === 'necklaces-statement'), 'statement category created');
  assert(data.products.find(p => p.id === 'p3').categorySlug === 'necklaces-statement', 'statement product linked');
}

// Case: bracelet children with spaced / Arabic / numeric slugs
{
  const data = {
    categories: [
      { id: 'cat-bracelets', slug: 'bracelets', name: 'أساور', nameAr: 'أساور', parentId: null },
      { id: 'c1', slug: 'bracelets summer', name: 'انسيالات صيفي', nameAr: 'انسيالات صيفي', parentId: 'cat-bracelets' },
      { id: 'c2', slug: 'اساور', name: 'اساور', nameAr: 'اساور', parentId: 'cat-bracelets' },
      { id: 'c3', slug: '40', name: 'انسيالات ب 40', nameAr: 'انسيالات ب 40', parentId: 'cat-bracelets' }
    ],
    products: [
      { id: 'p1', categorySlug: 'اساور', category: 'اساور' },
      { id: 'p2', categorySlug: '40', category: 'انسيالات ب 40' }
    ]
  };
  const { changed } = repairCategoryProductLinks(data);
  assert(changed, 'bracelet junk slugs should change');
  assert(data.categories.find(c => c.id === 'c1').slug === 'bracelets-summer', 'summer slug fixed');
  assert(data.categories.find(c => c.id === 'c2').slug === 'bracelets-asawer', 'asawer slug fixed');
  assert(data.categories.find(c => c.id === 'c3').slug === 'bracelets-40', '40 slug fixed');
  assert(data.products.find(p => p.id === 'p1').categorySlug === 'bracelets-asawer', 'asawer products relinked');
  assert(data.products.find(p => p.id === 'p2').categorySlug === 'bracelets-40', '40 products relinked');
}

// Case: drop necklace products misfiled under pharaonic after slug uniquify
{
  const data = {
    categories: [
      { id: 'cat-necklaces', slug: 'necklaces', name: 'سلاسل', nameAr: 'سلاسل', parentId: null },
      { id: 'cat-phar', slug: 'necklaces-pharaonic', name: 'سلاسل فرعوني و اسلامي', nameAr: 'سلاسل فرعوني و اسلامي', parentId: 'cat-necklaces' },
      { id: 'cat-drop', slug: 'necklaces-drop', name: 'drop necklace', nameAr: 'drop necklace', parentId: 'cat-necklaces' }
    ],
    products: [
      { id: 'p1', categorySlug: 'necklaces-pharaonic', category: 'سلاسل فرعوني و اسلامي', name: 'drop necklace stainless steel' },
      { id: 'p2', categorySlug: 'necklaces-pharaonic', category: 'سلاسل فرعوني و اسلامي', name: 'star drop necklace' },
      { id: 'p3', categorySlug: 'necklaces-pharaonic', category: 'سلاسل فرعوني و اسلامي', name: 'Islamic pendant chain' }
    ]
  };
  repairCategoryProductLinks(data);
  assert(data.products[0].categorySlug === 'necklaces-drop', 'drop product 1 recovered');
  assert(data.products[1].categorySlug === 'necklaces-drop', 'drop product 2 recovered');
  assert(data.products[2].categorySlug === 'necklaces-pharaonic', 'non-drop stays pharaonic');
}

console.log('CATEGORY_LINKS_TEST_OK');
