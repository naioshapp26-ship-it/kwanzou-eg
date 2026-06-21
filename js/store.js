/**
 * LUMIÈRE — Central data store (localStorage)
 */
const LumiereStore = (() => {
  const KEY = 'kwanzou_store_v12';
  const CATALOG_VERSION = 3;

  const defaults = {
    catalogVersion: CATALOG_VERSION,
    settings: {
      brandName: 'Kwanzou EG',
      logo: 'assets/logo.png',
      theme: {
        primary: '#2C2420',
        accent: '#C9A962',
        accentLight: '#D4BC7A',
        accentDark: '#A8893E',
        background: '#FAF8F5',
        cream: '#F5F0EB',
        textSecondary: '#6B5E54'
      },
      heroEyebrowCityAr: 'الإسكندرية',
      heroEyebrowCityEn: 'Alexandria',
      heroEyebrowNoteAr: 'توصيل لجميع أنحاء مصر',
      heroEyebrowNoteEn: 'Delivery across all of Egypt',
      tagline: 'Kwanzou EG — Made to complete your elegance',
      taglineAr: 'Kwanzou EG — إكسسوارات ودهب على ذوقك',
      taglineEn: 'Kwanzou EG — Made to complete your elegance',
      subtitle: 'Discover exquisite jewelry, luxury handbags, and signature accessories.',
      subtitleAr: 'شوف أحلى دهب، شنط، وإكسسوارات من Kwanzou EG.',
      subtitleEn: 'Discover exquisite jewelry, luxury handbags, and signature accessories from Kwanzou EG.',
      announcement: 'Free shipping across Egypt on orders over 1,500 EGP',
      announcementAr: 'توصيل مجاني لكل مصر على الطلبات فوق 1,500 ج.م',
      announcementEn: 'Free shipping across Egypt on orders over 1,500 EGP',
      heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85',
      heroAccent1: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=650&q=80',
      heroAccent2: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=650&q=80',
      promoImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=85',
      authVisualImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
      instaHandle: '@kwanzou.eg',
      instaUrl: 'https://instagram.com/kwanzou.eg',
      currency: 'EGP',
      currencySymbol: 'ج.م',
      freeShippingThreshold: 1500,
      heroTypography: {
        eyebrow: { font: 'cairo', size: 0.82, weight: 600 },
        brand: { font: 'cormorant', size: 3.25, weight: 600 },
        tagline: { font: 'cairo', size: 1.05, weight: 500 },
        subtitle: { font: 'cairo', size: 0.95, weight: 400 }
      }
    },
    categories: [
      { id: 'cat-necklaces', name: 'Necklaces', nameAr: 'سلاسل', slug: 'necklaces', sort: 1, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', featured: true },
      { id: 'cat-bracelets', name: 'Bracelets', nameAr: 'أساور', slug: 'bracelets', sort: 2, image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80', featured: true },
      { id: 'cat-accessories', name: 'Earrings', nameAr: 'حلقان', slug: 'accessories', sort: 3, image: 'https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=800&q=80', featured: true },
      { id: 'cat-rings', name: 'Rings', nameAr: 'خواتم', slug: 'rings', sort: 4, image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800&q=80', featured: true },
      { id: 'cat-perfumes', name: 'Perfumes', nameAr: 'برفانات', slug: 'perfumes', sort: 5, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', featured: true },
      { id: 'cat-handbags', name: 'Bags', nameAr: 'شنط', slug: 'handbags', sort: 6, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', featured: true }
    ],
    products: [
      { id: 'p-n1', name: 'Layered Gold Chain', nameAr: 'سلسلة طبقات دهب', category: 'Necklaces', categorySlug: 'necklaces', price: 520, rating: 5, reviews: 84, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 30, descAr: 'سلسلة طبقات ترند، شكلها شيك على الرقبة.', descEn: 'Trendy layered chain necklace.' },
      { id: 'p-n2', name: 'Charm Pendant Necklace', nameAr: 'سلسلة دلاية دهب', category: 'Necklaces', categorySlug: 'necklaces', price: 410, rating: 5, reviews: 52, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 22, descAr: 'دلاية ناعمة بتكمل أي لوك يومي.', descEn: 'Delicate charm pendant for daily wear.' },
      { id: 'p-n3', name: 'Zircon Pendant Chain', nameAr: 'سلسلة zircon', category: 'Necklaces', categorySlug: 'necklaces', price: 480, rating: 5, reviews: 38, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 18, descAr: 'سلسلة لامعة بحجر zircon — ترند السهرات.', descEn: 'Sparkling zircon pendant chain.' },
      { id: 'p-b1', name: 'Pearl Bracelet', nameAr: 'اسورة لؤلؤ', category: 'Bracelets', categorySlug: 'bracelets', price: 380, rating: 5, reviews: 73, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 28, descAr: 'اسورة لؤلؤ كلاسيك على المعصم.', descEn: 'Classic pearl bracelet.' },
      { id: 'p-b2', name: 'Gold Cuff Bracelet', nameAr: 'اسورة كف دهب', category: 'Bracelets', categorySlug: 'bracelets', price: 460, rating: 5, reviews: 41, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 18, descAr: 'اسورة كف bold — ترند أوي.', descEn: 'Bold gold-tone cuff bracelet.' },
      { id: 'p-b3', name: 'Stacked Bangle Set', nameAr: 'طقم اساور', category: 'Bracelets', categorySlug: 'bracelets', price: 350, rating: 5, reviews: 29, image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80', images: ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 24, descAr: 'طقم اساور رفيعة — شكلها حلو مع الساعة.', descEn: 'Stacked slim bangles set.' },
      { id: 'p-e1', name: 'Gold Hoop Earrings', nameAr: 'حلق هوب دهب', category: 'Accessories', categorySlug: 'accessories', price: 280, rating: 5, reviews: 156, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 45, descAr: 'حلق هوب خفيف — ترند كل يوم.', descEn: 'Lightweight gold-tone hoop earrings.' },
      { id: 'p-e2', name: 'Zircon Drop Earrings', nameAr: 'حلق zircon', category: 'Accessories', categorySlug: 'accessories', price: 320, rating: 5, reviews: 88, image: 'https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=600&q=80', images: ['https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 32, descAr: 'حلق نازل بحجر لامع — شكل بنت لابساه.', descEn: 'Zircon drop earrings with a dressy look.' },
      { id: 'p-e3', name: 'Pearl Stud Earrings', nameAr: 'حلق لؤلؤ', category: 'Accessories', categorySlug: 'accessories', price: 260, rating: 5, reviews: 64, image: 'https://images.unsplash.com/photo-1488799812881-957129749661?w=600&q=80', images: ['https://images.unsplash.com/photo-1488799812881-957129749661?w=800&q=80'], badge: '', featured: true, bestseller: false, stock: 40, descAr: 'حلق لؤلؤ كلاسيك — يركب مع كل حاجة.', descEn: 'Classic pearl stud earrings.' },
      { id: 'p-r1', name: 'Crystal Stacking Ring', nameAr: 'خاتم كريستال', category: 'Rings', categorySlug: 'rings', price: 320, rating: 5, reviews: 54, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 35, descAr: 'خاتم ناعم ينفع stacking.', descEn: 'Delicate crystal stacking ring.' },
      { id: 'p-r2', name: 'Statement Gold Ring', nameAr: 'خاتم statement', category: 'Rings', categorySlug: 'rings', price: 540, rating: 5, reviews: 22, image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&q=80', images: ['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 14, descAr: 'خاتم بارز للسهرات.', descEn: 'Statement ring for evenings.' },
      { id: 'p-r3', name: 'Minimal Band Ring', nameAr: 'خاتم بسيط', category: 'Rings', categorySlug: 'rings', price: 290, rating: 5, reviews: 31, image: 'https://images.unsplash.com/photo-1602751584552-8ba173e5c6d0?w=600&q=80', images: ['https://images.unsplash.com/photo-1602751584552-8ba173e5c6d0?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 20, descAr: 'خاتم بسيط دهبي — ترند daily.', descEn: 'Minimal gold-tone band ring.' },
      { id: 'p-f1', name: 'Floral Perfume 50ml', nameAr: 'برفان زهري 50ml', category: 'Perfumes', categorySlug: 'perfumes', price: 680, rating: 5, reviews: 89, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 18, descAr: 'برفان زهري خفيف وثابت.', descEn: 'Light floral perfume.' },
      { id: 'p-f2', name: 'Oud Perfume 30ml', nameAr: 'برفان عود 30ml', category: 'Perfumes', categorySlug: 'perfumes', price: 950, rating: 5, reviews: 64, image: 'https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=600&q=80', images: ['https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 12, descAr: 'برفان عود فاخر للسهرات.', descEn: 'Rich oud perfume for evenings.' },
      { id: 'p-h1', name: 'Leather Tote Bag', nameAr: 'شنطة جلد', category: 'Bags', categorySlug: 'handbags', price: 1250, rating: 5, reviews: 92, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 15, descAr: 'شنطة جلد عملية وشيك.', descEn: 'Spacious leather tote bag.' },
      { id: 'p-h2', name: 'Mini Crossbody Bag', nameAr: 'شنطة كروس', category: 'Bags', categorySlug: 'handbags', price: 890, rating: 4, reviews: 67, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 20, descAr: 'شنطة كروس صغيرة للخروجات.', descEn: 'Compact crossbody bag.' }
    ],
    collections: [
      { id: 'col-1', label: 'Collection 01', labelAr: 'استالس', labelEn: 'Stainless', title: 'Stainless\nAccessories', titleAr: 'إكسسوارات\nاستالس', titleEn: 'Stainless\nAccessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80' },
      { id: 'col-2', label: 'Collection 02', labelAr: 'شنط', labelEn: 'Bags', title: 'Everyday\nHandbags', titleAr: 'شنط\nيومية', titleEn: 'Everyday\nHandbags', slug: 'handbags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80' },
      { id: 'col-3', label: 'Collection 03', labelAr: 'ميكب', labelEn: 'Makeup', title: 'Beauty\nEssentials', titleAr: 'ميكب\nأساسي', titleEn: 'Beauty\nEssentials', slug: 'makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&q=80' },
      { id: 'col-4', label: 'Collection 04', labelAr: 'برفانات', labelEn: 'Perfumes', title: 'Signature\nScents', titleAr: 'برفانات\nمميزة', titleEn: 'Signature\nScents', slug: 'perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80' }
    ],
    testimonials: [
      { id: 't1', name: 'Nour Hassan', location: 'Cairo, Egypt', text: 'The stainless accessories are amazing quality.', textAr: 'إكسسوارات الاستالس عندهم جامدة جداً وما بتصديش.', textEn: 'The stainless accessories are amazing quality.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', featured: false },
      { id: 't2', name: 'Mariam Ali', location: 'Alexandria, Egypt', text: 'Best bags and perfumes in one shop.', textAr: 'أحلى شنط وبرفانات في مكان واحد.', textEn: 'Best bags and perfumes in one shop.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', featured: true },
      { id: 't3', name: 'Yasmin Farid', location: 'Giza, Egypt', text: 'Fast delivery and great makeup selection.', textAr: 'التوصيل سريع والميكب عندهم حلو أوي.', textEn: 'Fast delivery and great makeup selection.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', featured: false }
    ],
    instagramGallery: [
      { id: 'ig-1', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
      { id: 'ig-2', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' },
      { id: 'ig-3', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80' },
      { id: 'ig-4', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80' },
      { id: 'ig-5', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80' },
      { id: 'ig-6', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80' }
    ],
    users: [
      { id: 'u-admin', name: 'Super Admin', email: 'admin@lumiere.com', password: 'admin123', role: 'superadmin', phone: '+20 100 000 0000', createdAt: '2024-01-01' },
      { id: 'u-demo', name: 'Sarah Mitchell', email: 'customer@lumiere.com', password: 'demo123', role: 'customer', phone: '+20 100 000 0001', createdAt: '2025-03-15', wishlist: ['p-e2', 'p-b2'], orders: [] }
    ],
    orders: [],
    newsletter: [],
    cart: {}
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  const TRIAL_LOGO_RE = /^assets\/logo(-.*)?\.svg$/i;

  function mergeDefaults(data) {
    if (!data || typeof data !== 'object') return clone(defaults);
    const merged = clone(data);
    merged.settings = { ...defaults.settings, ...(data.settings || {}) };
    merged.settings.theme = { ...defaults.settings.theme, ...(data.settings?.theme || {}) };
    merged.settings.heroTypography = {
      ...defaults.settings.heroTypography,
      ...(data.settings?.heroTypography || {})
    };
    ['eyebrow', 'brand', 'tagline', 'subtitle'].forEach(key => {
      merged.settings.heroTypography[key] = {
        ...defaults.settings.heroTypography[key],
        ...(data.settings?.heroTypography?.[key] || {})
      };
    });
    if (typeof merged.settings.logo === 'string' &&
        (TRIAL_LOGO_RE.test(merged.settings.logo) || merged.settings.logo.includes('logo-v'))) {
      merged.settings.logo = 'assets/logo.png';
    }
    merged.categories = data.categories?.length ? clone(data.categories) : clone(defaults.categories);
    merged.products = data.products?.length ? clone(data.products) : clone(defaults.products);
    merged.collections = data.collections?.length ? data.collections : clone(defaults.collections);
    merged.testimonials = data.testimonials?.length ? data.testimonials : clone(defaults.testimonials);
    merged.instagramGallery = data.instagramGallery?.length ? clone(data.instagramGallery) : clone(defaults.instagramGallery);
    merged.users = data.users?.length ? data.users : clone(defaults.users);
    merged.newsletter = data.newsletter || [];
    merged.orders = Array.isArray(data.orders) ? data.orders : [];
    merged.cart = data.cart || {};
    merged.catalogVersion = merged.catalogVersion || CATALOG_VERSION;
    return merged;
  }

  let _cache = null;
  let _apiMode = false;
  let _ready = null;

  async function syncToApi(data) {
    if (!_apiMode) return true;
    try {
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          if (err.error) msg = err.error;
        } catch (_) {}
        console.warn('Store API sync failed:', msg);
        _lastSyncError = msg;
        return false;
      }
      _lastSyncError = null;
      return true;
    } catch (err) {
      console.warn('Store API sync failed:', err);
      _lastSyncError = err.message || 'Network error';
      return false;
    }
  }

  let _lastSyncError = null;

  function getLastSyncError() {
    return _lastSyncError;
  }

  async function flush() {
    if (!_cache) return true;
    const ok = await syncToApi(_cache);
    if (!ok) return false;
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const raw = await res.json();
        _cache = mergeDefaults(raw);
        localStorage.setItem(KEY, JSON.stringify(_cache));
      }
    } catch (_) {}
    return true;
  }

  function init() {
    if (!_ready) {
      _ready = (async () => {
        try {
          const res = await fetch('/api/store');
          if (res.ok) {
            const raw = await res.json();
            _apiMode = true;
            _cache = mergeDefaults(raw);
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
    data.updatedAt = new Date().toISOString();
    data.catalogVersion = CATALOG_VERSION;
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

  function addCollection(col) {
    return update(data => {
      col.id = 'col-' + Date.now();
      data.collections.push(col);
    });
  }

  function updateCollection(id, patch) {
    return update(data => {
      const idx = data.collections.findIndex(c => c.id === id);
      if (idx !== -1) Object.assign(data.collections[idx], patch);
    });
  }

  function deleteCollection(id) {
    return update(data => {
      data.collections = data.collections.filter(c => c.id !== id);
    });
  }

  function addTestimonial(t) {
    return update(data => {
      t.id = 't-' + Date.now();
      data.testimonials.push(t);
    });
  }

  function updateTestimonial(id, patch) {
    return update(data => {
      const idx = data.testimonials.findIndex(t => t.id === id);
      if (idx !== -1) Object.assign(data.testimonials[idx], patch);
    });
  }

  function deleteTestimonial(id) {
    return update(data => {
      data.testimonials = data.testimonials.filter(t => t.id !== id);
    });
  }

  function addNewsletter(email) {
    return update(data => {
      if (!data.newsletter.includes(email)) data.newsletter.push(email);
    });
  }

  function deleteNewsletter(email) {
    return update(data => {
      data.newsletter = data.newsletter.filter(e => e !== email);
    });
  }

  function deleteOrder(orderId) {
    return update(data => {
      const order = data.orders.find(o => o.id === orderId);
      data.orders = data.orders.filter(o => o.id !== orderId);
      if (order?.userId) {
        const user = data.users.find(u => u.id === order.userId);
        if (user?.orders) user.orders = user.orders.filter(o => o.id !== orderId);
      }
    });
  }

  function placeOrder({
    customerName,
    customerEmail,
    customerPhone,
    customerPhone2,
    shippingAddress,
    paymentMethod,
    paymentMethodLabel,
    subtotal,
    shippingFee,
    items,
    total,
    userId
  }) {
    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      subtotal: subtotal ?? total,
      shippingFee: shippingFee ?? 0,
      total,
      status: 'Pending',
      customerName,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      customerPhone2: customerPhone2 || '',
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'cod',
      paymentMethodLabel: paymentMethodLabel || '',
      userId: userId || null,
      items: items.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price }))
    };
    return update(data => {
      data.orders.unshift(order);
      if (userId) {
        const user = data.users.find(u => u.id === userId);
        if (user) {
          user.orders = user.orders || [];
          user.orders.unshift({
            id: order.id,
            date: order.date,
            total: order.total,
            status: order.status,
            items: order.items.map(i => ({ name: i.name, qty: i.qty }))
          });
        }
      }
    }), order;
  }

  function getAllOrders() {
    return get().orders || [];
  }

  function updateOrderStatus(orderId, status) {
    return update(data => {
      const order = data.orders.find(o => o.id === orderId);
      if (order) order.status = status;
      if (order?.userId) {
        const user = data.users.find(u => u.id === order.userId);
        const userOrder = user?.orders?.find(o => o.id === orderId);
        if (userOrder) userOrder.status = status;
      }
    });
  }

  return {
    get, update, reset, defaults, init, flush, getLastSyncError,
    findUser, findUserById, addUser, updateUser, deleteUser,
    addProduct, updateProduct, deleteProduct,
    updateSettings, addCategory, updateCategory, deleteCategory,
    addCollection, updateCollection, deleteCollection,
    addTestimonial, updateTestimonial, deleteTestimonial,
    addNewsletter, deleteNewsletter,
    placeOrder, getAllOrders, updateOrderStatus, deleteOrder
  };
})();

if (typeof module !== 'undefined') module.exports = LumiereStore;
