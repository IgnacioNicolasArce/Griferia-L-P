// Estado global de la aplicación
let currentUser = null;
let cart = [];
let products = [];

// Configuración del API - detecta automáticamente la URL base
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : window.location.origin; // Usa la misma URL base (sin puerto para Vercel)

// Debug: mostrar la URL del API
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📍 Current hostname:', window.location.hostname);

// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const adminModal = document.getElementById('adminModal');
const cartModal = document.getElementById('cartModal');
const productModal = document.getElementById('productModal');
const productFormModal = document.getElementById('productFormModal');

// Elementos del carrito
const cartBtn = document.getElementById('cartBtn');
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartPanelItems'); // Panel del carrito
const cartModalItems = document.getElementById('cartModalItems'); // Modal del carrito
const cartCount = document.getElementById('cartCount');
const cartModalTotal = document.getElementById('cartModalTotal');
const cartPanelTotal = document.getElementById('cartPanelTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Botón flotante del carrito para móviles
const floatingCartBtn = document.getElementById('floatingCartBtn');
const floatingCartCount = document.getElementById('floatingCartCount');

// Formularios
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const contactForm = document.getElementById('contactForm');
const productForm = document.getElementById('productForm');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadProducts();
    checkAuthStatus();
    checkPaymentResult();
});

function initializeApp() {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUI();
    }
}

function setupEventListeners() {
    // Navegación
    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
    adminBtn.addEventListener('click', () => showModal(adminModal));
    logoutBtn.addEventListener('click', logout);
    
    // Carrito
    cartBtn.addEventListener('click', toggleCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Botón flotante del carrito para móviles
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', toggleCart);
    }

    // Formularios
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    contactForm.addEventListener('submit', handleContact);
    productForm.addEventListener('submit', handleProductSubmit);

    // Modales
    setupModalCloseListeners();

    // Checkout ya está configurado arriba

    // Admin
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productFormTitle').textContent = 'Agregar Producto';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        showModal(productFormModal);
    });

    // Tabs del admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchAdminTab(tab);
        });
    });

    // Menú hamburguesa
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace y manejar scroll suave
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Si es un enlace interno (empieza con #)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
            
            navMenu.classList.remove('active');
        });
    });

    // Manejar el botón "Ver Catálogo" del hero
    const heroBtn = document.querySelector('.hero .btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo('#catalog');
        });
    }
}

function setupModalCloseListeners() {
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal);
        });
    });

    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
}

function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Autenticación
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            currentUser = result.user;
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            updateUI();
            hideModal(loginModal);
            showMessage('Login exitoso', 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Error de conexión', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            currentUser = result.user;
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            updateUI();
            hideModal(registerModal);
            showMessage('Registro exitoso', 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Error de conexión', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    cart = [];
    updateUI();
    showMessage('Sesión cerrada', 'success');
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // Verificar si el token es válido
        fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                logout();
            }
        })
        .catch(() => {
            logout();
        });
    }
}

function updateUI() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        if (currentUser.role === 'admin') {
            adminBtn.style.display = 'block';
        }
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        adminBtn.style.display = 'none';
    }
}

