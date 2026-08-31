// ==========================================================================
// ⚡ Finalflash Feedback Edition - Data Config
// ==========================================================================

const STORE_CONFIG = {
    storeName: "Finalflash",
    tagline: "Hand-picked Streetwear & Thrift",
    instagramUsername: "finalflash.8",
    instagramUrl: "https://www.instagram.com/finalflash.8/",
    whatsappNumber: "213778659640",
    tiktokUrl: "https://www.tiktok.com/@finalflash.8",
    logoImage: "images/logo.jpg",
    currency: "DA",
    announcementText: "⚡ عرض خاص: Baggy Jogger + تيشيرت بـ 3950 DA فقط! | التوصيل متوفر لـ 58 ولاية 🚚",
    aboutText: "فاينل فلاش (Finalflash) - وجهتك الأولى لأفضل قطع الستريت وير والثريفت الأصلية المنتقاة بعناية فائقة في الجزائر مع ضمان الجودة والنظافة العالية.",
    // رابط Webhook اختياري لحفظ الطلبات تلقائياً في Google Sheets أو Telegram Bot
    webhookUrl: "" 
};

// 0. بيانات الولايات الـ 58 مع أسعار التوصيل المقدرة (منزل / مكتب)
const WILAYAS_DATA = [
    { code: "01", name: "01 - أدرار (Adrar)", home: 900, desk: 650 },
    { code: "02", name: "02 - الشلف (Chlef)", home: 600, desk: 400 },
    { code: "03", name: "03 - الأغواط (Laghouat)", home: 750, desk: 500 },
    { code: "04", name: "04 - أم البواقي (Oum El Bouaghi)", home: 650, desk: 450 },
    { code: "05", name: "05 - باتنة (Batna)", home: 650, desk: 450 },
    { code: "06", name: "06 - بجاية (Béjaïa)", home: 600, desk: 400 },
    { code: "07", name: "07 - بسكرة (Biskra)", home: 750, desk: 500 },
    { code: "08", name: "08 - بشار (Béchar)", home: 900, desk: 650 },
    { code: "09", name: "09 - البليدة (Blida)", home: 500, desk: 350 },
    { code: "10", name: "10 - البويرة (Bouira)", home: 600, desk: 400 },
    { code: "11", name: "11 - تمنراست (Tamanrasset)", home: 1100, desk: 850 },
    { code: "12", name: "12 - تبسة (Tébessa)", home: 700, desk: 450 },
    { code: "13", name: "13 - تلمسان (Tlemcen)", home: 650, desk: 450 },
    { code: "14", name: "14 - تيارت (Tiaret)", home: 650, desk: 450 },
    { code: "15", name: "15 - تيزي وزو (Tizi Ouzou)", home: 600, desk: 400 },
    { code: "16", name: "16 - الجزائر العاصمة (Alger)", home: 450, desk: 300 },
    { code: "17", name: "17 - الجلفة (Djelfa)", home: 700, desk: 450 },
    { code: "18", name: "18 - جيجل (Jijel)", home: 650, desk: 450 },
    { code: "19", name: "19 - سطيف (Sétif)", home: 600, desk: 400 },
    { code: "20", name: "20 - سعيدة (Saïda)", home: 700, desk: 450 },
    { code: "21", name: "21 - سكيكدة (Skikda)", home: 650, desk: 450 },
    { code: "22", name: "22 - سيدي بلعباس (Sidi Bel Abbès)", home: 650, desk: 450 },
    { code: "23", name: "23 - عنابة (Annaba)", home: 650, desk: 450 },
    { code: "24", name: "24 - قالمة (Guelma)", home: 650, desk: 450 },
    { code: "25", name: "25 - قسنطينة (Constantine)", home: 600, desk: 400 },
    { code: "26", name: "26 - المدية (Médéa)", home: 600, desk: 400 },
    { code: "27", name: "27 - مستغانم (Mostaganem)", home: 650, desk: 450 },
    { code: "28", name: "28 - المسيلة (M'Sila)", home: 650, desk: 450 },
    { code: "29", name: "29 - معسكر (Mascara)", home: 650, desk: 450 },
    { code: "30", name: "30 - ورقلة (Ouargla)", home: 800, desk: 550 },
    { code: "31", name: "31 - وهران (Oran)", home: 600, desk: 400 },
    { code: "32", name: "32 - البيض (El Bayadh)", home: 800, desk: 550 },
    { code: "33", name: "33 - إليزي (Illizi)", home: 1100, desk: 850 },
    { code: "34", name: "34 - برج بوعريريج (Bordj Bou Arreridj)", home: 600, desk: 400 },
    { code: "35", name: "35 - بومرداس (Boumerdès)", home: 500, desk: 350 },
    { code: "36", name: "36 - الطارف (El Tarf)", home: 700, desk: 450 },
    { code: "37", name: "37 - تندوف (Tindouf)", home: 1100, desk: 850 },
    { code: "38", name: "38 - تيسمسيلت (Tissemsilt)", home: 650, desk: 450 },
    { code: "39", name: "39 - الوادي (El Oued)", home: 800, desk: 550 },
    { code: "40", name: "40 - خنشلة (Khenchela)", home: 700, desk: 450 },
    { code: "41", name: "41 - سوق أهراس (Souk Ahras)", home: 700, desk: 450 },
    { code: "42", name: "42 - تيبازة (Tipaza)", home: 500, desk: 350 },
    { code: "43", name: "43 - ميلة (Mila)", home: 650, desk: 450 },
    { code: "44", name: "44 - عين الدفلى (Aïn Defla)", home: 600, desk: 400 },
    { code: "45", name: "45 - النعامة (Naâma)", home: 800, desk: 550 },
    { code: "46", name: "46 - عين تموشنت (Aïn Témouchent)", home: 650, desk: 450 },
    { code: "47", name: "47 - غرداية (Ghardaïa)", home: 750, desk: 500 },
    { code: "48", name: "48 - غليزان (Relizane)", home: 650, desk: 450 },
    { code: "49", name: "49 - تيميمون (Timimoun)", home: 950, desk: 700 },
    { code: "50", name: "50 - برج باجي مختار (Bordj Badji Mokhtar)", home: 1200, desk: 900 },
    { code: "51", name: "51 - أولاد جلال (Ouled Djellal)", home: 750, desk: 500 },
    { code: "52", name: "52 - بني عباس (Béni Abbès)", home: 950, desk: 700 },
    { code: "53", name: "53 - عين صالح (In Salah)", home: 1100, desk: 850 },
    { code: "54", name: "54 - عين قزام (In Guezzam)", home: 1200, desk: 900 },
    { code: "55", name: "55 - تقرت (Touggourt)", home: 800, desk: 550 },
    { code: "56", name: "56 - جانت (Djanet)", home: 1200, desk: 900 },
    { code: "57", name: "57 - المغير (El M'Ghair)", home: 800, desk: 550 },
    { code: "58", name: "58 - المنيعة (El Meniaa)", home: 850, desk: 600 }
];

