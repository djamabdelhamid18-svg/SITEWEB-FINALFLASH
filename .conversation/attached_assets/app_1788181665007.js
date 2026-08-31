const state = {
    config: STORE_CONFIG,
    hero: HERO_DATA,
    bundle: SPECIAL_BUNDLE_DATA,
    delivery: DELIVERY_SECTION_DATA,
    products: PRODUCTS_DATA,
    categories: CATEGORIES_DATA,
    stories: STORIES_DATA,
    gallery: INSTAGRAM_GALLERY_IMAGES,
    feedbacks: FEEDBACK_GALLERY_DATA,
    faqs: FAQS_DATA,
    wilayas: typeof WILAYAS_DATA !== 'undefined' ? WILAYAS_DATA : [],
    sizeGuide: typeof SIZE_GUIDE_DATA !== 'undefined' ? SIZE_GUIDE_DATA : {},
    guarantees: typeof STORE_GUARANTEES_DATA !== 'undefined' ? STORE_GUARANTEES_DATA : [],

    cart: JSON.parse(localStorage.getItem('finalflash_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('finalflash_wishlist')) || [],
    orderHistory: JSON.parse(localStorage.getItem('finalflash_orders_history')) || [],

    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    inStockOnly: false,
    
    currentStoryIndex: 0,
    currentSlideIndex: 0,
    storyTimer: null,
    isStoryPaused: false,
    storyDuration: 5000,

    currentLightboxIndex: 0,

    currentQuickViewProduct: null,
    selectedSize: '',
    selectedColor: null,
    selectedQuantity: 1,

    // خيارات التوصيل في الشيك أوت
    selectedWilaya: null,
    deliveryType: 'home', // 'home' | 'desk'
    currentSizeGuideTab: 'jogger'
};

// ==========================================================================
// تهيئة التطبيق
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initStoreBrandAndContent();
    renderCategories();
    renderStories();
    renderProducts();
    renderFeedbackScreenshots();
    renderInstagramGallery();
    renderFAQs();
    initWilayasDropdown();
    updateCartUI();
    updateWishlistBadges();
    setupSearchListeners();

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-quad',
            once: true,
            offset: 20
        });
    }

    // دعم إغلاق الـ Lightbox بزر Escape في لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeFeedbackLightbox();
        if (e.key === 'ArrowRight') prevFeedbackImage();
        if (e.key === 'ArrowLeft') nextFeedbackImage();
    });
});

// تعبئة كافة نصوص وصور الموقع
function initStoreBrandAndContent() {
    const { storeName, tagline, instagramUsername, instagramUrl, whatsappNumber, tiktokUrl, logoImage, currency, announcementText, aboutText } = state.config;
    const hero = state.hero;
    const bundle = state.bundle;
    const delivery = state.delivery;

    document.title = `${storeName} | ${tagline}`;

    setElText('headerStoreName', storeName);
    setElText('headerTagline', tagline);
    setElText('announcementTextDisplay', announcementText);
    setElText('headerInstaHandle', `@${instagramUsername}`);
    setElSrc('headerLogoImg', logoImage);
    setElSrc('footerLogoImg', logoImage);

    setElText('heroBadgeText', hero.badgeText);
    setElText('heroTitleLine1', hero.titleLine1);
    setElText('heroTitleLine2', hero.titleLine2);
    setElText('heroDescription', hero.description);
    setElSrc('heroMainImg', hero.mainImage);
    setElText('heroBundleBtnText', bundle.buttonText);
    setElText('heroInstaHandle', `@${instagramUsername}`);

    if (hero.featuredCard) {
        setElText('heroCardBadge', hero.featuredCard.badge);
        setElText('heroCardTitle', hero.featuredCard.title);
        setElText('heroCardPrice', hero.featuredCard.price);
        setElText('heroCardSizes', hero.featuredCard.sizesText);
        const cardBtn = document.getElementById('heroCardBtn');
        if (cardBtn) {
            cardBtn.onclick = () => openProductQuickView(hero.featuredCard.productId || 1);
        }
    }

    setElText('bundleBadgeText', bundle.badge);
    setElText('bundleTitleText', bundle.title);
    setElText('bundlePriceText', `${bundle.price} ${currency}!`);
    setElText('bundleDescriptionText', bundle.description);
    setElText('bundleBtnText', bundle.buttonText);
    setElText('bundleModalPriceDisplay', `${bundle.price} ${currency} (${bundle.savingsText})`);

    setElText('deliveryBadgeText', delivery.badge);
    setElText('deliveryTitleText', delivery.title);
    setElText('deliveryDescriptionText', delivery.description);
    setElSrc('deliverySectionImg', delivery.image);

    setElText('footerStoreName', storeName);
    setElText('copyrightStoreName', storeName);
    setElText('footerAboutText', aboutText);
    setElText('storyHeaderInsta', `@${instagramUsername}`);

    const instaLinks = ['headerInstagramLink', 'feedFollowBtn', 'deliveryInstagramBtn', 'footerInstaIcon', 'mobileInstaBottomLink'];
    instaLinks.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = instagramUrl || `https://www.instagram.com/${instagramUsername}/`;
    });

    const whatsappLinks = ['deliveryWhatsappBtn', 'footerWhatsappIcon'];
    whatsappLinks.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً Finalflash ⚡، أرغب في الاستفسار عن القطع المتوفرة.')}`;
    });

    const tiktokEl = document.getElementById('footerTiktokIcon');
    if (tiktokEl && tiktokUrl) tiktokEl.href = tiktokUrl;
}

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
}

function setElSrc(id, src) {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
}

// ==========================================================================
// شريط الستوريات (متضمن ستوري آراء الزبائن Reviews ⭐)
// ==========================================================================
function renderStories() {
    const container = document.getElementById('storiesContainer');
    if (!container) return;

    container.innerHTML = state.stories.map((story, index) => `
        <div class="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group" onclick="openStoryViewer(${index})">
            <div class="story-ring-gradient p-0.5 shadow">
                <div class="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-brand-dark overflow-hidden bg-brand-card">
                    <img src="${story.cover}" alt="${story.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                </div>
            </div>
            <span class="text-[11px] font-bold text-neutral-300 max-w-[75px] truncate text-center font-streetwear">${story.title}</span>
        </div>
    `).join('');
}

