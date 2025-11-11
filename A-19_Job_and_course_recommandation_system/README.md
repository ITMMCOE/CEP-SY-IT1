💼 Job and Course Recommendation System 🎓

Welcome to the Job and Course Recommendation System, an AI-powered web application that helps users discover the most suitable career opportunities and educational courses based on their skills, interests, and goals.

This project uses Sentence Transformer models to understand the semantic meaning of text inputs (like user skills, job descriptions, and course details), enabling accurate and context-aware recommendations.

🚀 Quick Overview

Name: Job and Course Recommendation System
Framework: Django
Purpose: Provide personalized job and course recommendations using AI-based semantic similarity.
Institution: Marathwada Mitra Mandal’s College of Engineering, Pune
Guide: Mr. Nikhil S. Dhavase
Academic Year: 2025–26
Team Members:

Tushar M. Deshpande

Pranav U. Gandewar

Harsh P. Kurhe

Varad D. Rajboinwad

✨ Features

✅ User registration, login, and OTP verification
✅ Profile management (skills, interests, and goals)
✅ Admin dashboard for managing jobs and courses
✅ Personalized job and course recommendations
✅ Real-time email notifications
✅ Feedback and contact forms
✅ News section for market trends

🧠 How It Works

User Registration – Users create an account and enter skills and goals.

Profile Encoding – Data is processed using Sentence Transformers for semantic understanding.

Matching Process – System compares user embeddings with job/course data.

Recommendations – Users receive ranked results based on contextual similarity.

Continuous Learning – System refines suggestions from user feedback and activity.

🛠 Tech Stack

Frontend: HTML, CSS, JavaScript
Backend: Python (Django Framework)
Database: MySQL (via MySQL Workbench)
AI Model: Sentence Transformers (all-MiniLM-L6-v2)
APIs: Django REST Framework
IDE: Visual Studio Code
Optional Tools: Google Colab (for model testing)

⚙️ Installation (Development Setup)
Step 1: Create Virtual Environment
python -m venv venv


Activate it:

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

Step 2: Install Dependencies
pip install -r requirements.txt


If no file exists:

pip install django sentence-transformers mysqlclient

Step 3: Configure Database (MySQL)

Create a new database in MySQL Workbench (e.g., job_course_db)
Then, in settings.py, update your DATABASES section:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'job_course_db',
        'USER': 'root',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

Step 4: Run Migrations and Server
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver


Open: http://127.0.0.1:8000

🧩 System Modules

👤 User Module

Register/Login via OTP

Manage profile, feedback, and preferences

Get job and course recommendations

🧑‍💻 Admin Module

Manage users, job posts, and courses

View feedback and news

Upload data using Excel via admin panel

💡 Recommendation Engine

Uses Sentence Transformer for semantic similarity

Handles cold start problem

Continuously improves using feedback

🧾 Environment Variables (.env Example)
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
EMAIL_HOST_USER=youremail@gmail.com
EMAIL_HOST_PASSWORD=yourpassword

🧪 Testing

To run Django tests:

python manage.py test


Make sure your virtual environment and MySQL database are properly set up.

🌱 Future Enhancements

Integration with external job and course APIs (LinkedIn, Coursera, etc.)

AI chatbot for user interaction

Multi-language support

Real-time labor market analytics

🤝 Contributors

Tushar M. Deshpande

Pranav U. Gandewar

Harsh P. Kurhe

Varad D. Rajboinwad

📄 License

This project was developed as part of the Community Engagement Project (2025–26)
Department of Information Technology,
Marathwada Mitra Mandal’s College of Engineering, Pune.
All rights reserved © 2025.

📬 Contact

Guide: Mr. Nikhil S. Dhavase
Assistant Professor, IT Department, MMCOE Pune

For queries, contact:
📧 tushardeshpande2025.it@mmcoe.edu.in

Made with ❤️ by Team Job & Course Recommendation System @MMCOE
