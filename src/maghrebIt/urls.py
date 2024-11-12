from maghrebIt import views
from django.urls import path, re_path



urlpatterns = [
    path('client/', views.client_view),
    re_path(r'^client/([0-9]+)$', views.client_view),
    path('documentClient/', views.Document_view),
    re_path(r'^documentClient/([0-9]+)$', views.Document_view),
    path('ESN/', views.esn_view),
    re_path(r'^ESN/([0-9]+)$', views.esn_view),
    path('docEsn/', views.docEsn_view),
    re_path(r'^docEsn/([0-9]+)$', views.docEsn_view),
    path('admin/', views.admin_view),
    re_path(r'^admin/([0-9]+)$', views.admin_view),
    path('login/', views.login),
    re_path(r'^login/([0-9]+)$', views.login),
    path('login_esn/', views.login_esn),
    re_path(r'^login_esn/([0-9]+)$', views.login_esn),
    path('login_client/', views.login_client),
    re_path(r'^login_client/([0-9]+)$', views.login_client),
    path('collaborateur/', views.collaborateur_view),
    re_path(r'^collaborateur/([0-9]+)$', views.collaborateur_view),
    path('appelOffre/', views.appelOffre_view),
    re_path(r'^appelOffre/([0-9]+)$', views.appelOffre_view),
    path('notification/', views.notification_view),
    re_path(r'^notification/([0-9]+)$', views.notification_view),
    path('Bondecommande/', views.Bondecommande_view),
    re_path(r'^Bondecommande/([0-9]+)$', views.Bondecommande_view),
    path('Contrat/', views.Contrat_view),
    re_path(r'^Contrat/([0-9]+)$', views.Contrat_view),
    path('candidature/', views.candidature_view),
    re_path(r'^candidature/([0-9]+)$', views.candidature_view),
    path('partenariats/', views.partenariats_view),
    re_path(r'^partenariats/([0-9]+)$', views.partenariats_view),
    path('saveDoc/', views.save_doc),
    ]