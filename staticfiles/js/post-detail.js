// ========== Post Detail JavaScript ==========

let currentPost = null;

// ========== Load Post Details ==========
async function loadPostDetail() {
    const slug = window.location.pathname.split('/').filter(Boolean)[1];
    
    try {
        showLoading();
        const data = await apiCall(`/posts/?search=${slug}`);
        
        if (data.results && data.results.length > 0) {
            currentPost = data.results[0];
            renderPostHero(currentPost);
            renderPostContent(currentPost);
            renderPostTags(currentPost);
            renderAuthorCard(currentPost);
            renderComments(currentPost);
            loadRelatedPosts(currentPost);
        } else {
            document.getElementById('postHero').innerHTML = '<h1>المقال غير موجود</h1>';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('postHero').innerHTML = '<h1 style="color: var(--danger);">حدث خطأ في تحميل المقال</h1>';
    } finally {
        hideLoading();
    }
}

// ========== Render Post Hero ==========
function renderPostHero(post) {
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920';
    
    document.getElementById('postHero').innerHTML = `
        <div style="margin-bottom: 1rem;">
            ${post.category ? `<span class="post-category">${post.category.name}</span>` : ''}
        </div>
        <h1 style="font-size: 3rem; margin-bottom: 1.5rem; line-height: 1.3;">${post.title}</h1>
        <div style="display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="author-avatar">${getInitials(post.author.username)}</div>
                <div>
                    <div style="font-weight: 600;">${post.author.username}</div>
                    <div style="opacity: 0.9; font-size: 0.9rem;">${formatDate(post.created_at)}</div>
                </div>
            </div>
            <div style="display: flex; gap: 2rem; opacity: 0.9;">
                <span><i class="fas fa-eye"></i> ${post.views} مشاهدة</span>
                <span><i class="fas fa-comment"></i> ${post.comments?.length || 0} تعليق</span>
            </div>
            <button class="btn btn-secondary" onclick="openShareModal()">
                <i class="fas fa-share-alt"></i> مشاركة
            </button>
        </div>
    `;
}

// ========== Render Post Content ==========
function renderPostContent(post) {
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200';
    
    document.getElementById('postContent').innerHTML = `
        ${post.image ? `<img src="${imageUrl}" alt="${post.title}" style="width: 100%; border-radius: var(--radius); margin-bottom: 2rem;">` : ''}
        <div style="line-height: 2; font-size: 1.1rem;">
            ${post.content.replace(/\n/g, '<br><br>')}
        </div>
    `;
}

// ========== Render Post Tags ==========
function renderPostTags(post) {
    if (!post.tags || post.tags.length === 0) {
        document.getElementById('postTags').innerHTML = '';
        return;
    }
    
    const tagsHTML = post.tags.map(tag => 
        `<a href="/tag/${tag.slug}/" class="post-tag"><i class="fas fa-tag"></i> ${tag.name}</a>`
    ).join('');
    
    document.getElementById('postTags').innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--dark);">
            <i class="fas fa-tags"></i> الوسوم
        </h3>
        ${tagsHTML}
    `;
}

// ========== Render Author Card ==========
function renderAuthorCard(post) {
    document.getElementById('authorCard').innerHTML = `
        <div class="author-avatar-large">${getInitials(post.author.username)}</div>
        <div style="flex: 1;">
            <h3 style="margin-bottom: 0.5rem;">${post.author.username}</h3>
            <p style="color: var(--gray); margin-bottom: 1rem;">كاتب محتوى</p>
            <p style="line-height: 1.8;">كاتب مهتم بمشاركة المعرفة والخبرات</p>
        </div>
    `;
}

// ========== Render Comments ==========
function renderComments(post) {
    const comments = post.comments || [];
    const commentsCount = comments.length;
    
    document.getElementById('commentsCount').textContent = commentsCount;
    
    // Render comment form
    const commentFormContainer = document.getElementById('commentFormContainer');
    const user = null; // سيتم تحديثها من checkAuth
    
    checkAuth().then(userData => {
        if (userData) {
            commentFormContainer.innerHTML = `
                <form class="comment-form" id="commentForm">
                    <textarea id="commentContent" placeholder="اكتب تعليقك هنا..." required></textarea>
                    <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-paper-plane"></i> إرسال التعليق
                    </button>
                </form>
            `;
            
            document.getElementById('commentForm').addEventListener('submit', submitComment);
        } else {
            commentFormContainer.innerHTML = `
                <div class="comment-form" style="text-align: center;">
                    <p style="color: var(--gray); margin-bottom: 1rem;">يجب تسجيل الدخول للتعليق</p>
                    <a href="/login/" class="btn btn-primary">تسجيل الدخول</a>
                </div>
            `;
        }
    });
    
    // Render comments list
    const commentsList = document.getElementById('commentsList');
    if (commentsCount === 0) {
        commentsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
    } else {
        const topLevelComments = comments.filter(c => !c.parent);
        commentsList.innerHTML = topLevelComments.map(comment => renderComment(comment, comments)).join('');
    }
}

function renderComment(comment, allComments) {
    const replies = allComments.filter(c => c.parent === comment.id);
    const repliesHTML = replies.map(reply => renderComment(reply, allComments)).join('');
    
    return `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-author-info">
                    <div class="comment-avatar">${getInitials(comment.author.username)}</div>
                    <div>
                        <strong>${comment.author.username}</strong>
                        <div class="comment-date">${formatDate(comment.created_at)}</div>
                    </div>
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
            ${repliesHTML ? `<div class="comment-reply">${repliesHTML}</div>` : ''}
        </div>
    `;
}

// ========== Submit Comment ==========
async function submitComment(e) {
    e.preventDefault();
    
    const content = document.getElementById('commentContent').value.trim();
    if (!content) return;
    
    try {
        showLoading();
        await apiCall('/comments/', {
            method: 'POST',
            body: JSON.stringify({
                post: currentPost.id,
                content: content
            })
        });
        
        // Reload post to show new comment
        await loadPostDetail();
        alert('تم إضافة تعليقك بنجاح!');
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('حدث خطأ في إضافة التعليق');
    } finally {
        hideLoading();
    }
}

// ========== Load Related Posts ==========
async function loadRelatedPosts(post) {
    try {
        let url = '/posts/?status=published&page_size=5';
        if (post.category) {
            url += `&category=${post.category.id}`;
        }
        
        const data = await apiCall(url);
        const relatedPosts = data.results.filter(p => p.id !== post.id).slice(0, 4);
        
        const container = document.getElementById('relatedPosts');
        if (relatedPosts.length === 0) {
            container.innerHTML = '<p style="color: var(--gray);">لا توجد مقالات ذات صلة</p>';
        } else {
            container.innerHTML = relatedPosts.map(p => `
                <div class="related-post-item" onclick="window.location.href='/post/${p.slug}/'">
                    <img src="${p.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400'}" 
                         alt="${p.title}" class="related-post-image">
                    <div class="related-post-info">
                        <h4>${truncateText(p.title, 60)}</h4>
                        <div class="related-post-meta">
                            <i class="fas fa-eye"></i> ${p.views}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading related posts:', error);
    }
}

