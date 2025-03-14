from django.db import models
						
# Create your models here.
class Client(models.Model):
    ID_clt = models.AutoField(primary_key=True)
    raison_sociale = models.CharField(max_length=255, verbose_name="Raison Sociale" , blank=True, null=True,)
    siret = models.CharField(max_length=14, unique=True, verbose_name="Numéro SIRET" , blank=True, null=True,)
    rce = models.CharField(max_length=255, blank=True, null=True, verbose_name="RCE")
    pays = models.CharField(max_length=100, verbose_name="Pays" , blank=True, null=True,)
    adresse = models.CharField(max_length=255, verbose_name="Adresse" ,blank=True, null=True,)
    cp = models.CharField(max_length=10, verbose_name="CP" , blank=True, null=True,)
    ville = models.CharField(max_length=100, verbose_name="Ville" , blank=True, null=True,)
    province = models.CharField(max_length=100, blank=True, null=True, verbose_name="Province")
    mail_contact = models.EmailField(unique=True, verbose_name="Email de Contact")
    password = models.CharField(max_length=255, blank=True, null=True, verbose_name="Mot de Passe")
    tel_contact = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone de Contact")
    statut = models.CharField(max_length=50, blank=True, null=True, verbose_name="Statut")
    date_validation = models.DateField(blank=True, null=True, verbose_name="Date de Validation")
    n_tva = models.CharField(max_length=20, blank=True, null=True, verbose_name="Numéro de TVA")
    iban = models.CharField(max_length=34, blank=True, null=True, verbose_name="IBAN")
    bic = models.CharField(max_length=11, blank=True, null=True, verbose_name="BIC")
    banque = models.CharField(max_length=100, blank=True, null=True, verbose_name="Banque")
    img_path = models.CharField(max_length=100, blank=True, null=True, verbose_name="img_path")
    token = models.TextField(blank=True, null=True, verbose_name="token")
    responsible = models.CharField(max_length=255, blank=True, null=True, verbose_name="Responsable")

    class Meta:
        
        db_table = 'client' # Nom de la table dans la base de données
        
class Doc_clt(models.Model):
    ID_DOC_CLT = models.AutoField(primary_key=True)  # Identifiant unique pour chaque document
    ID_CLT =models.IntegerField()  # Lien vers un client (modèle Client)
    Doc_URL = models.CharField(max_length=255, verbose_name="url path")  # URL du document
    Titre = models.CharField(max_length=255, verbose_name="Titre")  # Titre du document
    Date_Valid = models.DateField(verbose_name="Date de Validation", null=True, blank=True)  # Date de validation du document
    Statut = models.CharField(max_length=50, verbose_name="Statut")  # Statut du document
    Description = models.TextField(blank=True, null=True, verbose_name="Description")  # Description du document
    class Meta:

        db_table = 'doc_clt' # Nom de la table dans la base de données
        

class ESN(models.Model):
    ID_ESN = models.AutoField(primary_key=True)  # Identifiant unique auto-incrémenté
    Raison_sociale = models.CharField(max_length=255, verbose_name="Raison Sociale")
    SIRET = models.CharField(max_length=14, unique=True, verbose_name="Numéro SIRET", blank=True, null=True,)
    RCE = models.CharField(max_length=255, blank=True, null=True, verbose_name="RCE")
    
    # Informations géographiques et de localisation
    Pays = models.CharField(max_length=100, verbose_name="Pays",  blank=True, null=True,)
    Adresse = models.CharField(max_length=255, verbose_name="Adresse")
    CP = models.CharField(max_length=10, verbose_name="Code Postal")
    Ville = models.CharField(max_length=100, verbose_name="Ville" ,  blank=True, null=True,)
    Province = models.CharField(max_length=100, blank=True, null=True, verbose_name="Province")
    
    # Informations de contact
    mail_Contact = models.EmailField(max_length=191, unique=True, verbose_name="Email de Contact")  # Réduit à 191 pour la compatibilité avec les index
    password = models.CharField(max_length=255, verbose_name="Mot de Passe", blank=True, null=True)  # À stocker sous forme hachée
    Tel_Contact = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone de Contact")
    responsible = models.CharField(max_length=255, blank=True, null=True, verbose_name="Responsable")
    # Statut et date de validation
    Statut = models.CharField(max_length=50, blank=True, null=True, verbose_name="Statut")
    Date_validation = models.DateField(blank=True, null=True, verbose_name="Date de Validation")
    token = models.TextField(blank=True, null=True, verbose_name="token")
    
    # Informations bancaires
    N_TVA = models.CharField(max_length=20, blank=True, null=True, verbose_name="Numéro de TVA")
    IBAN = models.CharField(max_length=34, blank=True, null=True, verbose_name="IBAN")
    BIC = models.CharField(max_length=11, blank=True, null=True, verbose_name="BIC")
    Banque = models.CharField(max_length=100, blank=True, null=True, verbose_name="Banque")
    
   
    
    class Meta:
        db_table = 'esn'  # Nom de la table dans la base de données
       

