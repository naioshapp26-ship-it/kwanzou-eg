/**
 * LUMIÈRE — Central data store (localStorage)
 */
const LumiereStore = (() => {
  const KEY = 'kwanzou_store_v10';

  const defaults = {
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
      currency: 'EGP',
      currencySymbol: 'ج.م'
    },
    categories: [
      { id: 'cat-1', name: 'Accessories', nameAr: 'إكسسوارات', slug: 'accessories', sort: 1, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', featured: true },
      { id: 'cat-2', name: 'Bags', nameAr: 'شنط', slug: 'handbags', sort: 2, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', featured: true },
      { id: 'cat-3', name: 'Perfumes', nameAr: 'برفانات', slug: 'perfumes', sort: 3, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', featured: true },
      { id: 'cat-4', name: 'Necklaces', nameAr: 'سلاسل', slug: 'necklaces', sort: 4, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=800&q=80', featured: true },
      { id: 'cat-5', name: 'Bracelets', nameAr: 'أساور', slug: 'bracelets', sort: 5, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', featured: true },
      { id: 'cat-6', name: 'Rings', nameAr: 'خواتم', slug: 'rings', sort: 6, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', featured: true },
      { id: 'cat-7', name: 'Watches', nameAr: 'ساعات', slug: 'watches', sort: 7, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', featured: true },
      { id: 'cat-8', name: 'New Arrivals', nameAr: 'جديد', slug: 'new-arrivals', sort: 8, image: 'https://images.unsplash.com/photo-1492707896669-8dd329a169e8?w=800&q=80', featured: true }
    ],
    products: [
      { id: 'p1', name: 'Layered Chain Necklace', nameAr: 'سلسلة طبقات', category: 'Necklaces', categorySlug: 'necklaces', price: 520, rating: 5, reviews: 84, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 30, descAr: 'سلسلة استالس 316L ما بتصديش. شكلها شيك وبتكمل أي لوك.', descEn: '316L stainless steel necklace. Tarnish-free and elegant.' },
      { id: 'p2', name: 'Gold Hoop Earrings', nameAr: 'حلق ذهبي', category: 'Accessories', categorySlug: 'accessories', price: 280, rating: 5, reviews: 156, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 45, descAr: 'حلق خفيف ومريح. مناسب للاستخدام اليومي.', descEn: 'Lightweight hoop earrings for daily wear.' },
      { id: 'p3', name: 'Leather Tote Bag', nameAr: 'شنطة جلد', category: 'Bags', categorySlug: 'handbags', price: 1250, rating: 5, reviews: 92, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 15, descAr: 'شنطة جلد كويسة، مساحة كبيرة وشكلها عملي وشيك.', descEn: 'Spacious leather tote with a clean everyday look.' },
      { id: 'p4', name: 'Mini Crossbody Bag', nameAr: 'شنطة كروس', category: 'Bags', categorySlug: 'handbags', price: 890, rating: 4, reviews: 67, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 20, descAr: 'شنطة كروس صغيرة للخروجات. خفيفة وعملية.', descEn: 'Compact crossbody bag for outings.' },
      { id: 'p5', name: 'Pearl Bracelet', nameAr: 'اسورة لؤلؤ', category: 'Bracelets', categorySlug: 'bracelets', price: 380, rating: 5, reviews: 73, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 28, descAr: 'اسورة لؤلؤ كلاسيك. بتكمل أي لوك سهرة.', descEn: 'Classic pearl bracelet for elegant evenings.' },
      { id: 'p6', name: 'Crystal Stacking Ring', nameAr: 'خاتم كريستال', category: 'Rings', categorySlug: 'rings', price: 320, rating: 5, reviews: 54, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'], badge: '', featured: true, bestseller: false, stock: 35, descAr: 'خاتم كريستال ناعم. ينفع لوحده أو مع خواتم تانية.', descEn: 'Delicate crystal ring, perfect for stacking.' },
      { id: 'p7', name: 'Floral Perfume 50ml', nameAr: 'برفان زهري 50ml', category: 'Perfumes', categorySlug: 'perfumes', price: 680, rating: 5, reviews: 89, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 18, descAr: 'برفان زهري خفيف وثابت. مناسب للنهار.', descEn: 'Light floral perfume with lasting scent.' },
      { id: 'p8', name: 'Oud Perfume 30ml', nameAr: 'برفان عود 30ml', category: 'Perfumes', categorySlug: 'perfumes', price: 950, rating: 5, reviews: 64, image: 'https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=600&q=80', images: ['https://images.unsplash.com/photo-1592945403244-b3fb4447f053?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 12, descAr: 'برفان عود فاخر. ريحة قوية وثابتة للسهرات.', descEn: 'Rich oud perfume for evening wear.' },
      { id: 'p9', name: 'Classic Gold Watch', nameAr: 'ساعة ذهبية', category: 'Watches', categorySlug: 'watches', price: 1450, rating: 5, reviews: 41, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80'], badge: 'New', featured: true, bestseller: true, stock: 10, descAr: 'ساعة كلاسيك بإطار ذهبي. شيك للخروجات.', descEn: 'Classic watch with a gold-tone finish.' },
      { id: 'p10', name: 'Charm Pendant Necklace', nameAr: 'سلسلة دلاية', category: 'Necklaces', categorySlug: 'necklaces', price: 410, rating: 4, reviews: 38, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 22, descAr: 'دلاية شيك بتكمل أي لوك يومي.', descEn: 'Elegant charm pendant for everyday style.' },
      { id: 'p11', name: 'Cuff Bracelet', nameAr: 'اسورة كف', category: 'Bracelets', categorySlug: 'bracelets', price: 460, rating: 5, reviews: 29, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'], badge: '', featured: false, bestseller: true, stock: 18, descAr: 'اسورة كف bold وشيك.', descEn: 'Bold cuff bracelet with a refined finish.' },
      { id: 'p12', name: 'Statement Ring', nameAr: 'خاتم statement', category: 'Rings', categorySlug: 'rings', price: 540, rating: 5, reviews: 22, image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&q=80', images: ['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 14, descAr: 'خاتم بارز للسهرات والمناسبات.', descEn: 'Statement ring for special occasions.' }
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
    users: [
      { id: 'u-admin', name: 'Super Admin', email: 'admin@lumiere.com', password: 'admin123', role: 'superadmin', phone: '+20 100 000 0000', createdAt: '2024-01-01' },
      { id: 'u-demo', name: 'Sarah Mitchell', email: 'customer@lumiere.com', password: 'demo123', role: 'customer', phone: '+20 100 000 0001', createdAt: '2025-03-15', wishlist: ['p2', 'p5'], orders: [] }
    ],
    orders: [],
    newsletter: [],
    cart: {}
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeDefaults(data) {
    if (!data || typeof data !== 'object') return clone(defaults);
    const merged = clone(data);
    merged.settings = { ...defaults.settings, ...(data.settings || {}) };
    merged.settings.theme = { ...defaults.settings.theme, ...(data.settings?.theme || {}) };
    merged.categories = data.categories?.length ? clone(data.categories) : clone(defaults.categories);
    defaults.categories.forEach(defCat => {
      if (!merged.categories.some(c => c.slug === defCat.slug)) {
        merged.categories.push(clone(defCat));
      }
    });
    merged.categories.sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
    merged.products = data.products?.length ? data.products : clone(defaults.products);
    merged.collections = data.collections?.length ? data.collections : clone(defaults.collections);
    merged.testimonials = data.testimonials?.length ? data.testimonials : clone(defaults.testimonials);
    merged.users = data.users?.length ? data.users : clone(defaults.users);
    merged.newsletter = data.newsletter || [];
    merged.orders = Array.isArray(data.orders) ? data.orders : [];
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

  function placeOrder({ customerName, customerEmail, customerPhone, items, total, userId }) {
    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      total,
      status: 'Pending',
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
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
    get, update, reset, defaults, init,
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
