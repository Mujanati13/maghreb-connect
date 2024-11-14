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
        
class AppelOffreSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppelOffre
        fields = ['id', 'client_id', 'titre','description', 'profil', 'tjm_min','tjm_max', 'date_publication', 'date_limite','date_debut', 'statut']
       


class CandidatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = ['id_cd', 'AO_id', 'esn_id','responsable_compte', 'id_consultant', 'date_candidature','statut', 'tjm', 'date_disponibilite','commentaire']
       
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user_id', 'message','status', 'categorie', 'created_at']
        
      
class BondecommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bondecommande
        fields = ['id_bdc', 'candidature_id', 'numero_bdc','date_creation', 'montant_total', 'statut', 'description']
        
class ContratSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrat
        fields = ['id_contrat', 'candidature_id', 'numero_contrat','date_signature', 'date_debut', 'date_fin', 'montant','statut', 'conditions']
        

class PartenariatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partenariat
        fields = ['id','id_client', 'id_esn', 'statut', 'description', 'categorie']
        
class Partenariat1Serializer(serializers.ModelSerializer):
    class Meta:
        model = Partenariat1
        fields = ['id_part','id_client', 'id_esn', 'statut','date_debut','date_fin' ,'description', 'categorie']