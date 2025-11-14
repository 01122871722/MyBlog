# 🌐 Django Blog Backend – README

## 📌 Overview
This is a **Django REST API** project for a complete blog system with authentication, posts, categories, tags, and comments.  
The API is fully structured using **Django REST Framework**, includes **JWT authentication**, and supports user profile extensions.

---

## 🚀 Features
### ✅ Authentication
- User registration
- Login & logout
- Password reset via email
- View & update user profile

### 📝 Blog System
- Create, update, delete blog posts
- Categories & tags
- Comments API
- Dynamic slug generation

### 🔧 Additional Features
- Admin panel customization
- Media upload support
- API documentation (DRF browsable API)

---

## 🏗️ Project Structure
```
project_django/
│
├── blog_backend/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── blog/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── accounts/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
└── manage.py
```

---

## ⚙️ Installation Guide
### 1️⃣ Clone repository
```
git clone <your repo>
cd project_django
```

### 2️⃣ Create virtual environment
```
python -m venv venv
venv\Scripts\activate
```

### 3️⃣ Install requirements
```
pip install -r requirements.txt
```

### 4️⃣ Run migrations
```
python manage.py migrate
```

### 5️⃣ Create superuser
```
python manage.py createsuperuser
```

### 6️⃣ Run server
```
python manage.py runserver
```

---

## 📬 Email Configuration
Add these inside **settings.py**:
```
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your@gmail.com'
EMAIL_HOST_PASSWORD = 'your_app_password'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
```
Use Gmail App Password (not your password).

---

## 🔑 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login |
| POST | /api/auth/logout/ | Logout |
| POST | /api/auth/request-reset/ | Request password reset |
| POST | /api/auth/reset-password/ | Confirm reset |
| GET | /api/auth/user/ | User details |

### 📝 Blog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts/ | List posts |
| POST | /api/posts/ | Create post |
| GET | /api/posts/{id}/ | Retrieve |
| PUT | /api/posts/{id}/ | Update |
| DELETE | /api/posts/{id}/ | Delete |

### 🏷 Categories & Tags
| Method | Endpoint |
|--------|----------|
| GET | /api/categories/ |
| GET | /api/tags/ |

---

## 🧪 Test Email API
Use for debugging:
```
GET /api/auth/test-email/
```
If status is 200 and message says sent, email config is working.

---

## 🛠️ Common Issues & Fixes
### ❌ Email not received?
✔ Check **Spam**  
✔ Ensure **App Password** is used  
✔ Enable **Less secure apps** if using old Gmail  
✔ Check terminal for errors

### ❌ Reset email not arriving?
- Make sure **FRONTEND_URL** or **reset link generator** is correct
- Ensure **EMAIL_HOST_USER == DEFAULT_FROM_EMAIL**

---

## 📦 Generate Sample Data
Use:
```
python create_sample_data.py
```
This creates users, categories, tags, and posts.

---

## 👩‍💻 Developer
**Rania Ahmed Anter**  
Back-end Developer (Django)  
Electronics Engineering – Computers & Information Dept.

---

## 📜 License
This project is for learning & portfolio use.

---

## ⭐ If you like this project — don't forget to star your repo!