// دليل المقاسات الشامل
const SIZE_GUIDE_DATA = {
    jogger: {
        title: "دليل مقاسات الـ Baggy Jogger",
        tip: "💡 تصميم البنطال فضفاض (Baggy Fit) ومزود برباط خصر مطاطي وأسفل قابل للتعديل.",
        headers: ["المقاس", "الطول الموصى به", "الوزن الموصى به", "طول البنطال"],
        rows: [
            ["M", "160 - 173 سم", "52 - 68 كغ", "98 سم"],
            ["L", "172 - 182 سم", "68 - 83 كغ", "102 سم"],
            ["XL", "180 - 195 سم", "83 - 100 كغ", "106 سم"]
        ]
    },
    tshirts: {
        title: "دليل مقاسات التيشيرتات (T-Shirts)",
        tip: "💡 قصات التيشيرتات لدينا مريحة وستريت وير أصلي.",
        headers: ["المقاس", "الطول الموصى به", "الوزن الموصى به", "العرض (الصدر)"],
        rows: [
            ["S", "155 - 168 سم", "48 - 62 كغ", "50 سم"],
            ["M", "168 - 178 سم", "62 - 76 كغ", "54 سم"],
            ["L", "176 - 185 سم", "75 - 88 كغ", "58 سم"],
            ["XL", "182 - 195 سم", "88 - 105 كغ", "62 سم"]
        ]
    },
    shoes: {
        title: "دليل مقاسات الأحذية (Converse & Shoes)",
        tip: "💡 حذاء Converse All Star مقاسه مضبوط standard EU.",
        headers: ["EU Size", "طول القدم (سم)", "US Men", "US Women"],
        rows: [
            ["38", "24.0 سم", "5.5", "7.5"],
            ["39", "24.5 سم", "6.0", "8.0"],
            ["40", "25.5 سم", "7.0", "9.0"],
            ["41", "26.0 سم", "7.5", "9.5"],
            ["42", "26.5 سم", "8.5", "10.5"],
            ["43", "27.5 سم", "9.5", "11.5"]
        ]
    }
};

