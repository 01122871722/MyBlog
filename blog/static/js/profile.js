// // ========== Profile Page JavaScript ==========

// let currentUser = null;
// let currentTab = 'all';

// // ========== Load User Profile ==========
// async function loadUserProfile() {
//     try {
//         showLoading();
        
//         currentUser = await checkAuth();
//         if (!currentUser) {
//             window.location.href = '/login/';
//             return;
//         }
        
//         // Make sure profile exists
//         if (!currentUser.profile_image && !currentUser.bio) {
//             currentUser.bio = '';
//             currentUser.profile_image = null;
//         }
        
//         renderProfileHero();
//         renderProfileInfo();
//         await loadUserPosts();
        
//     } catch (error) {
//         console.error('Error loading profile:', error);
//         alert('حدث خطأ في تحميل الملف الشخصي');
//     } finally {
//         hideLoading();
//     }
// }

// // ========== Render Profile Hero ==========
// function renderProfileHero() {
//     document.getElementById('profileHero').innerHTML = `
//         <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">الملف الشخصي</h1>
//         <p style="opacity: 0.9;">إدارة حسابك ومقالاتك</p>
//     `;
// }

// // ========== Render Profile Info ==========
// async function renderProfileInfo() {
//     const initials = getInitials(currentUser.username);
//     const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username;
    
//     // Avatar
//     const avatarContent = currentUser.profile_image 
//         ? `<img src="${currentUser.profile_image}" alt="${currentUser.username}">`
//         : initials;
    
//     document.getElementById('profileAvatar').innerHTML = avatarContent;
    
//     // Info
//     document.getElementById('profileInfo').innerHTML = `
//         <h2>${fullName}</h2>
//         <p class="username">@${currentUser.username}</p>
//         <p style="color: var(--gray); margin-top: 0.5rem; font-size: 0.95rem;">
//             <i class="fas fa-envelope"></i> ${currentUser.email}
//         </p>
//         <p style="color: var(--gray); margin-top: 0.3rem; font-size: 0.9rem;">
//             <i class="fas fa-calendar"></i> انضم ${formatDate(currentUser.date_joined)}
//         </p>
//     `;
    
//     // Actions
//     document.getElementById('profileActions').innerHTML = `
//         <button class="btn btn-primary" onclick="openEditModal()">
//             <i class="fas fa-edit"></i> تعديل الملف
//         </button>
//         <button class="btn btn-secondary" onclick="window.location.href='/create-post/'">
//             <i class="fas fa-plus"></i> مقال جديد
//         </button>
//     `;
    
//     // Load stats
//     await loadProfileStats();
    
//     // About
//     const bio = currentUser.bio || 'لم يتم إضافة نبذة بعد. اضغط "تعديل الملف" لإضافة نبذة عنك.';
//     document.getElementById('profileAbout').innerHTML = `
//         <h3 style="margin-bottom: 1rem; color: var(--dark);">
//             <i class="fas fa-info-circle"></i> نبذة عني
//         </h3>
//         <p style="line-height: 1.8; color: var(--gray);">${bio}</p>
//     `;
// }

// // ========== Load Profile Stats ==========
// async function loadProfileStats() {
//     try {
//         const response = await apiCall('/posts/my_posts/');
//         const allPosts = response.results || [];
        
//         const publishedCount = allPosts.filter(p => p.status === 'published').length;
//         const draftsCount = allPosts.filter(p => p.status === 'draft').length;
//         const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        
//         document.getElementById('profileStats').innerHTML = `
//             <div class="stat-item">
//                 <span class="stat-number">${publishedCount}</span>
//                 <span class="stat-label">منشور</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">${draftsCount}</span>
//                 <span class="stat-label">مسودة</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">${totalViews}</span>
//                 <span class="stat-label">مشاهدة</span>
//             </div>
//         `;
//     } catch (error) {
//         console.error('Error loading stats:', error);
//         document.getElementById('profileStats').innerHTML = `
//             <div class="stat-item">
//                 <span class="stat-number">0</span>
//                 <span class="stat-label">منشور</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">0</span>
//                 <span class="stat-label">مسودة</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">0</span>
//                 <span class="stat-label">مشاهدة</span>
//             </div>
//         `;
//     }
// }

// // ========== Create Post Card for Profile ==========
// function createProfilePostCard(post) {
//     const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
    
