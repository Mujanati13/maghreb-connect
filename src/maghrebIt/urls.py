from maghrebIt import views
from django.urls import path, re_path



urlpatterns = [
    path('client/', views.client_view),
    re_path(r'^client/([0-9]+)$', views.client_view),
    path('documentClient/', views.Document_view),
    re_path(r'^documentClient/([0-9]+)$', views.Document_view),
    path('ESN/', views.esn_view),
    re_path(r'^ESN/([0-9]+)$', views.esn_view),
    ]