class DocumentESN(models.Model):
    ID_DOC_ESN = models.AutoField(primary_key=True)  # Identifiant unique pour chaque document
    ID_ESN = models.IntegerField()   # Lien vers le modèle ESN
    Doc_URL = models.CharField(max_length=255, verbose_name="URL du Document")  # URL du document
    Titre = models.CharField(max_length=255, verbose_name="Titre")  # Titre du document
    Date_Valid = models.DateField(null=True, blank=True, verbose_name="Date de Validation")  # Date de validation
    Statut = models.CharField(max_length=50, verbose_name="Statut")  # Statut du document
    Description = models.TextField(blank=True, null=True, verbose_name="Description")  # Description du document



    class Meta:
      
        db_table = 'doc_esn'  # Nom de la table dans la base de données



class Collaborateur(models.Model):
    ID_collab = models.AutoField(primary_key=True)  # Identifiant unique pour chaque collaborateur
    ID_ESN = models.IntegerField() # Lien vers le modèle ESN
    Admin = models.BooleanField(default=False, verbose_name="Administrateur")  # Rôle administrateur
    Commercial = models.BooleanField(default=False, verbose_name="Commercial")  # Rôle commercial
    Consultant = models.BooleanField(default=False, verbose_name="Consultant")  # Rôle consultant
    Actif = models.BooleanField(default=True, verbose_name="Actif")  # Statut d'activité
    Nom = models.CharField(max_length=100, verbose_name="Nom")  # Nom du collaborateur
    Prenom = models.CharField(max_length=100, verbose_name="Prénom")  # Prénom du collaborateur
    Date_naissance = models.DateField(null=True, blank=True, verbose_name="Date de Naissance")  # Date de naissance
    Poste = models.CharField(max_length=100, null=True, blank=True, verbose_name="Poste")  # Poste occupé
    date_debut_activ = models.DateField(null=True, blank=True, verbose_name="Date de Début d'Activité")  # Date de début d'activité
    date_dé = models.DateField(null=True, blank=True, verbose_name="Date de Démission")  # Date de démission
    CV = models.URLField(max_length=255, null=True, blank=True, verbose_name="Lien CV")  # Lien vers le CV
    LinkedIN = models.URLField(max_length=255, null=True, blank=True, verbose_name="Lien LinkedIn")  # Lien LinkedIn
    Mobilité = models.CharField(max_length=20, choices=[('National', 'National'), ('International', 'International'), ('Autres', 'Autres')], default='National', verbose_name="Mobilité")  # Mobilité
    Disponibilité = models.DateField(null=True, blank=True, verbose_name="Disponibilité")  # Date de disponibilité

     
    class Meta:
        db_table = 'collaboration' 
        


class Admin(models.Model):
    ID_Admin = models.AutoField(primary_key=True)  # Identifiant unique pour chaque administrateur
    Mail = models.EmailField(max_length=255, unique=True, verbose_name="Email de l'Administrateur")  # Adresse email, unique
    mdp = models.CharField(max_length=255, verbose_name="Mot de Passe")  # Mot de passe


    class Meta:
        db_table = 'admin'  # Nom de la table dans la base de données
        
class AppelOffre(models.Model):
    id = models.AutoField(primary_key=True)  # Identifiant unique pour chaque document
    client_id = models.IntegerField()   # Lien vers le modèle ESN
    titre = models.CharField(max_length=255)  # URL du document
    description = models.TextField(blank=True, null=True)   # Titre du document
    profil = models.CharField(max_length=50)  # Date de validation
    tjm_min = models.CharField(max_length=50) # Statut du document
    tjm_max = models.CharField(max_length=50)  # Description du document
    date_publication = models.DateField(max_length=255)  # Titre du document
    date_limite = models.DateField(null=True, blank=True)  # Date de validation
    date_debut = models.DateField(null=True, blank=True)  # Statut du document
    statut = models.CharField(max_length=20)
    jours = models.IntegerField(null=True, blank=True)


    class Meta:
      
        db_table = 'appeloffre'  # Nom de la table dans la base de données
        


