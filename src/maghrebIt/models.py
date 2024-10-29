from django.db import models
						
# Create your models here.
class Client(models.Model):
    ID_clt = models.AutoField(primary_key=True)
    raison_sociale = models.CharField(max_length=255, verbose_name="Raison Sociale")
    siret = models.CharField(max_length=14, unique=True, verbose_name="Numéro SIRET")
    rce = models.CharField(max_length=255, blank=True, null=True, verbose_name="RCE")
    pays = models.CharField(max_length=100, verbose_name="Pays")
    adresse = models.CharField(max_length=255, verbose_name="Adresse")
    cp = models.CharField(max_length=10, verbose_name="CP")
    ville = models.CharField(max_length=100, verbose_name="Ville")
    province = models.CharField(max_length=100, blank=True, null=True, verbose_name="Province")
    mail_contact = models.EmailField(unique=True, verbose_name="Email de Contact")
    password = models.CharField(max_length=255, verbose_name="Mot de Passe")
    tel_contact = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone de Contact")
    statut = models.CharField(max_length=50, blank=True, null=True, verbose_name="Statut")
    date_validation = models.DateField(blank=True, null=True, verbose_name="Date de Validation")
    n_tva = models.CharField(max_length=20, blank=True, null=True, verbose_name="Numéro de TVA")
    iban = models.CharField(max_length=34, blank=True, null=True, verbose_name="IBAN")
    bic = models.CharField(max_length=11, blank=True, null=True, verbose_name="BIC")
    banque = models.CharField(max_length=100, blank=True, null=True, verbose_name="Banque")

    class Meta:
        
        db_table = 'client' # Nom de la table dans la base de données
        
class Doc_clt(models.Model):
    ID_DOC_CLT = models.AutoField(primary_key=True)  # Identifiant unique pour chaque document
    ID_CLT =models.IntegerField()  # Lien vers un client (modèle Client)
    Doc_URL = models.URLField(max_length=255, verbose_name="URL du Document")  # URL du document
    Titre = models.CharField(max_length=255, verbose_name="Titre")  # Titre du document
    Date_Valid = models.DateField(verbose_name="Date de Validation", null=True, blank=True)  # Date de validation du document
    Statut = models.CharField(max_length=50, verbose_name="Statut")  # Statut du document
    Description = models.TextField(blank=True, null=True, verbose_name="Description")  # Description du document
    class Meta:

        db_table = 'doc_clt' # Nom de la table dans la base de données
        

class ESN(models.Model):
    ID_ESN = models.AutoField(primary_key=True)  # Identifiant unique auto-incrémenté
    Raison_sociale = models.CharField(max_length=255, verbose_name="Raison Sociale")
    SIRET = models.CharField(max_length=14, unique=True, verbose_name="Numéro SIRET")
    RCE = models.CharField(max_length=255, blank=True, null=True, verbose_name="RCE")
    
    # Informations géographiques et de localisation
    Pays = models.CharField(max_length=100, verbose_name="Pays")
    Adresse = models.CharField(max_length=255, verbose_name="Adresse")
    CP = models.CharField(max_length=10, verbose_name="Code Postal")
    Ville = models.CharField(max_length=100, verbose_name="Ville")
    Province = models.CharField(max_length=100, blank=True, null=True, verbose_name="Province")
    
    # Informations de contact
    mail_Contact = models.EmailField(max_length=191, unique=True, verbose_name="Email de Contact")  # Réduit à 191 pour la compatibilité avec les index
    password = models.CharField(max_length=255, verbose_name="Mot de Passe")  # À stocker sous forme hachée
    Tel_Contact = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone de Contact")
    
    # Statut et date de validation
    Statut = models.CharField(max_length=50, blank=True, null=True, verbose_name="Statut")
    Date_validation = models.DateField(blank=True, null=True, verbose_name="Date de Validation")
    
    # Informations bancaires
    N_TVA = models.CharField(max_length=20, blank=True, null=True, verbose_name="Numéro de TVA")
    IBAN = models.CharField(max_length=34, blank=True, null=True, verbose_name="IBAN")
    BIC = models.CharField(max_length=11, blank=True, null=True, verbose_name="BIC")
    Banque = models.CharField(max_length=100, blank=True, null=True, verbose_name="Banque")
    
   
    
    class Meta:
        db_table = 'esn'  # Nom de la table dans la base de données
       

