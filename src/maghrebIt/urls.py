from maghrebIt import views
from django.urls import path, re_path



urlpatterns = [
    # Gestion des clients
    path('client/', views.client_view),
    # Route pour gérer les clients (opérations globales comme GET tous les clients ou POST pour ajouter un client).
    re_path(r'^client/([0-9]+)$', views.client_view),
    # Route pour gérer un client spécifique par son ID (opérations GET, PUT, DELETE).

    # Gestion des documents des clients
    path('documentClient/', views.Document_view),
    # Route pour gérer les documents des clients (exemple : ajout d'un document).
    re_path(r'^documentClient/([0-9]+)$', views.Document_view),
    # Route pour gérer un document client spécifique par son ID.

    # Gestion des entreprises ESN (Entreprises de Services Numériques)
    path('ESN/', views.esn_view),
    # Route pour gérer les ESN (opérations globales comme GET tous les ESN ou POST pour ajouter une ESN).
    re_path(r'^ESN/([0-9]+)$', views.esn_view),
    # Route pour gérer une ESN spécifique par son ID.
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/create/', views.create_admin_account, name='create_admin_account'),

    # Gestion des documents des ESN
    path('docEsn/', views.docEsn_view),
    # Route pour gérer les documents associés aux ESN.
    re_path(r'^docEsn/([0-9]+)$', views.docEsn_view),
    # Route pour gérer un document ESN spécifique par son ID.

    # Gestion des administrateurs
    path('admin/', views.admin_view),
    # Route pour gérer les administrateurs (exemple : ajout ou récupération de tous les administrateurs).
    re_path(r'^admin/([0-9]+)$', views.admin_view),
    # Route pour gérer un administrateur spécifique par son ID.

    # Authentification
    path('login/', views.login),
    # Route pour authentifier un administrateur.
    re_path(r'^login/([0-9]+)$', views.login),
    # Authentification par ID (non standard, à adapter si nécessaire).
    path('login_esn/', views.login_esn),
    # Route pour authentifier une ESN.
    re_path(r'^login_esn/([0-9]+)$', views.login_esn),
    # Authentification ESN avec paramètre (non standard).
    path('login_client/', views.login_client),
    # Route pour authentifier un client.
    re_path(r'^login_client/([0-9]+)$', views.login_client),
    # Authentification client avec paramètre (non standard).

    # Gestion des collaborateurs
    path('collaborateur/', views.collaborateur_view),
    # Route pour gérer les collaborateurs (exemple : récupération ou ajout de collaborateurs).
    re_path(r'^collaborateur/([0-9]+)$', views.collaborateur_view),
    # Route pour gérer un collaborateur spécifique par son ID.
    path('get-appel-offre-with-candidatures-by-esn/', views.get_appel_offre_with_candidatures_by_esn, name='get-appel-offre-with-candidatures-by-esn'),

    # Gestion des appels d'offres
    path('appelOffre/', views.appelOffre_view),
    # Route pour gérer les appels d'offres (exemple : récupération ou création d'appels d'offres).
    re_path(r'^appelOffre/([0-9]+)$', views.appelOffre_view),
    # Route pour gérer un appel d'offre spécifique par son ID.

    # Gestion des notifications
    path('notification/', views.notification_view),
    # Route pour gérer les notifications (exemple : récupération ou création de notifications).
    re_path(r'^notification/([0-9]+)$', views.notification_view),
    # Route pour gérer une notification spécifique par son ID.

    path('update-token/', views.update_token, name='update-token'),

    # Gestion des bons de commande
    path('Bondecommande/', views.Bondecommande_view),
    # Route pour gérer les bons de commande (exemple : récupération ou création de bons de commande).
    re_path(r'^Bondecommande/([0-9]+)$', views.Bondecommande_view),
    # Route pour gérer un bon de commande spécifique par son ID.

    # Gestion des contrats
    path('Contrat/', views.Contrat_view),
    # Route pour gérer les contrats (exemple : récupération ou création de contrats).
    re_path(r'^Contrat/([0-9]+)$', views.Contrat_view),
    # Route pour gérer un contrat spécifique par son ID.

    # Gestion des candidatures
    path('candidature/', views.candidature_view),
    # Route pour gérer les candidatures (exemple : récupération ou création de candidatures).
    re_path(r'^candidature/([0-9]+)$', views.candidature_view),
    # Route pour gérer une candidature spécifique par son ID.
    path('update-candidature-status/', views.update_candidature_status, name='update-candidature-status'),

    # Gestion des partenariats
    path('partenariats/', views.partenariats_view),
    # Route pour gérer les partenariats (exemple : récupération ou création de partenariats).
    re_path(r'^partenariats/([0-9]+)$', views.partenariats_view),
    # Route pour gérer un partenariat spécifique par son ID.

    # Sauvegarde de documents
    path('saveDoc/', views.save_doc),
    # Route pour sauvegarder des fichiers envoyés par le client.
    
    
    path('getUserData/', views.Client_by_id),
    re_path(r'^getUserData/([0-9]+)$', views.Client_by_id),
    
    path('getEsnData/', views.Esn_by_id),
    re_path(r'^getEsnData/([0-9]+)$', views.Esn_by_id),
    
    path('getAppelOffre/', views.apprlOffre_by_idClient),
    re_path(r'^getAppelOffre/([0-9]+)$', views.apprlOffre_by_idClient),
    
    path('getNotifications/', views.notification_by_type),
    re_path(r'^getNotifications/([0-9]+)$', views.notification_by_type),
    
    
    path('getDocumentClient/', views.DocumentClient),
    re_path(r'^getDocumentClient/([0-9]+)$', views.DocumentClient),
    path('clients_par_esn/', views.clients_par_esn),
    re_path(r'^clients_par_esn/([0-9]+)$', views.clients_par_esn),
    
    path('consultants_par_client/', views.consultants_par_client),
    re_path(r'^consultants_par_client/([0-9]+)$', views.consultants_par_client),
    
    path('candidatures_par_client/', views.candidatures_par_client),
    re_path(r'^candidatures_par_client/([0-9]+)$', views.candidatures_par_client),
    
    path('consultants_par_esn/', views.consultants_par_esn1),
    re_path(r'^consultants_par_esn/([0-9]+)$', views.consultants_par_esn1),

    path('consultants-par-esn-et-projet/', views.consultants_par_esn_et_projet, name='consultants-par-esn-et-projet'),
    re_path(r'^consultants-par-esn-et-projet/([0-9]+)$', views.consultants_par_esn_et_projet),
    
    path('get-candidatures/', views.get_candidatures_by_project_and_esn, name='get-candidatures-by-project-and-esn'),
    path('get-candidatures-by-project-and-client/', views.get_candidatures_by_project_and_client, name='get-candidatures-by-project-and-client'),

    path('PartenariatClients/', views.PartenariatClients),
    re_path(r'^PartenariatClients/([0-9]+)$', views.PartenariatClients),
    
    path('candidatures_par_appel_offre/', views.candidatures_par_appel_offre),
    re_path(r'^candidatures_par_appel_offre/([0-9]+)$', views.candidatures_par_appel_offre),
    
    path('get_candidates/', views.get_candidates),
    re_path(r'^get_candidates/([0-9]+)$', views.get_candidates),
    
    path('PartenariatESNs/', views.get_esn_partenariats),
    re_path(r'^PartenariatESNs/([0-9]+)$', views.get_esn_partenariats),
    
    path('get_contract/', views.get_contract),
    re_path(r'^get_contract/([0-9]+)$', views.get_contract),
    
    path('getDocumentESN/', views.DocumentESNs),
    re_path(r'^getDocumentESN/([0-9]+)$', views.DocumentESNs),
    
    path('get_bon_de_commande_by_client/', views.get_bon_de_commande_by_client),
    re_path(r'^get_bon_de_commande_by_client/([0-9]+)$', views.get_bon_de_commande_by_client),
    
    
    path('get_bon_de_commande_by_esn/', views.get_bon_de_commande_by_esn),
    re_path(r'^get_bon_de_commande_by_esn/([0-9]+)$', views.get_bon_de_commande_by_esn),
    
    path('notify_signature_contrat/', views.notify_signature_contrat),
    re_path(r'^notify_signature_contrat/([0-9]+)$', views.notify_signature_contrat),
    
    path('notify_validation_bon_de_commande/', views.notify_validation_bon_de_commande),
    re_path(r'^notify_validation_bon_de_commande/([0-9]+)$', views.notify_validation_bon_de_commande),
    
    path('notify_bon_de_commande/', views.notify_bon_de_commande),
    re_path(r'^notify_bon_de_commande/([0-9]+)$', views.notify_bon_de_commande),
    
    path('notify_validation_candidature/', views.notify_validation_candidature),
    re_path(r'^notify_validation_candidature/([0-9]+)$', views.notify_validation_candidature),
    
    path('notify_reponse_appel_offre/', views.notify_reponse_appel_offre),
    re_path(r'^notify_reponse_appel_offre/([0-9]+)$', views.notify_reponse_appel_offre),
    
    path('notify_appel_offre/', views.notify_appel_offre),
    re_path(r'^notify_appel_offre/([0-9]+)$', views.notify_appel_offre),
    
    path('contrat_by_idClient/', views.contrat_by_idClient),
    re_path(r'^contrat_by_idClient/([0-9]+)$', views.contrat_by_idClient),
    
    path('contrat_by_idEsn/', views.contrat_by_idEsn),
    re_path(r'^contrat_by_idEsn/([0-9]+)$', views.contrat_by_idEsn),
    
    path('notify_new_candidature/', views.notify_new_candidature),
    re_path(r'^notify_new_candidature/([0-9]+)$', views.notify_new_candidature),
    
    path('notify_candidature_accepted/', views.notify_candidature_accepted),
    re_path(r'^notify_candidature_accepted/([0-9]+)$', views.notify_candidature_accepted),

    path('notify_expiration_ao/', views.notify_expiration_ao),
    re_path(r'^notify_expiration_ao/([0-9]+)$', views.notify_expiration_ao),
    
    path('notify_end_of_mission/', views.notify_end_of_mission),
    re_path(r'^notify_end_of_mission/([0-9]+)$', views.notify_end_of_mission),
]