//     return `
//         <div class="post-card" style="position: relative;">
//             <div class="post-image-wrapper">
//                 <img src="${imageUrl}" alt="${post.title}" class="post-image">
//                 ${post.category ? `<span class="post-category">${post.category.name}</span>` : ''}
//             </div>
//             <div class="post-content">
//                 <h3 class="post-title">${post.title}</h3>
//                 <p class="post-excerpt">${truncateText(post.excerpt || post.content, 100)}</p>
//                 <div class="post-meta">
//                     <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--gray);">
//                         <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
//                         <span><i class="fas fa-comment"></i> ${post.comments_count || 0}</span>
//                         <span class="post-status ${post.status}">
//                             ${post.status === 'published' ? '✓ منشور' : '⏱ مسودة'}
//                         </span>
//                     </div>
//                     <div style="display: flex; gap: 0.5rem;">
//                         <button class="btn-icon btn-primary" onclick="window.location.href='/post/${post.slug}/'" title="عرض">
//                             <i class="fas fa-eye"></i>
//                         </button>
//                         <button class="btn-icon btn-warning" onclick="window.location.href='/edit-post/${post.slug}/'" title="تعديل">
//                             <i class="fas fa-edit"></i>
//                         </button>
//                         <button class="btn-icon btn-danger" onclick="confirmDeletePost('${post.slug}')" title="حذف">
//                             <i class="fas fa-trash"></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// // ========== Load User Posts ==========
// async function loadUserPosts() {
//     try {
//         showLoading();
        
//         const response = await apiCall('/posts/my_posts/');
//         let posts = response.results || [];
        
//         // Filter based on tab
//         if (currentTab === 'published') {
//             posts = posts.filter(p => p.status === 'published');
//         } else if (currentTab === 'draft') {
//             posts = posts.filter(p => p.status === 'draft');
//         }
        
//         const container = document.getElementById('userPosts');
        
//         if (posts.length === 0) {
//             const messages = {
//                 'all': 'لا توجد مقالات بعد',
//                 'published': 'لا توجد مقالات منشورة',
//                 'draft': 'لا توجد مسودات'
//             };
            
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
//                     <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
//                     <h3 style="color: var(--gray); margin-bottom: 0.5rem;">${messages[currentTab]}</h3>
//                     <p style="color: var(--gray); margin-bottom: 2rem;">ابدأ بكتابة مقالك الأول</p>
//                     <a href="/create-post/" class="btn btn-primary">
//                         <i class="fas fa-plus"></i> مقال جديد
//                     </a>
//                 </div>
//             `;
//         } else {
//             container.innerHTML = posts.map(post => createProfilePostCard(post)).join('');
//         }
        
//     } catch (error) {
//         console.error('Error loading posts:', error);
//         document.getElementById('userPosts').innerHTML = `
//             <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
//                 <p style="color: var(--danger);">حدث خطأ في تحميل المقالات</p>
//             </div>
//         `;
//     } finally {
//         hideLoading();
//     }
// }

// // ========== Delete Post ==========
// async function confirmDeletePost(slug) {
//     if (!confirm('هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
//         return;
//     }
    
//     try {
//         showLoading();
        
//         const response = await fetch(`${API_URL}/posts/${slug}/`, {
//             method: 'DELETE',
//             headers: {
//                 'X-CSRFToken': csrftoken
//             },
//             credentials: 'include'
//         });
        
//         if (!response.ok) {
//             const errorData = await response.text();
//             console.error('Delete error:', errorData);
//             throw new Error('Failed to delete post');
//         }
        
//         alert('تم حذف المقال بنجاح');
        
//         // إعادة تحميل المقالات والإحصائيات بدون إعادة تحميل الصفحة
//         await loadUserPosts();
//         await loadProfileStats();
        
//     } catch (error) {
//         console.error('Error deleting post:', error);
//         alert('حدث خطأ في حذف المقال. حاول مرة أخرى.');
//     } finally {
//         hideLoading();
//     }
// }

// // ========== Edit Profile Modal ==========
// function openEditModal() {
//     // Fill form with current data
//     document.getElementById('first_name').value = currentUser.first_name || '';
//     document.getElementById('last_name').value = currentUser.last_name || '';
//     document.getElementById('email').value = currentUser.email || '';
//     document.getElementById('bio').value = currentUser.bio || '';
    
