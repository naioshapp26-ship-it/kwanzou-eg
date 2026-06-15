/**
 * LUMIÈRE — Internationalization (Arabic default · English optional)
 */
const LumiereI18n = (() => {
  const LANG_KEY = 'lumiere_lang';
  const DEFAULT_LANG = 'ar';

  const strings = {
    ar: {
      meta_title: 'Kwanzou EG | إكسسوارات ومجوهرات',
      meta_desc: 'Kwanzou EG — إكسسوارات ومجوهرات فاخرة في مصر.',
      nav_home: 'الرئيسية',
      shop_all: 'كل المنتجات',
      shop_title: 'تسوق | Kwanzou EG',
      product_title: 'منتج | Kwanzou EG',
      cart_title: 'الحقيبة | Kwanzou EG',
      search_placeholder: 'ابحثي عن إكسسوارات، مجوهرات...',
      quick_earrings: 'أقراط',
      buy_now: 'اشتري الآن',
      in_stock: 'متوفر في المخزون',
      out_of_stock: 'غير متوفر',
      quantity: 'الكمية',
      related_products: 'منتجات مشابهة',
      products_count: 'منتج',
      shop_empty: 'لا توجد منتجات.',
      sort_featured: 'مميز',
      sort_price_low: 'السعر: من الأقل',
      sort_price_high: 'السعر: من الأعلى',
      sort_rating: 'الأعلى تقييماً',
      product_not_found: 'المنتج غير موجود',
      delivery_fast: 'توصيل سريع 2-4 أيام',
      delivery_returns: 'إرجاع مجاني خلال 14 يوم',
      delivery_authentic: 'منتج أصلي 100%',
      tab_description: 'الوصف',
      tab_details: 'المواصفات',
      tab_reviews: 'التقييمات',
      no_description: 'لا يوجد وصف.',
      material: 'الخامة',
      material_premium: 'مواد فاخرة عالية الجودة',
      warranty: 'الضمان',
      warranty_1year: 'ضمان سنة',
      origin: 'المنشأ',
      origin_intl: 'تصميم دولي',
      sku: 'رمز المنتج',
      category_label: 'القسم',
      reviews_count: 'تقييم',
      reviews_verified: 'جميع التقييمات من مشتريات موثقة.',
      no_related: 'لا توجد منتجات مشابهة.',
      cart_empty: 'الحقيبة فارغة',
      cart_total: 'الإجمالي',
      checkout: 'إتمام الشراء',
      shop_now: 'تسوق الآن',
      nav_jewelry: 'المجوهرات',
      nav_collections: 'المجموعات',
      nav_new: 'وصل حديثاً',
      nav_bestsellers: 'الأكثر مبيعاً',
      nav_bag: 'الحقيبة',
      nav_signin: 'تسجيل الدخول',
      nav_account: 'حسابي',
      nav_admin: 'لوحة التحكم',
      nav_mobile_all: 'المجوهرات والإكسسوارات',
      nav_admin_panel: 'لوحة الإدارة',
      lang_switch: 'English',
      hero_eyebrow: 'القاهرة · الإسكندرية · الجيزة',
      hero_badge: '✦ شحن مجاني للطلبات +1,500 ج.م',
      hero_cta_shop: 'تسوق المجموعة',
      hero_cta_explore: 'استكشفي المجوهرات',
      hero_scroll: 'مرّري',
      quick_jewelry: 'مجوهرات',
      quick_handbags: 'حقائب',
      quick_watches: 'ساعات',
      quick_scarves: 'أوشحة',
      quick_new: 'وصل حديثاً',
      quick_bestsellers: 'الأكثر مبيعاً',
      cat_eyebrow: 'مجموعات مختارة',
      cat_title: 'المجوهرات والإكسسوارات',
      cat_desc: 'من القلادات البارزة إلى حقائب التوقيع — كل قطعة تحكي قصتك.',
      cat_explore: 'استكشفي ←',
      featured_eyebrow: 'مختارة بعناية',
      featured_title: 'قطع مميزة',
      featured_view_all: 'عرض الكل ←',
      editorial_eyebrow: 'اختيار لوميère',
      editorial_title: 'حيث يلتقي<br><em>الحرف بالفخامة</em>',
      editorial_desc: 'كل إكسسوار يُصمم في باريس ويُصنع من أ finest المواد — ذهب 18 قيراط، لآلئ أصلية، جلد إيطالي، وتفاصيل يدوية.',
      stat_countries: 'دولة',
      stat_clients: 'عميلة سعيدة',
      stat_authentic: 'أصلي',
      coll_eyebrow: 'تحريري',
      coll_title: 'مجموعات فاخرة',
      coll_discover: 'اكتشفي ←',
      bs_eyebrow: 'الأكثر حباً',
      bs_title: 'الأكثر مبيعاً',
      trust_shipping: 'شحن عالمي',
      trust_shipping_desc: 'توصيل سريع إلى أكثر من 120 دولة.',
      trust_payments: 'دفع آمن',
      trust_payments_desc: 'تشفير 256-bit عند الدفع.',
      trust_authentic: 'منتجات أصلية',
      trust_authentic_desc: 'قطع فاخرة معتمدة 100%.',
      trust_returns: 'إرجاع سهل',
      trust_returns_desc: 'إرجاع خلال 30 يوماً بدون تعقيد.',
      trust_support: 'دعم مميز',
      trust_support_desc: 'مستشارات أناقة متاحون 24/7.',
      reviews_eyebrow: 'آراء العملاء',
      reviews_title: 'ماذا تقول عميلاتنا',
      insta_eyebrow: '@kwanzou.eg',
      insta_title: 'إلهام الأناقة',
      news_eyebrow: 'وصول حصري',
      news_title: 'انضمي لمجتمع Kwanzou',
      news_desc: 'وصول مبكر للمجموعات الجديدة، نصائح الأناقة، وعروض حصرية.',
      news_placeholder: 'أدخلي بريدك الإلكتروني',
      news_subscribe: 'اشتراك',
      news_welcome: 'مرحباً بكِ في دائرة لوميère ✨',
      footer_desc: 'Kwanzou EG — إكسسوارات ومجوهرات فاخرة للمرأة العصرية في مصر.',
      footer_shop: 'تسوق',
      footer_account: 'الحساب',
      footer_care: 'خدمة العملاء',
      footer_contact: 'تواصل',
      footer_signin: 'تسجيل الدخول',
      footer_register: 'إنشاء حساب',
      footer_orders: 'طلباتي',
      footer_wishlist: 'المفضلة',
      footer_shipping: 'الشحن',
      footer_returns: 'الإرجاع',
      footer_faq: 'الأسئلة الشائعة',
      footer_privacy: 'الخصوصية',
      footer_terms: 'الشروط',
      footer_rights: 'جميع الحقوق محفوظة.',
      add_cart: 'أضيفي للحقيبة',
      quick_view: 'عرض سريع',
      added_bag: 'تمت الإضافة للحقيبة',
      wishlist_add: 'أضيفي للمفضلة',
      wishlist_remove: 'حُذفت من المفضلة',
      badge_new: 'جديد',
      badge_bestseller: 'الأكثر مبيعاً',
      badge_limited: 'محدود',
      login_title: 'تسجيل الدخول | لوميère',
      login_welcome: 'مرحباً بعودتك',
      login_sub: 'سجّلي دخولك لعرض الطلبات والمفضلة والمزيد.',
      login_email: 'البريد الإلكتروني',
      login_password: 'كلمة المرور',
      login_submit: 'تسجيل الدخول',
      login_demo: 'حسابات تجريبية:',
      login_demo_customer: 'حساب عميل',
      login_demo_admin: 'مدير النظام',
      login_no_account: 'ليس لديك حساب؟',
      login_create: 'أنشئي حساباً',
      login_back: '← العودة للمتجر',
      login_visual: 'مجوهرات وإكسسوارات فاخرة للمرأة العصرية.',
      login_error: 'البريد أو كلمة المرور غير صحيحة.',
      register_title: 'إنشاء حساب | لوميère',
      register_heading: 'إنشاء حساب',
      register_sub: 'سجّلي للتتبع الطلبات، حفظ المفضلة، والعروض الحصرية.',
      register_name: 'الاسم الكامل',
      register_phone: 'الهاتف (اختياري)',
      register_submit: 'إنشاء حساب',
      register_have: 'لديك حساب بالفعل؟',
      register_signin: 'تسجيل الدخول',
      register_visual: 'انضمي لآلاف النساء اللواتي يثقن بلوميère.',
      register_error_required: 'جميع الحقول مطلوبة.',
      register_error_pass: 'كلمة المرور 6 أحرف على الأقل.',
      register_error_exists: 'البريد مسجّل مسبقاً.',
      account_title: 'حسابي | لوميère',
      account_eyebrow: 'حسابي',
      account_welcome: 'مرحباً',
      account_logout: 'تسجيل الخروج',
      account_overview: 'نظرة عامة',
      account_orders: 'طلباتي',
      account_wishlist: 'المفضلة',
      account_profile: 'الإعدادات',
      account_stat_orders: 'الطلبات',
      account_stat_wishlist: 'المفضلة',
      account_stat_member: 'عضو منذ',
      account_recent: 'آخر الطلبات',
      account_orders_title: 'سجل الطلبات',
      account_wishlist_title: 'قائمة المفضلة',
      account_profile_title: 'إعدادات الملف',
      account_order_id: 'رقم الطلب',
      account_date: 'التاريخ',
      account_items: 'المنتجات',
      account_total: 'الإجمالي',
      account_status: 'الحالة',
      account_no_orders: 'لا توجد طلبات بعد.',
      account_shop: 'ابدئي التسوق',
      account_empty_wishlist: 'المفضلة فارغة.',
      account_save: 'حفظ التغييرات',
      account_saved: 'تم تحديث الملف بنجاح',
      status_delivered: 'تم التسليم',
      status_shipped: 'قيد الشحن',
      status_pending: 'قيد المعالجة',
      admin_dashboard: 'لوحة التحكم',
      admin_products: 'المنتجات',
      admin_categories: 'الأقسام',
      admin_collections: 'المجموعات',
      admin_settings: 'إعدادات الموقع',
      admin_users: 'العملاء',
      admin_testimonials: 'آراء العملاء',
      admin_newsletter: 'النشرة',
      admin_super: 'مدير النظام',
      admin_view_store: 'عرض المتجر ←',
      admin_signout: 'تسجيل الخروج',
      admin_add_product: '+ إضافة منتج',
      admin_add_category: '+ إضافة قسم',
      admin_save: 'حفظ',
      admin_reset: 'استعادة الافتراضي',
      admin_reset_desc: 'استعادة المنتجات والأقسام والإعدادات للقيم الافتراضية.',
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
    jewelry: { ar: 'المجوهرات', en: 'Jewelry' },
    necklaces: { ar: 'القلادات', en: 'Necklaces' },
    earrings: { ar: 'الأقراط', en: 'Earrings' },
    handbags: { ar: 'حقائب اليد', en: 'Handbags' },
    watches: { ar: 'الساعات', en: 'Watches' },
    scarves: { ar: 'الأوشحة والحرير', en: 'Scarves & Silk' },
    sunglasses: { ar: 'النظارات', en: 'Sunglasses' },
    'new-arrivals': { ar: 'وصل حديثاً', en: 'New Arrivals' }
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
    translateCategory, translateBadge, translateStatus,
    applyTranslations, applyDocumentLang, langSwitcherHTML, bindLangSwitch, init
  };
})();
