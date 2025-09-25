// --- Mobile Cart Logic (mobilecart.js) ---

// 1. STATE MANAGEMENT
const storedMobileCart = JSON.parse(localStorage.getItem('cleanShopCart'));
const mobileCart = storedMobileCart || [];

// 2. CORE UTILITY FUNCTIONS
function saveMobileCart() {
    localStorage.setItem('cleanShopCart', JSON.stringify(mobileCart));
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
window.mobileAddToCart = function(name, price, image) {
    const existing = mobileCart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        mobileCart.push({ name, price: Number(price), qty: 1, image });
    }
    updateMobileCart();
    playMobileCartFeedback();
}

window.mobileChangeQty = function(index, delta) {
    mobileCart[index].qty += delta;
    if (mobileCart[index].qty <= 0) {
        mobileCart.splice(index, 1);
    }
    updateMobileCart();
}

window.mobileRemoveItem = function(index) {
    mobileCart.splice(index, 1);
    updateMobileCart();
}

window.updateMobileCart = function() {
    const cartItems = document.getElementById('mobile-cart-items');
    const cartCount = document.getElementById('mobile-cart-count');
    const cartTotal = document.getElementById('mobile-cart-total');
    
    if (!cartItems || !cartCount || !cartTotal) return;

    cartItems.innerHTML = '';
    let total = 0, count = 0;

    mobileCart.forEach((item, index) => {
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
                <button onclick="mobileChangeQty(${index}, -1)" class="px-2 bg-gray-200 rounded text-sm">-</button>
                <span class="text-sm text-gray-300">${item.qty}</span>
                <button onclick="mobileChangeQty(${index}, 1)" class="px-2 bg-gray-200 rounded text-sm">+</button>
                <button onclick="mobileRemoveItem(${index})" class="text-red-500 text-sm">✕</button>
            </div>
        `;
        cartItems.appendChild(li);
    });

    cartTotal.textContent = total.toLocaleString();
    cartCount.textContent = count;

    saveMobileCart();
}

window.mobileCheckout = function() {
    if (mobileCart.length === 0) return alert('Cart is empty');

    let message = '🛍️ New Order:%0A';
    let total = 0;
    mobileCart.forEach(item => {
        message += `• ${item.name} (x${item.qty}) - ₦${(item.price * item.qty).toLocaleString()}%0A`;
        total += item.price * item.qty;
    });
    message += `%0ATotal: ₦${total.toLocaleString()}%0APlease confirm my order ✅`;

    const phone = '2348163645085';
    const url = /Mobi|Android/i.test(navigator.userAgent)
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${message}`
        : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

    window.open(url, '_blank');
}

// 4. INITIALIZATION AND EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateMobileCart();

    const cartBtn = document.getElementById('mobile-cart-btn'); // mobile button
    const cartDrawer = document.getElementById('mobile-cart-drawer');
    const overlay = document.getElementById('mobile-overlay');

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
});