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
        