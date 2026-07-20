/**
 * Category tree — parent/child helpers & default subcategories
 */
const CategoryTree = (() => {
  const CATALOG_SUBCATEGORY_VERSION = 7;

  const DEFAULT_TOP_LEVEL = [
    {
      id: 'cat-perfumes',
      name: 'Perfumes',
      nameAr: 'برفانات',
      slug: 'perfumes',
      sort: 5,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
      featured: true
    },
    {
      id: 'cat-handbags',
      name: 'Bags',
      nameAr: 'شنط',
      slug: 'handbags',
      sort: 6,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      featured: true
    }
  ];

  const STARTER_PRODUCTS = [
    {
      id: 'p-f1',
      name: 'Floral Perfume 50ml',
      nameAr: 'برفان زهري 50ml',
      category: 'Daily Perfumes',
      categorySlug: 'perfumes-daily',
      price: 680,
      rating: 5,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'],
      badge: 'Best Seller',
      featured: true,
      bestseller: true,
      stock: 18,
      descAr: 'برفان زهري خفيف وثابت.',
      descEn: 'Light floral perfume.'
    },
    {
      id: 'p-f2',
      name: 'Oud Perfume 30ml',
      nameAr: 'برفان عود 30ml',
      category: 'Evening Scents',
      categorySlug: 'perfumes-evening',
      price: 950,
      rating: 5,
      reviews: 64,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=600&q=80',
      images: ['https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=800&q=80'],
      badge: 'New',
      featured: true,
      bestseller: true,
      stock: 12,
      descAr: 'برفان عود فاخر للسهرات.',
      descEn: 'Rich oud perfume for evenings.'
    },
    {
      id: 'p-h1',
      name: 'Leather Tote Bag',
      nameAr: 'شنطة جلد',
      category: 'Tote Bags',
      categorySlug: 'handbags-tote',
      price: 1250,
      rating: 5,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'],
      badge: 'Best Seller',
      featured: true,
      bestseller: true,
      stock: 15,
      descAr: 'شنطة جلد عملية وشيك.',
      descEn: 'Spacious leather tote bag.'
    },
    {
      id: 'p-h2',
      name: 'Mini Crossbody Bag',
      nameAr: 'شنطة كروس',
      category: 'Crossbody Bags',
      categorySlug: 'handbags-crossbody',
      price: 890,
      rating: 4,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
      badge: 'New',
      featured: true,
      bestseller: false,
      stock: 20,
      descAr: 'شنطة كروس صغيرة للخروجات.',
      descEn: 'Compact crossbody bag.'
    }
  ];

  const SUBCATEGORY_KEYWORDS = {
    necklaces: [
      { slug: 'necklaces-summer', keys: ['صيف', 'summer'] },
      { slug: 'necklaces-trendy', keys: ['ترند', 'trend', 'trendy'] },
      { slug: 'necklaces-simple', keys: ['سنبل', 'simple', 'minimal', 'na'] },
      { slug: 'necklaces-statement', keys: ['استرس', 'statement', 'bold'] },
      { slug: 'necklaces-layered', keys: ['طبقات', 'layer', 'layered'] },
      { slug: 'necklaces-pendant', keys: ['دلاية', 'pendant', 'charm'] }
    ],
    bracelets: [
      { slug: 'bracelets-pearl', keys: ['لؤلؤ', 'pearl'] },
      { slug: 'bracelets-statement', keys: ['كف', 'cuff', 'statement', 'ستايل'] },
      { slug: 'bracelets-stack', keys: ['طقم', 'stack', 'bangle'] },
      { slug: 'bracelets-minimal', keys: ['minimal', 'ناعم', 'na'] }
    ],
    accessories: [
      { slug: 'earrings-hoop', keys: ['هوب', 'hoop'] },
      { slug: 'earrings-zircon', keys: ['zircon', 'zircon', 'زيركون'] },
      { slug: 'earrings-summer', keys: ['صيف', 'summer'] },
      { slug: 'earrings-korean', keys: ['كوري', 'korean'] },
      { slug: 'earrings-evening', keys: ['سواريه', 'evening', 'drop'] },
      { slug: 'earrings-set', keys: ['طقم', 'set', 'مجموعة'] }
    ],
    rings: [
      { slug: 'rings-statement', keys: ['statement', 'استرس', 'بارز'] },
      { slug: 'rings-stack', keys: ['stack', 'stacking', 'staak', 'ستاك', 'crystal'] },
      { slug: 'rings-trend', keys: ['ترند', 'trend'] },
      { slug: 'rings-daily', keys: ['daily', 'يوم', 'بسيط', 'minimal', 'band'] }
    ],
    perfumes: [
      { slug: 'perfumes-evening', keys: ['oud', 'عود', 'evening', 'مساء', 'سهر'] },
      { slug: 'perfumes-gift', keys: ['gift', 'هد', 'set', 'طقم'] },
      { slug: 'perfumes-daily', keys: ['floral', 'زهر', 'daily', 'يوم', '50ml', '30ml', 'برفان'] }
    ],
    handbags: [
      { slug: 'handbags-crossbody', keys: ['cross', 'كروس', 'crossbody'] },
      { slug: 'handbags-mini', keys: ['mini', 'ميني', 'small', 'صغير'] },
      { slug: 'handbags-tote', keys: ['tote', 'جلد', 'leather', 'كبير', 'large', 'شنطة'] }
    ]
  };

  const PARENT_SLUGS = ['necklaces', 'bracelets', 'accessories', 'rings', 'perfumes', 'handbags'];

  const SUBCATEGORY_TEMPLATES = {
    necklaces: [
      { slug: 'necklaces-summer', name: 'Summer Necklaces', nameAr: 'سلاسل صيفي', sort: 1 },
      { slug: 'necklaces-trendy', name: 'Trendy Necklaces', nameAr: 'سلاسل ترندي', sort: 2 },
      { slug: 'necklaces-simple', name: 'Simple Necklaces', nameAr: 'سلاسل سنبل', sort: 3 },
      { slug: 'necklaces-statement', name: 'Statement Necklaces', nameAr: 'سلاسل استرس', sort: 4 },
      { slug: 'necklaces-layered', name: 'Layered Necklaces', nameAr: 'سلاسل طبقات', sort: 5 },
      { slug: 'necklaces-pendant', name: 'Pendant Necklaces', nameAr: 'سلاسل دلايات', sort: 6 }
    ],
    bracelets: [
      { slug: 'bracelets-minimal', name: 'Minimal Bracelets', nameAr: 'أساور ناعمة', sort: 1 },
      { slug: 'bracelets-statement', name: 'Statement Bracelets', nameAr: 'أساور ستايل', sort: 2 },
      { slug: 'bracelets-stack', name: 'Stack Sets', nameAr: 'أطقم أساور', sort: 3 },
      { slug: 'bracelets-pearl', name: 'Pearl Bracelets', nameAr: 'أساور لؤلؤ', sort: 4 }
    ],
    accessories: [
      { slug: 'earrings-set', name: 'Earring Sets', nameAr: 'حلقان مجموعة', sort: 1 },
      { slug: 'earrings-zircon', name: 'Zircon Earrings', nameAr: 'حلقان زircon', sort: 2 },
      { slug: 'earrings-summer', name: 'Summer Earrings', nameAr: 'حلقان صيفي', sort: 3 },
      { slug: 'earrings-korean', name: 'Korean Earrings', nameAr: 'حلقان كوري', sort: 4 },
      { slug: 'earrings-evening', name: 'Evening Earrings', nameAr: 'حلقان سواريه', sort: 5 },
      { slug: 'earrings-hoop', name: 'Hoop Earrings', nameAr: 'حلق هوب', sort: 6 }
    ],
    rings: [
      { slug: 'rings-daily', name: 'Daily Rings', nameAr: 'خواتم يومية', sort: 1 },
      { slug: 'rings-trend', name: 'Trendy Rings', nameAr: 'خواتم ترند', sort: 2 },
      { slug: 'rings-stack', name: 'Stackable Rings', nameAr: 'خواتم ستاك', sort: 3 },
      { slug: 'rings-statement', name: 'Statement Rings', nameAr: 'خواتم استرس', sort: 4 }
    ],
    perfumes: [
      { slug: 'perfumes-daily', name: 'Daily Perfumes', nameAr: 'برفانات يومية', sort: 1 },
      { slug: 'perfumes-evening', name: 'Evening Scents', nameAr: 'روائح مسائية', sort: 2 },
      { slug: 'perfumes-gift', name: 'Perfume Gifts', nameAr: 'هدايا عطور', sort: 3 }
    ],
    handbags: [
      { slug: 'handbags-crossbody', name: 'Crossbody Bags', nameAr: 'شنط كروس', sort: 1 },
      { slug: 'handbags-mini', name: 'Mini Bags', nameAr: 'شنط ميني', sort: 2 },
      { slug: 'handbags-tote', name: 'Tote Bags', nameAr: 'شنط كبيرة', sort: 3 }
    ]
  };

  function sortCategories(categories) {
    return [...categories].sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
  }

  function getBySlug(categories, slug) {
    if (!slug) return null;
    const list = categories || [];
    const exact = list.filter(c => c.slug === slug);
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) {
      // Prefer the top-level category when legacy children reuse the parent slug.
      return exact.find(c => !c.parentId) || exact[0];
    }
    return list.find(c => c.nameAr === slug || c.name === slug) || null;
  }

  function getById(categories, id) {
    return (categories || []).find(c => c.id === id) || null;
  }

  function getTopLevel(categories) {
    return sortCategories((categories || []).filter(c => !c.parentId));
  }

  function getChildren(categories, parentId) {
    if (!parentId) return [];
    return sortCategories((categories || []).filter(c => c.parentId === parentId));
  }

  function getParent(categories, category) {
    if (!category?.parentId) return null;
    return getById(categories, category.parentId);
  }

  function categoryAliases(cat) {
    const set = new Set();
    if (!cat) return set;
    if (cat.slug) set.add(cat.slug);
    if (cat.nameAr) set.add(cat.nameAr);
    if (cat.name) set.add(cat.name);
    return set;
  }

  function collectFilterSlugsById(categories, catId, seen = new Set()) {
    if (!catId || seen.has(catId)) return new Set();
    seen.add(catId);
    const cat = getById(categories, catId);
    if (!cat) return new Set();
    const slugs = categoryAliases(cat);
    getChildren(categories, cat.id).forEach(child => {
      collectFilterSlugsById(categories, child.id, seen).forEach(s => slugs.add(s));
    });
    return slugs;
  }

  function getFilterSlugs(categories, slug) {
    const cat = getBySlug(categories, slug);
    if (!cat) {
      const slugs = new Set([slug]);
      (categories || []).forEach(c => {
        if (c.slug.startsWith(`${slug}-`)) slugs.add(c.slug);
      });
      return slugs;
    }
    // Walk by id so duplicate child slugs cannot recurse forever.
    return collectFilterSlugsById(categories, cat.id);
  }

  function isDescendantOf(categories, slug, ancestorSlug) {
    if (!slug || !ancestorSlug) return false;
    if (slug === ancestorSlug) return true;
    let cat = getBySlug(categories, slug);
    const seen = new Set();
    while (cat?.parentId && !seen.has(cat.id)) {
      seen.add(cat.id);
      const parent = getById(categories, cat.parentId);
      if (!parent) break;
      if (parent.slug === ancestorSlug || parent.nameAr === ancestorSlug || parent.name === ancestorSlug) return true;
      cat = parent;
    }
    return false;
  }

  function flattenForAdmin(categories) {
    const rows = [];
    getTopLevel(categories).forEach(parent => {
      rows.push({ category: parent, depth: 0 });
      getChildren(categories, parent.id).forEach(child => {
        rows.push({ category: child, depth: 1 });
      });
    });
    (categories || []).filter(c => {
      if (!c.parentId) return false;
      return !getById(categories, c.parentId);
    }).forEach(orphan => rows.push({ category: orphan, depth: 1 }));
    return rows;
  }

  function buildProductSelectOptions(categories, selectedSlug = '') {
    const selected = getBySlug(categories, selectedSlug);
    const parts = [];
    getTopLevel(categories).forEach(parent => {
      const children = getChildren(categories, parent.id);
      const parentLabel = parent.nameAr || parent.name;
      if (children.length) {
        parts.push(`<optgroup label="${parentLabel}">`);
        children.forEach(child => {
          const label = child.nameAr || child.name;
          const sel = selected?.id === child.id ? ' selected' : '';
          parts.push(`<option value="${child.slug}"${sel}>${label}</option>`);
        });
        parts.push('</optgroup>');
      }
      const sel = selected?.id === parent.id ? ' selected' : '';
      parts.push(`<option value="${parent.slug}"${sel}>${parentLabel}</option>`);
    });
    return parts.join('');
  }

  function buildParentSelectOptions(categories, selectedParentId = '', editingId = '') {
    const noneSel = !selectedParentId ? ' selected' : '';
    let html = `<option value=""${noneSel}>—</option>`;
    getTopLevel(categories).forEach(parent => {
      if (parent.id === editingId) return;
      const label = parent.nameAr || parent.name;
      const sel = selectedParentId === parent.id ? ' selected' : '';
      html += `<option value="${parent.id}"${sel}>${label}</option>`;
    });
    return html;
  }

  function productSearchText(product) {
    return [
      product.name,
      product.nameAr,
      product.descEn,
      product.descAr,
      product.category
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function resolveSubcategorySlug(product, categories) {
    const current = getBySlug(categories, product.categorySlug);
    if (current?.parentId) return product.categorySlug;

    const parentSlug = PARENT_SLUGS.includes(product.categorySlug)
      ? product.categorySlug
      : getParent(categories, current)?.slug;
    if (!parentSlug) return product.categorySlug;

    const parent = getBySlug(categories, parentSlug);
    const children = getChildren(categories, parent?.id);
    if (!children.length) return product.categorySlug;

    const text = productSearchText(product);
    const rules = SUBCATEGORY_KEYWORDS[parentSlug] || [];
    for (const rule of rules) {
      if (rule.keys.some(key => text.includes(String(key).toLowerCase()))) {
        return rule.slug;
      }
    }

    let hash = 0;
    for (let i = 0; i < String(product.id).length; i += 1) {
      hash = ((hash << 5) - hash) + String(product.id).charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % children.length;
    return children[idx].slug;
  }

  function syncProductCategory(product, categories, slug) {
    const cat = getBySlug(categories, slug);
    product.categorySlug = slug;
    if (cat) product.category = cat.name;
  }

  function hasProductsInBranch(products, categories, parentSlug) {
    const allowed = getFilterSlugs(categories, parentSlug);
    return products.some(p => allowed.has(p.categorySlug));
  }

  function ensureStarterProducts(merged) {
    const products = merged.products || [];
    const categories = merged.categories || [];
    const existingIds = new Set(products.map(p => p.id));

    if (!hasProductsInBranch(products, categories, 'perfumes')) {
      STARTER_PRODUCTS.filter(p => p.id.startsWith('p-f')).forEach(starter => {
        if (!existingIds.has(starter.id)) {
          products.push(JSON.parse(JSON.stringify(starter)));
          existingIds.add(starter.id);
        }
      });
    }

    if (!hasProductsInBranch(products, categories, 'handbags')) {
      STARTER_PRODUCTS.filter(p => p.id.startsWith('p-h')).forEach(starter => {
        if (!existingIds.has(starter.id)) {
          products.push(JSON.parse(JSON.stringify(starter)));
          existingIds.add(starter.id);
        }
      });
    }

    merged.products = products;
  }

  function assignProductsToSubcategories(products, categories) {
    (products || []).forEach(product => {
      const nextSlug = resolveSubcategorySlug(product, categories);
      if (nextSlug && nextSlug !== product.categorySlug) {
        syncProductCategory(product, categories, nextSlug);
      }
    });
  }

  function ensureDefaultParents(categories) {
    const existingSlugs = new Set(categories.map(c => c.slug));
    DEFAULT_TOP_LEVEL.forEach(parent => {
      if (existingSlugs.has(parent.slug)) return;
      categories.push({ ...parent, parentId: null });
      existingSlugs.add(parent.slug);
    });
  }

  function ensureSubcategories(categories) {
    const existingSlugs = new Set(categories.map(c => c.slug));
    const parentBySlug = new Map(getTopLevel(categories).map(c => [c.slug, c]));

    Object.entries(SUBCATEGORY_TEMPLATES).forEach(([parentSlug, templates]) => {
      const parent = parentBySlug.get(parentSlug);
      if (!parent) return;
      templates.forEach((tpl, idx) => {
        const existing = categories.find(c => c.slug === tpl.slug);
        if (existing) {
          if (!existing.parentId) existing.parentId = parent.id;
          return;
        }
        categories.push({
          id: `cat-${tpl.slug}`,
          parentId: parent.id,
          name: tpl.name,
          nameAr: tpl.nameAr,
          slug: tpl.slug,
          sort: tpl.sort ?? idx + 1,
          image: parent.image || '',
          featured: false
        });
        existingSlugs.add(tpl.slug);
      });
    });
  }

  /** Relink products saved with Arabic/legacy names onto the real category slug. */
  function repairProductCategoryLinks(products, categories) {
    const bySlug = new Map();
    const byNameAr = new Map();
    const byName = new Map();
    (categories || []).forEach(c => {
      if (c.slug) bySlug.set(c.slug, c);
      if (c.nameAr) byNameAr.set(c.nameAr, c);
      if (c.name) byName.set(c.name, c);
    });
    const EXTRA = {
      'بروش': 'brooch',
      'بيرسينج': 'piercing',
      'خلخال': 'anklet',
      'ساعات': 'watches',
      'حلقان': 'earrings',
      eeee: 'piercing',
      'bracelets-hand chain': 'bracelets-hand-chain'
    };
    let changed = false;
    (products || []).forEach(p => {
      const slug = p.categorySlug || '';
      let cat = bySlug.get(slug);
      if (!cat && EXTRA[slug]) cat = bySlug.get(EXTRA[slug]);
      if (!cat) cat = byNameAr.get(slug) || byName.get(slug);
      if (!cat && p.category) {
        cat = byNameAr.get(p.category) || byName.get(p.category) || bySlug.get(p.category);
      }
      if (!cat) return;
      if (p.categorySlug === cat.slug && (p.category === cat.name || p.category === cat.nameAr)) return;
      p.categorySlug = cat.slug;
      p.category = cat.name || cat.nameAr;
      changed = true;
    });
    return changed;
  }

  function migrateCatalog(data) {
    const version = data?.catalogVersion || 0;
    const merged = JSON.parse(JSON.stringify(data || {}));
    merged.products = merged.products || [];
    merged.categories = (merged.categories || []).map(c => ({
      ...c,
      parentId: c.parentId || null
    }));

    if (version < CATALOG_SUBCATEGORY_VERSION) {
      if (version < 5) {
        ensureDefaultParents(merged.categories);
        ensureSubcategories(merged.categories);
      }

      if (version < 6) {
        ensureStarterProducts(merged);
        assignProductsToSubcategories(merged.products, merged.categories);
      }

      if (version < 7) {
        ensureDefaultParents(merged.categories);
        ensureSubcategories(merged.categories);
        assignProductsToSubcategories(merged.products, merged.categories);
      }

      merged.catalogVersion = CATALOG_SUBCATEGORY_VERSION;
    }

    // Always safe / idempotent — fixes Arabic-name categorySlug orphans.
    repairProductCategoryLinks(merged.products, merged.categories);
    return merged;
  }

  return {
    CATALOG_SUBCATEGORY_VERSION,
    SUBCATEGORY_TEMPLATES,
    sortCategories,
    getBySlug,
    getById,
    getTopLevel,
    getChildren,
    getParent,
    getFilterSlugs,
    isDescendantOf,
    flattenForAdmin,
    buildProductSelectOptions,
    buildParentSelectOptions,
    ensureStarterProducts,
    assignProductsToSubcategories,
    repairProductCategoryLinks,
    migrateCatalog
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CategoryTree;
}
