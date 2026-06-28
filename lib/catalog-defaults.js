/** Curated catalog — shared by seed data & migrations */
const CategoryTree = require('../js/category-tree.js');
const CATALOG_VERSION = CategoryTree.CATALOG_SUBCATEGORY_VERSION;

const REMOVED_CATEGORY_SLUGS = ['jewelry', 'earrings', 'watches', 'scarves', 'sunglasses', 'new-arrivals'];

const LEGACY_CATEGORY_SLUG_MAP = {
  jewelry: 'necklaces',
  earrings: 'accessories'
};

const categories = [
  { id: 'cat-necklaces', name: 'Necklaces', nameAr: 'سلاسل', slug: 'necklaces', sort: 1, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', featured: true },
  { id: 'cat-bracelets', name: 'Bracelets', nameAr: 'أساور', slug: 'bracelets', sort: 2, image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80', featured: true },
  { id: 'cat-accessories', name: 'Earrings', nameAr: 'حلقان', slug: 'accessories', sort: 3, image: 'https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=800&q=80', featured: true },
  { id: 'cat-rings', name: 'Rings', nameAr: 'خواتم', slug: 'rings', sort: 4, image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800&q=80', featured: true },
  { id: 'cat-perfumes', name: 'Perfumes', nameAr: 'برفانات', slug: 'perfumes', sort: 5, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', featured: true },
  { id: 'cat-handbags', name: 'Bags', nameAr: 'شنط', slug: 'handbags', sort: 6, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', featured: true }
];

const products = [
  { id: 'p-n1', name: 'Layered Gold Chain', nameAr: 'سلسلة طبقات دهب', category: 'Necklaces', categorySlug: 'necklaces', price: 520, rating: 5, reviews: 84, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 30, descAr: 'سلسلة طبقات ترند، شكلها شيك على الرقبة.', descEn: 'Trendy layered chain necklace.' },
  { id: 'p-n2', name: 'Charm Pendant Necklace', nameAr: 'سلسلة دلاية دهب', category: 'Necklaces', categorySlug: 'necklaces', price: 410, rating: 5, reviews: 52, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 22, descAr: 'دلاية ناعمة بتكمل أي لوك يومي.', descEn: 'Delicate charm pendant for daily wear.' },
  { id: 'p-n3', name: 'Zircon Pendant Chain', nameAr: 'سلسلة زircon', category: 'Necklaces', categorySlug: 'necklaces', price: 480, rating: 5, reviews: 38, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 18, descAr: 'سلسلة لامعة بحجر زircon — ترند السهرات.', descEn: 'Sparkling zircon pendant chain.' },

  { id: 'p-b1', name: 'Pearl Bracelet', nameAr: 'اسورة لؤلؤ', category: 'Bracelets', categorySlug: 'bracelets', price: 380, rating: 5, reviews: 73, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 28, descAr: 'اسورة لؤلؤ كلاسيك على المعصم.', descEn: 'Classic pearl bracelet.' },
  { id: 'p-b2', name: 'Gold Cuff Bracelet', nameAr: 'اسورة كف دهب', category: 'Bracelets', categorySlug: 'bracelets', price: 460, rating: 5, reviews: 41, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 18, descAr: 'اسورة كف bold — ترند أوي.', descEn: 'Bold gold-tone cuff bracelet.' },
  { id: 'p-b3', name: 'Stacked Bangle Set', nameAr: 'طقم اساور', category: 'Bracelets', categorySlug: 'bracelets', price: 350, rating: 5, reviews: 29, image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80', images: ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 24, descAr: 'طقم اساور رفيعة — شكلها حلو مع الساعة.', descEn: 'Stacked slim bangles set.' },

  { id: 'p-e1', name: 'Gold Hoop Earrings', nameAr: 'حلق هوب دهب', category: 'Accessories', categorySlug: 'accessories', price: 280, rating: 5, reviews: 156, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 45, descAr: 'حلق هوب خفيف — ترند كل يوم.', descEn: 'Lightweight gold-tone hoop earrings.' },
  { id: 'p-e2', name: 'Zircon Drop Earrings', nameAr: 'حلق زircon', category: 'Accessories', categorySlug: 'accessories', price: 320, rating: 5, reviews: 88, image: 'https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=600&q=80', images: ['https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 32, descAr: 'حلق نازل بحجر لامع — شكل بنت لابساه.', descEn: 'Zircon drop earrings with a dressy look.' },
  { id: 'p-e3', name: 'Pearl Stud Earrings', nameAr: 'حلق لؤلؤ', category: 'Accessories', categorySlug: 'accessories', price: 260, rating: 5, reviews: 64, image: 'https://images.unsplash.com/photo-1488799812881-957129749661?w=600&q=80', images: ['https://images.unsplash.com/photo-1488799812881-957129749661?w=800&q=80'], badge: '', featured: true, bestseller: false, stock: 40, descAr: 'حلق لؤلؤ كلاسيك — يركب مع كل حاجة.', descEn: 'Classic pearl stud earrings.' },

  { id: 'p-r1', name: 'Crystal Stacking Ring', nameAr: 'خاتم كريستال', category: 'Rings', categorySlug: 'rings', price: 320, rating: 5, reviews: 54, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 35, descAr: 'خاتم ناعم ينفع stacking.', descEn: 'Delicate crystal stacking ring.' },
  { id: 'p-r2', name: 'Statement Gold Ring', nameAr: 'خاتم statement', category: 'Rings', categorySlug: 'rings', price: 540, rating: 5, reviews: 22, image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&q=80', images: ['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 14, descAr: 'خاتم بارز للسهرات.', descEn: 'Statement ring for evenings.' },
  { id: 'p-r3', name: 'Minimal Band Ring', nameAr: 'خاتم بسيط', category: 'Rings', categorySlug: 'rings', price: 290, rating: 5, reviews: 31, image: 'https://images.unsplash.com/photo-1602751584552-8ba173e5c6d0?w=600&q=80', images: ['https://images.unsplash.com/photo-1602751584552-8ba173e5c6d0?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 20, descAr: 'خاتم بسيط دهبي — ترند daily.', descEn: 'Minimal gold-tone band ring.' },

  { id: 'p-f1', name: 'Floral Perfume 50ml', nameAr: 'برفان زهري 50ml', category: 'Perfumes', categorySlug: 'perfumes', price: 680, rating: 5, reviews: 89, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 18, descAr: 'برفان زهري خفيف وثابت.', descEn: 'Light floral perfume.' },
  { id: 'p-f2', name: 'Oud Perfume 30ml', nameAr: 'برفان عود 30ml', category: 'Perfumes', categorySlug: 'perfumes', price: 950, rating: 5, reviews: 64, image: 'https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=600&q=80', images: ['https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 12, descAr: 'برفان عود فاخر للسهرات.', descEn: 'Rich oud perfume for evenings.' },

  { id: 'p-h1', name: 'Leather Tote Bag', nameAr: 'شنطة جلد', category: 'Bags', categorySlug: 'handbags', price: 1250, rating: 5, reviews: 92, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 15, descAr: 'شنطة جلد عملية وشيك.', descEn: 'Spacious leather tote bag.' },
  { id: 'p-h2', name: 'Mini Crossbody Bag', nameAr: 'شنطة كروس', category: 'Bags', categorySlug: 'handbags', price: 890, rating: 4, reviews: 67, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 20, descAr: 'شنطة كروس صغيرة للخروجات.', descEn: 'Compact crossbody bag.' }
];

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function needsCatalogMigration(data) {
  if (!data || typeof data !== 'object') return true;
  return (data.catalogVersion || 0) < CATALOG_VERSION;
}

function applyCatalogMigration(data) {
  if (!needsCatalogMigration(data)) return { data, changed: false };

  const merged = clone(data || {});
  const version = merged.catalogVersion || 0;

  if (version < 2) {
    const defaultSlugs = new Set(categories.map(c => c.slug));
    const incomingBySlug = new Map((data?.categories || []).map(c => [c.slug, c]));
    const mergedDefaults = clone(categories).map(c => {
      const saved = incomingBySlug.get(c.slug);
      return saved ? { ...c, ...saved, id: saved.id || c.id } : c;
    });
    const customCategories = (data?.categories || [])
      .filter(c => !defaultSlugs.has(c.slug) && !REMOVED_CATEGORY_SLUGS.includes(c.slug))
      .map(c => clone(c));
    merged.categories = [...mergedDefaults, ...customCategories];

    const demoIds = new Set(products.map(p => p.id));
    const incomingProducts = new Map((data?.products || []).map(p => [p.id, p]));
    const mergedDemoProducts = clone(products).map(p => {
      const saved = incomingProducts.get(p.id);
      return saved ? { ...p, ...saved } : p;
    });
    const kept = (data?.products || [])
      .filter(p => !demoIds.has(p.id))
      .map(p => {
        const copy = clone(p);
        if (LEGACY_CATEGORY_SLUG_MAP[copy.categorySlug]) {
          copy.categorySlug = LEGACY_CATEGORY_SLUG_MAP[copy.categorySlug];
        }
        if (REMOVED_CATEGORY_SLUGS.includes(copy.categorySlug)) return null;
        return copy;
      })
      .filter(Boolean);
    merged.products = [...mergedDemoProducts, ...kept];
  }

  if (version < 3) {
    merged.categories = (merged.categories || [])
      .map(c => {
        if (REMOVED_CATEGORY_SLUGS.includes(c.slug)) return null;
        if (LEGACY_CATEGORY_SLUG_MAP[c.slug]) return { ...c, slug: LEGACY_CATEGORY_SLUG_MAP[c.slug] };
        return c;
      })
      .filter(Boolean);

    merged.products = (merged.products || [])
      .map(p => {
        const copy = clone(p);
        if (LEGACY_CATEGORY_SLUG_MAP[copy.categorySlug]) {
          copy.categorySlug = LEGACY_CATEGORY_SLUG_MAP[copy.categorySlug];
        }
        if (REMOVED_CATEGORY_SLUGS.includes(copy.categorySlug)) return null;
        return copy;
      })
      .filter(Boolean);

    if (!merged.categories.length) merged.categories = clone(categories);
    if (!merged.products.length) merged.products = clone(products);
  }

  if (version < 5) {
    const migrated = CategoryTree.migrateCatalog(merged);
    merged.categories = migrated.categories;
    merged.catalogVersion = migrated.catalogVersion;
  }

  merged.catalogVersion = CATALOG_VERSION;
  merged.settings = { ...(merged.settings || {}), ...(data?.settings || {}) };

  return { data: merged, changed: true };
}

module.exports = {
  CATALOG_VERSION,
  REMOVED_CATEGORY_SLUGS,
  LEGACY_CATEGORY_SLUG_MAP,
  categories,
  products,
  needsCatalogMigration,
  applyCatalogMigration
};
