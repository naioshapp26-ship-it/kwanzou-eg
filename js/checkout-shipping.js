/**
 * Checkout — shipping zones & payment methods
 */
const CheckoutShipping = (() => {
  const DEFAULT_CONFIG = {
    freeThreshold: 1500,
    countries: [
      {
        code: 'EG',
        nameAr: 'مصر',
        nameEn: 'Egypt',
        zones: [
          { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', fee: 50 },
          { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', fee: 50 },
          { id: 'alex', nameAr: 'الإسكندرية', nameEn: 'Alexandria', fee: 60 },
          { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', fee: 60 },
          { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia', fee: 65 },
          { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia', fee: 65 },
          { id: 'gharbia', nameAr: 'الغربية', nameEn: 'Gharbia', fee: 65 },
          { id: 'monufia', nameAr: 'المنوفية', nameEn: 'Monufia', fee: 65 },
          { id: 'beheira', nameAr: 'البحيرة', nameEn: 'Beheira', fee: 70 },
          { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', fee: 70 },
          { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', fee: 70 },
          { id: 'port-said', nameAr: 'بورسعيد', nameEn: 'Port Said', fee: 70 },
          { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta', fee: 70 },
          { id: 'kafr-el-sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', fee: 70 },
          { id: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum', fee: 75 },
          { id: 'beni-suef', nameAr: 'بني سويف', nameEn: 'Beni Suef', fee: 80 },
          { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya', fee: 80 },
          { id: 'assiut', nameAr: 'أسيوط', nameEn: 'Assiut', fee: 85 },
          { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag', fee: 85 },
          { id: 'qena', nameAr: 'قنا', nameEn: 'Qena', fee: 90 },
          { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor', fee: 90 },
          { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan', fee: 95 },
          { id: 'red-sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea', fee: 100 },
          { id: 'matrouh', nameAr: 'مطروح', nameEn: 'Matrouh', fee: 100 },
          { id: 'north-sinai', nameAr: 'شمال سيناء', nameEn: 'North Sinai', fee: 100 },
          { id: 'south-sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai', fee: 100 },
          { id: 'new-valley', nameAr: 'الوادي الجديد', nameEn: 'New Valley', fee: 110 }
        ]
      },
      {
        code: 'SA',
        nameAr: 'السعودية',
        nameEn: 'Saudi Arabia',
        zones: [
          { id: 'sa-riyadh', nameAr: 'الرياض', nameEn: 'Riyadh', fee: 250 },
          { id: 'sa-jeddah', nameAr: 'جدة', nameEn: 'Jeddah', fee: 250 },
          { id: 'sa-other', nameAr: 'مدن أخرى', nameEn: 'Other cities', fee: 300 }
        ]
      },
      {
        code: 'AE',
        nameAr: 'الإمارات',
        nameEn: 'UAE',
        zones: [
          { id: 'ae-dubai', nameAr: 'دبي', nameEn: 'Dubai', fee: 250 },
          { id: 'ae-abu', nameAr: 'أبوظبي', nameEn: 'Abu Dhabi', fee: 250 },
          { id: 'ae-other', nameAr: 'إمارات أخرى', nameEn: 'Other emirates', fee: 300 }
        ]
      },
      {
        code: 'OTHER',
        nameAr: 'دولة أخرى',
        nameEn: 'Other country',
        zones: [
          { id: 'intl', nameAr: 'شحن دولي', nameEn: 'International', fee: 400 }
        ]
      }
    ],
    paymentMethods: [
      { id: 'cod', nameAr: 'الدفع عند الاستلام', nameEn: 'Cash on Delivery', enabled: true },
      {
        id: 'instapay',
        nameAr: 'Instapay / إنستا باي',
        nameEn: 'Instapay',
        enabled: true,
        phone: '01284371361',
        whatsapp: '201284371361',
        instructionsAr: 'يرجى تحويل المبلغ عبر إنستا باي على الرقم: 01284371361 لعملية التحويل، يرجى إرسال لقطة شاشة للتأكيد على نفس الرقم بعد الإرسال 🤍',
        instructionsEn: 'Please transfer the amount via Instapay to: 01284371361. After transferring, please send a screenshot for confirmation to the same number 🤍'
      }
    ]
  };

  function mergePaymentMethods(saved) {
    const defaults = DEFAULT_CONFIG.paymentMethods.map(m => ({ ...m }));
    if (!Array.isArray(saved) || !saved.length) return defaults;
    const byId = new Map(saved.map(m => [m.id, m]));
    const merged = defaults.map(d => {
      const prev = byId.get(d.id);
      if (!prev) return d;
      // Keep enable flag from admin, but always use latest Instapay copy/phone from code.
      if (d.id === 'instapay') {
        return {
          ...d,
          enabled: prev.enabled !== false
        };
      }
      return { ...d, ...prev, id: d.id };
    });
    saved.forEach(m => {
      if (m?.id && !merged.some(x => x.id === m.id) && m.id !== 'card' && m.id !== 'wallet') {
        merged.push(m);
      }
    });
    return merged;
  }

  function getConfig() {
    const s = LumiereStore?.get?.()?.settings || {};
    return {
      freeThreshold: s.freeShippingThreshold ?? DEFAULT_CONFIG.freeThreshold,
      countries: s.shippingCountries?.length ? s.shippingCountries : DEFAULT_CONFIG.countries,
      paymentMethods: mergePaymentMethods(s.paymentMethods)
    };
  }

  function zoneLabel(zone) {
    return LumiereI18n.getLang() === 'ar' ? zone.nameAr : zone.nameEn;
  }

  function countryLabel(country) {
    return LumiereI18n.getLang() === 'ar' ? country.nameAr : country.nameEn;
  }

  function paymentLabel(method) {
    return LumiereI18n.getLang() === 'ar' ? method.nameAr : method.nameEn;
  }

  function paymentInstructions(method) {
    if (!method) return '';
    return LumiereI18n.getLang() === 'ar'
      ? (method.instructionsAr || '')
      : (method.instructionsEn || method.instructionsAr || '');
  }

  function findCountry(code) {
    return getConfig().countries.find(c => c.code === code);
  }

  function findZone(countryCode, zoneId) {
    const country = findCountry(countryCode);
    return country?.zones?.find(z => z.id === zoneId) || null;
  }

  function calcShipping(subtotal, countryCode, zoneId) {
    const config = getConfig();
    const zone = findZone(countryCode, zoneId);
    if (!zone) return { fee: 0, free: false };
    const free = subtotal >= config.freeThreshold;
    return { fee: free ? 0 : zone.fee, free, zone };
  }

  function enabledPaymentMethods() {
    return getConfig().paymentMethods.filter(m => m.enabled);
  }

  return {
    DEFAULT_CONFIG,
    getConfig,
    zoneLabel,
    countryLabel,
    paymentLabel,
    paymentInstructions,
    findCountry,
    findZone,
    calcShipping,
    enabledPaymentMethods
  };
})();
