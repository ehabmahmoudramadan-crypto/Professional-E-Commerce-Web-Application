let cart = JSON.parse(localStorage.getItem('PREMIUM_CART')) || [];

const drawer = document.getElementById('cart-drawer');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const countElement = document.getElementById('count');

// 1. دالة فتح وقفل السلة الجانبية
function toggleCart() {
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
        renderCart(); // ارسم المنتجات أول ما تفتح السلة
    }
    
}
// دالة التحويل لصفحة الفاتورة
function goToCheckout() {
    // 1. إغلاق السلة الجانبية
    drawer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // 2. إخفاء واجهة المتجر الرئيسية
    document.querySelector('main:not(#checkout-view)').classList.add('hidden');
    
    // 3. إظهار واجهة الفاتورة
    const checkoutView = document.getElementById('checkout-view');
    checkoutView.classList.remove('hidden');
    
    // 4. تشغيل دالة رسم الفاتورة
    renderInvoice();
}

// دالة العودة للمتجر
function backToStore() {
    document.getElementById('checkout-view').classList.add('hidden');
    document.querySelector('main:not(#checkout-view)').classList.remove('hidden');
}
// ربط زرار السلة في الـ Navbar عشان يفتح السلة لما نضغط عليه
document.getElementById('cart-btn').addEventListener('click', toggleCart);

// 2. دالة إضافة منتج للسلة (محدثة)
function addToCart(id) {
    const product = allProducts.find(item => item.id === id);
    const exist = cart.find(item => item.id === id);

    if (exist) {
        exist.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCart();
}

// 3. دالة حذف منتج تماماً من السلة
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    renderCart(); // أعد الرسم بعد الحذف
}

// 4. دالة تحديث العداد والحفظ
function updateCart() {
    localStorage.setItem('PREMIUM_CART', JSON.stringify(cart));
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    countElement.innerText = totalItems;
}

// 5. دالة رسم منتجات السلة داخل الـ Drawer وحساب الإجمالي
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="text-center text-gray-400 py-12">سلتك فارغة تماماً، املأها بالجمال!</p>`;
        cartTotal.innerText = "$0.00";
        return;
    }

    // رسم المنتجات بكلاسات صغيرة ونظيفة
    cartItems.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 py-2 border-b border-gray-50">
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain bg-gray-50 rounded-lg p-1">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-800 truncate">${item.title}</h4>
                <p class="text-xs text-gray-500 mt-1">$${item.price} × ${item.qty}</p>
            </div>
            <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-600 text-sm p-2">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    // حساب المجموع الكلي
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.innerText = `$${total.toFixed(2)}`;
}

// تشغيل التحديث فوراً لتحديث العداد فوق من الذاكرة
updateCart();

// دالة تعديل الكمية بالزيادة أو النقصان داخل الفاتورة
function changeQty(id, amount) {
    const item = cart.find(prod => prod.id === id);
    if (!item) return;

    item.qty += amount;

    // لو الكمية بقت صفر امسح المنتج تماماً
    if (item.qty <= 0) {
        cart = cart.filter(prod => prod.id !== id);
    }

    updateCart();  // حفظ وتحديث العداد فوق
    renderCart();  // تحديث السلة الجانبية
    renderInvoice(); // إعادة رسم الفاتورة بالكميات الجديدة
}

// دالة رسم منتجات الفاتورة بالكامل
function renderInvoice() {
    const checkoutItems = document.getElementById('checkout-items');
    const invoiceSubtotal = document.getElementById('invoice-subtotal');
    const invoiceTotal = document.getElementById('invoice-total');

    if (cart.length === 0) {
        checkoutItems.innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-basket-shopping text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-400">لا توجد منتجات في الفاتورة، عد للمتجر وأضف بعض المنتجات!</p>
            </div>`;
        invoiceSubtotal.innerText = "$0.00";
        invoiceTotal.innerText = "$0.00";
        return;
    }

    checkoutItems.innerHTML = cart.map(item => `
        <div class="flex flex-col sm:flex-items sm:flex-row items-center gap-4 pb-6 border-b border-gray-50 dark:border-gray-700/50 last:border-none last:pb-0">
            <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-contain bg-gray-50 dark:bg-gray-900 rounded-xl p-2">
            
            <div class="flex-1 text-center sm:text-right min-w-0">
                <h4 class="text-base font-bold text-gray-800 dark:text-white truncate">${item.title}</h4>
                <p class="text-xs text-gray-400 mt-1">${item.category}</p>
                <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-2">$${item.price.toFixed(2)}</p>
            </div>

            <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <button onclick="changeQty(${item.id}, -1)" class="text-gray-500 hover:text-red-500 bg-transparent border-none cursor-pointer text-lg px-1"><i class="fa-solid fa-minus"></i></button>
                <span class="font-bold text-gray-800 dark:text-white w-6 text-center">${item.qty}</span>
                <button onclick="changeQty(${item.id}, 1)" class="text-gray-500 hover:text-green-500 bg-transparent border-none cursor-pointer text-lg px-1"><i class="fa-solid fa-plus"></i></button>
            </div>

            <button onclick="changeQty(${item.id}, -${item.qty})" class="text-red-500 hover:text-red-600 p-2 bg-transparent border-none cursor-pointer text-lg">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    // حساب المجاميع الكلية
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    invoiceSubtotal.innerText = `$${total.toFixed(2)}`;
    invoiceTotal.innerText = `$${total.toFixed(2)}`;
}

// دالة تأكيد الطلب وتصفير السلة
function confirmOrder() {
    alert('🎉 تم تأكيد طلبك بنجاح في HOBA STORE! شكراً لثقتك بنا.');
    cart = [];
    updateCart();
    backToStore();
}