// ========== Load Popular Posts ==========
async function loadPopularPosts() {
    try {
        const data = await apiCall('/posts/trending/');
        const popularPosts = data.slice(0, 5);
        
        const container = document.getElementById('popularPosts');
        container.innerHTML = popularPosts.map(p => `
            <div class="popular-post-item" onclick="window.location.href='/post/${p.slug}/'">
                <img src="${p.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400'}" 
                     alt="${p.title}" class="popular-post-image">
                <div class="popular-post-info">
                    <h4>${truncateText(p.title, 60)}</h4>
                    <div class="popular-post-meta">
                        <i class="fas fa-fire"></i> ${p.views}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading popular posts:', error);
    }
}

// ========== Load Categories Widget ==========
async function loadCategoriesWidget() {
    try {
        const data = await apiCall('/categories/');
        const categories = data.slice(0, 8);
        
        const container = document.getElementById('categoriesWidget');
        container.innerHTML = categories.map(cat => `
            <div class="category-item" onclick="window.location.href='/category/${cat.slug}/'">
                <span>${cat.name}</span>
                <span style="color: var(--gray);">(${cat.posts_count || 0})</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ========== Share Functions ==========
function openShareModal() {
    document.getElementById('shareModal').classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentPost.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentPost.title);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ الرابط!');
    closeShareModal();
}

// ========== Initialize Page ==========
document.addEventListener('DOMContentLoaded', function() {
    loadPostDetail();
    loadPopularPosts();
    loadCategoriesWidget();
    
    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeShareModal);
    document.getElementById('shareModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeShareModal();
        }
    });
});