//     // Show current profile image
//     if (currentUser.profile_image) {
//         document.getElementById('profileImagePreview').innerHTML = 
//             `<img src="${currentUser.profile_image}" alt="Profile">`;
//     } else {
//         document.getElementById('profileImagePreview').innerHTML = '';
//     }
    
//     document.getElementById('editProfileModal').classList.add('active');
// }

// function closeEditModal() {
//     document.getElementById('editProfileModal').classList.remove('active');
//     // مسح معاينة الصورة
//     document.getElementById('profileImagePreview').innerHTML = '';
//     document.getElementById('profileImage').value = '';
// }

// // Profile image preview
// document.getElementById('profileImage')?.addEventListener('change', function(e) {
//     const file = e.target.files[0];
//     if (file) {
//         // التحقق من حجم الملف (مثلاً أقل من 5MB)
//         if (file.size > 5 * 1024 * 1024) {
//             alert('حجم الصورة كبير جداً. يجب أن يكون أقل من 5MB');
//             this.value = '';
//             return;
//         }
        
//         // التحقق من نوع الملف
//         if (!file.type.startsWith('image/')) {
//             alert('يرجى اختيار صورة فقط');
//             this.value = '';
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             document.getElementById('profileImagePreview').innerHTML = 
//                 `<img src="${e.target.result}" alt="Preview">`;
//         };
//         reader.readAsDataURL(file);
//     }
// });

// // Submit edit form
// document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const submitBtn = e.target.querySelector('button[type="submit"]');
//     const originalBtnText = submitBtn.innerHTML;
    
//     try {
//         // تعطيل الزر وإظهار حالة التحميل
//         submitBtn.disabled = true;
//         submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        
//         showLoading();
        
//         const formData = new FormData();
        
//         const firstName = document.getElementById('first_name').value.trim();
//         const lastName = document.getElementById('last_name').value.trim();
//         const email = document.getElementById('email').value.trim();
//         const bio = document.getElementById('bio').value.trim();
        
//         // التحقق من البريد الإلكتروني
//         if (!email || !email.includes('@')) {
//             throw new Error('يرجى إدخال بريد إلكتروني صحيح');
//         }
        
//         formData.append('first_name', firstName);
//         formData.append('last_name', lastName);
//         formData.append('email', email);
//         formData.append('bio', bio);
//         const profileData = {};
// profileData.bio = bio;
// if (imageFile) {
//     profileData.profile_image = imageFile;
// }

// formData.append('profile', JSON.stringify(profileData));
        
//         const imageFile = document.getElementById('profileImage').files[0];
//         if (imageFile) {
//             formData.append('profile_image', imageFile);
//         }
        
//         const response = await fetch(`${API_URL}/auth/user/`, {
//             method: 'PATCH',
//             headers: {
//                 'X-CSRFToken': csrftoken
//             },
//             credentials: 'include',
//             body: formData
//         });
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             console.error('Update error:', errorData);
//             throw new Error(errorData.detail || 'فشل تحديث الملف الشخصي');
//         }
        
//         const updatedUser = await response.json();
//         console.log('Updated user:', updatedUser);
        
//         // تحديث بيانات المستخدم الحالي
//         currentUser = updatedUser;
        
//         // إغلاق النافذة
//         closeEditModal();
        
//         // إظهار رسالة نجاح
//         alert('✓ تم تحديث الملف الشخصي بنجاح!');
        
//         // إعادة عرض البيانات المحدثة بدون إعادة تحميل الصفحة
//         renderProfileInfo();
        
//     } catch (error) {
//         console.error('Error updating profile:', error);
//         alert(error.message || 'حدث خطأ في تحديث الملف الشخصي. تأكد من صحة البيانات.');
//     } finally {
//         hideLoading();
//         submitBtn.disabled = false;
//         submitBtn.innerHTML = originalBtnText;
//     }
// });

// // ========== Tab Switching ==========
// document.addEventListener('DOMContentLoaded', function() {
//     const tabs = document.querySelectorAll('.profile-tab');
    
//     tabs.forEach(tab => {
//         tab.addEventListener('click', function() {
//             tabs.forEach(t => t.classList.remove('active'));
//             this.classList.add('active');
//             currentTab = this.dataset.tab;
//             loadUserPosts();
//         });
//     });
    
//     // Close modal on outside click
//     document.getElementById('editProfileModal')?.addEventListener('click', function(e) {
//         if (e.target === this) {
//             closeEditModal();
//         }
//     });
    