// Productos
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const allProducts = await response.json();
        
        // Filtrar solo productos válidos (que tengan name, price, etc.)
        products = allProducts.filter(product => 
            product.name && 
            product.price && 
            product.stock !== undefined &&
            !product['0'] // Excluir productos corruptos
        );
        
        console.log('All products from API:', allProducts);
        console.log('Valid products for store:', products);
        
        renderProducts();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image_url || 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen'}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <i class="fas fa-tint" style="display: none;"></i>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'Sin descripción'}</p>
                <div class="product-price">$${product.price.toLocaleString()}</div>
                <div class="product-stock">Stock: ${product.stock}</div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="viewProduct(${product.id})">
                        Ver Detalles
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="addToCart(${product.id})">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const productDetails = document.getElementById('productDetails');
    productDetails.innerHTML = `
        <div class="product-detail">
            <div class="product-image">
                <img src="${product.image_url || 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen'}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <i class="fas fa-tint" style="display: none;"></i>
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <p><strong>Descripción:</strong> ${product.description || 'Sin descripción'}</p>
                <p><strong>Precio:</strong> $${product.price.toLocaleString()}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Categoría:</strong> ${product.category || 'Sin categoría'}</p>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.id}); hideModal(productModal);">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
    showModal(productModal);
}

function addToCart(productId) {
    if (!currentUser) {
        showMessage('Debes iniciar sesión para agregar productos al carrito', 'error');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        showMessage('Producto sin stock', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showMessage('No hay suficiente stock', 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
        });
    }

    showMessage('Producto agregado al carrito', 'success');
    updateCartUI();
}


function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    showMessage('Producto eliminado del carrito', 'success');
}

function showCart() {
    updateCartUI();
    showModal(cartModal);
}

// Checkout
async function handleCheckout() {
    if (cart.length === 0) {
        showMessage('El carrito está vacío', 'error');
        return;
    }

    const shippingAddress = prompt('Ingresa tu dirección de envío:');
    if (!shippingAddress) return;

    const orderData = {
        items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        })),
        shipping_address: shippingAddress
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            cart = [];
            updateCartUI();
            hideModal(cartModal);
            showMessage('Compra realizada exitosamente. Revisa tu email para la confirmación.', 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Error al procesar la compra', 'error');
    }
}

// Contacto
async function handleContact(e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Mensaje enviado exitosamente', 'success');
            contactForm.reset();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Error al enviar mensaje', 'error');
    }
}

// Admin Panel
function switchAdminTab(tab) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');

    if (tab === 'products') {
        loadAdminProducts();
    } else if (tab === 'orders') {
        loadAdminOrders();
    }
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const products = await response.json();
        
        // Filtrar solo productos válidos (que tengan name, price, etc.)
        const validProducts = products.filter(product => 
            product.name && 
            product.price && 
            product.stock !== undefined &&
            !product['0'] // Excluir productos corruptos
        );
        
        console.log('All products:', products);
        console.log('Valid products:', validProducts);
        
        renderAdminProducts(validProducts);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function renderAdminProducts(products) {
    const adminProductsList = document.getElementById('adminProductsList');
    adminProductsList.innerHTML = '';

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'admin-product-item';
        productItem.innerHTML = `
            <div class="admin-product-info">
                <h4>${product.name}</h4>
                <p>Precio: $${product.price.toLocaleString()} - Stock: ${product.stock}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-primary btn-small" onclick="editProduct(${product.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">
                    Eliminar
                </button>
            </div>
        `;
        adminProductsList.appendChild(productItem);
    });
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('productFormTitle').textContent = 'Editar Producto';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image_url || '';
    document.getElementById('productCategory').value = product.category || '';

    showModal(productFormModal);
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Producto eliminado exitosamente', 'success');
            loadAdminProducts();
            loadProducts(); // Actualizar lista principal
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Error al eliminar producto', 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    console.log('Submitting product form...');
    
    const productId = document.getElementById('productId').value;
    const isEdit = productId !== '';
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image_url: document.getElementById('productImage').value,
        category: document.getElementById('productCategory').value
    };

    console.log('Product data:', productData);
    console.log('Token:', localStorage.getItem('token'));

    try {
        const url = isEdit ? `${API_BASE_URL}/api/products/${productId}` : `${API_BASE_URL}/api/products`;
        const method = isEdit ? 'PUT' : 'POST';
        
        console.log('Making request to:', url, 'with method:', method);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(productData)
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);

        if (response.ok) {
            showMessage(isEdit ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente', 'success');
            hideModal(productFormModal);
            loadAdminProducts();
            loadProducts(); // Actualizar lista principal
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting product:', error);
        showMessage('Error al guardar producto', 'error');
    }
}

async function loadAdminOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const orders = await response.json();
        renderAdminOrders(orders);
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
    }
}

function renderAdminOrders(orders) {
    const adminOrdersList = document.getElementById('adminOrdersList');
    adminOrdersList.innerHTML = '';

    if (orders.length === 0) {
        adminOrdersList.innerHTML = '<p>No hay órdenes</p>';
        return;
    }

    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'admin-product-item';
        orderItem.innerHTML = `
            <div class="admin-product-info">
                <h4>Orden #${order.id}</h4>
                <p>Cliente: ${order.user_name} (${order.user_email})</p>
                <p>Total: $${order.total.toLocaleString()} - Estado: ${order.status}</p>
                <p>Fecha: ${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
        `;
        adminOrdersList.appendChild(orderItem);
    });
}

// Utilidades
function showMessage(message, type) {
    // Remover mensajes existentes
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Función para scroll suave personalizado
function smoothScrollTo(targetId) {
    // Validar que targetId no esté vacío y sea un selector válido
    if (!targetId || targetId === '#' || targetId.length < 2) {
        console.warn('Selector inválido:', targetId);
        return;
    }
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) {
        console.warn('Elemento no encontrado:', targetId);
        return;
    }

    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = targetElement.offsetTop - headerHeight - 20; // 20px de margen adicional
    
    // Agregar efecto visual de highlight
    targetElement.classList.add('scroll-highlight');
    
    // Actualizar enlace activo en la navegación
    updateActiveNavLink(targetId);
    
    // Remover el highlight después de 2 segundos
    setTimeout(() => {
        targetElement.classList.remove('scroll-highlight');
    }, 2000);
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Función para actualizar el enlace activo en la navegación
function updateActiveNavLink(targetId) {
    // Validar targetId
    if (!targetId || targetId === '#') return;
    
    // Remover clase activa de todos los enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase activa al enlace correspondiente
    const activeLink = document.querySelector(`a[href="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ==================== FUNCIONES DEL CARRITO ====================

// Función para alternar el panel del carrito
function toggleCart() {
    cartPanel.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartPanel.classList.contains('active') ? 'hidden' : '';
}

// Función para cerrar el panel del carrito
function closeCart() {
    cartPanel.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}


// Función para remover producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    updateCartUI();
    showMessage('Producto removido del carrito', 'success');
}

// Función para actualizar cantidad de producto en el carrito
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartUI();
        }
    }
}