// ضمانات المتجر وسياسة الاستبدال
const STORE_GUARANTEES_DATA = [
    {
        icon: "fa-solid fa-magnifying-glass",
        title: "حق المعاينة قبل الدفع",
        desc: "لك كامل الحق في فتح الطرد ومعاينة نظافة وجودة ومقاس القطعة قبل دفع أي دينار لموظف التوصيل."
    },
    {
        icon: "fa-solid fa-arrows-rotate",
        title: "ضمان استبدال المقاس (48 ساعة)",
        desc: "في حال لم يناسبك المقاس تماماً، يمكنك طلب الاستبدال بمقاس آخر بكل سلاسة وسرعة."
    },
    {
        icon: "fa-solid fa-soap",
        title: "نظافة وتعقيم 10/10",
        desc: "جميع قطع الثريفت تمر عبر غسيل وتعقيم واختبار يدوي دقيق لضمان وصولها لك بحالة الوكالة."
    },
    {
        icon: "fa-solid fa-truck-fast",
        title: "توصيل سريع وآمن لـ 58 ولاية",
        desc: "شحن سريع خلال 24 - 48 ساعة للشمال، و 2 - 4 أيام للجنوب مع إمكانية التوصيل لباب المنزل أو المكتب."
    }
];

const HERO_DATA = {
    badgeText: "Hand-picked Streetwear & Vintage Drops 🔥",
    titleLine1: "STREETWEAR & VINTAGE",
    titleLine2: "CURATED FOR YOU",
    description: "اكتشف تشكيلة Finalflash الحصرية من الـ Baggy Joggers بتطريز النرد المشتعل، تيشيرتات Gymshark وHard Rock Vintage، وسنيكرز Converse الأصلية.",
    mainImage: "images/jogger-black.jpg",
    featuredCard: {
        badge: "🔥 Most Wanted",
        title: "Baggy Jogger",
        price: "2900 DA",
        sizesText: "M / L / XL",
        productId: 1
    }
};

const SPECIAL_BUNDLE_DATA = {
    badge: "🔥 Special Bundle Offer",
    title: "Baggy Jogger + T-Shirt (Gymshark or Hard Rock)",
    price: 3950,
    regularPrice: 4900,
    savingsText: "Save 950 DA!",
    description: "وفّر 950 دج فوراً عند طلب طقم الستريت وير الكامل: اختر بنطال الجوغر المفضل لديك (أسود أو رمادي) مع تيشيرت Gymshark أو Hard Rock الأصلي بسعر 3950 DA بدل 4900 DA مع التوصيل لكافة الولايات.",
    buttonText: "⚡ تخصيص وطلب العرض (3950 DA)"
};

const DELIVERY_SECTION_DATA = {
    badge: "ALGERIA WIDE DELIVERY",
    title: "التوصيل السريع متوفر لـ 69 ولاية 🇩🇿",
    description: "مهما كانت ولايتك، طلبك يوصلك لباب المنزل أو للمكتب في أسرع وقت مع إمكانية فحص الطرد والدفع عند الاستلام (Paiement à la livraison).",
    image: "images/logo.jpg"
};