// ==========================================================================
// معرض ومحادثات آراء الزبائن التفاعلي (Feedback Screenshots Wall)
// ==========================================================================
function renderFeedbackScreenshots() {
    const grid = document.getElementById('feedbackScreenshotsGrid');
    if (!grid) return;

    grid.innerHTML = state.feedbacks.map((item, index) => `
        <div class="bg-brand-card rounded-2xl border border-brand-border overflow-hidden group relative cursor-pointer hover:border-brand-purple/60 hover:shadow-xl transition-all" onclick="openFeedbackLightbox(${index})">
            
            <div class="relative aspect-[3/4] bg-brand-dark overflow-hidden">
                <img src="${item.image}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400">
                
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-2">
                    <div class="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-magnifying-glass-plus text-sm"></i>
                    </div>
                    <span class="text-[11px] font-bold">انقر لقراءة المحادثة 🔍</span>
                </div>

                <div class="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] text-amber-400 font-bold border border-white/10">
                    <i class="fa-solid fa-star"></i>
                    <span>5.0</span>
                </div>
            </div>

            <div class="p-3 bg-brand-card flex items-center justify-between gap-1 border-t border-brand-border">
                <span class="text-[11px] font-bold text-white truncate">${item.title}</span>
                <span class="text-[10px] text-brand-purpleLight font-bold bg-brand-purple/15 px-2 py-0.5 rounded-full whitespace-nowrap">${item.tag}</span>
            </div>

        </div>
    `).join('');
}

function openFeedbackLightbox(index) {
    state.currentLightboxIndex = index;
    const item = state.feedbacks[index];
    if (!item) return;

    document.getElementById('lightboxMainImage').src = item.image;
    document.getElementById('lightboxTagText').textContent = item.tag;
    document.getElementById('lightboxTitleText').textContent = `${item.title} (${index + 1} من ${state.feedbacks.length})`;

    const modal = document.getElementById('feedbackLightboxModal');
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }
}

function closeFeedbackLightbox(e) {
    if (e && e.target.closest('#lightboxMainImage')) return;
    const modal = document.getElementById('feedbackLightboxModal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
}

function nextFeedbackImage() {
    state.currentLightboxIndex = (state.currentLightboxIndex + 1) % state.feedbacks.length;
    openFeedbackLightbox(state.currentLightboxIndex);
}

function prevFeedbackImage() {
    state.currentLightboxIndex = (state.currentLightboxIndex - 1 + state.feedbacks.length) % state.feedbacks.length;
    openFeedbackLightbox(state.currentLightboxIndex);
}

// ==========================================================================
// عرض وتصفية المنتجات
// ==========================================================================
function renderCategories() {
    const container = document.getElementById('categoriesPillsContainer');
    if (!container) return;

    container.innerHTML = state.categories.map(cat => {
        const isActive = state.activeCategory === cat.id;
        const activeClasses = isActive 
            ? 'bg-brand-purple text-white shadow font-bold' 
            : 'bg-brand-card text-neutral-300 hover:bg-brand-cardHover border border-brand-border';

        return `
            <button onclick="filterByCategory('${cat.id}')" 
                    class="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 font-streetwear ${activeClasses}">
                <span>${cat.name}</span>
            </button>
        `;
    }).join('');
}

function filterByCategory(categoryId) {
    if (categoryId === 'bundle') {
        openBundleModal();
        return;
    }
    state.activeCategory = categoryId;
    renderCategories();
    applyFilters();
}

function setupSearchListeners() {
    const desktopInput = document.getElementById('desktopSearchInput');
    const mobileInput = document.getElementById('mobileSearchInput');

    const handleSearch = (val) => {
        state.searchQuery = val.trim();
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
            clearBtn.classList.toggle('hidden', state.searchQuery === '');
        }
        applyFilters();
    };

    if (desktopInput) {
        desktopInput.addEventListener('input', (e) => {
            if (mobileInput) mobileInput.value = e.target.value;
            handleSearch(e.target.value);
        });
    }

    if (mobileInput) {
        mobileInput.addEventListener('input', (e) => {
            if (desktopInput) desktopInput.value = e.target.value;
            handleSearch(e.target.value);
        });
    }
}

function clearSearch() {
    state.searchQuery = '';
    const desktopInput = document.getElementById('desktopSearchInput');
    const mobileInput = document.getElementById('mobileSearchInput');
    if (desktopInput) desktopInput.value = '';
    if (mobileInput) mobileInput.value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    applyFilters();
}

