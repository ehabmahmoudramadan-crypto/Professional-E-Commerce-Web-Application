// تم تعريف العناصر مرة واحدة فقط وبأسماء صغيرة ومختصرة
const grid = document.getElementById('grid');
const search = document.getElementById('search');
const count = document.getElementById('count');

let allProducts = []; 

// دالة جلب البيانات من الـ API
async function fetchProducts() {
    try {
        grid.innerHTML = `<p class="text-center col-span-full text-gray-500">جاري تحميل المنتجات الساحرة...</p>`;
        
        const response = await fetch('https://fakestoreapi.com/products');
        allProducts = await response.json();
        
        renderProducts(allProducts);
    } catch (error) {
        console.error("مشكلة في جلب البيانات:", error);
        grid.innerHTML = `<p class="text-red-500 text-center col-span-full font-bold">عذراً، فشل الاتصال بالخادم!</p>`;
    }
}

function renderProducts(list) {
    if (list.length === 0) {
        grid.innerHTML = `<p class="text-center col-span-full text-gray-500 dark:text-gray-400">لم نجد أي منتجات تطابق بحثك.</p>`;
        return;
    }

    grid.innerHTML = list.map(item => {
        // التأكد إذا كان المنتج موجود في المفضلة عشان نلون القلب بالأحمر تلقائياً
        const isFavorite = wishlist.some(fav => fav.id === item.id);
        const heartClass = isFavorite ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-gray-400';

        return `
        <div class="prod-card relative">
            <button onclick="toggleWishlist(${item.id}, this)" class="absolute top-4 left-4 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-sm hover:scale-110 transition-transform border-none cursor-pointer">
                <i class="${heartClass} text-lg"></i>
            </button>

            <div onclick="openModal(${item.id})" class="cursor-pointer flex-1 flex flex-col">
                <div class="img-box">
                    <img src="${item.image}" alt="${item.title}" class="prod-img">
                    <span class="badge-cat">${item.category}</span>
                </div>
                <div class="card-body">
                    <h3 class="prod-title" title="${item.title}">${item.title}</h3>
                </div>
            </div>
            
            <div class="card-footer-box">
                <div class="card-footer">
                    <span class="prod-price">$${item.price.toFixed(2)}</span>
                    <div class="prod-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${item.rating?.rate || 4.5}</span>
                    </div>
                </div>
                
                <button onclick="addToCart(${item.id})" class="btn-add">
                    <i class="fa-solid fa-plus text-xs"></i>
                    إضافة للسلة
                </button>
            </div>
        </div>
        `;
    }).join('');
}
// تشغيل التطبيق
fetchProducts();

// 4. منطق البحث اللحظي (Live Search)
search.addEventListener('input', (e) => {
    // تحويل النص المكتوب لحروف صغيرة (Lowercase) لتجنب مشاكل الحروف الكبيرة
    const query = e.target.value.toLowerCase().trim();
    
    // فلترة المنتجات بناءً على العنوان
    const filtered = allProducts.filter(item => 
        item.title.toLowerCase().includes(query)
    );
    
    // إعادة رسم المنتجات المفلترة فقط في الـ DOM
    renderProducts(filtered);
});
// 5. منطق فلترة المنتجات حسب التصنيف
function filterCategory(categoryName, buttonElement) {
    // 1. إزالة كلاس active من كل الأزرار
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // 2. إضافة كلاس active للزرار الذي تم الضغط عليه حالياً
    buttonElement.classList.remove('bg-transparent'); // أمان إضافي للـ CDN
    buttonElement.classList.add('active');
    
    // 3. الفلترة بناءً على الاسم
    if (categoryName === 'all') {
        renderProducts(allProducts); // لو اختار الكل ارسم المصفوفة كاملة
    } else {
        const filtered = allProducts.filter(item => item.category === categoryName);
        renderProducts(filtered); // ارسم المفلتر فقط
    }
}

// 7. منطق صندوق تفاصيل المنتج (Modal)
const productModal = document.getElementById('product-modal');

