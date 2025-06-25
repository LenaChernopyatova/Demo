const CART_KEY = 'baby_clothes_cart';

class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        this.saveCart();
        this.showFeedback("Товар добавлен в корзину");
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
    }

    updateQuantity(id, delta) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity < 1) {
                this.removeItem(id);
            }
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
        this.updateCartCount();
        if (typeof this.onCartUpdate === 'function') {
            this.onCartUpdate();
        }
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const countElements = document.querySelectorAll('.cart-count, #cart-widget-count');
        countElements.forEach(el => {
            el.textContent = count;
        });
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Ваша корзина пуста</p>';
            cartTotalElement.textContent = '0';
            return;
        }

        let html = '';
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h3>${item.name || item.title}</h3>
                        <p>${item.price} ₽ × ${item.quantity} = ${itemTotal} ₽</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        <button class="remove-btn" data-id="${item.id}">×</button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotalElement.textContent = this.getTotal();
    }
}

const cart = new Cart();

function setupModal(modalId, openSelector, closeSelector) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const openElements = document.querySelectorAll(openSelector);
    const closeElements = document.querySelectorAll(closeSelector);

    openElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            if (modalId === 'cart-modal') {
                cart.renderCart();
            }
        });
    });

    closeElements.forEach(el => {
        el.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupModal('cart-modal', '.cart-widget-toggle, .cart-icon', '.cart-modal-close, #cart-close');
    setupModal('payment-modal', '#checkout-btn, #pay-button, #pay-btn', '.payment-modal-close, #payment-close');
    setupModal('success-modal', null, '.success-modal-close');
    setupModal('empty-cart-modal', null, '.empty-cart-modal-close');

    const checkoutBtn = document.getElementById('checkout-btn');
    const payBtn = document.getElementById('pay-btn');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.cart.length === 0) {
                document.getElementById('empty-cart-modal').style.display = 'flex';
                document.getElementById('cart-modal').style.display = 'none';
            } else {
                document.getElementById('payment-amount').textContent = cart.getTotal();
                document.getElementById('payment-modal').style.display = 'flex';
                document.getElementById('cart-modal').style.display = 'none';
            }
        });
    }

    if (payBtn) {
        payBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.cart.length === 0) {
                document.getElementById('empty-cart-modal').style.display = 'flex';
                document.getElementById('cart-modal').style.display = 'none';
            } else {
                document.getElementById('payment-amount').textContent = cart.getTotal();
                document.getElementById('payment-modal').style.display = 'flex';
                document.getElementById('cart-modal').style.display = 'none';
            }
        });
    }

    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('payment-modal').style.display = 'none';
            document.getElementById('success-modal').style.display = 'flex';
            cart.clearCart();
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const id = e.target.getAttribute('data-id');
            cart.removeItem(id);
            cart.renderCart();
        }

        if (e.target.classList.contains('quantity-btn')) {
            const id = e.target.getAttribute('data-id');
            const isPlus = e.target.classList.contains('plus');
            cart.updateQuantity(id, isPlus ? 1 : -1);
            cart.renderCart();
        }
    });

    cart.onCartUpdate = () => {
        cart.renderCart();
    };
});