//     // Close modal with Escape key
//     document.addEventListener('keydown', function(e) {
//         if (e.key === 'Escape') {
//             const modal = document.getElementById('editProfileModal');
//             if (modal && modal.classList.contains('active')) {
//                 closeEditModal();
//             }
//         }
//     });
    
//     loadUserProfile();
// });
// ========== Profile Page JavaScript ==========

// let currentUser = null;
// let currentTab = 'all';

// // ========== Load User Profile ==========
// async function loadUserProfile() {
//     try {
//         showLoading();
        
//         currentUser = await checkAuth();
//         if (!currentUser) {
//             window.location.href = '/login/';
//             return;
//         }
        
//         // Make sure profile exists
//         if (!currentUser.profile_image && !currentUser.bio) {
//             currentUser.bio = '';
//             currentUser.profile_image = null;
//         }
        
//         renderProfileHero();
//         renderProfileInfo();
//         loadUserPosts();
        
//     } catch (error) {
//         console.error('Error loading profile:', error);
//         alert('حدث خطأ في تحميل الملف الشخصي');
//     } finally {
//         hideLoading();
//     }
// }

// // ========== Render Profile Hero ==========
// function renderProfileHero() {
//     document.getElementById('profileHero').innerHTML = `
//         <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">الملف الشخصي</h1>
//         <p style="opacity: 0.9;">إدارة حسابك ومقالاتك</p>
//     `;
// }

// // ========== Render Profile Info ==========
// function renderProfileInfo() {
//     const initials = getInitials(currentUser.username);
//     const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username;
    
//     // Avatar
//     const avatarContent = currentUser.profile_image 
//         ? `<img src="${currentUser.profile_image}" alt="${currentUser.username}">`
//         : initials;
    
//     document.getElementById('profileAvatar').innerHTML = avatarContent;
    
//     // Info
//     document.getElementById('profileInfo').innerHTML = `
//         <h2>${fullName}</h2>
//         <p class="username">@${currentUser.username}</p>
//         <p style="color: var(--gray); margin-top: 0.5rem; font-size: 0.95rem;">
//             <i class="fas fa-envelope"></i> ${currentUser.email}
//         </p>
//         <p style="color: var(--gray); margin-top: 0.3rem; font-size: 0.9rem;">
//             <i class="fas fa-calendar"></i> انضم ${formatDate(currentUser.date_joined)}
//         </p>
//     `;
    
//     // Actions
//     document.getElementById('profileActions').innerHTML = `
//         <button class="btn btn-primary" onclick="openEditModal()">
//             <i class="fas fa-edit"></i> تعديل الملف
//         </button>
//         <button class="btn btn-secondary" onclick="window.location.href='/create-post/'">
//             <i class="fas fa-plus"></i> مقال جديد
//         </button>
//     `;
    
//     // Load stats
//     loadProfileStats();
    
//     // About
//     const bio = currentUser.bio || 'لم يتم إضافة نبذة بعد. اضغط "تعديل الملف" لإضافة نبذة عنك.';
//     document.getElementById('profileAbout').innerHTML = `
//         <h3 style="margin-bottom: 1rem; color: var(--dark);">
//             <i class="fas fa-info-circle"></i> نبذة عني
//         </h3>
//         <p style="line-height: 1.8; color: var(--gray);">${bio}</p>
//     `;
// }

// // ========== Load Profile Stats ==========
// async function loadProfileStats() {
//     try {
//         const response = await apiCall('/posts/my_posts/');
//         const allPosts = response.results || [];
        
//         const publishedCount = allPosts.filter(p => p.status === 'published').length;
//         const draftsCount = allPosts.filter(p => p.status === 'draft').length;
//         const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        
//         document.getElementById('profileStats').innerHTML = `
//             <div class="stat-item">
//                 <span class="stat-number">${publishedCount}</span>
//                 <span class="stat-label">منشور</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">${draftsCount}</span>
//                 <span class="stat-label">مسودة</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">${totalViews}</span>
//                 <span class="stat-label">مشاهدة</span>
//             </div>
//         `;
//     } catch (error) {
//         console.error('Error loading stats:', error);
//         document.getElementById('profileStats').innerHTML = `
//             <div class="stat-item">
//                 <span class="stat-number">0</span>
//                 <span class="stat-label">منشور</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">0</span>
//                 <span class="stat-label">مسودة</span>
//             </div>
//             <div class="stat-item">
//                 <span class="stat-number">0</span>
//                 <span class="stat-label">مشاهدة</span>
//             </div>
//         `;
//     }
// }