function applyFilters() {
    const sortSelect = document.getElementById('sortBySelect');
    const inStockCheckbox = document.getElementById('inStockFilterCheckbox');

    if (sortSelect) state.sortBy = sortSelect.value;
    if (inStockCheckbox) state.inStockOnly = inStockCheckbox.checked;

    let filtered = [...state.products];

    if (state.activeCategory !== 'all') {
        filtered = filtered.filter(p => p.category === state.activeCategory);
    }

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    if (state.inStockOnly) {
        filtered = filtered.filter(p => p.inStock && p.stockCount > 0);
    }

    if (state.sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderProductsGrid(filtered);
}

function renderProducts() {
    applyFilters();
}

function renderProductsGrid(products) {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProductsFound');
    const countText = document.getElementById('productsCountText');

    if (!grid) return;

    if (countText) {
        countText.textContent = `${products.length} of ${state.products.length} items`;
    }

    if (products.length === 0) {
        grid.innerHTML = '';
        if (noProducts) noProducts.classList.remove('hidden');
        return;
    }

    if (noProducts) noProducts.classList.add('hidden');

    grid.innerHTML = products.map((product) => {
        const isWishlisted = state.wishlist.some(id => id === product.id);
        const isLowStock = product.stockCount && product.stockCount <= 3;

        return `
            <div class="product-card rounded-2xl overflow-hidden flex flex-col group relative">
                
                <div class="relative aspect-[3/4] overflow-hidden bg-brand-dark cursor-pointer" onclick="openProductQuickView(${product.id})">
                    <img src="${product.images[0]}" alt="${product.title}" loading="lazy"
                         class="card-img-zoom w-full h-full object-cover object-center">
                    
                    <div class="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
                        ${product.badge ? `<span class="bg-brand-purpleDark/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow border border-brand-purpleLight/30 font-streetwear">${product.badge}</span>` : ''}
                        ${product.quality ? `<span class="quality-badge text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow font-streetwear">${product.quality}</span>` : ''}
                        ${isLowStock ? `<span class="bg-red-950/90 text-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow border border-red-500/40 animate-pulse">🔥 متبقي ${product.stockCount === 1 ? 'قطعة واحدة فقط' : product.stockCount + ' قطع'}</span>` : ''}
                    </div>

                    <button onclick="toggleWishlist(event, ${product.id})" 
                            class="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-brand-card/80 hover:bg-brand-card text-neutral-300 hover:text-pink-500 shadow flex items-center justify-center transition-all z-10 border border-brand-border" 
                            title="إضافة للمفضلة">
                        <i class="${isWishlisted ? 'fa-solid text-pink-500 fa-heart' : 'fa-regular fa-heart'} text-xs"></i>
                    </button>

                    <div class="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <span class="bg-brand-card/95 hover:bg-brand-card text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg w-full text-center flex items-center justify-center gap-1.5 border border-brand-border font-streetwear">
                            <i class="fa-solid fa-eye text-xs"></i>
                            <span>View Item</span>
                        </span>
                    </div>
                </div>

                <div class="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-brand-card">
                    <div>
                        <h3 onclick="openProductQuickView(${product.id})" 
                            class="font-streetwear font-bold text-sm sm:text-base text-white hover:text-brand-purpleLight cursor-pointer transition-colors leading-snug mb-2">
                            ${product.title}
                        </h3>

                        <div class="flex items-center gap-1.5 overflow-hidden text-[11px] text-neutral-400 mb-2">
                            <span class="font-semibold text-neutral-500">Size:</span>
                            <span class="text-brand-purpleLight font-bold font-streetwear">${product.sizes.join(' / ')}</span>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-brand-border flex items-center justify-between gap-2">
                        <div>
                            <span class="text-sm sm:text-base font-extrabold text-white font-streetwear">${product.price} ${state.config.currency}</span>
                        </div>
                        
                        <button onclick="quickAddToCart(${product.id})" 
                                class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl btn-purple flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                title="إضافة سريعة للسلة">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>

                </div>

            </div>
        `;
    }).join('');
}

function resetAllFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    state.sortBy = 'featured';
    state.inStockOnly = false;
    
    const sortSelect = document.getElementById('sortBySelect');
    const inStockCheckbox = document.getElementById('inStockFilterCheckbox');
    if (sortSelect) sortSelect.value = 'featured';
    if (inStockCheckbox) inStockCheckbox.checked = false;

    clearSearch();
    renderCategories();
    applyFilters();
}

