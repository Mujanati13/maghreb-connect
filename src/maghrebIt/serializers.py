from rest_framework import serializers
from .models import *

# serializer Client
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model= Client
        fields = (  'ID_clt', 
            'raison_sociale', 
            'siret', 
            'rce', 
            'pays', 
            'adresse', 
            'cp', 
            'ville', 
            'province', 
            'mail_contact', 
            'password', 
            'tel_contact', 
            'statut', 
            'date_validation', 
            'n_tva', 
            'iban', 
            'bic', 
            'banque') 
        
# serializer doc_clt
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doc_clt
        fields = [
            'ID_DOC_CLT',
            'ID_CLT',
            'Doc_URL',
            'Titre',
            'Date_Valid',
            'Statut',
            'Description'
        ]
        

# serializer ENS
class ESNSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESN
        fields = [
            'ID_ESN', 
            'Raison_sociale', 
            'SIRET', 
            'RCE', 
            'Pays', 
            'Adresse', 
            'CP', 
            'Ville', 
            'Province', 
            'mail_Contact', 
            'password', 
            'Tel_Contact', 
            'Statut', 
            'Date_validation', 
            'N_TVA', 
            'IBAN', 
            'BIC', 
            'Banque'
        ]
# serializer DocumentESN      
class DocumentESNSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentESN
        fields = [
            'ID_DOC_ESN',
            'ID_ESN',
            'Doc_URL',
            'Titre',
            'Date_Valid',
            'Statut',
            'Description'
        ]
        
# serializer Collaborateur      
class CollaborateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collaborateur
        fields = [
            'ID_collab',
            'ID_ESN',
            'Admin',
            'Commercial',
            'Consultant',
            'Actif',
            'Nom',
            'Prenom',
            'Date_naissance',
            'Poste',
            'date_debut_activ',
            'date_dé',
            'CV',
            'LinkedIN',
            'Mobilité',
            'Disponibilité'
        ]
        
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['ID_Admin', 'Mail', 'mdp']
       