// // ========== Create Post Card for Profile ==========
// function createProfilePostCard(post) {
//     const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
    
//     return `
//         <div class="post-card" style="position: relative;">
//             <div class="post-image-wrapper">
//                 <img src="${imageUrl}" alt="${post.title}" class="post-image">
//                 ${post.category ? `<span class="post-category">${post.category.name}</span>` : ''}
//             </div>
//             <div class="post-content">
//                 <h3 class="post-title">${post.title}</h3>
//                 <p class="post-excerpt">${truncateText(post.excerpt || post.content, 100)}</p>
//                 <div class="post-meta">
//                     <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--gray);">
//                         <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
//                         <span><i class="fas fa-comment"></i> ${post.comments_count || 0}</span>
//                         <span class="post-status ${post.status}">
//                             ${post.status === 'published' ? '✓ منشور' : '⏱ مسودة'}
//                         </span>
//                     </div>
//                     <div style="display: flex; gap: 0.5rem;">
//                         <button class="btn-icon btn-primary" onclick="window.location.href='/post/${post.slug}/'" title="عرض">
//                             <i class="fas fa-eye"></i>
//                         </button>
//                         <button class="btn-icon btn-warning" onclick="window.location.href='/edit-post/${post.slug}/'" title="تعديل">
//                             <i class="fas fa-edit"></i>
//                         </button>
//                         <button class="btn-icon btn-danger" onclick="confirmDeletePost('${post.slug}')" title="حذف">
//                             <i class="fas fa-trash"></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// // ========== Load User Posts ==========
// async function loadUserPosts() {
//     try {
//         showLoading();
        
//         const response = await apiCall('/posts/my_posts/');
//         let posts = response.results || [];
        
//         // Filter based on tab
//         if (currentTab === 'published') {
//             posts = posts.filter(p => p.status === 'published');
//         } else if (currentTab === 'draft') {
//             posts = posts.filter(p => p.status === 'draft');
//         }
        
//         const container = document.getElementById('userPosts');
        
//         if (posts.length === 0) {
//             const messages = {
//                 'all': 'لا توجد مقالات بعد',
//                 'published': 'لا توجد مقالات منشورة',
//                 'draft': 'لا توجد مسودات'
//             };
            
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
//                     <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
//                     <h3 style="color: var(--gray); margin-bottom: 0.5rem;">${messages[currentTab]}</h3>
//                     <p style="color: var(--gray); margin-bottom: 2rem;">ابدأ بكتابة مقالك الأول</p>
//                     <a href="/create-post/" class="btn btn-primary">
//                         <i class="fas fa-plus"></i> مقال جديد
//                     </a>
//                 </div>
//             `;
//         } else {
//             container.innerHTML = posts.map(post => createProfilePostCard(post)).join('');
//         }
        
//     } catch (error) {
//         console.error('Error loading posts:', error);
//         document.getElementById('userPosts').innerHTML = `
//             <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
//                 <p style="color: var(--danger);">حدث خطأ في تحميل المقالات</p>
//             </div>
//         `;
//     } finally {
//         hideLoading();
//     }
// }

// // ========== Delete Post ==========
// async function confirmDeletePost(slug) {
//     if (!confirm('هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
//         return;
//     }
    
//     try {
//         showLoading();
        
//         const response = await fetch(`${API_URL}/posts/${slug}/`, {
//             method: 'DELETE',
//             headers: {
//                 'X-CSRFToken': csrftoken
//             },
//             credentials: 'include'
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to delete post');
//         }
        
//         hideLoading();
//         alert('تم حذف المقال بنجاح');
//         loadUserPosts();
//         loadProfileStats();
        
//     } catch (error) {
//         hideLoading();
//         console.error('Error deleting post:', error);
//         alert('حدث خطأ في حذف المقال');
//     }
// }

// // ========== Edit Profile Modal ==========
// function openEditModal() {
//     // Fill form with current data
//     document.getElementById('username').value = currentUser.username || '';
//     document.getElementById('email').value = currentUser.email || '';
//     document.getElementById('bio').value = currentUser.bio || '';
    
//     // Show current profile image
//     if (currentUser.profile_image) {
//         document.getElementById('profileImagePreview').innerHTML = 
//             `<img src="${currentUser.profile_image}" alt="Profile">`;
//     }
    
