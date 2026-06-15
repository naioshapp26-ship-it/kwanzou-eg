/**
 * LUMIÈRE — Central data store (localStorage)
 */
const LumiereStore = (() => {
  const KEY = 'kwanzou_store_v5';

  const defaults = {
    settings: {
      brandName: 'Kwanzou EG',
      logo: 'assets/logo.png',
      tagline: 'Kwanzou EG — Made to complete your elegance',
      taglineAr: 'Kwanzou EG، صُنعت لتُكمّل أناقتك',
      taglineEn: 'Kwanzou EG — Made to complete your elegance',
      subtitle: 'Discover exquisite jewelry, luxury handbags, and signature accessories.',
      subtitleAr: 'شوف أحلى دهب، شنط، وإكسسوارات من Kwanzou EG.',
      subtitleEn: 'Discover exquisite jewelry, luxury handbags, and signature accessories from Kwanzou EG.',
      announcement: 'Free shipping across Egypt on orders over 1,500 EGP',
      announcementAr: 'شحن مجاني لجميع أنحاء مصر للطلبات فوق 1,500 جنيه',
      announcementEn: 'Free shipping across Egypt on orders over 1,500 EGP',
      heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85',
      heroAccent1: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=650&q=80',
      heroAccent2: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=650&q=80',
      currency: 'EGP',
      currencySymbol: 'ج.م'
    },
    categories: [
      { id: 'cat-1', name: 'Jewelry', slug: 'jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', featured: true },
      { id: 'cat-2', name: 'Necklaces', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', featured: false },
      { id: 'cat-3', name: 'Earrings', slug: 'earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', featured: false },
      { id: 'cat-4', name: 'Handbags', slug: 'handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', featured: true },
      { id: 'cat-5', name: 'Watches', slug: 'watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', featured: false },
      { id: 'cat-6', name: 'Scarves & Silk', slug: 'scarves', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80', featured: false },
      { id: 'cat-7', name: 'Sunglasses', slug: 'sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', featured: false },
      { id: 'cat-8', name: 'New Arrivals', slug: 'new-arrivals', image: 'https://images.unsplash.com/photo-1492707896669-8dd329a169e8?w=600&q=80', featured: true }
    ],
    products: [
      { id: 'p1', name: 'Étoile Diamond Necklace', nameAr: 'سلسلة دياموند', category: 'Necklaces', categorySlug: 'necklaces', price: 8900, rating: 5, reviews: 84, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=800&q=80','https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 12, descAr: 'قلادة فاخرة مرصعة بأحجار زirconia لامعة، مطلية بالذهب عيار 18. مثالية للمناسبات الخاصة.', descEn: 'Luxury necklace with brilliant zirconia stones, 18K gold plated. Perfect for special occasions.' },
      { id: 'p2', name: 'Pearl Cascade Earrings', nameAr: 'أقراط اللؤلؤ المت cascading', category: 'Earrings', categorySlug: 'earrings', price: 4200, rating: 5, reviews: 156, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'], badge: '', featured: true, bestseller: true, stock: 24, descAr: 'أقراط لؤلؤ طبيعي بتصميم متدرج أنيق.', descEn: 'Natural pearl earrings with elegant cascade design.' },
      { id: 'p3', name: 'Maison Leather Tote', nameAr: 'حقيبة ماison الجلدية', category: 'Handbags', categorySlug: 'handbags', price: 12500, rating: 5, reviews: 92, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 8, descAr: 'حقيبة يد جلد إيطالي فاخر مع تفاصيل ذهبية.', descEn: 'Premium Italian leather tote with gold details.' },
      { id: 'p4', name: 'Rose Gold Bangle Set', nameAr: 'طقم أساور ذهب وردي', category: 'Jewelry', categorySlug: 'jewelry', price: 5800, rating: 4, reviews: 67, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'], badge: '', featured: true, bestseller: false, stock: 18, descAr: 'طقم 3 أساور مطلية بذهب وردي.', descEn: 'Set of 3 rose gold plated bangles.' },
      { id: 'p5', name: 'Silk Monogram Scarf', nameAr: 'وشاح حرير مونogram', category: 'Scarves & Silk', categorySlug: 'scarves', price: 1950, rating: 5, reviews: 203, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'], badge: '', featured: false, bestseller: true, stock: 35, descAr: 'وشاح حرير 100% بطبعة أنيقة.', descEn: '100% silk scarf with elegant monogram print.' },
      { id: 'p6', name: 'Classic Watch', nameAr: 'ساعة كلاسيكية', category: 'Watches', categorySlug: 'watches', price: 21000, rating: 5, reviews: 41, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80'], badge: 'Limited', featured: false, bestseller: true, stock: 5, descAr: 'ساعة يد فاخرة بحركة سويسرية.', descEn: 'Luxury wristwatch with Swiss movement.' },
      { id: 'p7', name: 'Aviator Gold Sunglasses', nameAr: 'نظارة أفياتور ذهبية', category: 'Sunglasses', categorySlug: 'sunglasses', price: 3400, rating: 4, reviews: 78, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'], badge: '', featured: false, bestseller: true, stock: 15, descAr: 'نظارة شمسية UV400 بإطار ذهبي.', descEn: 'UV400 sunglasses with gold frame.' },
      { id: 'p8', name: 'Crystal Drop Ring', nameAr: 'خاتم كريستال', category: 'Jewelry', categorySlug: 'jewelry', price: 7200, rating: 5, reviews: 112, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'], badge: 'New', featured: false, bestseller: true, stock: 10, descAr: 'خاتم كريستال SWAROVSKI بتصميم drop.', descEn: 'SWAROVSKI crystal drop ring design.' }
    ],
    collections: [
      { id: 'col-1', label: 'Collection 01', labelAr: 'المجموعة 01', labelEn: 'Collection 01', title: 'Signature\nJewelry', titleAr: 'مجوهرات\nالتوقيع', titleEn: 'Signature\nJewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80' },
      { id: 'col-2', label: 'Collection 02', labelAr: 'المجموعة 02', labelEn: 'Collection 02', title: 'Luxury\nHandbags', titleAr: 'حقائب\nفاخرة', titleEn: 'Luxury\nHandbags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80' },
      { id: 'col-3', label: 'Collection 03', labelAr: 'المجموعة 03', labelEn: 'Collection 03', title: 'Evening\nAccessories', titleAr: 'إكسسوارات\nالمساء', titleEn: 'Evening\nAccessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d9e7b2?w=1200&q=80' }
    ],
    testimonials: [
      { id: 't1', name: 'Sophia Laurent', location: 'Paris, France', text: 'The jewelry quality is extraordinary. Every piece feels like a heirloom — LUMIÈRE is my absolute favorite for accessories.', textAr: 'جودة المجوهرات استثنائية. كل قطعة تبدو كإرث عائلي — لوميère المفضلة لدي للإكسسوارات.', textEn: 'The jewelry quality is extraordinary. Every piece feels like a heirloom — LUMIÈRE is my absolute favorite for accessories.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', featured: false },
      { id: 't2', name: 'Amara Chen', location: 'New York, USA', text: 'I\'ve collected handbags from every luxury house, and LUMIÈRE\'s craftsmanship rivals them all.', textAr: 'جمعت حقائب من كل بيوت الأزياء الفاخرة، وحرفية لوميère تنافسهم جميعاً.', textEn: 'I\'ve collected handbags from every luxury house, and LUMIÈRE\'s craftsmanship rivals them all.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', featured: true },
      { id: 't3', name: 'Layla Al-Rashid', location: 'Dubai, UAE', text: 'Fast shipping, authentic products, and the most beautiful accessories I\'ve ever owned.', textAr: 'شحن سريع، منتجات أصلية، وأجمل إكسسوارات امتلكتها على الإطلاق.', textEn: 'Fast shipping, authentic products, and the most beautiful accessories I\'ve ever owned.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', featured: false }
    ],
    users: [
      { id: 'u-admin', name: 'Super Admin', email: 'admin@lumiere.com', password: 'admin123', role: 'superadmin', phone: '+1 800 555 0001', createdAt: '2024-01-01' },
      { id: 'u-demo', name: 'Sarah Mitchell', email: 'customer@lumiere.com', password: 'demo123', role: 'customer', phone: '+1 555 0123', createdAt: '2025-03-15', wishlist: ['p2', 'p3'], orders: [
        { id: 'ORD-1001', date: '2025-11-20', total: 890, status: 'Delivered', items: [{ name: 'Étoile Diamond Necklace', qty: 1 }] },
        { id: 'ORD-1042', date: '2026-01-08', total: 420, status: 'Shipped', items: [{ name: 'Pearl Cascade Earrings', qty: 1 }] }
      ]}
    ],
    orders: [],
    newsletter: [],
    cart: {}
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeDefaults(data) {
    const merged = clone(defaults);
    if (!data || typeof data !== 'object') return merged;
    merged.settings = { ...merged.settings, ...(data.settings || {}) };
    merged.settings.tagline = defaults.settings.tagline;
    merged.settings.taglineAr = defaults.settings.taglineAr;
    merged.settings.taglineEn = defaults.settings.taglineEn;
    merged.settings.heroAccent1 = defaults.settings.heroAccent1;
    merged.settings.heroAccent2 = defaults.settings.heroAccent2;
    merged.categories = (data.categories && data.categories.length)
      ? data.categories.map((c, i) => ({
          ...c,
          slug: c.slug || (c.name || '').toLowerCase().replace(/\s.*/,''),
          image: c.image || defaults.categories[i % defaults.categories.length].image
        }))
      : merged.categories;
    merged.products = (data.products && data.products.length)
      ? data.products.map(p => ({
          ...p,
          categorySlug: p.categorySlug || (p.category || '').toLowerCase().split(' ')[0],
          image: p.image || defaults.products[0].image,
          price: p.price || 0
        }))
      : merged.products;
    merged.collections = (data.collections && data.collections.length) ? data.collections : merged.collections;
    merged.testimonials = (data.testimonials && data.testimonials.length) ? data.testimonials : merged.testimonials;
    merged.users = (data.users && data.users.length) ? data.users : merged.users;
    merged.newsletter = data.newsletter || [];
    merged.orders = data.orders || [];
    merged.cart = data.cart || {};
    return merged;
  }

  let _cache = null;
  let _apiMode = false;
  let _ready = null;

  async function syncToApi(data) {
    if (!_apiMode) return;
    try {
      await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Store API sync failed:', err);
    }
  }

  function init() {
    if (!_ready) {
      _ready = (async () => {
        try {
          const res = await fetch('/api/store');
          if (res.ok) {
            _cache = mergeDefaults(await res.json());
            _apiMode = true;
            localStorage.setItem(KEY, JSON.stringify(_cache));
            return _cache;
          }
        } catch (_) {}
        _cache = loadLocal();
        return _cache;
      })();
    }
    return _ready;
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return mergeDefaults(parsed);
      }
    } catch (_) {}
    const fresh = clone(defaults);
    save(fresh);
    return fresh;
  }

  function save(data) {
    _cache = data;
    localStorage.setItem(KEY, JSON.stringify(data));
    syncToApi(data);
  }

  function get() {
    if (_cache) return _cache;
    _cache = loadLocal();
    return _cache;
  }

  function update(fn) {
    const data = get();
    fn(data);
    save(data);
    return data;
  }

  async function reset() {
    localStorage.removeItem(KEY);
    _cache = clone(defaults);
    localStorage.setItem(KEY, JSON.stringify(_cache));
    await syncToApi(_cache);
    return _cache;
  }

  function findUser(email) {
    return get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  function findUserById(id) {
    return get().users.find(u => u.id === id);
  }

  function addUser(user) {
    return update(data => {
      user.id = 'u-' + Date.now();
      user.createdAt = new Date().toISOString().split('T')[0];
      user.role = 'customer';
      user.wishlist = user.wishlist || [];
      user.orders = user.orders || [];
      data.users.push(user);
    });
  }

  function updateUser(id, patch) {
    return update(data => {
      const idx = data.users.findIndex(u => u.id === id);
      if (idx !== -1) Object.assign(data.users[idx], patch);
    });
  }

  function deleteUser(id) {
    return update(data => {
      data.users = data.users.filter(u => u.id !== id);
    });
  }

  function addProduct(product) {
    return update(data => {
      product.id = 'p' + Date.now();
      data.products.push(product);
    });
  }

  function updateProduct(id, patch) {
    return update(data => {
      const idx = data.products.findIndex(p => p.id === id);
      if (idx !== -1) Object.assign(data.products[idx], patch);
    });
  }

  function deleteProduct(id) {
    return update(data => {
      data.products = data.products.filter(p => p.id !== id);
    });
  }

  function updateSettings(patch) {
    return update(data => Object.assign(data.settings, patch));
  }

  function addCategory(cat) {
    return update(data => {
      cat.id = 'cat-' + Date.now();
      data.categories.push(cat);
    });
  }

  function updateCategory(id, patch) {
    return update(data => {
      const idx = data.categories.findIndex(c => c.id === id);
      if (idx !== -1) Object.assign(data.categories[idx], patch);
    });
  }

  function deleteCategory(id) {
    return update(data => {
      data.categories = data.categories.filter(c => c.id !== id);
    });
  }

  function updateCollection(id, patch) {
    return update(data => {
      const idx = data.collections.findIndex(c => c.id === id);
      if (idx !== -1) Object.assign(data.collections[idx], patch);
    });
  }

  function updateTestimonial(id, patch) {
    return update(data => {
      const idx = data.testimonials.findIndex(t => t.id === id);
      if (idx !== -1) Object.assign(data.testimonials[idx], patch);
    });
  }

  function addNewsletter(email) {
    return update(data => {
      if (!data.newsletter.includes(email)) data.newsletter.push(email);
    });
  }

  return {
    get, update, reset, defaults, init,
    findUser, findUserById, addUser, updateUser, deleteUser,
    addProduct, updateProduct, deleteProduct,
    updateSettings, addCategory, updateCategory, deleteCategory,
    updateCollection, updateTestimonial, addNewsletter
  };
})();

if (typeof module !== 'undefined') module.exports = LumiereStore;
