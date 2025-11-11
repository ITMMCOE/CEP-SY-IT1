from os import path
from . import views

urlpatterns = [
    # ... your existing URLs ...
    path('send-screen-email/', views.send_screen_email, name='send_screen_email'),
]