// 1. ستوريات إنستغرام متضمنة ستوري مخصص لآراء الزبائن (Reviews ⭐)
const STORIES_DATA = [
    {
        id: 1,
        title: "Reviews ⭐",
        cover: "images/feedback-1.jpg",
        items: [
            { image: "images/feedback-1.jpg", caption: "رأي وثقة زبائننا في سرعة التوصيل وجودة السلعة 💬✨" },
            { image: "images/feedback-2.jpg", caption: "استلام الطرد ورضا تام عن نظافة القطع 10/10 📦🔥" },
            { image: "images/feedback-3.jpg", caption: "تجربة تسوق ممتازة وتأكيد المقاسات المضبوطة 🤝" },
            { image: "images/feedback-4.jpg", caption: "توصيل سريع لباب المنزل مع الدفع عند الاستلام 🚚" },
            { image: "images/feedback-5.jpg", caption: "جودة القماش والتطريز كما في الصور تماماً ⚡" },
            { image: "images/feedback-6.jpg", caption: "شهادات زبائننا من مختلف ولايات الوطن 🇩🇿" },
            { image: "images/feedback-7.jpg", caption: "تأكيد جودة قطع الثريفت الأصلية ونظافتها ✨" },
            { image: "images/feedback-8.jpg", caption: "شكراً لثقتكم المستمرة في Finalflash 💜" }
        ]
    },
    {
        id: 2,
        title: "New Drop 🔥",
        cover: "images/jogger-black.jpg",
        items: [
            {
                image: "images/jogger-black.jpg",
                caption: "وصول الدفعة الجديدة من الـ Baggy Jogger مع تطريز النرد المشتعل - كمية محدودة جداً!",
                linkText: "عرض الجوغر الأسود",
                productId: 1
            },
            {
                image: "images/gymshark-front.jpg",
                caption: "تيشيرت Gymshark ثريفت أصلي بحالة الوكالة 10/10 متوفر الآن.",
                linkText: "عرض التيشيرت",
                productId: 2
            }
        ]
    },
    {
        id: 3,
        title: "Special Offer 🎁",
        cover: "images/jogger-grey.jpg",
        items: [
            {
                image: "images/jogger-grey.jpg",
                caption: "⚡ باقة التوفير: Baggy Jogger + تيشيرت (Gymshark أو Hard Rock) فقط بـ 3950 دج بدل 4900 دج!",
                linkText: "اطلب العرض الخاص الآن",
                action: "openBundleOffer"
            }
        ]
    },
    {
        id: 4,
        title: "All Star 👟",
        cover: "images/Converse-1.jpg",
        items: [
            {
                image: "images/Converse-1.jpg",
                caption: "Converse All Star أصلية كلاسيكية مقاس 39 بحالة ممتازة 9.5/10.",
                linkText: "مشاهدة الكونفرس",
                productId: 4
            },
            {
                image: "images/Converse-2.jpg",
                caption: "تفاصيل ونظافة نعل حذاء الكونفرس الأصلي.",
                linkText: "طلب الكونفرس",
                productId: 4
            }
        ]
    },
    {
        id: 5,
        title: "Carhartt 🛹",
        cover: "images/CarharttBaggyPants1.jpg",
        items: [
            {
                image: "images/CarharttBaggyPants1.jpg",
                caption: "Carhartt Baggy Pants أسود - متانة فائقة وقصة ستريت وير أصلية 100%.",
                linkText: "تفاصيل البنطال",
                productId: 5
            },
            {
                image: "images/CarharttBaggyPants2.jpg",
                caption: "شعار وجودة كارهارت الأصلية بحالة 9.5/10.",
                linkText: "طلب البنطال",
                productId: 5
            }
        ]
    }
];

// 2. قائمة لقطات الشاشة لمعرض آراء ومحادثات الزبائن (Feedback Gallery Lightbox)
const FEEDBACK_GALLERY_DATA = [
    { id: 1, image: "images/feedback-1.jpg", title: "محادثة زبون مؤكد", tag: "سرعة التوصيل 🚚", stars: 5 },
    { id: 2, image: "images/feedback-2.jpg", title: "استلام الطرد", tag: "جودة 10/10 ✨", stars: 5 },
    { id: 3, image: "images/feedback-3.jpg", title: "تأكيد المقاسات", tag: "مطابقة تامة 📏", stars: 5 },
    { id: 4, image: "images/feedback-4.jpg", title: "رضا الزبون", tag: "دفع عند الاستلام 💵", stars: 5 },
    { id: 5, image: "images/feedback-5.jpg", title: "خامة ممتازة", tag: "قماش سميك 🔥", stars: 5 },
    { id: 6, image: "images/feedback-6.jpg", title: "ثقة متجددة", tag: "زبون دائم 🤝", stars: 5 },
    { id: 7, image: "images/feedback-7.jpg", title: "نظافة السلعة", tag: "حالة الوكالة 🧼", stars: 5 },
    { id: 8, image: "images/feedback-8.jpg", title: "خدمة راقية", tag: "معاملة احترافية 💜", stars: 5 }
];

