// ========== API Configuration ==========
const API_BASE = window.location.origin;
const API_URL = `${API_BASE}/api`;

// ========== Utility Functions ==========
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// ========== API Calls ==========
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'include'
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// ========== Loading Spinner ==========
function showLoading() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

// ========== Auth Functions ==========
async function checkAuth() {
    try {
        const data = await apiCall('/auth/user/');
        updateAuthUI(data);
        return data;
    } catch (error) {
        updateAuthUI(null);
        return null;
    }
}

function updateAuthUI(user) {
    const authLinks = document.getElementById('authLinks');
    
    if (user) {
        authLinks.innerHTML = `
            <div class="user-menu">
                <span class="user-name">مرحباً، ${user.username}</span>
                <a href="/create-post/" class="nav-link">
                    <i class="fas fa-plus"></i> مقال جديد
                </a>
                <a href="/my-posts/" class="nav-link">
                    <i class="fas fa-folder"></i> مقالاتي
                </a>
                <button onclick="logout()" class="nav-link" style="background: none; border: none; color: white; cursor: pointer;">
                    <i class="fas fa-sign-out-alt"></i> تسجيل خروج
                </button>
            </div>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="/login/" class="nav-link">
                <i class="fas fa-sign-in-alt"></i> تسجيل دخول
            </a>
            <a href="/register/" class="nav-link">
                <i class="fas fa-user-plus"></i> تسجيل
            </a>
        `;
    }
}

async function logout() {
    try {
        await apiCall('/auth/logout/', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ========== Format Functions ==========
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function truncateText(text, length = 150) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// ========== Post Card Creation ==========
function createPostCard(post) {
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
    const initials = getInitials(post.author.username);
    
    return `
        <div class="post-card" onclick="window.location.href='/post/${post.slug}/'">
            <div class="post-image-wrapper">
                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                ${post.category ? `<span class="post-category">${post.category.name}</span>` : ''}
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${truncateText(post.excerpt)}</p>
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">${initials}</div>
                        <div>
                            <div style="font-weight: 600;">${post.author.username}</div>
                            <div style="font-size: 0.85rem; color: var(--gray);">${formatDate(post.created_at)}</div>
                        </div>
                    </div>
                    <div class="post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments_count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== Trending Card Creation ==========
function createTrendingCard(post, index) {
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
    
    return `
        <div class="trending-card post-card" onclick="window.location.href='/post/${post.slug}/'">
            <span class="trending-badge">#${index + 1}</span>
            <div class="post-image-wrapper">
                <img src="${imageUrl}" alt="${post.title}" class="post-image">
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${truncateText(post.excerpt, 100)}</p>
                <div class="post-stats">
                    <span><i class="fas fa-fire"></i> ${post.views} مشاهدة</span>
                </div>
            </div>
        </div>
    `;
}

// ========== Category Card Creation ==========
function createCategoryCard(category) {
    const icons = ['fa-laptop-code', 'fa-palette', 'fa-book', 'fa-rocket', 'fa-lightbulb', 'fa-camera'];
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return `
        <div class="category-card" style="background: ${randomColor};" onclick="window.location.href='/category/${category.slug}/'">
            <i class="fas ${randomIcon} category-icon"></i>
            <h3 class="category-name">${category.name}</h3>
            <p class="category-count">${category.posts_count} مقال</p>
        </div>
    `;
}

// ========== Mobile Menu ==========
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Check auth on page load
    checkAuth();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('شكراً للاشتراك! سنرسل لك أحدث المقالات قريباً.');
            newsletterForm.reset();
        });
    }
});