function openModal(id) {
    // البحث عن المنتج بالـ id
    const product = allProducts.find(item => item.id === id);
    if (!product) return;

    // حقن البيانات داخل عناصر الـ Modal
    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-img').alt = product.title;
    document.getElementById('modal-cat').innerText = product.category;
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price').innerText = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-rating').innerText = product.rating?.rate || 4.5;

    // توليد زرار الإضافة للسلة ديناميكياً عشان يقرأ الـ ID الصح
    document.getElementById('modal-action-box').innerHTML = `
        <button onclick="addToCart(${product.id}); closeModal();" class="btn-add">
            <i class="fa-solid fa-bag-shopping"></i>
            إضافة للسلة من هنا
        </button>
    `;

    // إظهار الصندوق بنعومة
    productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // قفل السكرول للموقع الخلفي أثناء فتح المودال
}

function closeModal() {
    productModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // إعادة تشغيل السكرول للموقع
}
// 6. منطق الـ Dark Mode المطور والمضمون 100%
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return; // أمان عشان لو الزرار مش موجود في صفحة تانية ميرميش خطأ
    
    const themeIcon = themeBtn.querySelector('i');

    // 1. التأكد من الوضع المحفوظ سابقاً فور تحميل الصفحة
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        if(themeIcon) themeIcon.className = 'fa-solid fa-sun';
    }

    // 2. حدث الضغط على الزرار للتبديل اللحظي
    themeBtn.addEventListener('click', () => {
        // بنغير الـ documentElement (الـ html نفسه) والـ body عشان نكسر أي تضارب
        document.documentElement.classList.toggle('dark');
        document.body.classList.toggle('dark');
        
        if (document.body.classList.contains('dark')) {
            if(themeIcon) themeIcon.className = 'fa-solid fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            if(themeIcon) themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('theme', 'light');
        }
    });
});

// 8. منطق قائمة الأمنيات (Wishlist) الكامل
let wishlist = JSON.parse(localStorage.getItem('HOBA_WISHLIST')) || [];
let showingWishlistOnly = false;

// دالة إضافة/حذف المنتج من المفضلة عند الضغط على القلب في الكارت
function toggleWishlist(id, buttonElement) {
    const icon = buttonElement.querySelector('i');
    const product = allProducts.find(item => item.id === id);
    const index = wishlist.findIndex(item => item.id === id);

    if (index > -1) {
        // لو موجود احذفه (Unfavorite)
        wishlist.splice(index, 1);
        icon.className = 'fa-regular fa-heart text-gray-400';
    } else {
        // لو مش موجود ضيفه (Favorite)
        wishlist.push(product);
        icon.className = 'fa-solid fa-heart text-red-500';
    }

    // حفظ التحديثات وتحديث العداد فوق
    localStorage.setItem('HOBA_WISHLIST', JSON.stringify(wishlist));
    updateWishlistCount();

    // لو المستخدم واقف جوه صفحة المفضلة وبيعمل حذف، يعيد الرسم فوراً
    if (showingWishlistOnly) {
        renderProducts(wishlist);
    }
}

// دالة تحديث عداد المفضلة فوق في الـ Navbar
function updateWishlistCount() {
    const wishCountElement = document.getElementById('wish-count');
    wishCountElement.innerText = wishlist.length;
    
    if (wishlist.length > 0) {
        wishCountElement.classList.remove('hidden');
    } else {
        wishCountElement.classList.add('hidden');
    }
}

// دالة الفلترة الكبرى: لما يضغط على القلب فوق يعرض المحبوبين بس ولما يضغط تاني يرجع للمتجر
function toggleWishlistFilter() {
    const wishBtnIcon = document.getElementById('wishlist-btn').querySelector('i');
    showingWishlistOnly = !showingWishlistOnly;

    // تأكيد العودة للمتجر الرئيسي أولاً لو كان في صفحة الدفع
    backToStore(); 

    if (showingWishlistOnly) {
        wishBtnIcon.classList.add('text-red-500');
        renderProducts(wishlist); // اعرض المفضلة فقط
    } else {
        wishBtnIcon.classList.remove('text-red-500');
        renderProducts(allProducts); // ارجع اعرض المتجر كله
    }
}

// تشغيل العداد فوراً عند تحميل الصفحة ليقرأ من الذاكرة
updateWishlistCount();

// 9. منطق الـ Hero Slider التلقائي
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
}

// تبديل تلقائي كل 5 ثواني
setInterval(nextSlide, 5000);