// Función para actualizar la UI del carrito
function updateCartUI() {
    // Actualizar contador del carrito
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Actualizar contador del botón flotante
    if (floatingCartCount) {
        floatingCartCount.textContent = totalItems;
    }

    // Crear HTML para los items del carrito
    const cartItemsHTML = cart.length === 0 ? `
        <div class="cart-empty">
            <i class="fas fa-shopping-cart"></i>
            <p>Tu carrito está vacío</p>
        </div>
    ` : cart.map(item => `
        <div class="cart-item">
            <img src="${item.image_url || 'https://via.placeholder.com/100x100/f8f9fa/6c757d?text=Sin+Imagen'}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Actualizar panel del carrito
    if (cartItems) {
        cartItems.innerHTML = cartItemsHTML;
    }

    // Actualizar modal del carrito
    if (cartModalItems) {
        cartModalItems.innerHTML = cartItemsHTML;
    }

    // Mostrar/ocultar botón de checkout
    if (checkoutBtn) {
        checkoutBtn.style.display = cart.length === 0 ? 'none' : 'block';
    }

    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartModalTotal) {
        cartModalTotal.textContent = total.toLocaleString();
    }
    if (cartPanelTotal) {
        cartPanelTotal.textContent = total.toLocaleString();
    }
}

// Función para manejar el checkout (versión simplificada)
async function handleCheckout() {
    console.log('🚀 Iniciando checkout...');
    
    if (!currentUser) {
        console.log('❌ Usuario no autenticado');
        closeCart();
        showModal(loginModal);
        showMessage('Debes iniciar sesión para proceder al pago', 'error');
        return;
    }

    if (cart.length === 0) {
        console.log('❌ Carrito vacío');
        showMessage('Tu carrito está vacío', 'error');
        return;
    }

    console.log('✅ Usuario autenticado y carrito con productos');

    // Solicitar dirección de envío
    const shippingAddress = prompt('Ingresa tu dirección de envío:');
    if (!shippingAddress) {
        showMessage('La dirección de envío es requerida', 'error');
        return;
    }

    console.log('✅ Dirección ingresada:', shippingAddress);

    try {
        showMessage('Procesando pago...', 'success');
        
        // Calcular total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('💰 Total calculado:', total);
        
        // Crear orden directamente
        const orderData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            shipping_address: shippingAddress,
            total: total,
            payment_method: 'mercadopago'
        };

        console.log('📦 Creando orden:', orderData);

        // Crear orden en la base de datos
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });

        console.log('📡 Respuesta del servidor:', response.status);

        const result = await response.json();
        console.log('📋 Resultado:', result);

        if (response.ok) {
            // Limpiar carrito y mostrar éxito
            cart = [];
            updateCartUI();
            closeCart();
            showMessage('¡Compra realizada exitosamente! Tu orden ha sido procesada.', 'success');
            
            // Simular redirección a Mercado Pago
            setTimeout(() => {
                if (confirm('¿Deseas ir a Mercado Pago para completar el pago?')) {
                    window.open('https://www.mercadopago.com.ar/', '_blank');
                }
            }, 2000);
        } else {
            console.error('❌ Error del servidor:', result);
            showMessage(result.message || 'Error al procesar la compra', 'error');
        }

    } catch (error) {
        console.error('❌ Error en checkout:', error);
        showMessage('Error al procesar el pago. Intenta nuevamente.', 'error');
    }
}

// Función para obtener el total del carrito
function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Función para limpiar el carrito
function clearCart() {
    cart = [];
    updateCartUI();
}

// Función para verificar resultado de pago desde URL
function checkPaymentResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const payment_id = urlParams.get('payment_id');

    if (status && payment_id) {
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);

        if (status === 'approved') {
            showModal(document.getElementById('paymentSuccessModal'));
            clearCart();
        } else if (status === 'rejected') {
            showModal(document.getElementById('paymentFailureModal'));
        } else if (status === 'pending') {
            showModal(document.getElementById('paymentPendingModal'));
        }
    }
}

