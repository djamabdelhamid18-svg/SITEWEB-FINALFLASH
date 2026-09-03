import type { Product } from '../types/store';

export const honestMeasurementNotice =
  'ملاحظة الشفافية: هذه القياسات تقريبية مأخوذة يدوياً بمتر الخياطة. نرحب بتأكيد المقاس المناسب معك بصورة حية عبر واتساب قبل الشحن، ولديك كامل الحق في معاينة وقياس القطعة بيدك عند الاستلام قبل دفع أي دينار.';

export const products: Product[] = [
  {
    id: 1,
    title: 'Baggy Jogger',
    category: 'pants',
    price: 2900,
    badge: 'MOST WANTED',
    rating: 5,
    inStock: true,
    stockCount: 6,
    quality: '10/10 تنفيذ خاص',
    conditionDetails: 'قطعة حصرية مصممة من تنفيذ Finalflash. تطريز Flaming Dice دقيق ومكثف، خياطة ثلاثية متينة، ومطاط خصر مريح مع رباط قابل للتعديل.',
    fabric: '100% قطن ثقيل عالي الجودة والتحمل (Heavyweight Cotton)',
    fit: 'Streetwear Baggy Cut — قصة فضفاضة مع فتحة كاحل مريحة فوق الأحذية',
    care: 'غسيل بارد على 30 درجة مئوية مقلوب للحفاظ على لون القماش والتطريز، لا تستخدم المبيضات.',
    measurements: [
      { label: 'الطول الكامل (تقريبي)', value: 'M: 98 cm | L: 102 cm | XL: 106 cm' },
      { label: 'محيط الخصر (مطاطي)', value: 'M: 72–86 cm | L: 78–92 cm | XL: 84–98 cm' },
      { label: 'عرض الفخذ (Thigh)', value: 'M: 33 cm | L: 35 cm | XL: 37 cm' },
      { label: 'اتساع الكاحل (Leg Opening)', value: '24 cm (Open Bottom)' }
    ],
    images: ['jogger-black.jpg', 'jogger-grey.jpg'],
    description: 'بنطال جوغر بقصة باغية فضفاضة ومريحة. قماش قطني سميك فائق التحمل، وتطريز Flaming Dice المميز من تنفيذ Finalflash.',
    features: [
      'Baggy streetwear fit مريح وعصري',
      'تطريز Flaming Dice عالي الدقة على الجيب',
      'خصر مطاطي مع رباط داخلي سميك للتعديل',
      'متوفر باللونين الأسود والرمادي الكلاسيكي'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#17151a', image: 'jogger-black.jpg' },
      { name: 'Grey', hex: '#8b8990', image: 'jogger-grey.jpg' }
    ]
  },
  {
    id: 2,
    title: 'Thrifted Gymshark T-Shirt',
    category: 'tshirts',
    price: 2000,
    badge: 'THRIFT 10/10',
    rating: 5,
    inStock: true,
    stockCount: 1,
    quality: '10/10 أصلي بحالة الوكالة',
    conditionDetails: 'قطعة ثريفت أصلية واردة بحالة ممتازة وخالية تماماً من العيوب، الدرزات سليمة 100%، وتم غسلها وتعقيمها بالبخار قبل العرض.',
    fabric: 'قطن مرن عالي الجودة لمقاومة التمدد والاهتراء',
    fit: 'Athletic Street Cut — قصة مضبوطة على الكتف والصدر مع ياقة دائرية',
    care: 'غسيل في الغسالة بماء بارد، يفضل التجفيف الطبيعي على حبل وتجنب المكواة المباشرة على الطباعة.',
    measurements: [
      { label: 'المقاس المتاح', value: 'S (يناسب طول 158–172 cm تقريباً)' },
      { label: 'الطول من الكتف', value: '69 cm (قياس يدوي تقريبي)' },
      { label: 'عرض الصدر (Pit to Pit)', value: '50 cm (قياس يدوي تقريبي)' }
    ],
    images: ['gymshark-front.jpg', 'gymshark-back.jpg'],
    description: 'تيشيرت Gymshark أسود أصلي بطباعة بيضاء نظيفة. ملمس ناعم وخفيف، ملائم لارتداء يومي ستريت وير أو رياضي.',
    features: [
      'قطعة ثريفت أصلية 100% بحالة الوكالة',
      'شعار Gymshark كلاسيكي بارز على الصدر والظهر',
      'قماش ناعم وخفيف ومريح في الاستخدام اليومي',
      'مغسولة ومعقمة بالبخار وجاهزة للارتداء فور الاستلام'
    ],
    sizes: ['S'],
    colors: [{ name: 'Black', hex: '#18161b', image: 'gymshark-front.jpg' }]
  },
  {
    id: 3,
    title: 'Vintage Hard Rock Cafe Tee',
    category: 'tshirts',
    price: 2400,
    badge: 'RARE THRIFT 9.5/10',
    rating: 5,
    inStock: true,
    stockCount: 1,
    quality: '9.5/10 فينتاج أصلي',
    conditionDetails: 'قطعة فينتاج نادرة بلون أزرق بحري أصلي، الرسمة الكلاسيكية مطبوعة بجودة عالية دون تشققات ظاهرة، وياقة متماسكة خالية من التمدد.',
    fabric: '100% قطن طبيعي فينتاج ذو ملمس ثقيل وعتيق',
    fit: 'Classic 90s Boxy Fit — قصة فينتاج كلاسيكية مريحة وعريضة',
    care: 'غسيل مقلوباً بماء معتدل أو بارد، لا تستخدم مجفف حراري لحماية جودة الطبعة الأصلية.',
    measurements: [
      { label: 'المقاس المتاح', value: 'M (يناسب طول 168–178 cm تقريباً)' },
      { label: 'الطول الكامل', value: '72 cm (قياس يدوي تقريبي)' },
      { label: 'عرض الصدر (Pit to Pit)', value: '54 cm (قياس يدوي تقريبي)' }
    ],
    images: ['hardrock-front.jpg', 'hardrock-back.jpg'],
    description: 'تيشيرت Hard Rock Cafe كلاسيكي بتصميم فينتاج نادر. خامة قطنية ممتازة وقصة مربعة ستريت وير أصيلة لا تتكرر.',
    features: [
      'قطعة فينتاج أصلية نادرة 1 of 1',
      'طبعة Hard Rock Cafe كلاسيكية بألوان زاهية وثابتة',
      'خامة قطنية طبيعية متماسكة',
      'مفحوصة ومعقمة وجاهزة للمعاينة باليد عند التوصيل'
    ],
    sizes: ['M'],
    colors: [{ name: 'Navy Blue', hex: '#1d2a44', image: 'hardrock-front.jpg' }]
  },
  {
    id: 4,
    title: 'The Finalflash Street Set',
    category: 'bundle',
    price: 4300,
    badge: 'SAVE 600 DA',
    rating: 5,
    inStock: true,
    stockCount: 3,
    quality: '10/10 طقم كامل متناسق',
    conditionDetails: 'طقم متناسق يتضمن بنطال Baggy Jogger مع تيشيرت ستريت وير أصلي (Gymshark أو Hard Rock). توفير فوري بقيمة 600 دج.',
    fabric: 'مزيج من القطن الثقيل للجوغر مع القطن الناعم للتيشيرت',
    fit: 'Complete Oversized Fit — مظهر ستريت وير متكامل منسق بعناية',
    care: 'راجع إرشادات الغسيل الخاصة بكل قطعة في الطقم للحفاظ على ألوانها وتطريزاتها.',
    measurements: [
      { label: 'الجوغر', value: 'M, L, XL (راجع جدول مقاسات البناطيل)' },
      { label: 'التيشيرت المتاح', value: 'Gymshark (S) أو Hard Rock Vintage (M)' }
    ],
    images: ['jogger-black.jpg', 'hardrock-front.jpg', 'gymshark-front.jpg', 'jogger-grey.jpg'],
    description: 'اقتنِ اللوك الكامل بخصم خاص: بنطال Baggy Jogger مطرز مع تيشيرت ستريت وير أصلي من اختيارك بسعر 4,300 دج بدل 4,900 دج.',
    features: [
      'توفير مباشر 600 دج مقارنة بسعر الشراء المنفصل',
      'حرية اختيار لون ومقاس الجوغر (أسود أو رمادي)',
      'حرية اختيار موديل التيشيرت (Gymshark أو Hard Rock)',
      'معاينة كامل الطقم قطعة بقطعة عند الاستلام قبل الدفع'
    ],
    sizes: ['Set Customizer'],
    colors: [
      { name: 'Black Set', hex: '#17151a' },
      { name: 'Grey Set', hex: '#8b8990' }
    ],
    isBundle: true
  },
  {
    id: 5,
    title: 'Carhartt Vintage Baggy Pants',
    category: 'pants',
    price: 4500,
    badge: 'ARCHIVE 1 OF 1',
    rating: 5,
    inStock: true,
    stockCount: 1,
    quality: '9.5/10 فينتاج نادر',
    conditionDetails: 'بنطال Carhartt أصلي بلون بني ترابي كلاسيكي، قماش متين جداً بحالة نظيفة وممتازة، خالي من أي تمزقات، وسحاب نحاسي أصلي.',
    fabric: '100% قماش كانفاس قطني ثقيل ومتين (Heavyweight Canvas)',
    fit: 'Straight Baggy Workwear Fit — قصة مريحة واسعة بستايل الورك وير الأصيل',
    care: 'غسيل بماء بارد وتجنب المجفف عالي الحرارة للحفاظ على صلابة الكانفاس الطبيعي.',
    measurements: [
      { label: 'المقاس المتاح', value: 'W32–W34 (يناسب طول 174–185 cm تقريباً)' },
      { label: 'الطول الكلي', value: '106 cm (قياس يدوي تقريبي)' },
      { label: 'محيط الخصر', value: '84 cm (قياس يدوي تقريبي)' },
      { label: 'عرض الفخذ (Thigh)', value: '34 cm' },
      { label: 'فتحة الكاحل', value: '23 cm' }
    ],
    images: ['CarharttBaggyPants1.jpg', 'CarharttBaggyPants2.jpg', 'CarharttBaggyPants3.jpg', 'CarharttBaggyPants4.jpg'],
    description: 'قطعة أرشيفية نادرة من كارهارت. قماش كانفاس بني فائق المتانة، جيوب وورك وير تقليدية، وقصة باغية تجسد ثقافة الستريت وير الكلاسيكية.',
    features: [
      'قطعة Carhartt أصلية 1 of 1 نادرة',
      'قماش كانفاس ثقيل ومتين للغاية',
      'رقعة Carhartt الكلاسيكية على الجيب الخلفي',
      'سحابات وأزرار معدنية صلبة وأصلية'
    ],
    sizes: ['W32-34'],
    colors: [{ name: 'Duck Brown', hex: '#8b5a2b', image: 'CarharttBaggyPants1.jpg' }]
  },
  {
    id: 6,
    title: 'Converse All Star High 1990s',
    category: 'shoes',
    price: 5200,
    badge: 'VINTAGE 9.5/10',
    rating: 5,
    inStock: true,
    stockCount: 1,
    quality: '9.5/10 فينتاج استثنائي',
    conditionDetails: 'حذاء كونفيرس تشاك تايلور برقبة عالية بحالة ممتازة، الكانفاس متماسك والنعل المطاطي سليم ومرن، خالي من أي تلف أو اهتراء جانبي.',
    fabric: 'كانفاس كلاسيكي متين مع نعل مطاطي أصلي مبركن',
    fit: 'High-Top Classic Fit — دعم كاحل كلاسيكي مريح',
    care: 'تنظيف يدوي بفرشاة ناعمة وماء وصابون معتدل، لا تغسل في الغسالة الأوتوماتيكية لحماية المطاط الطبيعي.',
    measurements: [
      { label: 'المقاس الأوروبي', value: 'EU 40.5 (يناسب طول قدم 25.5 cm تقريباً)' },
      { label: 'طول النعل الداخلي', value: '25.5 cm (قياس يدوي تقريبي)' },
      { label: 'الارتفاع', value: 'High Top (فوق الكاحل)' }
    ],
    images: [
      'Converse-1.jpg', 'Converse-2.jpg', 'Converse-3.jpg',
      'Converse-4.jpg', 'Converse-5.jpg', 'Converse-6.jpg'
    ],
    description: 'حذاء Converse Chuck Taylor All Star High كلاسيكي بلون رمادي دخاني. حذاء ستريت وير أيقوني يعبر عن ثقافة الشارع الحقيقية.',
    features: [
      'قطعة فينتاج أصلية كلاسيكية 1 of 1',
      'نجمة Converse All Star الأصلية على الكاحل',
      'نعل مطاطي مريح ومتين ومقاوم للانزلاق',
      'مغسول ومعقم بالكامل وجاهز للمعاينة والتجربة قبل الدفع'
    ],
    sizes: ['EU 40.5'],
    colors: [{ name: 'Smoke Grey', hex: '#6b666d', image: 'Converse-1.jpg' }]
  }
];