//     document.getElementById('editProfileModal').classList.add('active');
// }

// function closeEditModal() {
//     document.getElementById('editProfileModal').classList.remove('active');
// }

// // Profile image preview
// document.getElementById('profileImage')?.addEventListener('change', function(e) {
//     const file = e.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             document.getElementById('profileImagePreview').innerHTML = 
//                 `<img src="${e.target.result}" alt="Preview">`;
//         };
//         reader.readAsDataURL(file);
//     }
// });

// // Submit edit form
// document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     try {
//         showLoading();
        
//         const formData = new FormData();
        
//         formData.append('email', document.getElementById('email').value.trim());
//         formData.append('bio', document.getElementById('bio').value.trim());
        
//         const imageFile = document.getElementById('profileImage').files[0];
//         if (imageFile) {
//             formData.append('profile_image', imageFile);
//         }
        
//         const response = await fetch(`${API_URL}/auth/user/`, {
//             method: 'PATCH',
//             headers: {
//                 'X-CSRFToken': csrftoken
//             },
//             credentials: 'include',
//             body: formData
//         });
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(JSON.stringify(errorData));
//         }
        
//         closeEditModal();
//         hideLoading();
//         alert('تم تحديث الملف الشخصي بنجاح!');
//         location.reload();
        
//     } catch (error) {
//         hideLoading();
//         console.error('Error updating profile:', error);
//         alert('حدث خطأ في تحديث الملف الشخصي. تأكد من صحة البيانات.');
//     }
// });

// // ========== Tab Switching ==========
// document.addEventListener('DOMContentLoaded', function() {
//     const tabs = document.querySelectorAll('.profile-tab');
    
//     tabs.forEach(tab => {
//         tab.addEventListener('click', function() {
//             tabs.forEach(t => t.classList.remove('active'));
//             this.classList.add('active');
//             currentTab = this.dataset.tab;
//             loadUserPosts();
//         });
//     });
    
//     // Close modal on outside click
//     document.getElementById('editProfileModal')?.addEventListener('click', function(e) {
//         if (e.target === this) {
//             closeEditModal();
//         }
//     });
    
//     loadUserProfile();
// });
// static/js/profile.js - النسخة المحدثة

// ========== Profile Page JavaScript - Fixed Version ==========

let currentUser = null;
let currentTab = 'all';

// ========== Load User Profile ==========
async function loadUserProfile() {
    try {
        showLoading();
        
        currentUser = await checkAuth();
        if (!currentUser) {
            window.location.href = '/login/';
            return;
        }
        
        if (!currentUser.profile_image && !currentUser.bio) {
            currentUser.bio = '';
            currentUser.profile_image = null;
        }
        
        renderProfileHero();
        renderProfileInfo();
        loadUserPosts();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('حدث خطأ في تحميل الملف الشخصي');
    } finally {
        hideLoading();
    }
}

// ========== Render Profile Hero ==========
function renderProfileHero() {
    document.getElementById('profileHero').innerHTML = `
        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">الملف الشخصي</h1>
        <p style="opacity: 0.9;">إدارة حسابك ومقالاتك</p>
    `;
}