// ==========================================================================
// المعاينة السريعة للمنتج
// ==========================================================================
function openProductQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.currentQuickViewProduct = product;
    state.selectedSize = product.sizes[0] || 'L';
    state.selectedColor = product.colors[0] || null;
    state.selectedQuantity = 1;

    const modal = document.getElementById('productQuickViewModal');
    const content = document.getElementById('productQuickViewContent');

    if (!modal || !content) return;

    const guideTab = product.category === 'shoes' ? 'shoes' : (product.category === 'tshirts' ? 'tshirts' : 'jogger');
    const isLowStock = product.stockCount && product.stockCount <= 3;

    content.innerHTML = `
        <div class="sm:col-span-6 space-y-3">
            <div class="rounded-2xl overflow-hidden aspect-[3/4] bg-brand-dark border border-brand-border shadow-md relative">
                <img id="quickViewMainImage" src="${product.images[0]}" alt="${product.title}" class="w-full h-full object-cover">
                ${product.badge ? `<span class="absolute top-3 right-3 bg-brand-purple text-white text-xs font-bold px-3 py-1 rounded-full shadow font-streetwear">${product.badge}</span>` : ''}
            </div>
            
            ${product.images.length > 1 ? `
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    ${product.images.map((img, idx) => `
                        <button onclick="switchQuickViewImage('${img}', this)" 
                                class="w-14 h-18 rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-brand-purple' : 'border-transparent opacity-60'} hover:opacity-100 flex-shrink-0 transition-all bg-brand-dark">
                            <img src="${img}" class="w-full h-full object-cover">
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>

        <div class="sm:col-span-6 space-y-4">
            
            <div>
                <div class="flex items-center gap-2 text-xs mb-1">
                    <span class="text-amber-400"><i class="fa-solid fa-star"></i> 5.0</span>
                    ${product.quality ? `<span class="quality-badge text-[10px] font-bold px-2 py-0.5 rounded-full font-streetwear">${product.quality}</span>` : ''}
                </div>
                <h2 class="text-lg sm:text-xl font-extrabold text-white font-streetwear">${product.title}</h2>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-2xl font-extrabold text-brand-purpleLight font-streetwear">${product.price} ${state.config.currency}</span>
                </div>
            </div>

            ${isLowStock ? `
                <div class="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                    <i class="fa-solid fa-fire text-red-400 animate-pulse"></i>
                    <span>كمية محدودة: متبقي <strong>${product.stockCount === 1 ? 'قطعة واحدة فقط' : product.stockCount + ' قطع'}</strong> في المخزون!</span>
                </div>
            ` : ''}

            <p class="text-xs text-neutral-300 leading-relaxed">${product.description}</p>

            ${product.features ? `
                <div class="space-y-1.5 py-1 bg-brand-dark/60 p-3 rounded-xl border border-brand-border">
                    ${product.features.map(f => `
                        <div class="flex items-center gap-2 text-[11px] text-neutral-200">
                            <i class="fa-solid fa-check text-brand-purpleLight text-xs"></i>
                            <span>${f}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${product.colors && product.colors.length > 0 ? `
                <div>
                    <label class="block font-bold text-xs text-neutral-200 mb-2 font-streetwear">
                        Color: <span id="quickViewSelectedColorName" class="text-brand-purpleLight">${product.colors[0].name}</span>
                    </label>
                    <div class="flex items-center gap-2.5">
                        ${product.colors.map((c, idx) => `
                            <button onclick="selectColor('${c.name}', '${c.hex}', '${c.image || ''}', this)" 
                                    class="color-dot w-7 h-7 rounded-full border border-neutral-600 ${idx === 0 ? 'active' : ''}" 
                                    style="background-color: ${c.hex}" 
                                    title="${c.name}">
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="font-bold text-xs text-neutral-200 font-streetwear">
                        Size: <span id="quickViewSelectedSizeName" class="text-brand-purpleLight">${state.selectedSize}</span>
                    </label>
                    <button type="button" onclick="openSizeGuideModal('${guideTab}')" class="text-[11px] text-brand-purpleLight hover:underline font-bold flex items-center gap-1">
                        <i class="fa-solid fa-ruler-combined"></i>
                        <span>دليل المقاسات</span>
                    </button>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${product.sizes.map((s, idx) => `
                        <button onclick="selectSize('${s}', this)" 
                                class="size-pill px-4 py-1.5 rounded-xl border border-brand-border text-xs font-semibold text-neutral-300 font-streetwear ${idx === 0 ? 'active' : 'hover:border-neutral-500'}">
                            ${s}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-2 pt-3">
                <button onclick="addCurrentProductToCart()" class="btn-purple w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span>إضافة إلى سلة المشتريات</span>
                </button>
                
                <button onclick="directInstagramOrderFromQuickView()" class="btn-instagram w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                    <i class="fa-brands fa-instagram"></i>
                    <span>طلب مباشر عبر إنستغرام (@${state.config.instagramUsername})</span>
                </button>
            </div>

        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.remove('scale-95');
}

function switchQuickViewImage(src, btn) {
    const mainImg = document.getElementById('quickViewMainImage');
    if (mainImg) mainImg.src = src;

    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => {
        b.classList.remove('border-brand-purple', 'opacity-100');
        b.classList.add('border-transparent', 'opacity-60');
    });
    btn.classList.add('border-brand-purple', 'opacity-100');
    btn.classList.remove('border-transparent', 'opacity-60');
}

function selectSize(size, btn) {
    state.selectedSize = size;
    const nameEl = document.getElementById('quickViewSelectedSizeName');
    if (nameEl) nameEl.textContent = size;

    const pills = btn.parentElement.querySelectorAll('button');
    pills.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
}

function selectColor(colorName, hex, imageSrc, btn) {
    state.selectedColor = { name: colorName, hex };
    const nameEl = document.getElementById('quickViewSelectedColorName');
    if (nameEl) nameEl.textContent = colorName;

    if (imageSrc) {
        const mainImg = document.getElementById('quickViewMainImage');
        if (mainImg) mainImg.src = imageSrc;
    }

    const dots = btn.parentElement.querySelectorAll('button');
    dots.forEach(d => d.classList.remove('active'));
    btn.classList.add('active');
}

function closeProductQuickView() {
    const modal = document.getElementById('productQuickViewModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.add('scale-95');
}

function addCurrentProductToCart() {
    if (!state.currentQuickViewProduct) return;
    
    addToCart(
        state.currentQuickViewProduct,
        state.selectedSize,
        state.selectedColor,
        1
    );

    closeProductQuickView();
    openCartDrawer();
}

function directInstagramOrderFromQuickView() {
    if (!state.currentQuickViewProduct) return;
    
    const p = state.currentQuickViewProduct;
    const size = state.selectedSize || p.sizes[0];
    const color = state.selectedColor ? state.selectedColor.name : (p.colors[0] ? p.colors[0].name : '');

    const text = `مرحباً ${state.config.storeName} ⚡، أرغب بطلب:\n- *${p.title}*\n- المقاس: ${size}\n${color ? `- اللون: ${color}\n` : ''}- السعر: ${p.price} ${state.config.currency}\n\nهل القطعة متوفرة للتوصيل؟`;
    
    copyToClipboardAndOpenInstagram(text);
}

// ==========================================================================
// باقة العرض الخاص
// ==========================================================================
function openBundleModal() {
    const modal = document.getElementById('bundleOfferModal');
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.remove('scale-95');
}

function closeBundleModal() {
    const modal = document.getElementById('bundleOfferModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.add('scale-95');
}

function addBundleToCart() {
    const joggerColor = document.getElementById('bundleJoggerColor').value;
    const joggerSize = document.getElementById('bundleJoggerSize').value;
    const tshirtChoice = document.getElementById('bundleTshirtChoice').value;

    const bundleItem = {
        id: 999,
        title: `⚡ ${state.bundle.title}`,
        price: state.bundle.price,
        image: "images/jogger-black.jpg",
        selectedSize: `Jogger (${joggerSize}) | ${tshirtChoice}`,
        selectedColor: { name: joggerColor },
        quantity: 1
    };

    state.cart.push(bundleItem);
    saveCart();
    updateCartUI();
    closeBundleModal();
    openCartDrawer();
    showToast('تمت إضافة باقة العرض الخاص بنجاح! ⚡', 'success');
}

function directOrderBundleWhatsApp() {
    const joggerColor = document.getElementById('bundleJoggerColor').value;
    const joggerSize = document.getElementById('bundleJoggerSize').value;
    const tshirtChoice = document.getElementById('bundleTshirtChoice').value;

    const message = `مرحباً ${state.config.storeName} ⚡،
أرغب في طلب *باقة العرض الخاص (${state.bundle.price} ${state.config.currency})*:
- Baggy Jogger: ${joggerColor} | مقاس: ${joggerSize}
- التيشيرت: ${tshirtChoice}
- السعر الإجمالي: ${state.bundle.price} ${state.config.currency}

يرجى تأكيد توفر القطع والتوصيل ❤️`;

    const whatsappUrl = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ==========================================================================
// إدارة سلة المشتريات
// ==========================================================================
function quickAddToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const defaultSize = product.sizes[0] || 'L';
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;

    addToCart(product, defaultSize, defaultColor, 1);
    showToast(`Added "${product.title}" to cart ⚡`, 'success');
}

function addToCart(product, size, color, quantity = 1) {
    const existingIndex = state.cart.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        (!color || (item.selectedColor && item.selectedColor.name === color.name))
    );

    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
    } else {
        state.cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0],
            selectedSize: size,
            selectedColor: color,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();

    const iconWrapper = document.getElementById('cartIconWrapper');
    if (iconWrapper) {
        iconWrapper.classList.remove('cart-bounce-animate');
        void iconWrapper.offsetWidth;
        iconWrapper.classList.add('cart-bounce-animate');
    }
}

function updateCartQuantity(index, delta) {
    if (!state.cart[index]) return;
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast('Removed item from cart', 'info');
}

function saveCart() {
    localStorage.setItem('finalflash_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const badges = ['cartCountBadge', 'mobileCartBadge'];
    badges.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = totalItems;
    });

    const headerTotal = document.getElementById('headerCartTotal');
    if (headerTotal) headerTotal.textContent = `${subtotal} ${state.config.currency}`;

    const cartCountText = document.getElementById('cartDrawerItemCount');
    if (cartCountText) cartCountText.textContent = `${totalItems} items`;

    const finalTotalEl = document.getElementById('cartFinalTotalText');
    if (finalTotalEl) finalTotalEl.textContent = `${subtotal} ${state.config.currency}`;

    renderCartItemsList();
}

function renderCartItemsList() {
    const list = document.getElementById('cartItemsList');
    if (!list) return;

    if (state.cart.length === 0) {
        list.innerHTML = `
            <div class="py-16 text-center text-neutral-500">
                <div class="w-16 h-16 rounded-full bg-brand-dark text-neutral-400 flex items-center justify-center mx-auto mb-3 text-2xl border border-brand-border">
                    <i class="fa-solid fa-bag-shopping"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1 font-streetwear">Your cart is empty</h4>
                <p class="text-xs text-neutral-400 mb-4">Add your favorite streetwear items!</p>
                <button onclick="closeCartDrawer()" class="btn-purple text-xs px-5 py-2.5 rounded-full font-bold">
                    Browse Drops
                </button>
            </div>
        `;
        return;
    }

    list.innerHTML = state.cart.map((item, index) => `
        <div class="flex items-center gap-3 p-3 bg-brand-dark rounded-2xl border border-brand-border">
            <div class="w-16 h-20 rounded-xl overflow-hidden bg-brand-card flex-shrink-0">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
            </div>
            
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-xs text-white truncate font-streetwear">${item.title}</h4>
                <div class="text-[11px] text-neutral-400 my-1 truncate font-streetwear">
                    <span>${item.selectedSize}</span>
                    ${item.selectedColor ? `<span class="text-brand-purpleLight mr-1">(${item.selectedColor.name})</span>` : ''}
                </div>
                <span class="text-xs font-extrabold text-brand-purpleLight font-streetwear">${item.price * item.quantity} ${state.config.currency}</span>
            </div>

            <div class="flex flex-col items-end justify-between h-20">
                <button onclick="removeFromCart(${index})" class="text-neutral-500 hover:text-red-400 text-xs p-1" title="Delete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>

                <div class="flex items-center border border-brand-border rounded-lg bg-brand-card">
                    <button onclick="updateCartQuantity(${index}, -1)" class="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-neutral-300 hover:bg-neutral-800"><i class="fa-solid fa-minus"></i></button>
                    <span class="w-6 text-center text-xs font-bold text-white font-streetwear">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${index}, 1)" class="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-neutral-300 hover:bg-neutral-800"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (!drawer || !backdrop) return;

    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    drawer.classList.remove('-translate-x-full');
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (!drawer || !backdrop) return;

    backdrop.classList.add('opacity-0', 'pointer-events-none');
    drawer.classList.add('-translate-x-full');
}

// ==========================================================================
// إتمام الطلب الشامل (Wilayas 58 + Dual Checkout + Auto-Logging)
// ==========================================================================
function initWilayasDropdown() {
    const select = document.getElementById('customerWilayaSelect');
    if (!select || !state.wilayas || state.wilayas.length === 0) return;

    if (select.options.length <= 1) {
        select.innerHTML = '<option value="">-- اختر الولاية (58 ولاية) * --</option>' + 
            state.wilayas.map(w => `<option value="${w.code}">${w.name}</option>`).join('');
    }
}

function setDeliveryType(type) {
    state.deliveryType = type;
    const homeBtn = document.getElementById('deliveryTypeHomeBtn');
    const deskBtn = document.getElementById('deliveryTypeDeskBtn');
    const label = document.getElementById('checkoutDeliveryTypeLabel');

    if (homeBtn && deskBtn) {
        if (type === 'home') {
            homeBtn.className = 'py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition-all bg-brand-purple text-white shadow';
            deskBtn.className = 'py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition-all text-neutral-400 hover:text-white';
            if (label) label.textContent = 'للمنزل';
        } else {
            deskBtn.className = 'py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition-all bg-brand-purple text-white shadow';
            homeBtn.className = 'py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition-all text-neutral-400 hover:text-white';
            if (label) label.textContent = 'استلام من المكتب';
        }
    }
    updateCheckoutCalculations();
}

function onCheckoutWilayaChange() {
    const select = document.getElementById('customerWilayaSelect');
    const code = select ? select.value : '';
    state.selectedWilaya = state.wilayas.find(w => w.code === code) || null;
    updateCheckoutCalculations();
}

function updateCheckoutCalculations() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalEl = document.getElementById('checkoutSubtotalText');
    const shippingEl = document.getElementById('checkoutShippingCostText');
    const totalEl = document.getElementById('checkoutTotalAmount');

    if (subtotalEl) subtotalEl.textContent = `${subtotal} ${state.config.currency}`;

    let shippingCost = 0;
    if (state.selectedWilaya) {
        shippingCost = state.deliveryType === 'home' ? state.selectedWilaya.home : state.selectedWilaya.desk;
        if (shippingEl) shippingEl.textContent = `${shippingCost} ${state.config.currency}`;
    } else {
        if (shippingEl) shippingEl.textContent = `-- ${state.config.currency}`;
    }

    const finalTotal = subtotal + shippingCost;
    if (totalEl) totalEl.textContent = `${finalTotal} ${state.config.currency}`;
}

function openCheckoutModal() {
    if (state.cart.length === 0) {
        showToast('السلة فارغة، يرجى اختيار قطع أولاً', 'error');
        return;
    }

    closeCartDrawer();

    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    initWilayasDropdown();

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('checkoutItemsCount');
    if (countEl) countEl.textContent = totalItems;

    const previewList = document.getElementById('checkoutItemsListPreview');
    if (previewList) {
        previewList.innerHTML = state.cart.map(item => `
            <div class="flex justify-between">
                <span>• ${item.title} (${item.selectedSize}${item.selectedColor ? ' - ' + item.selectedColor.name : ''}) × ${item.quantity}</span>
                <span class="font-bold text-white">${item.price * item.quantity} ${state.config.currency}</span>
            </div>
        `).join('');
    }

    updateCheckoutCalculations();

    modal.classList.remove('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.remove('scale-95');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.add('scale-95');
}

function generateOrderReference() {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FF-${random}`;
}

function recordOrderLocally(orderData) {
    try {
        const history = JSON.parse(localStorage.getItem('finalflash_orders_history')) || [];
        history.unshift(orderData);
        localStorage.setItem('finalflash_orders_history', JSON.stringify(history));
    } catch (e) {
        console.warn('Could not save order to local history', e);
    }
}

async function sendOrderToWebhook(orderData) {
    if (!state.config.webhookUrl) return;
    try {
        await fetch(state.config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            mode: 'no-cors'
        });
    } catch (e) {
        console.warn('Webhook dispatch failed', e);
    }
}

function getOrderDetailsMessage(data) {
    const itemsText = data.items.map((item, idx) => {
        const colorText = item.selectedColor ? ` | Color: ${item.selectedColor.name}` : '';
        return `${idx + 1}. *${item.title}*\n   - Size: ${item.selectedSize}${colorText}\n   - Qty: ${item.quantity} | Price: ${item.price * item.quantity} ${state.config.currency}`;
    }).join('\n\n');

    return `مرحباً ${state.config.storeName} ⚡،
طلب جديد رقم: *#${data.ref}*

📦 *القطع المطلوبة:*
${itemsText}

💰 *ملخص الحساب:*
- مجموع المنتجات: ${data.subtotal} ${state.config.currency}
- مصاريف التوصيل (${data.deliveryType}): ${data.shippingFee} ${state.config.currency}
- *الإجمالي النهائي للدفع: ${data.total} ${state.config.currency}*
- الدفع: عند الاستلام بعد المعاينة (COD) 💵

📍 *معلومات الزبون والتوصيل:*
- الاسم واللقب: ${data.name}
- رقم الهاتف: ${data.phone}
- الولاية: ${data.wilaya}
- البلدية والعنوان: ${data.address}
${data.notes ? `- ملاحظات: ${data.notes}\n` : ''}
شكراً وبانتظار تأكيد إرسال الطرد 🚚⚡`;
}

function validateCustomerData() {
    const nameInput = document.getElementById('customerNameInput');
    const phoneInput = document.getElementById('customerPhoneInput');
    const wilayaSelect = document.getElementById('customerWilayaSelect');
    const addressInput = document.getElementById('customerAddressInput');
    const notesInput = document.getElementById('customerNotesInput');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const wilayaCode = wilayaSelect ? wilayaSelect.value : '';
    const address = addressInput ? addressInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!name) {
        showToast('يرجى كتابة الاسم واللقب', 'error');
        if (nameInput) nameInput.focus();
        return null;
    }

    if (!phone) {
        showToast('يرجى إدخال رقم الهاتف للتواصل', 'error');
        if (phoneInput) phoneInput.focus();
        return null;
    }

    if (!wilayaCode) {
        showToast('يرجى اختيار الولاية من القائمة', 'error');
        if (wilayaSelect) wilayaSelect.focus();
        return null;
    }

    if (!address) {
        showToast('يرجى كتابة البلدية والعنوان بالتفصيل', 'error');
        if (addressInput) addressInput.focus();
        return null;
    }

    const wilaya = state.wilayas.find(w => w.code === wilayaCode) || { name: wilayaCode, home: 600, desk: 400 };
    const shippingFee = state.deliveryType === 'home' ? wilaya.home : wilaya.desk;
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingFee;
    const ref = generateOrderReference();

    return { 
        ref,
        name, 
        phone, 
        wilaya: wilaya.name, 
        deliveryType: state.deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب',
        shippingFee,
        subtotal,
        total,
        address, 
        notes,
        items: [...state.cart],
        timestamp: new Date().toISOString()
    };
}

function sendOrderViaWhatsApp() {
    const data = validateCustomerData();
    if (!data) return;

    recordOrderLocally(data);
    sendOrderToWebhook(data);

    const message = getOrderDetailsMessage(data);
    const whatsappUrl = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(message)}`;

    triggerCelebrationConfetti();
    closeCheckoutModal();
    
    state.cart = [];
    saveCart();
    updateCartUI();

    showToast(`تم تسجيل الطلب #${data.ref}! جاري التوجيه إلى واتساب...`, 'success');
    window.open(whatsappUrl, '_blank');
}

function sendOrderViaInstagram() {
    const data = validateCustomerData();
    if (!data) return;

    recordOrderLocally(data);
    sendOrderToWebhook(data);

    const message = getOrderDetailsMessage(data);
    
    triggerCelebrationConfetti();
    closeCheckoutModal();

    state.cart = [];
    saveCart();
    updateCartUI();

    copyToClipboardAndOpenInstagram(message, data.ref);
}

function copyToClipboardAndOpenInstagram(text, ref) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`تم نسخ تفاصيل الطلب #${ref}! الصقها في رسائل إنستغرام 📋⚡`, 'success');
        setTimeout(() => {
            window.open(state.config.instagramUrl || `https://www.instagram.com/${state.config.instagramUsername}/`, '_blank');
        }, 1200);
    }).catch(() => {
        showToast('جاري توجيهك إلى إنستغرام...', 'info');
        window.open(state.config.instagramUrl || `https://www.instagram.com/${state.config.instagramUsername}/`, '_blank');
    });
}

