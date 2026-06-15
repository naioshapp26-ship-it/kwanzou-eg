/**
 * LUMIÈRE — Internationalization (Arabic default · English optional)
 */
const LumiereI18n = (() => {
  const LANG_KEY = 'lumiere_lang';
  const DEFAULT_LANG = 'ar';

  const strings = {
    ar: {
      meta_title: 'Kwanzou EG | إكسسوارات ودهب',
      meta_desc: 'Kwanzou EG — إكسسوارات ودهب في مصر.',
      nav_home: 'الرئيسية',
      shop_all: 'كل المنتجات',
      shop_title: 'تسوق | Kwanzou EG',
      product_title: 'منتج | Kwanzou EG',
      cart_title: 'الشنطة | Kwanzou EG',
      search_placeholder: 'دور على إكسسوارات، دهب، شنط...',
      quick_earrings: 'حلق',
      buy_now: 'اشتري دلوقتي',
      in_stock: 'موجود',
      out_of_stock: 'خلص',
      quantity: 'الكمية',
      related_products: 'حاجات شبهها',
      products_count: 'منتج',
      shop_empty: 'مفيش منتجات.',
      sort_featured: 'مميز',
      sort_price_low: 'السعر: من الأرخص',
      sort_price_high: 'السعر: من الأغلى',
      sort_rating: 'الأعلى تقييم',
      product_not_found: 'المنتج مش موجود',
      delivery_fast: 'توصيل سريع 2–4 أيام',
      delivery_returns: 'مرتجع مجاني خلال 14 يوم',
      delivery_authentic: 'منتج أصلي 100%',
      tab_description: 'الوصف',
      tab_details: 'المواصفات',
      tab_reviews: 'التقييمات',
      no_description: 'مفيش وصف.',
      material: 'الخامة',
      material_premium: 'خامات كويسة وعالية',
      warranty: 'الضمان',
      warranty_1year: 'ضمان سنة',
      origin: 'المنشأ',
      origin_intl: 'تصميم عالمي',
      sku: 'كود المنتج',
      category_label: 'القسم',
      reviews_count: 'تقييم',
      reviews_verified: 'كل التقييمات من ناس اشتروا فعلاً.',
      no_related: 'مفيش حاجات شبهها.',
      cart_empty: 'الشنطة فاضية',
      cart_total: 'الإجمالي',
      checkout: 'كملي الشراء',
      shop_now: 'تسوق دلوقتي',
      nav_jewelry: 'دهب',
      nav_collections: 'مجموعات',
      nav_new: 'جديد',
      nav_bestsellers: 'الأكتر مبيعاً',
      nav_bag: 'الشنطة',
      nav_signin: 'دخول',
      nav_account: 'حسابي',
      nav_admin: 'لوحة التحكم',
      nav_mobile_all: 'دهب وإكسسوارات',
      nav_admin_panel: 'لوحة الإدارة',
      lang_switch: 'English',
      hero_eyebrow: 'القاهرة · الإسكندرية · الجيزة',
      hero_badge: '✦ شحن مجاني للطلبات +1,500 ج.م',
      hero_cta_shop: 'تسوق دلوقتي',
      hero_cta_explore: 'شوف الدهب',
      hero_scroll: 'انزل',
      quick_jewelry: 'دهب',
      quick_handbags: 'شنط',
      quick_watches: 'ساعات',
      quick_scarves: 'طرح',
      quick_new: 'جديد',
      quick_bestsellers: 'الأكتر مبيعاً',
      cat_eyebrow: 'أقسام مختارة',
      cat_title: 'دهب وإكسسوارات',
      cat_desc: 'من سلاسل وحلق لحد شنط حلوة — كل حاجة على ذوقك.',
      cat_explore: 'شوف ←',
      featured_eyebrow: 'مختارين ليك',
      featured_title: 'حاجات مميزة',
      featured_view_all: 'شوف الكل ←',
      editorial_eyebrow: 'Kwanzou EG',
      editorial_title: 'شغل كويس<br><em>وستايل يجنن</em>',
      editorial_desc: 'كل قطعة متعملة بذوق وخامات حلوة — دهب، لؤلؤ، جلد، وتفاصيل مظبوطة.',
      stat_countries: 'دولة',
      stat_clients: 'عميلة',
      stat_authentic: 'أصلي',
      coll_eyebrow: 'مجموعات',
      coll_title: 'مجموعات مختارة',
      coll_discover: 'شوف ←',
      bs_eyebrow: 'الناس بتحبها',
      bs_title: 'الأكتر مبيعاً',
      trust_shipping: 'شحن لكل مصر',
      trust_shipping_desc: 'توصيل سريع لباب البيت.',
      trust_payments: 'دفع آمن',
      trust_payments_desc: 'دفعك محمي ومتشفر.',
      trust_authentic: 'منتجات أصلية',
      trust_authentic_desc: '100% أصلي ومضمون.',
      trust_returns: 'مرتجع سهل',
      trust_returns_desc: 'ترجعي خلال 14 يوم من غير تعب.',
      trust_support: 'دعم على طول',
      trust_support_desc: 'فريقنا معاك 24/7.',
      reviews_eyebrow: 'آراء الناس',
      reviews_title: 'عملاءنا قالوا إيه',
      insta_eyebrow: '@kwanzou.eg',
      insta_title: 'ستايل وإلهام',
      news_eyebrow: 'عروض خاصة',
      news_title: 'سجّلي مع Kwanzou',
      news_desc: 'هتوصلك عروض جديدة ومنتجات لسه نازلة.',
      news_placeholder: 'اكتب إيميلك',
      news_subscribe: 'سجّل',
      news_welcome: 'أهلاً بيك في Kwanzou ✨',
      footer_desc: 'Kwanzou EG — دهب وإكسسوارات للبنت المصرية.',
      footer_shop: 'تسوق',
      footer_account: 'الحساب',
      footer_care: 'مساعدة',
      footer_contact: 'تواصل معانا',
      footer_signin: 'دخول',
      footer_register: 'اعمل حساب',
      footer_orders: 'طلباتي',
      footer_wishlist: 'المفضلة',
      footer_shipping: 'الشحن',
      footer_returns: 'المرتجع',
      footer_faq: 'أسئلة شائعة',
      footer_privacy: 'الخصوصية',
      footer_terms: 'الشروط',
      footer_rights: 'كل الحقوق محفوظة.',
      add_cart: 'ضيف للشنطة',
      quick_view: 'عرض سريع',
      added_bag: 'اتضاف للشنطة',
      wishlist_add: 'ضيف للمفضلة',
      wishlist_remove: 'اتشال من المفضلة',
      badge_new: 'جديد',
      badge_bestseller: 'الأكتر مبيعاً',
      badge_limited: 'كمية محدودة',
      login_title: 'دخول | Kwanzou EG',
      login_welcome: 'أهلاً بيك',
      login_sub: 'سجّل دخولك عشان تشوف طلباتك ومفضلتك.',
      login_email: 'الإيميل',
      login_password: 'الباسورد',
      login_submit: 'دخول',
      login_demo: 'حسابات تجريبية:',
      login_demo_customer: 'حساب عميل',
      login_demo_admin: 'أدمن',
      login_no_account: 'معندكش حساب؟',
      login_create: 'اعمل حساب',
      login_back: '← رجوع للمتجر',
      login_visual: 'دهب وإكسسوارات على ذوقك.',
      login_error: 'الإيميل أو الباسورد غلط.',
      register_title: 'اعمل حساب | Kwanzou EG',
      register_heading: 'اعمل حساب',
      register_sub: 'سجّل عشان تتابع طلباتك وتحفظ المفضلة.',
      register_name: 'الاسم',
      register_phone: 'الموبايل (اختياري)',
      register_submit: 'اعمل حساب',
      register_have: 'عندك حساب؟',
      register_signin: 'دخول',
      register_visual: 'انضم لآلاف اللي بيحبوا Kwanzou.',
      register_error_required: 'املأ كل الحقول.',
      register_error_pass: 'الباسورد 6 حروف على الأقل.',
      register_error_exists: 'الإيميل مسجّل قبل كده.',
      account_title: 'حسابي | Kwanzou EG',
      account_eyebrow: 'حسابي',
      account_welcome: 'أهلاً',
      account_logout: 'خروج',
      account_overview: 'نظرة عامة',
      account_orders: 'طلباتي',
      account_wishlist: 'المفضلة',
      account_profile: 'الإعدادات',
      account_stat_orders: 'الطلبات',
      account_stat_wishlist: 'المفضلة',
      account_stat_member: 'عضو من',
      account_recent: 'آخر الطلبات',
      account_orders_title: 'سجل الطلبات',
      account_wishlist_title: 'المفضلة',
      account_profile_title: 'بياناتك',
      account_order_id: 'رقم الطلب',
      account_date: 'التاريخ',
      account_items: 'المنتجات',
      account_total: 'الإجمالي',
      account_status: 'الحالة',
      account_no_orders: 'لسه مفيش طلبات.',
      account_shop: 'روح تسوق',
      account_empty_wishlist: 'المفضلة فاضية.',
      account_save: 'احفظ',
      account_saved: 'اتحفظ بنجاح',
      status_delivered: 'وصل',
      status_shipped: 'في الطريق',
      status_pending: 'جاري التجهيز',
      admin_dashboard: 'لوحة التحكم',
      admin_products: 'المنتجات',
      admin_categories: 'الأقسام',
      admin_collections: 'المجموعات',
      admin_settings: 'إعدادات الموقع',
      admin_users: 'العملاء',
      admin_testimonials: 'آراء العملاء',
      admin_newsletter: 'النشرة',
      admin_super: 'أدمن',
      admin_view_store: 'افتح المتجر ←',
      admin_signout: 'خروج',
      admin_add_product: '+ منتج جديد',
      admin_add_category: '+ قسم جديد',
      admin_save: 'احفظ',
      admin_reset: 'رجّع الافتراضي',
      admin_reset_desc: 'يرجّع المنتجات والأقسام للوضع الافتراضي.',
      admin_preview: 'معاينة الموقع'
    },
    en: {
      meta_title: 'Kwanzou EG | Luxury Accessories',
      meta_desc: 'Kwanzou EG — Luxury accessories and jewelry in Egypt.',
      nav_home: 'Home',
      shop_all: 'All Products',
      shop_title: 'Shop | Kwanzou EG',
      product_title: 'Product | Kwanzou EG',
      cart_title: 'Bag | Kwanzou EG',
      search_placeholder: 'Search accessories, jewelry...',
      quick_earrings: 'Earrings',
      buy_now: 'Buy Now',
      in_stock: 'In Stock',
      out_of_stock: 'Out of Stock',
      quantity: 'Quantity',
      related_products: 'Related Products',
      products_count: 'products',
      shop_empty: 'No products found.',
      sort_featured: 'Featured',
      sort_price_low: 'Price: Low to High',
      sort_price_high: 'Price: High to Low',
      sort_rating: 'Top Rated',
      product_not_found: 'Product not found',
      delivery_fast: 'Fast delivery 2-4 days',
      delivery_returns: 'Free returns within 14 days',
      delivery_authentic: '100% Authentic',
      tab_description: 'Description',
      tab_details: 'Specifications',
      tab_reviews: 'Reviews',
      no_description: 'No description available.',
      material: 'Material',
      material_premium: 'Premium quality materials',
      warranty: 'Warranty',
      warranty_1year: '1 Year Warranty',
      origin: 'Origin',
      origin_intl: 'International Design',
      sku: 'SKU',
      category_label: 'Category',
      reviews_count: 'reviews',
      reviews_verified: 'All reviews from verified purchases.',
      no_related: 'No related products.',
      cart_empty: 'Your bag is empty',
      cart_total: 'Total',
      checkout: 'Checkout',
      shop_now: 'Shop Now',
      nav_jewelry: 'Jewelry',
      nav_collections: 'Collections',
      nav_new: 'New In',
      nav_bestsellers: 'Best Sellers',
      nav_bag: 'Bag',
      nav_signin: 'Sign In',
      nav_account: 'My Account',
      nav_admin: 'Admin',
      nav_mobile_all: 'Jewelry & Accessories',
      nav_admin_panel: 'Admin Panel',
      lang_switch: 'عربي',
      hero_eyebrow: 'Cairo · Alexandria · Giza',
      hero_badge: '✦ Free shipping on orders +1,500 EGP',
      hero_cta_shop: 'Shop Collection',
      hero_cta_explore: 'Explore Jewelry',
      hero_scroll: 'Scroll',
      quick_jewelry: 'Jewelry',
      quick_handbags: 'Handbags',
      quick_watches: 'Watches',
      quick_scarves: 'Scarves',
      quick_new: 'New In',
      quick_bestsellers: 'Best Sellers',
      cat_eyebrow: 'Curated Collections',
      cat_title: 'Jewelry & Accessories',
      cat_desc: 'From statement necklaces to signature handbags — every piece tells your story.',
      cat_explore: 'Explore →',
      featured_eyebrow: 'Handpicked',
      featured_title: 'Featured Pieces',
      featured_view_all: 'View All →',
      editorial_eyebrow: 'The LUMIÈRE Edit',
      editorial_title: 'Where Craftsmanship<br>Meets <em>Modern Luxury</em>',
      editorial_desc: 'Each accessory is designed in Paris and crafted with the finest materials — 18K gold, genuine pearls, Italian leather, and hand-finished details.',
      stat_countries: 'Countries',
      stat_clients: 'Happy Clients',
      stat_authentic: 'Authentic',
      coll_eyebrow: 'Editorial',
      coll_title: 'Luxury Collections',
      coll_discover: 'Discover →',
      bs_eyebrow: 'Most Loved',
      bs_title: 'Best Sellers',
      trust_shipping: 'Worldwide Shipping',
      trust_shipping_desc: 'Express delivery to 120+ countries.',
      trust_payments: 'Secure Payments',
      trust_payments_desc: '256-bit encrypted checkout.',
      trust_authentic: 'Authentic Products',
      trust_authentic_desc: 'Certified genuine luxury pieces.',
      trust_returns: 'Easy Returns',
      trust_returns_desc: '30-day hassle-free returns.',
      trust_support: 'Premium Support',
      trust_support_desc: 'Personal stylists available 24/7.',
      reviews_eyebrow: 'Reviews',
      reviews_title: 'What Our Clients Say',
      insta_eyebrow: '@kwanzou.eg',
      insta_title: 'Style Inspiration',
      news_eyebrow: 'Exclusive Access',
      news_title: 'Join the LUMIÈRE Circle',
      news_desc: 'Early access to new collections, styling tips, and members-only offers.',
      news_placeholder: 'Enter your email',
      news_subscribe: 'Subscribe',
      news_welcome: 'Welcome to the LUMIÈRE Circle ✨',
      footer_desc: 'Kwanzou EG — Luxury accessories and jewelry for the modern woman in Egypt.',
      footer_shop: 'Shop',
      footer_account: 'Account',
      footer_care: 'Customer Care',
      footer_contact: 'Contact',
      footer_signin: 'Sign In',
      footer_register: 'Create Account',
      footer_orders: 'My Orders',
      footer_wishlist: 'Wishlist',
      footer_shipping: 'Shipping',
      footer_returns: 'Returns',
      footer_faq: 'FAQ',
      footer_privacy: 'Privacy',
      footer_terms: 'Terms',
      footer_rights: 'All rights reserved.',
      add_cart: 'Add to Cart',
      quick_view: 'Quick View',
      added_bag: 'Added to bag',
      wishlist_add: 'Added to wishlist',
      wishlist_remove: 'Removed from wishlist',
      badge_new: 'New',
      badge_bestseller: 'Best Seller',
      badge_limited: 'Limited',
      login_title: 'Sign In | LUMIÈRE',
      login_welcome: 'Welcome Back',
      login_sub: 'Sign in to view orders, wishlist, and more.',
      login_email: 'Email Address',
      login_password: 'Password',
      login_submit: 'Sign In',
      login_demo: 'Demo Accounts:',
      login_demo_customer: 'Customer Account',
      login_demo_admin: 'Super Admin',
      login_no_account: "Don't have an account?",
      login_create: 'Create one',
      login_back: '← Back to Store',
      login_visual: 'Exquisite jewelry & accessories for the modern woman.',
      login_error: 'Invalid email or password.',
      register_title: 'Create Account | LUMIÈRE',
      register_heading: 'Create Account',
      register_sub: 'Register to track orders, save wishlist, and enjoy exclusive offers.',
      register_name: 'Full Name',
      register_phone: 'Phone (optional)',
      register_submit: 'Create Account',
      register_have: 'Already have an account?',
      register_signin: 'Sign In',
      register_visual: 'Join thousands of women who trust LUMIÈRE.',
      register_error_required: 'All fields are required.',
      register_error_pass: 'Password must be at least 6 characters.',
      register_error_exists: 'An account with this email already exists.',
      account_title: 'My Account | LUMIÈRE',
      account_eyebrow: 'My Account',
      account_welcome: 'Hello',
      account_logout: 'Sign Out',
      account_overview: 'Overview',
      account_orders: 'My Orders',
      account_wishlist: 'Wishlist',
      account_profile: 'Profile Settings',
      account_stat_orders: 'Orders',
      account_stat_wishlist: 'Wishlist Items',
      account_stat_member: 'Member Since',
      account_recent: 'Recent Orders',
      account_orders_title: 'Order History',
      account_wishlist_title: 'My Wishlist',
      account_profile_title: 'Profile Settings',
      account_order_id: 'Order ID',
      account_date: 'Date',
      account_items: 'Items',
      account_total: 'Total',
      account_status: 'Status',
      account_no_orders: 'No orders yet.',
      account_shop: 'Start shopping',
      account_empty_wishlist: 'Your wishlist is empty.',
      account_save: 'Save Changes',
      account_saved: 'Profile updated successfully',
      status_delivered: 'Delivered',
      status_shipped: 'Shipped',
      status_pending: 'Pending',
      admin_dashboard: 'Dashboard',
      admin_products: 'Products',
      admin_categories: 'Categories',
      admin_collections: 'Collections',
      admin_settings: 'Site Settings',
      admin_users: 'Customers',
      admin_testimonials: 'Testimonials',
      admin_newsletter: 'Newsletter',
      admin_super: 'Super Admin',
      admin_view_store: 'View Store →',
      admin_signout: 'Sign Out',
      admin_add_product: '+ Add Product',
      admin_add_category: '+ Add Category',
      admin_save: 'Save',
      admin_reset: 'Reset to Defaults',
      admin_reset_desc: 'Restore all products, categories, and settings to defaults.',
      admin_preview: 'Preview Site'
    }
  };

  const categoryKeys = {
    jewelry: { ar: 'دهب', en: 'Jewelry' },
    necklaces: { ar: 'سلاسل', en: 'Necklaces' },
    earrings: { ar: 'حلق', en: 'Earrings' },
    handbags: { ar: 'شنط', en: 'Handbags' },
    watches: { ar: 'ساعات', en: 'Watches' },
    scarves: { ar: 'طرح', en: 'Scarves & Silk' },
    sunglasses: { ar: 'نظارات', en: 'Sunglasses' },
    'new-arrivals': { ar: 'جديد', en: 'New Arrivals' }
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyDocumentLang(lang);
    window.dispatchEvent(new CustomEvent('lumiere:langchange', { detail: { lang } }));
  }

  function toggleLang() {
    setLang(getLang() === 'ar' ? 'en' : 'ar');
  }

  function t(key) {
    const lang = getLang();
    return strings[lang]?.[key] ?? strings.en[key] ?? key;
  }

  function isRTL() {
    return getLang() === 'ar';
  }

  function localized(obj, field = 'name') {
    if (!obj) return '';
    const lang = getLang();
    const localizedKey = field + (lang === 'ar' ? 'Ar' : 'En');
    return obj[localizedKey] || obj[field + 'En'] || obj[field + 'Ar'] || obj[field] || '';
  }

  function localizedSettings(settings, field) {
    const lang = getLang();
    const key = field + (lang === 'ar' ? 'Ar' : 'En');
    return settings[key] || settings[field] || '';
  }

  function translateCategory(cat) {
    if (cat.slug && categoryKeys[cat.slug]) {
      return categoryKeys[cat.slug][getLang()] || cat.name;
    }
    return localized(cat, 'name') || cat.name;
  }

  function productCategory(product) {
    if (product?.categorySlug) return translateCategory({ slug: product.categorySlug });
    return localized(product, 'category') || product?.category || '';
  }

  function translateBadge(badge) {
    if (!badge) return '';
    const map = { 'New': 'badge_new', 'Best Seller': 'badge_bestseller', 'Limited': 'badge_limited', 'جديد': 'badge_new' };
    const key = map[badge];
    return key ? t(key) : badge;
  }

  function translateStatus(status) {
    const map = {
      Delivered: 'status_delivered', Shipped: 'status_shipped', Pending: 'status_pending',
      'تم التسليم': 'status_delivered', 'قيد الشحن': 'status_shipped', 'قيد المعالجة': 'status_pending'
    };
    const key = map[status];
    return key ? t(key) : status;
  }

  function applyDocumentLang(lang) {
    const l = lang || getLang();
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.body?.classList.toggle('rtl', l === 'ar');
    document.body?.classList.toggle('ltr', l !== 'ar');
  }

  function applyTranslations(root = document) {
    applyDocumentLang();
    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    const titleKey = document.body?.dataset?.pageTitle;
    if (titleKey) document.title = t(titleKey);
  }

  function langSwitcherHTML(base = '') {
    return `<button type="button" class="lang-switch" id="langSwitch" aria-label="Switch language">${t('lang_switch')}</button>`;
  }

  function bindLangSwitch(root = document) {
    root.querySelectorAll('#langSwitch, .lang-switch').forEach(btn => {
      btn.onclick = () => {
        toggleLang();
        applyTranslations();
        btn.textContent = t('lang_switch');
      };
    });
  }

  function init() {
    applyDocumentLang();
    applyTranslations();
    bindLangSwitch();
    window.addEventListener('lumiere:langchange', () => {
      applyTranslations();
      bindLangSwitch();
    });
  }

  return {
    t, getLang, setLang, toggleLang, isRTL, localized, localizedSettings,
    translateCategory, productCategory, translateBadge, translateStatus,
    applyTranslations, applyDocumentLang, langSwitcherHTML, bindLangSwitch, init
  };
})();
