// --- Unified Cart Logic (cart.js) ---

// 1. STATE MANAGEMENT
const storedCart = JSON.parse(localStorage.getItem('cleanShopCart'));
const cart = storedCart || [];

// 2. CORE UTILITY FUNCTIONS
function saveCart() {
    localStorage.setItem('cleanShopCart', JSON.stringify(cart));
}

function playCartFeedback() {
    const cartSound = document.getElementById('cart-sound');
    const cartCount = document.getElementById('cart-count');

    if (cartSound) {
        cartSound.currentTime = 0;
        cartSound.play();
    }
    if (cartCount) {
        cartCount.classList.add('scale-125');
        setTimeout(() => cartCount.classList.remove('scale-125'), 200);
    }
}

function playMobileCartFeedback() {
    const cartSound = document.getElementById('mobile-cart-sound');
    const cartCount = document.getElementById('mobile-cart-count');

    if (cartSound) {
        cartSound.currentTime = 0;
        cartSound.play();
    }
    if (cartCount) {
        cartCount.classList.add('scale-125');
        setTimeout(() => cartCount.classList.remove('scale-125'), 200);
    }
}

// 3. CART INTERACTION FUNCTIONS
window.addToCart = function(name, price, image) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price: Number(price), qty: 1, image });
    }
    saveCart();
    updateCart();
    updateMobileCart();
    playCartFeedback();
    playMobileCartFeedback();


    pulseCartCount();
showToast(`${name} added to cart ✅`);

// Optional: pass product image for fly-to-cart
const productImg = document.querySelector(`img[alt='${name}']`);
if (productImg) flyToCart(productImg, "cart-btn"); // desktop
if (productImg) flyToCart(productImg, "mobile-cart-btn"); // mobile

};

window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
    updateCart();
    updateMobileCart();
};

window.removeItem = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCart();
    updateMobileCart();
};

// 4. RENDERERS
window.updateCart = function() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    if (!cartItems || !cartCount || !cartTotal) return;

    cartItems.innerHTML = '';
    let total = 0, count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center animate-fadeIn py-2 border-b';
        li.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md">
                <div>
                    <span class="font-medium text-sm text-white">${item.name}</span><br>
                    <span class="text-xs text-gray-400">₦${item.price.toLocaleString()}</span>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="changeQty(${index}, -1)" class="px-2 bg-gray-200 rounded text-sm">-</button>
                <span class="text-sm text-gray-300">${item.qty}</span>
                <button onclick="changeQty(${index}, 1)" class="px-2 bg-gray-200 rounded text-sm">+</button>
                <button onclick="removeItem(${index})" class="text-red-500 text-sm">✕</button>
            </div>
        `;
        cartItems.appendChild(li);
    });

    cartTotal.textContent = total.toLocaleString();
    cartCount.textContent = count;
};

window.updateMobileCart = function() {
    const cartItems = document.getElementById('mobile-cart-items');
    const cartCount = document.getElementById('mobile-cart-count');
    const cartTotal = document.getElementById('mobile-cart-total');

    if (!cartItems || !cartCount || !cartTotal) return;

    cartItems.innerHTML = '';
    let total = 0, count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center animate-fadeIn py-2 border-b';
        li.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md">
                <div>
                    <span class="font-medium text-sm text-white">${item.name}</span><br>
                    <span class="text-xs text-gray-400">₦${item.price.toLocaleString()}</span>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="changeQty(${index}, -1)" class="px-2 bg-gray-200 rounded text-sm">-</button>
                <span class="text-sm text-gray-300">${item.qty}</span>
                <button onclick="changeQty(${index}, 1)" class="px-2 bg-gray-200 rounded text-sm">+</button>
                <button onclick="removeItem(${index})" class="text-red-500 text-sm">✕</button>
            </div>
        `;
        cartItems.appendChild(li);
    });

    cartTotal.textContent = total.toLocaleString();
    cartCount.textContent = count;
};

// 5. CHECKOUT
window.checkout = function() {
    if (cart.length === 0) return alert('Cart is empty');

    let message = '🛍️ New Order:%0A';
    let total = 0;
    cart.forEach(item => {
        message += `• ${item.name} (x${item.qty}) - ₦${(item.price * item.qty).toLocaleString()}%0A`;
        total += item.price * item.qty;
    });
    message += `%0ATotal: ₦${total.toLocaleString()}%0APlease confirm my order ✅`;

    const phone = '2348163645085';
    const url = /Mobi|Android/i.test(navigator.userAgent)
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${message}`
        : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

    window.open(url, '_blank');
};

// 6. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    updateMobileCart();

    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');

    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    const mobileDrawer = document.getElementById('mobile-cart-drawer');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (cartBtn && cartDrawer && overlay) {
        cartBtn.addEventListener('click', () => {
            cartDrawer.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
        });
        overlay.addEventListener('click', () => {
            cartDrawer.classList.add('translate-x-full');
            overlay.classList.add('hidden');
        });
    }

    if (mobileCartBtn && mobileDrawer && mobileOverlay) {
        mobileCartBtn.addEventListener('click', () => {
            mobileDrawer.classList.remove('translate-x-full');
            mobileOverlay.classList.remove('hidden');
        });
        mobileOverlay.addEventListener('click', () => {
            mobileDrawer.classList.add('translate-x-full');
            mobileOverlay.classList.add('hidden');
        });
    }
});

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");

    setTimeout(() => {
        toast.classList.remove("opacity-100");
        toast.classList.add("opacity-0");
    }, 2000);
}


function flyToCart(imgEl, cartIconId = "cart-btn") {
    const cartIcon = document.getElementById(cartIconId);
    if (!imgEl || !cartIcon) return;

    const imgClone = imgEl.cloneNode(true);
    const rect = imgEl.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    imgClone.style.position = "fixed";
    imgClone.style.left = rect.left + "px";
    imgClone.style.top = rect.top + "px";
    imgClone.style.width = rect.width + "px";
    imgClone.style.height = rect.height + "px";
    imgClone.style.transition = "all 0.8s ease-in-out";
    imgClone.style.zIndex = "9999";
    imgClone.style.borderRadius = "50%";
    document.body.appendChild(imgClone);

    setTimeout(() => {
        imgClone.style.left = cartRect.left + "px";
        imgClone.style.top = cartRect.top + "px";
        imgClone.style.width = "80px";
        imgClone.style.height = "80px";
        imgClone.style.opacity = "0.3";
    }, 50);

    setTimeout(() => {
        imgClone.remove();
    }, 900);
}


function pulseCartCount() {
    const counters = document.querySelectorAll("#cart-count, #mobile-cart-count");
    counters.forEach(c => {
        c.classList.add("cart-pulse");
        setTimeout(() => c.classList.remove("cart-pulse"), 300);
    });
}