// ==========================================================================
// نوافذ دليل المقاسات والضمانات
// ==========================================================================
function openSizeGuideModal(tab = 'jogger') {
    state.currentSizeGuideTab = tab;
    switchSizeGuideTab(tab);
    const modal = document.getElementById('sizeGuideModal');
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.remove('scale-95');
}

function closeSizeGuideModal() {
    const modal = document.getElementById('sizeGuideModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.add('scale-95');
}

function switchSizeGuideTab(tab) {
    state.currentSizeGuideTab = tab;
    ['jogger', 'tshirts', 'shoes'].forEach(t => {
        const btn = document.getElementById(`sizeTab_${t}`);
        if (btn) {
            if (t === tab) {
                btn.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-brand-purple text-white';
            } else {
                btn.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all text-neutral-400 hover:text-white';
            }
        }
    });

    const guide = state.sizeGuide[tab];
    const container = document.getElementById('sizeGuideContent');
    if (!guide || !container) return;

    container.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <h4 class="font-bold text-sm text-white">${guide.title}</h4>
            </div>
            <p class="text-[11px] text-brand-purpleLight font-semibold">${guide.tip}</p>
            
            <div class="overflow-x-auto rounded-2xl border border-brand-border bg-brand-dark">
                <table class="w-full text-right text-xs">
                    <thead>
                        <tr class="border-b border-brand-border bg-brand-card text-neutral-300">
                            ${guide.headers.map(h => `<th class="py-2.5 px-3 font-bold">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-brand-border">
                        ${guide.rows.map(row => `
                            <tr class="hover:bg-neutral-800/50 transition-colors">
                                ${row.map((cell, idx) => `<td class="py-2.5 px-3 ${idx === 0 ? 'font-bold text-brand-purpleLight' : 'text-neutral-300'}">${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openGuaranteesModal() {
    const modal = document.getElementById('guaranteesModal');
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.remove('scale-95');
}

function closeGuaranteesModal() {
    const modal = document.getElementById('guaranteesModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.add('scale-95');
}

function triggerCelebrationConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// ==========================================================================
// عارض قصص إنستغرام (يدعم ستوري آراء الزبائن Reviews ⭐)
// ==========================================================================
function openStoryViewer(storyIndex) {
    state.currentStoryIndex = storyIndex;
    state.currentSlideIndex = 0;
    
    const modal = document.getElementById('storyViewerModal');
    if (!modal) return;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    loadStorySlide();
}

function closeStoryViewer() {
    clearTimeout(state.storyTimer);
    const modal = document.getElementById('storyViewerModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
}

function loadStorySlide() {
    clearTimeout(state.storyTimer);
    
    const story = state.stories[state.currentStoryIndex];
    if (!story) return closeStoryViewer();

    const slide = story.items[state.currentSlideIndex];
    if (!slide) {
        if (state.currentStoryIndex < state.stories.length - 1) {
            state.currentStoryIndex++;
            state.currentSlideIndex = 0;
            return loadStorySlide();
        } else {
            return closeStoryViewer();
        }
    }

    document.getElementById('storyHeaderTitle').textContent = story.title;
    document.getElementById('storyHeaderCover').src = story.cover;
    document.getElementById('storyMainImage').src = slide.image;
    document.getElementById('storyCaptionText').textContent = slide.caption;

    renderStoryProgressBars(story.items.length, state.currentSlideIndex);

    const actionContainer = document.getElementById('storyActionBtnContainer');
    if (actionContainer) {
        if (slide.productId) {
            actionContainer.innerHTML = `
                <button onclick="handleStoryActionProduct(${slide.productId})" class="btn-purple w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                    <i class="fa-solid fa-eye"></i>
                    <span>${slide.linkText || 'View Item'}</span>
                </button>
            `;
        } else if (slide.action === 'openBundleOffer') {
            actionContainer.innerHTML = `
                <button onclick="closeStoryViewer(); openBundleModal();" class="btn-bundle w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                    <i class="fa-solid fa-fire"></i>
                    <span>${slide.linkText || 'Special Offer'}</span>
                </button>
            `;
        } else if (slide.categoryId) {
            actionContainer.innerHTML = `
                <button onclick="handleStoryActionCategory('${slide.categoryId}')" class="btn-purple w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                    <i class="fa-solid fa-store"></i>
                    <span>${slide.linkText || 'Shop Collection'}</span>
                </button>
            `;
        } else {
            actionContainer.innerHTML = '';
        }
    }

    startSlideTimer();
}

function renderStoryProgressBars(totalSlides, activeIndex) {
    const container = document.getElementById('storyProgressBars');
    if (!container) return;

    container.innerHTML = Array.from({ length: totalSlides }).map((_, idx) => {
        let width = '0%';
        if (idx < activeIndex) width = '100%';
        return `
            <div class="story-progress-bar">
                <div id="storyProgressFill_${idx}" class="story-progress-fill" style="width: ${width};"></div>
            </div>
        `;
    }).join('');
}

function startSlideTimer() {
    const fill = document.getElementById(`storyProgressFill_${state.currentSlideIndex}`);
    if (fill) {
        fill.style.transition = `width ${state.storyDuration}ms linear`;
        setTimeout(() => {
            fill.style.width = '100%';
        }, 50);
    }

    state.storyTimer = setTimeout(() => {
        nextStorySlide();
    }, state.storyDuration);
}

function nextStorySlide(e) {
    if (e) e.stopPropagation();
    const story = state.stories[state.currentStoryIndex];
    if (!story) return closeStoryViewer();

    if (state.currentSlideIndex < story.items.length - 1) {
        state.currentSlideIndex++;
        loadStorySlide();
    } else if (state.currentStoryIndex < state.stories.length - 1) {
        state.currentStoryIndex++;
        state.currentSlideIndex = 0;
        loadStorySlide();
    } else {
        closeStoryViewer();
    }
}

function prevStorySlide(e) {
    if (e) e.stopPropagation();
    if (state.currentSlideIndex > 0) {
        state.currentSlideIndex--;
        loadStorySlide();
    } else if (state.currentStoryIndex > 0) {
        state.currentStoryIndex--;
        const prevStory = state.stories[state.currentStoryIndex];
        state.currentSlideIndex = prevStory.items.length - 1;
        loadStorySlide();
    }
}

function handleStoryTap(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
        prevStorySlide();
    } else {
        nextStorySlide();
    }
}

function toggleStoryPause() {
    state.isStoryPaused = !state.isStoryPaused;
    const btn = document.getElementById('storyPauseBtn');
    if (btn) {
        btn.innerHTML = state.isStoryPaused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
    }
    if (state.isStoryPaused) {
        clearTimeout(state.storyTimer);
    } else {
        loadStorySlide();
    }
}

function handleStoryActionProduct(productId) {
    closeStoryViewer();
    openProductQuickView(productId);
}

function handleStoryActionCategory(catId) {
    closeStoryViewer();
    filterByCategory(catId);
    document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================================
// المفضلة
// ==========================================================================
function toggleWishlist(e, productId) {
    if (e) e.stopPropagation();
    
    const index = state.wishlist.indexOf(productId);
    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast('Removed from favorites', 'info');
    } else {
        state.wishlist.push(productId);
        showToast('Added to favorites 💜', 'success');
    }

    localStorage.setItem('finalflash_wishlist', JSON.stringify(state.wishlist));
    updateWishlistBadges();
    applyFilters();
}

function updateWishlistBadges() {
    const count = state.wishlist.length;
    const badges = ['wishlistBadge'];
    badges.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = count;
            el.classList.toggle('hidden', count === 0);
        }
    });
}

function openWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const container = document.getElementById('wishlistItemsContainer');
    if (!modal || !container) return;

    const wishlistedProducts = state.products.filter(p => state.wishlist.includes(p.id));

    if (wishlistedProducts.length === 0) {
        container.innerHTML = `
            <div class="py-10 text-center text-neutral-500">
                <i class="fa-regular fa-heart text-3xl mb-2 text-neutral-600"></i>
                <p class="text-xs text-neutral-400 font-streetwear">No favorites saved yet</p>
            </div>
        `;
    } else {
        container.innerHTML = wishlistedProducts.map(p => `
            <div class="flex items-center justify-between gap-3 p-3 bg-brand-dark rounded-2xl border border-brand-border">
                <div class="flex items-center gap-3">
                    <img src="${p.images[0]}" loading="lazy" class="w-14 h-16 object-cover rounded-xl">
                    <div>
                        <h4 class="font-bold text-xs text-white font-streetwear">${p.title}</h4>
                        <span class="text-xs font-bold text-brand-purpleLight">${p.price} ${state.config.currency}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="quickAddToCart(${p.id})" class="btn-purple px-3 py-1.5 rounded-xl text-[11px] font-bold">
                        Add to Cart
                    </button>
                    <button onclick="toggleWishlist(null, ${p.id}); openWishlistModal();" class="text-neutral-500 hover:text-red-400 p-1 text-xs">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    modal.classList.remove('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.remove('scale-95');
}

function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalBox = modal.querySelector('div');
    if (modalBox) modalBox.classList.add('scale-95');
}

// ==========================================================================
// معرض إنستغرام والأسئلة الشائعة
// ==========================================================================
function renderInstagramGallery() {
    const container = document.getElementById('instagramGalleryGrid');
    if (!container) return;

    container.innerHTML = state.gallery.map((item) => `
        <div class="group relative rounded-2xl overflow-hidden aspect-square border border-brand-border bg-brand-dark cursor-pointer" onclick="openStoryViewer(${item.storyIndex || 0})">
            <img src="${item.image}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-2">
                <span class="font-streetwear">${item.tag}</span>
            </div>
        </div>
    `).join('');
}

function renderFAQs() {
    const container = document.getElementById('faqAccordionContainer');
    if (!container) return;

    container.innerHTML = state.faqs.map((faq, idx) => `
        <div class="bg-brand-card rounded-2xl border border-brand-border overflow-hidden shadow-sm">
            <button onclick="toggleFAQ(${idx})" class="w-full p-4 text-right flex items-center justify-between gap-3 text-xs font-bold text-neutral-200 hover:text-brand-purpleLight transition-colors">
                <span>${faq.q}</span>
                <i id="faqIcon_${idx}" class="fa-solid fa-chevron-down text-neutral-400 text-xs transition-transform duration-300"></i>
            </button>
            <div id="faqContent_${idx}" class="hidden px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-brand-border pt-3">
                ${faq.a}
            </div>
        </div>
    `).join('');
}

function toggleFAQ(index) {
    const content = document.getElementById(`faqContent_${index}`);
    const icon = document.getElementById(`faqIcon_${index}`);
    if (!content || !icon) return;

    const isHidden = content.classList.contains('hidden');
    content.classList.toggle('hidden', !isHidden);
    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
}

function closeAnnouncement() {
    const bar = document.getElementById('announcementBar');
    if (bar) bar.style.display = 'none';
}

// ==========================================================================
// نظام الإشعارات العائمة
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    let bgClass = 'bg-brand-card text-white border border-brand-border';
    let icon = '<i class="fa-solid fa-circle-info text-brand-purpleLight"></i>';

    if (type === 'success') {
        bgClass = 'bg-brand-card text-white border border-brand-purple shadow-lg shadow-purple-900/40';
        icon = '<i class="fa-solid fa-bolt text-brand-purpleLight animate-bounce"></i>';
    } else if (type === 'error') {
        bgClass = 'bg-red-950 text-white border border-red-500/40';
        icon = '<i class="fa-solid fa-circle-exclamation text-red-400"></i>';
    }

    toast.className = `${bgClass} px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold transform transition-all duration-300 -translate-y-4 opacity-0 pointer-events-auto`;
    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('-translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('-translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