const CATEGORIES_DATA = [
    { id: "all", name: "All", icon: "sparkles" },
    { id: "pants", name: "Pants & Joggers", icon: "vest" },
    { id: "tshirts", name: "T-Shirts", icon: "shirt" },
    { id: "shoes", name: "Shoes", icon: "shoe-prints" },
    { id: "bundle", name: "Special Offers", icon: "fire" }
];

const PRODUCTS_DATA = [
    {
        id: 1,
        title: "Baggy Jogger",
        category: "pants",
        price: 2900,
        badge: "Most Wanted 🔥",
        rating: 5.0,
        inStock: true,
        stockCount: 6,
        quality: "10/10 Condition",
        images: [
            "images/jogger-black.jpg",
            "images/jogger-grey.jpg"
        ],
        description: "بنطال جوغر ستريت وير بقصة باغية فضفاضة ومريحة جداً (Baggy Fit)، مصنوع من قماش قطني ممتاز وسميك مناسب لجميع فصول السنة، ومزين بتطريز متقن لنرد مشتعل (Flaming Dice).",
        features: [
            "قصة باغية مريحة وعصرية (Baggy Streetwear Fit)",
            "تطريز نرد مشتعل ناري عالي الدقة",
            "رباط خصر مطاطي مع إمكانية تعديل أسفل البنطال",
            "متوفر بلونين كلاسيكيين: الأسود والرمادي"
        ],
        sizes: ["M", "L", "XL"],
        colors: [
            { name: "Black", hex: "#111111", image: "images/jogger-black.jpg" },
            { name: "Grey", hex: "#8e8e93", image: "images/jogger-grey.jpg" }
        ]
    },
    {
        id: 2,
        title: "Thrifted Gymshark T-Shirt",
        category: "tshirts",
        price: 2000,
        badge: "Thrift 10/10 ✨",
        rating: 5.0,
        inStock: true,
        stockCount: 2,
        quality: "10/10 (وكالة)",
        images: [
            "images/gymshark-front.jpg",
            "images/gymshark-back.jpg"
        ],
        description: "تيشيرت جيم شارك أصلي 100% مستورد ثريفت بحالة الوكالة التامة (10/10). يتميز بلوجو جيم شارك مطرز في الأمام وطباعة جريئة ومميزة باللون الفضي في الخلف.",
        features: [
            "قطعة ثريفت أصلية 100% بحالة استثنائية (10/10)",
            "شعار أمامي مع طباعة خلفية أيقونية",
            "خامة قطنية فائقة النعومة والمرونة",
            "المقاس: S"
        ],
        sizes: ["S"],
        colors: [
            { name: "Black", hex: "#111111", image: "images/gymshark-front.jpg" },
            { name: "Blue", hex: "#1d4ed8" }
        ]
    },
    {
        id: 3,
        title: "Thrifted Hard Rock Graphic Tee",
        category: "tshirts",
        price: 1500,
        badge: "Vintage 🎸",
        rating: 5.0,
        inStock: true,
        stockCount: 1,
        quality: "9/10 (ممتازة)",
        images: [
            "images/hardrock-front.jpg",
            "images/hardrock-back.jpg"
        ],
        description: "تيشيرت كلاسيكي ثريفت نادر من Hard Rock Cafe باللون الأزرق المميز. يتميز بشعار Hard Rock في الأمام مع جرافيك خلفي مذهل لقيثارة مشتعلة وتنانين بنمط الفينتج الأصيل.",
        features: [
            "قطعة ثريفت نادرة وفريدة (1 of 1)",
            "أمام: شعار Hard Rock Cafe الأصلي",
            "خلف: جرافيك قيثارة وتنانين مميز",
            "حالة النظافة: 9/10 | المقاس: M"
        ],
        sizes: ["M"],
        colors: [
            { name: "Blue", hex: "#1e3a8a", image: "images/hardrock-front.jpg" }
        ]
    },
    {
        id: 4,
        title: "Authentic All Star Converse",
        category: "shoes",
        price: 2900,
        badge: "Authentic 👟",
        rating: 5.0,
        inStock: true,
        stockCount: 1,
        quality: "9.5/10 (شبه جديد)",
        images: [
            "images/Converse-1.jpg",
            "images/Converse-2.jpg",
            "images/Converse-3.jpg",
            "images/Converse-4.jpg",
            "images/Converse-5.jpg",
            "images/Converse-6.jpg"
        ],
        description: "حذاء كونفرس أول ستار الأصلي الشهير (Chuck Taylor All Star) باللون الأبيض الناصع مع الخطوط الحمراء والزرقاء الأيقونية. نظافة شبه جديدة 9.5/10 وجاهز للارتداء.",
        features: [
            "كونفرس أول ستار أصلي 100%",
            "حالة النظافة والنعل ممتازة جداً (9.5/10)",
            "اللون: أبيض مع خط أحمر وأزرق كلاسيكي",
            "المقاس: 39 EU"
        ],
        sizes: ["39"],
        colors: [
            { name: "White Classic", hex: "#f8f9fa", image: "images/Converse-1.jpg" }
        ]
    },
    {
        id: 5,
        title: "Carhartt Baggy Pants",
        category: "pants",
        price: 3000,
        badge: "Skate / Workwear 🛹",
        rating: 5.0,
        inStock: true,
        stockCount: 1,
        quality: "9.5/10 (متانة أصلية)",
        images: [
            "images/CarharttBaggyPants1.jpg",
            "images/CarharttBaggyPants2.jpg",
            "images/CarharttBaggyPants3.jpg",
            "images/CarharttBaggyPants4.jpg"
        ],
        description: "بنطال كارهارت (Carhartt) الأسود الشهير بقصة فضفاضة وباغية لعشاق الستريت وير والتزلج. قماش كانفاس سميك ومقاوم مع لوجو كارهارت المميز.",
        features: [
            "خامة كارهارت الأصلية شديدة التحمل",
            "قصة فضفاضة كلاسيكية (Baggy Streetwear Cut)",
            "حالة النظافة: 9.5/10 ممتازة",
            "المقاس الموصى به: L"
        ],
        sizes: ["L"],
        colors: [
            { name: "Black", hex: "#111111", image: "images/CarharttBaggyPants1.jpg" }
        ]
    }
];

