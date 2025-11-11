"""
URL configuration for jobs_courses project.

The `urlpatterns` list routes URLs to views. 
For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""

from django.urls import path
from myapp import views

urlpatterns = [
    # ---------- Public Pages ----------
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('news/', views.news, name='news'),
    path('feedback/', views.feedback, name='feedback'),
    path('faq/', views.faq, name='faq'),

    # ---------- Admin Authentication ----------
    path('admin-login/', views.adminlogin, name='admin-login'),
    path('adminlogin/', views.admin_login, name='admin_login'),
    path('admin-logout/', views.admin_logout, name='admin-logout'),

    # ---------- User Authentication ----------
    path('user-login/', views.userlogin, name='user-login'),
    path('userlogin/', views.user_login, name='user_login'),
    path('user-logout/', views.user_logout, name='user-logout'),
    path('user-register/', views.userregister, name='user-register'),
    path('user-store/', views.store_user, name='user_store'),

    # FIXED: Forgot Password URLs
    path('user-forgot/', views.user_forgot_password, name='user-forgot'),
    path('user-reset/<int:user_id>/', views.user_reset_password, name='user-reset'),
    # ---------- User Home & Profile ----------
    path('user-home/', views.userhome, name='user-home'),
    path('user-news/', views.usernews, name='user-news'),
    path('user-feedback/', views.userfeedback, name='user-feedback'),
    path('user-faq/', views.userfaq, name='user-faq'),
    path('user-profile/', views.userprofile, name='user-profile'),
    path('user-update/', views.update_user, name='user_update'),
    path('user-password-change/', views.user_password_change, name='user_password_change'),
    

    # ---------- Admin Dashboard ----------
    path('admin-home/', views.adminhome, name='admin-home'),
    path('admin-news/', views.adminnews, name='admin-news'),
    path('admin-users/', views.adminusers, name='admin-users'),
    path('users/delete/<int:user_id>/', views.delete_user, name='delete_user'),
    path('admin-contacts/', views.admincontacts, name='admin-contacts'),
    path('contacts/delete/<int:contact_id>/', views.delete_contact, name='delete_contact'),

    # ---------- Admin Features ----------
    path('admin-profile/', views.adminprofile, name='admin-profile'),
    path('admin-password-change/', views.admin_password_change, name='admin_password_change'),
    path('admin-upload-jobs/', views.admin_upload_jobs, name='admin_upload_jobs'),
    path('admin-upload-courses/', views.admin_upload_courses, name='admin_upload_courses'),

    # ---------- Job & Course Finder ----------
    path('find-job/', views.findjob, name='find-job'),
    path('find_jobs/', views.findjobs, name='find_jobs'),
    path('find-course/', views.findcourse, name='find-course'),
    path('find_courses/', views.findcourses, name='find_courses'),

    # ---------- News ----------
    path('news-store/', views.store_news, name='news_store'),
    path('news/delete/<int:news_id>/', views.delete_news, name='delete_news'),

    # ---------- Contact & Feedback ----------
    path('contact-store/', views.store_contact, name='contact_store'),
    path('feedback-store/', views.feedback_store, name='feedback_store'),

    # ---------- Email Sending ----------
    path('send-mail/', views.sendMail, name='send_mail'),   # ✅ FIXED HERE
    path('sendHtmlMail/', views.sendHtmlMail, name='sendHtmlMail'),
]
