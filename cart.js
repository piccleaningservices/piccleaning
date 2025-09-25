// --- Cart Logic (cart.js) ---

// 1. STATE MANAGEMENT
// Load cart from localStorage, defaulting to an empty array if none is found
const storedCart = JSON.parse(localStorage.getItem('cleanShopCart'));
const cart = storedCart || [];

// The products array is NOT included here. It should remain on the page where products are added.

// 2. CORE UTILITY FUNCTIONS

/**
 * Saves the current cart state to localStorage.
 */
function saveCart() {
    localStorage.setItem('cleanShopCart', JSON.stringify(cart));
}

/**
 * Plays a subtle sound effect and visual feedback on the cart icon.
 */
function playCartFeedback() {
    const cartSound = document.getElementById('cart-sound');
    const counters = document.querySelectorAll('cart-count');

    
    if (cartSound) {
        cartSound.currentTime = 0;
        cartSound.play();
    }
    
    if (cartCount) {
        cartCount.classList.add('scale-125');
        setTimeout(() => cartCount.classList.remove('scale-125'), 200);
    }
}

// 3. CART INTERACTION FUNCTIONS (Available globally via window)

/**
 * Adds a product to the cart or increments its quantity.
 * NOTE: This function requires 'name', 'price', and 'image' data, which should be passed 
 * from the onclick event on the product cards.
 */
window.addToCart = function(name, price, image) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        // Ensure price is a number for math later
        cart.push({ name, price: Number(price), qty: 1, image });
    }
    updateCart();
    playCartFeedback();
}

/**
 * Changes the quantity of an item in the cart.
 */
window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

/**
 * Removes an item from the cart entirely.
 */
window.removeItem = function(index) {
    cart.splice(index, 1);
    updateCart();
}

/**
 * Renders the cart contents to the drawer and updates counts/totals.
 */
window.updateCart = function() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartCount || !cartTotal) return; // Exit if elements don't exist

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
    
    // Save the updated cart state after every change
    saveCart();
}

/**
 * Generates the WhatsApp checkout URL.
 */
window.checkout = function() {
    if (cart.length === 0) return alert('Cart is empty');

    let message = '🛍️ New Order:%0A';
    let total = 0;
    cart.forEach(item => {
        message += `• ${item.name} (x${item.qty}) - ₦${(item.price * item.qty).toLocaleString()}%0A`;
        total += item.price * item.qty;
    });
    message += `%0ATotal: ₦${total.toLocaleString()}%0APlease confirm my order ✅`;

    const phone = '2348163645085'; // Your WhatsApp Number
    const url = /Mobi|Android/i.test(navigator.userAgent)
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${message}`
        : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

    window.open(url, '_blank');
}

// 4. INITIALIZATION AND EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    // A. Initial cart rendering to populate counts and drawer content
    updateCart();

    // B. Setup drawer toggling
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');

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