const INSTAGRAM_GALLERY_IMAGES = [
    { image: "images/jogger-black.jpg", title: "Baggy Jogger Black", tag: "New Drop 🔥", storyIndex: 1 },
    { image: "images/gymshark-front.jpg", title: "Gymshark Tee", tag: "Thrift 10/10 ⚡", storyIndex: 2 },
    { image: "images/hardrock-front.jpg", title: "Hard Rock Vintage", tag: "Vintage 🎸", storyIndex: 1 },
    { image: "images/Converse-1.jpg", title: "Converse All Star", tag: "Authentic 👟", storyIndex: 3 },
    { image: "images/CarharttBaggyPants1.jpg", title: "Carhartt Pants", tag: "Workwear 🛹", storyIndex: 4 }
];

const FAQS_DATA = [
    {
        q: "كيف تتم عملية الطلب والتأكيد؟",
        a: "اختر منتجاتك ومقاساتك وأضفها للسلة، ثم اضغط 'إتمام الطلب'. يمكنك إرسال تفاصيل الفاتورة مباشرة عبر واتساب بنقرة زر أو نسخها لمراسلتنا على حسابنا في إنستغرام (@finalflash.8)."
    },
    {
        q: "ما هي الولايات التي يتوفر فيها التوصيل وكم يستغرق؟",
        a: "نوفر التوصيل السريع لـ 69 ولاية عبر كامل التراب الوطني. يستغرق التوصيل عادةً من 24 إلى 48 ساعة للولايات الشمالية، ومن 2 إلى 4 أيام للولايات الجنوبية مع الدفع عند الاستلام (Paiement à la livraison)."
    },
    {
        q: "هل قطع الثريفت أصلية ونظيفة؟",
        a: "نعم! جميع قطع الثريفت لدينا منتقاة بعناية قطعة بقطعة (Hand-picked)، أصلية 100% ومفحوصة بدقة مع تحديد مستوى الجودة والنظافة (مثل 10/10 أو 9.5/10) لضمان أعلى مستويات الرضا."
    },
    {
        q: "كيف أستفيد من العرض الخاص (Baggy Jogger + تيشيرت بـ 3950 DA)؟",
        a: "يمكنك الضغط مباشرة على زر 'تخصيص وطلب العرض' في الموقع لاختيار لون الجوغر والتيشيرت المفضل وإرسال الطلب فوراً بالسعر المخفض 3950 دج."
    }
];