// ========== Render Profile Info ==========
function renderProfileInfo() {
    const initials = getInitials(currentUser.username);
    const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username;
    
    const avatarContent = currentUser.profile_image 
        ? `<img src="${currentUser.profile_image}" alt="${currentUser.username}">`
        : initials;
    
    document.getElementById('profileAvatar').innerHTML = avatarContent;
    
    document.getElementById('profileInfo').innerHTML = `
        <h2>${fullName}</h2>
        <p class="username">@${currentUser.username}</p>
        <p style="color: var(--gray); margin-top: 0.5rem; font-size: 0.95rem;">
            <i class="fas fa-envelope"></i> ${currentUser.email}
        </p>
        <p style="color: var(--gray); margin-top: 0.3rem; font-size: 0.9rem;">
            <i class="fas fa-calendar"></i> انضم ${formatDate(currentUser.date_joined)}
        </p>
    `;
    
    document.getElementById('profileActions').innerHTML = `
        <button class="btn btn-primary" onclick="openEditModal()">
            <i class="fas fa-edit"></i> تعديل الملف
        </button>
        <button class="btn btn-secondary" onclick="window.location.href='/create-post/'">
            <i class="fas fa-plus"></i> مقال جديد
        </button>
    `;
    
    loadProfileStats();
    
    const bio = currentUser.bio || 'لم يتم إضافة نبذة بعد. اضغط "تعديل الملف" لإضافة نبذة عنك.';
    document.getElementById('profileAbout').innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--dark);">
            <i class="fas fa-info-circle"></i> نبذة عني
        </h3>
        <p style="line-height: 1.8; color: var(--gray);">${bio}</p>
    `;
}

// ========== Load Profile Stats ==========
async function loadProfileStats() {
    try {
        const response = await apiCall('/posts/my_posts/');
        const allPosts = response.results || [];
        
        const publishedCount = allPosts.filter(p => p.status === 'published').length;
        const draftsCount = allPosts.filter(p => p.status === 'draft').length;
        const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        
        document.getElementById('profileStats').innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${publishedCount}</span>
                <span class="stat-label">منشور</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${draftsCount}</span>
                <span class="stat-label">مسودة</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${totalViews}</span>
                <span class="stat-label">مشاهدة</span>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('profileStats').innerHTML = `
            <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">منشور</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">مسودة</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">مشاهدة</span>
            </div>
        `;
    }
}

// ========== Create Post Card for Profile ==========
function createProfilePostCard(post) {
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
    
    return `
        <div class="post-card" style="position: relative;">
            <div class="post-image-wrapper">
                <img src="${imageUrl}" alt="${post.title}" class="post-image">
                ${post.category ? `<span class="post-category">${post.category.name}</span>` : ''}
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${truncateText(post.excerpt || post.content, 100)}</p>
                <div class="post-meta">
                    <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--gray);">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments_count || 0}</span>
                        <span class="post-status ${post.status}">
                            ${post.status === 'published' ? '✓ منشور' : '⏱ مسودة'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-icon btn-primary" onclick="window.location.href='/post/${post.slug}/'" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-warning" onclick="openEditPostModal('${post.slug}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="confirmDeletePost('${post.slug}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== Load User Posts ==========
async function loadUserPosts() {
    try {
        showLoading();
        
        const response = await apiCall('/posts/my_posts/');
        let posts = response.results || [];
        
        if (currentTab === 'published') {
            posts = posts.filter(p => p.status === 'published');
        } else if (currentTab === 'draft') {
            posts = posts.filter(p => p.status === 'draft');
        }
        
        const container = document.getElementById('userPosts');
        
        if (posts.length === 0) {
            const messages = {
                'all': 'لا توجد مقالات بعد',
                'published': 'لا توجد مقالات منشورة',
                'draft': 'لا توجد مسودات'
            };
            
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
                    <i class="fas fa-folder-open" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--gray); margin-bottom: 0.5rem;">${messages[currentTab]}</h3>
                    <p style="color: var(--gray); margin-bottom: 2rem;">ابدأ بكتابة مقالك الأول</p>
                    <a href="/create-post/" class="btn btn-primary">
                        <i class="fas fa-plus"></i> مقال جديد
                    </a>
                </div>
            `;
        } else {
            container.innerHTML = posts.map(post => createProfilePostCard(post)).join('');
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('userPosts').innerHTML = `
            <div style="text-align: center; padding: 4rem; grid-column: 1/-1;">
                <p style="color: var(--danger);">حدث خطأ في تحميل المقالات</p>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// ========== Edit Post Modal - NEW FUNCTION ==========
let currentEditingPost = null;

async function openEditPostModal(slug) {
    try {
        showLoading();
        
        // جلب بيانات المنشور
        const post = await apiCall(`/posts/${slug}/`);
        currentEditingPost = post;
        
        // إنشاء وعرض Modal التعديل
        const modalHTML = `
            <div id="editPostModal" class="modal active">
                <div class="modal-content" style="max-width: 900px;">
                    <span class="close-modal" onclick="closeEditPostModal()">&times;</span>
                    <h3 style="margin-bottom: 2rem;"><i class="fas fa-edit"></i> تعديل المنشور</h3>
                    
                    <form id="editPostForm">
                        <div class="form-group">
                            <label>عنوان المنشور</label>
                            <input type="text" id="editPostTitle" value="${post.title}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>المحتوى</label>
                            <textarea id="editPostContent" rows="10" required>${post.content}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>الملخص</label>
                            <textarea id="editPostExcerpt" rows="3">${post.excerpt || ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>الفئة</label>
                                <select id="editPostCategory">
                                    <option value="">اختر الفئة</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>الحالة</label>
                                <select id="editPostStatus" required>
                                    <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>مسودة</option>
                                    <option value="published" ${post.status === 'published' ? 'selected' : ''}>منشور</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>صورة المنشور</label>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <input type="file" id="editPostImage" accept="image/*" style="display: none;">
                                <button type="button" class="btn btn-secondary" onclick="document.getElementById('editPostImage').click()">
                                    <i class="fas fa-image"></i> اختر صورة جديدة
                                </button>
                                <div id="editPostImagePreview">
                                    ${post.image ? `<img src="${post.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> حفظ التعديلات
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeEditPostModal()">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // إضافة Modal للصفحة
        const existingModal = document.getElementById('editPostModal');
        if (existingModal) {
            existingModal.remove();
        }
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // تحميل الفئات
        await loadCategoriesForEdit(post.category?.id);
        
        // معاينة الصورة عند الاختيار
        document.getElementById('editPostImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('editPostImagePreview').innerHTML = 
                        `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // معالجة إرسال النموذج
        document.getElementById('editPostForm').addEventListener('submit', handleEditPostSubmit);
        
    } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('حدث خطأ في فتح نافذة التعديل');
    } finally {
        hideLoading();
    }
}

function closeEditPostModal() {
    const modal = document.getElementById('editPostModal');
    if (modal) {
        modal.remove();
    }
    currentEditingPost = null;
}

async function loadCategoriesForEdit(selectedId) {
    try {
        const response = await apiCall('/categories/');
        const categories = response.results || response;
        
        const select = document.getElementById('editPostCategory');
        select.innerHTML = '<option value="">اختر الفئة</option>' + 
            categories.map(cat => 
                `<option value="${cat.id}" ${cat.id === selectedId ? 'selected' : ''}>${cat.name}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function handleEditPostSubmit(e) {
    e.preventDefault();
    
    try {
        showLoading();
        
        const formData = new FormData();
        formData.append('title', document.getElementById('editPostTitle').value.trim());
        formData.append('content', document.getElementById('editPostContent').value.trim());
        formData.append('excerpt', document.getElementById('editPostExcerpt').value.trim());
        formData.append('status', document.getElementById('editPostStatus').value);
        
        const categoryId = document.getElementById('editPostCategory').value;
        if (categoryId) {
            formData.append('category', categoryId);
        }
        
        const imageFile = document.getElementById('editPostImage').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const response = await fetch(`${API_URL}/posts/${currentEditingPost.slug}/`, {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
        
        closeEditPostModal();
        alert('تم تحديث المنشور بنجاح!');
        loadUserPosts();
        loadProfileStats();
        
    } catch (error) {
        console.error('Error updating post:', error);
        alert('حدث خطأ في تحديث المنشور. تأكد من صحة البيانات.');
    } finally {
        hideLoading();
    }
}

// ========== Delete Post - IMPROVED ==========
async function confirmDeletePost(slug) {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟\nلا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/posts/${slug}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('المنشور غير موجود');
            }
            throw new Error('فشل حذف المنشور');
        }
        
        alert('✓ تم حذف المقال بنجاح');
        loadUserPosts();
        loadProfileStats();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('حدث خطأ في حذف المقال: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ========== Edit Profile Modal Functions ==========
function openEditModal() {
    document.getElementById('username').value = currentUser.username || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('bio').value = currentUser.bio || '';
    
    if (currentUser.profile_image) {
        document.getElementById('profileImagePreview').innerHTML = 
            `<img src="${currentUser.profile_image}" alt="Profile">`;
    }
    
    document.getElementById('editProfileModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

// Profile image preview
document.getElementById('profileImage')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImagePreview').innerHTML = 
                `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Submit edit profile form
document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        showLoading();
        
        const formData = new FormData();
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('bio', document.getElementById('bio').value.trim());
        
        const imageFile = document.getElementById('profileImage').files[0];
        if (imageFile) {
            formData.append('profile_image', imageFile);
        }
        
        const response = await fetch(`${API_URL}/auth/user/`, {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
        
        closeEditModal();
        alert('✓ تم تحديث الملف الشخصي بنجاح!');
        location.reload();
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('حدث خطأ في تحديث الملف الشخصي');
    } finally {
        hideLoading();
    }
});

// ========== Tab Switching ==========
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            loadUserPosts();
        });
    });
    
    document.getElementById('editProfileModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
    
    loadUserProfile();
});