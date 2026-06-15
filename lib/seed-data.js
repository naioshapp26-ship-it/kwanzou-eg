/** Default store data — seeded into PostgreSQL on first run */
module.exports = {
  settings: {
    brandName: 'Kwanzou EG',
    logo: 'assets/logo.png',
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
    { id: 'cat-1', name: 'Jewelry', nameAr: 'دهب', slug: 'jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', featured: true },
    { id: 'cat-2', name: 'Necklaces', nameAr: 'سلاسل', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', featured: false },
    { id: 'cat-3', name: 'Earrings', nameAr: 'حلق', slug: 'earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', featured: false },
    { id: 'cat-4', name: 'Handbags', nameAr: 'شنط', slug: 'handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', featured: true },
    { id: 'cat-5', name: 'Watches', nameAr: 'ساعات', slug: 'watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', featured: false },
    { id: 'cat-6', name: 'Scarves & Silk', nameAr: 'طرح', slug: 'scarves', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80', featured: false },
    { id: 'cat-7', name: 'Sunglasses', nameAr: 'نظارات', slug: 'sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', featured: false },
    { id: 'cat-8', name: 'New Arrivals', nameAr: 'جديد', slug: 'new-arrivals', image: 'https://images.unsplash.com/photo-1492707896669-8dd329a169e8?w=600&q=80', featured: true }
  ],
  products: [
    { id: 'p1', name: 'Étoile Diamond Necklace', nameAr: 'سلسلة دياموند', category: 'Necklaces', categorySlug: 'necklaces', price: 8900, rating: 5, reviews: 84, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=800&q=80'], badge: 'New', featured: true, bestseller: false, stock: 12, descAr: 'سلسلة حلوة مرصعة بحجر لامع، مطلية دهب.', descEn: 'Luxury necklace with brilliant stones.' },
    { id: 'p2', name: 'Pearl Cascade Earrings', nameAr: 'حلق لؤلؤ', category: 'Earrings', categorySlug: 'earrings', price: 4200, rating: 5, reviews: 156, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'], badge: '', featured: true, bestseller: true, stock: 24, descAr: 'حلق لؤلؤ طبيعي، شكله أنيق.', descEn: 'Natural pearl earrings.' },
    { id: 'p3', name: 'Maison Leather Tote', nameAr: 'شنطة جلد', category: 'Handbags', categorySlug: 'handbags', price: 12500, rating: 5, reviews: 92, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'], badge: 'Best Seller', featured: true, bestseller: true, stock: 8, descAr: 'شنطة جلد كويسة مع تفاصيل دهب.', descEn: 'Premium leather tote.' }
  ],
  collections: [
    { id: 'col-1', label: 'Collection 01', labelAr: 'مجموعة 01', labelEn: 'Collection 01', title: 'Signature\nJewelry', titleAr: 'دهب\nمميز', titleEn: 'Signature\nJewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80' },
    { id: 'col-2', label: 'Collection 02', labelAr: 'مجموعة 02', labelEn: 'Collection 02', title: 'Luxury\nHandbags', titleAr: 'شنط\nحلوة', titleEn: 'Luxury\nHandbags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80' },
    { id: 'col-3', label: 'Collection 03', labelAr: 'مجموعة 03', labelEn: 'Collection 03', title: 'Evening\nAccessories', titleAr: 'إكسسوارات\nسهرات', titleEn: 'Evening\nAccessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d9e7b2?w=1200&q=80' }
  ],
  testimonials: [
    { id: 't1', name: 'Sophia Laurent', location: 'Paris, France', text: 'Extraordinary jewelry quality.', textAr: 'الدهب عندهم تحفة. كل حاجة شكلها فخم.', textEn: 'Extraordinary jewelry quality.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', featured: false },
    { id: 't2', name: 'Amara Chen', location: 'New York, USA', text: 'Beautiful craftsmanship.', textAr: 'اشتريت شنط كتير، بس جودة Kwanzou من أحسن حاجة شوفتها.', textEn: 'Beautiful craftsmanship.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', featured: true },
    { id: 't3', name: 'Layla Al-Rashid', location: 'Dubai, UAE', text: 'Fast shipping and authentic products.', textAr: 'التوصيل سريع، والمنتجات أصلية، وأحلى إكسسوارات اشتريتها.', textEn: 'Fast shipping and authentic products.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', featured: false }
  ],
  users: [
    { id: 'u-admin', name: 'Super Admin', email: 'admin@lumiere.com', password: 'admin123', role: 'superadmin', phone: '+20 100 000 0000', createdAt: '2024-01-01' },
    { id: 'u-demo', name: 'Sarah Mitchell', email: 'customer@lumiere.com', password: 'demo123', role: 'customer', phone: '+20 100 000 0001', createdAt: '2025-03-15', wishlist: ['p2', 'p3'], orders: [] }
  ],
  orders: [],
  newsletter: [],
  cart: {}
};
