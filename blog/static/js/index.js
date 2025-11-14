// ========== Index Page JavaScript ==========

let currentPage = 1;
let isLoading = false;

// ========== Load Statistics ==========
async function loadStats() {
    try {
        const [posts, categories] = await Promise.all([
            apiCall('/posts/?page_size=1'),
            apiCall('/categories/')
        ]);
        
        // Calculate stats
        const totalPosts = posts.count || 0;
        const totalCategories = 16;
        
        // Animate numbers
        animateNumber('totalPosts', totalPosts);
        animateNumber('totalCategories', totalCategories);
        animateNumber('totalUsers', Math.floor(totalPosts / 3)); // تقريبي
        animateNumber('totalViews', totalPosts * 150); // تقريبي
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('ar-EG');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('ar-EG');
        }
    }, 16);
}

// ========== Load Trending Posts ==========
async function loadTrendingPosts() {
    try {
        showLoading();
        const data = await apiCall('/posts/trending/');
        
        const container = document.getElementById('trendingPosts');
        if (data.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">لا توجد مقالات رائجة حالياً</p>';
        } else {
            container.innerHTML = data.map((post, index) => createTrendingCard(post, index)).join('');
        }
    } catch (error) {
        console.error('Error loading trending posts:', error);
        document.getElementById('trendingPosts').innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--danger);">حدث خطأ في تحميل المقالات الرائجة</p>';
    } finally {
        hideLoading();
    }
}

// ========== Load Categories ==========
async function loadCategories() {
    try {
        const data = await apiCall('/categories/');
        const categories = Array.isArray(data) ? data : data.results;

        const container = document.getElementById('categoriesGrid');
        const footerContainer = document.getElementById('footerCategories');

        if (categories.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">لا توجد فئات متاحة</p>';
        } else {
            container.innerHTML = categories.slice(0, 6).map(category => createCategoryCard(category)).join('');

            // Footer categories
            if (footerContainer) {
                footerContainer.innerHTML = `
                    <ul>
                        ${categories.slice(0, 5).map(cat => `<li><a href="/category/${cat.slug}/">${cat.name}</a></li>`).join('')}
                    </ul>
                `;
            }
        }

    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoriesGrid').innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--danger);">حدث خطأ في تحميل الفئات</p>';
    }
}


// ========== Load Latest Posts ==========
async function loadLatestPosts(append = false) {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading();
        
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        
        let url = `/posts/?page=${currentPage}&status=published`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        const data = await apiCall(url);
        
        const container = document.getElementById('latestPosts');
        
        if (!append) {
            container.innerHTML = '';
        }
        
        if (data.results.length === 0 && !append) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">لا توجد مقالات متاحة</p>';
        } else {
            const postsHTML = data.results.map(post => createPostCard(post)).join('');
            if (append) {
                container.innerHTML += postsHTML;
            } else {
                container.innerHTML = postsHTML;
            }
        }
        
        // Handle load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            if (data.next) {
                loadMoreBtn.style.display = 'inline-flex';
                loadMoreBtn.onclick = () => {
                    currentPage++;
                    loadLatestPosts(true);
                };
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        if (!append) {
            document.getElementById('latestPosts').innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--danger);">حدث خطأ في تحميل المقالات</p>';
        }
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// ========== Search Functionality ==========
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    
    if (search) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = search;
        }
        
        // Update hero subtitle
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = `نتائج البحث عن: ${search}`;
        }
    }
});

// ========== Initialize Page ==========
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadTrendingPosts();
    loadCategories();
    loadLatestPosts();
    
    // Smooth scroll for hero arrow
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
});