class Candidature(models.Model):
    id_cd = models.AutoField(primary_key=True)  # Identifiant unique pour chaque candidature
    AO_id = models.IntegerField()   # Référence à l'appel d'offre
    esn_id = models.IntegerField()  # Référence à l'ESN qui postule
    responsable_compte = models.CharField(max_length=255, blank=True, null=True)  # Responsable du compte
    id_consultant = models.IntegerField()  # Consultant référencé (optionnel)
    date_candidature = models.DateField()  # Date de soumission de la candidature
    statut = models.CharField(max_length=20, choices=[('En cours', 'En cours'), ('Sélectionnée', 'Sélectionnée'), ('Rejetée', 'Rejetée')])  # Statut de la candidature
    tjm = models.DecimalField(max_digits=10, decimal_places=2)  # Tarif journalier proposé par l'ESN
    date_disponibilite = models.DateField()  # Date de disponibilité pour commencer le projet
    commentaire = models.TextField(blank=True, null=True)  # Commentaire supplémentaire
    nom_cn = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'candidature'  # Nom de la table dans la base de données
        
class Notification(models.Model):
    id = models.AutoField(primary_key=True) 
    user_id = models.IntegerField(blank=True, null=True)   
    dest_id = models.IntegerField()  
    event_id = models.IntegerField()  
    message = models.TextField(blank=True, null=True) 
    status = models.CharField(max_length=20, blank=True, null=True) 
    categorie = models.CharField(max_length=50, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now=True)
    event = models.CharField(max_length=50, blank=True, null=True) 
   
    class Meta:
        db_table = 'notifications'  # Nom de la table dans la base de données

class Bondecommande(models.Model):
    id_bdc = models.AutoField(primary_key=True)  # Identifiant unique pour chaque candidature
    candidature_id = models.IntegerField()   # Référence à l'appel d'offre
    numero_bdc = models.CharField(max_length=50, blank=True, null=True) # Référence à l'ESN qui postule
    date_creation = models.DateTimeField(auto_now=True)  # Responsable du compte
    montant_total = models.FloatField()
    statut = models.CharField(max_length=20, blank=True, null=True) 
    description = models.TextField(blank=True, null=True)
    has_contract = models.TextField(blank=True, null=True)
    TJM = models.FloatField()
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    jours = models.IntegerField(null=True, blank=True)
    benefit = models.TextField(blank=True, null=True)
    class Meta:
        db_table = 'bondecommande'  # Nom de la table dans la base de données

class Contrat(models.Model):
    id_contrat = models.AutoField(primary_key=True)  # Identifiant unique pour chaque candidature
    candidature_id = models.IntegerField()   # Référence à l'appel d'offre
    numero_contrat = models.CharField(max_length=50, blank=True, null=True) # Référence à l'ESN qui postule
    date_signature = models.DateField(null=True, blank=True)   # Responsable du compte
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    montant = models.FloatField()
    statut = models.CharField(max_length=20, blank=True, null=True) 
    conditions = models.TextField( blank=True, null=True) 
    esn_trace = models.TextField( blank=True, null=True)    
    client_trace = models.TextField( blank=True, null=True)    
    class Meta:
        db_table = 'contrat'  # Nom de la table dans la base de données
        
class Partenariat(models.Model):
    CATEGORY_CHOICES = [
        ('Diamond', 'Diamond'),
        ('Golden', 'Golden'),
        ('Silver', 'Silver'),
    ]
    id = models.AutoField(primary_key=True)
    id_client = models.IntegerField()   # Référence à la table Client
    id_esn = models.IntegerField()         # Référence à la table ESN
    statut = models.CharField(max_length=50)                           # Statut du partenariat (ex: Actif, Inactif)
    description = models.TextField(blank=True, null=True)              # Description du partenariat
    categorie = models.CharField(max_length=10, choices=CATEGORY_CHOICES)  # Catégorie de partenariat

    class Meta:
        db_table = 'partenariat'
        
        


class Partenariat1(models.Model):
    id_part = models.AutoField(primary_key=True)
    id_client = models.IntegerField()  # Clé étrangère vers le modèle Client
    id_esn = models.IntegerField()        # Clé étrangère vers le modèle ESN
    date_debut = models.DateField()                                    # Date de début du partenariat
    date_fin = models.DateField(blank=True, null=True)                 # Date de fin du partenariat, peut être NULL
    statut = models.CharField(max_length=50)                           # Statut du partenariat (ex. : Actif, Inactif)
    description = models.TextField(blank=True, null=True)              # Description du partenariat
    categorie = models.CharField(max_length=50)                        # Catégorie du partenariat (ex. : Diamond, Golden, Silver)

    class Meta:
        db_table = 'partenariat1'  # Nom de la table dans la base de données