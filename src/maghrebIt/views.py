from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404             
from .models import Candidature
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.http import FileResponse
from django.conf import settings

from django.core.files.storage import default_storage
import random
import string
import os

from .models import *
from .serializers import *
from rest_framework import status

from .models import Admin
from .serializers import AdminSerializer

import hashlib
import jwt

from django.core.mail import send_mail
from django.urls import reverse

def checkAuth(request):
    token = request.META.get('HTTP_AUTHORIZATION')
    if token == None:
        print("Non authentifié 1")
        return False
    try:
        token = token.replace('Bearer ', "")
        payload = jwt.decode(token, 'maghrebIt', algorithms=["HS256"])
        return True
    except Exception as e:
        print("Non authentifié 2")
        print(e)
        return False

@csrf_exempt
def save_doc(request):
    # Vérifie si la méthode HTTP est autorisée (seules les requêtes POST sont acceptées)
    if request.method != 'POST':
        return JsonResponse({"status": False, "msg": "Méthode non autorisée"}, status=405)

    # Récupère le fichier envoyé dans la requête sous la clé 'uploadedFile'
    file = request.FILES.get('uploadedFile')
    # Récupère le chemin où le fichier doit être sauvegardé, spécifié dans le corps de la requête
    path = request.POST.get('path')

    # Vérifie si le fichier est fourni dans la requête
    if not file:
        return JsonResponse({"status": False, "msg": "Aucun fichier fourni"}, status=400)
    # Vérifie si le chemin de sauvegarde est fourni
    if not path:
        return JsonResponse({"status": False, "msg": "Chemin de sauvegarde non fourni"}, status=400)

    # Récupère l'extension du fichier (par exemple, '.jpg', '.png')
    file_extension = os.path.splitext(file.name)[1]
    # Définit un ensemble de caractères pour générer des noms aléatoires
    char_set = string.ascii_uppercase + string.digits
    # Génère une chaîne aléatoire de 6 caractères pour le nom du fichier
    file_name_gen = ''.join(random.sample(char_set * 6, 6))
    # Génère une autre chaîne aléatoire pour assurer l'unicité du nom
    file_name_base = ''.join(random.sample(char_set * 6, 6))
    # Construit le nom final du fichier avec le chemin spécifié, un identifiant unique et l'extension
    file_name = f"{path}{file_name_base}-{file_name_gen}{file_extension}"

    # Tente de sauvegarder le fichier en utilisant le chemin généré
    try:
        saved_path = default_storage.save(file_name, file)
        # Renvoie une réponse JSON avec l'indication que l'opération a réussi et le chemin du fichier sauvegardé
        return JsonResponse({"status": True, "path": saved_path}, safe=False)
    except Exception as e:
        # Capture les erreurs potentielles et renvoie un message d'erreur JSON avec un statut HTTP 500
        return JsonResponse({"status": False, "msg": str(e)}, status=500)

# Login view
@csrf_exempt
def login(request):
    # Exempte cette vue de la vérification CSRF (Cross-Site Request Forgery),
    # ce qui est souvent nécessaire pour les API qui ne passent pas par un formulaire HTML classique.

    if request.method == "POST":
        # Vérifie si la méthode de la requête est POST. Si ce n'est pas le cas, aucune autre action n'est effectuée.

        data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans le corps de la requête.

        username = data["username"]
        # Récupère le champ "username" des données JSON.

        mdp = data["mdp"]
        # Récupère le champ "mdp" (mot de passe) des données JSON.

        users = Admin.objects.filter(Mail=username)
        # Requête pour rechercher un utilisateur dans le modèle `Admin` avec un email correspondant au "username".

        if users.exists():
            # Vérifie si un utilisateur avec cet email existe.

            user = users.first()
            # Récupère le premier utilisateur correspondant à la requête.

            pwd_utf = mdp.encode()
            # Encode le mot de passe fourni en UTF-8 pour la compatibilité avec le hachage.

            pwd_sh = hashlib.sha1(pwd_utf)
            # Calcule le hachage SHA-1 du mot de passe encodé.

            password_crp = pwd_sh.hexdigest()
            # Convertit le hachage en chaîne hexadécimale.
            
            if user.mdp == password_crp:
                # Compare le mot de passe haché fourni avec le mot de passe haché stocké dans la base de données.

                client_serializer = AdminSerializer(users, many=True)
                # Sérialise les données de l'utilisateur pour les inclure dans la réponse.

                payload = {
                    'id': user.ID_Admin,  # Inclut l'identifiant de l'utilisateur dans le jeton.
                    'email': user.Mail   # Inclut l'email de l'utilisateur dans le jeton.
                }
                token = jwt.encode(payload, 'maghrebIt', algorithm='HS256')
                # Génère un token JWT avec les informations utilisateur et une clé secrète ('maghrebIt').

                response = JsonResponse(
                    {"success": True, "token": token, "data": client_serializer.data}, safe=False)
                # Crée une réponse JSON contenant le token et les données utilisateur.

                response.set_cookie(key='jwt', value=token, max_age=86400)
                # Ajoute le token JWT en tant que cookie dans la réponse, avec une durée de validité de 24 heures (86 400 secondes).

                return response
                # Retourne la réponse contenant le token et les données utilisateur.

            return JsonResponse({"success": False, "msg": "Password not valid for this user"}, safe=False)
            # Retourne une erreur si le mot de passe ne correspond pas à celui stocké dans la base de données.

        else:
            return JsonResponse({"success": False, "msg": "user not found"}, safe=False)
            # Retourne une erreur si aucun utilisateur avec cet email n'a été trouvé.

@csrf_exempt
def admin_login(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        username = data["username"]
        password = data["mdp"]

        users = Admin.objects.filter(Mail=username)

        if users.exists():
            user = users.first()

            if check_password(password, user.mdp):
                client_serializer = AdminSerializer(users, many=True)
                payload = {
                    'id': user.ID_Admin,
                    'email': user.Mail,
                }
                token = jwt.encode(payload, 'maghrebIt', algorithm='HS256')

                response = JsonResponse({"success": True, "token": token, "data": client_serializer.data}, safe=False)
                response.set_cookie(key='jwt', value=token, max_age=86400)  # 24h (86,400s)

                return response
            return JsonResponse({"success": False, "msg": "Password not valid for this user"}, safe=False)
        else:
            return JsonResponse({"success": False, "msg": "user not found"}, safe=False)

@csrf_exempt
def create_admin_account(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        username = data["username"]
        mdp = data["mdp"]

        if Admin.objects.filter(Mail=username).exists():
            return JsonResponse({"success": False, "msg": "User already exists"}, safe=False)

        hashed_password = make_password(mdp)

        admin_data = {
            "Mail": username,
            "mdp": hashed_password,
            "is_staff": True
        }

        admin_serializer = AdminSerializer(data=admin_data)

        if admin_serializer.is_valid():
            admin_serializer.save()
            return JsonResponse({"success": True, "msg": "Admin account created successfully"}, safe=False)

        return JsonResponse({"success": False, "msg": "Failed to create admin account", "errors": admin_serializer.errors}, safe=False)

    return JsonResponse({"success": False, "msg": "Only POST method is allowed"}, safe=False, status=405)

@csrf_exempt
def login_client(request):
    # Fonction pour authentifier un client à partir de son email et de son mot de passe.
    if request.method == "POST":
        # Vérifie si la méthode de la requête est POST. Si ce n'est pas le cas, la requête n'est pas traitée.

        data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        username = data["username"]
        # Récupère le champ "username" (adresse email) des données JSON envoyées.

        password = data["password"]
        # Récupère le champ "password" des données JSON envoyées.

        users = Client.objects.filter(mail_contact=username)
        # Requête pour rechercher un client dans le modèle `Client` avec un email correspondant au "username".

        if users.exists():
            # Vérifie si un client avec cet email existe.

            user = users.first()
            # Récupère le premier client correspondant à la requête.

            pwd_utf = password.encode()
            # Encode le mot de passe fourni en UTF-8 pour le préparer au hachage.

            pwd_sh = hashlib.sha1(pwd_utf)
            # Calcule le hachage SHA-1 du mot de passe encodé.

            password_crp = pwd_sh.hexdigest()
            # Convertit le hachage en chaîne hexadécimale.

            if user.password == password_crp:
                # Compare le mot de passe haché fourni avec le mot de passe haché stocké dans la base de données.

                client_serializer = ClientSerializer(users, many=True)
                # Sérialise les données du client pour les inclure dans la réponse.

                payload = {
                    'id': user.ID_clt,  # Inclut l'identifiant du client dans le token.
                    'email': user.mail_contact  # Inclut l'email du client dans le token.
                }
                token = jwt.encode(payload, 'maghrebIt', algorithm='HS256')
                # Génère un token JWT avec les informations du client et une clé secrète ('maghrebIt').

                response = JsonResponse(
                    {"success": True, "token": token, "data": client_serializer.data}, safe=False)
                # Crée une réponse JSON contenant le token et les données du client.

                response.set_cookie(key='jwt', value=token, max_age=86400)
                # Ajoute le token JWT en tant que cookie dans la réponse, avec une durée de validité de 24 heures (86 400 secondes).

                return response
                # Retourne la réponse contenant le token et les données du client.

            return JsonResponse({"success": False, "msg": "Password not valid for this user"}, safe=False)
            # Retourne une erreur si le mot de passe ne correspond pas à celui stocké dans la base de données.

        else:
            return JsonResponse({"success": False, "msg": "user not found"}, safe=False)
            # Retourne une erreur si aucun client avec cet email n'a été trouvé.

@csrf_exempt
def login_esn(request):
    if request.method == "POST":

        data = JSONParser().parse(request)
        username = data["username"]
        password = data["password"]

        users = ESN.objects.filter(mail_Contact=username)

        if users.exists():
            user = users.first()
            pwd_utf = password.encode()
            pwd_sh = hashlib.sha1(pwd_utf)
            password_crp = pwd_sh.hexdigest()
            if user.password == password_crp:
                client_serializer = ESNSerializer(users, many=True)
                payload = {
                    'id': user.ID_ESN,
                    'email': user.mail_Contact,
                   
                }
                token = jwt.encode(payload, 'maghrebIt', algorithm='HS256')

                response = JsonResponse( {"success": True,  "token": token, "data": client_serializer.data}, safe=False)

                response.set_cookie(key='jwt', value = token, max_age=86400) # 24h (86.400s)

                return response
                #return JsonResponse({"success": True, "data": client_serializer.data}, safe=False)
            return JsonResponse({"success": False, "msg": "Password not valid for this user"}, safe=False)
        else:
            return JsonResponse({"success": False, "msg": "user not found"}, safe=False)
# Create your views here.

def client_view(request, id=0):
    # Fonction pour gérer les opérations CRUD (Create, Read, Update, Delete) sur les clients.

    # if checkAuth(request) == False:
    #     # Vérifie si l'utilisateur est authentifié à l'aide de la fonction `checkAuth`.
    #     return JsonResponse({
    #         "status": False,
    #         "msg": "Non authentifié"
    #     }, safe=False, status=401)
    #     # Si l'utilisateur n'est pas authentifié, retourne une réponse JSON avec un statut HTTP 401 (Non autorisé).

    if request.method == 'GET':
        # Gère la récupération des clients (opération READ).

        clients = Client.objects.filter()
        # Récupère tous les clients dans la base de données.

        client_serializer = ClientSerializer(clients, many=True)
        # Sérialise les données des clients récupérés pour les rendre exploitables sous forme de JSON.

        data = []
        # Initialise une liste vide pour stocker les données.

        for client in client_serializer.data:
            # Parcourt les données sérialisées des clients.
            data.append(client)
            # Ajoute chaque client dans la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de clients et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouveau client (opération CREATE).

        client_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        # Hash password
        password = client_data["password"]
        # Récupère le mot de passe fourni dans les données JSON.

        pwd_utf = password.encode()
        # Encode le mot de passe en UTF-8 pour le préparer au hachage.

        pwd_sh = hashlib.sha1(pwd_utf)
        # Calcule le hachage SHA-1 du mot de passe encodé.

        password_crp = pwd_sh.hexdigest()
        # Convertit le hachage en chaîne hexadécimale.

        # updated password to hashed password
        client_data["password"] = password_crp
        # Met à jour le mot de passe dans les données du client avec le mot de passe haché.

        client_serializer = ClientSerializer(data=client_data)
        # Crée une instance de sérialiseur avec les données du client.

        if client_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.
            client_serializer.save()
            # Sauvegarde le nouveau client dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!e",
                "errors": client_serializer.errors
            }, safe=False, status=200)
            # Retourne une réponse JSON indiquant que le client a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": client_serializer.errors
        }, safe=False, status=400)
        # Retourne une réponse JSON indiquant que l'ajout du client a échoué.
    if request.method == 'PUT':
        # Gère la mise à jour des informations d'un client existant (opération UPDATE).

        client_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        client = Client.objects.get(ID_clt=client_data["ID_clt"])
        # Récupère le client à mettre à jour en fonction de l'identifiant fourni.
        client_data["password"] = client.password
        # # Hash password
        # password = client_data["password"]
        # # Récupère le mot de passe fourni dans les données JSON.

        # pwd_utf = password.encode()
        # # Encode le mot de passe en UTF-8.

        # pwd_sh = hashlib.sha1(pwd_utf)
        # # Calcule le hachage SHA-1 du mot de passe encodé.

        # password_crp = pwd_sh.hexdigest()
        # # Convertit le hachage en chaîne hexadécimale.

        # # updated password to hashed password
        # client_data["password"] = password_crp
        # Met à jour le mot de passe dans les données du client.

        client_serializer = ClientSerializer(client, data=client_data)
        # Crée une instance de sérialiseur avec les données mises à jour.

        if client_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.
            client_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Upadated Successfully!!",
                "errors": client_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Update",
            "errors": client_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON avec les erreurs de validation si la mise à jour échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un client (opération DELETE).

        try:
            client = Client.objects.get(ID_clt=id)
            # Récupère le client à supprimer en fonction de l'identifiant fourni dans l'URL.

            client.delete()
            # Supprime le client de la base de données.

            return JsonResponse("Deleted Succeffuly!!", safe=False)
            # Retourne une réponse JSON indiquant que le client a été supprimé avec succès.

        except Exception as e:
            # Capture les exceptions en cas d'erreur (par exemple, si le client n'existe pas).

            return JsonResponse({
                "status": 404,
                "msg": "client n'existe pas"
            }, safe=False)
            # Retourne une réponse JSON avec un message d'erreur.

# Document view
@csrf_exempt
def Document_view(request, id=0):
    # Vue permettant de gérer les documents des clients avec des opérations CRUD (Create, Read, Update, Delete).

    # if checkAuth(request) == False:
    #     # Vérifie si l'utilisateur est authentifié en appelant la fonction `checkAuth`.
    #     return JsonResponse({
    #         "status": False,
    #         "msg": "Non authentifié"
    #     }, safe=False, status=401)
        # Si l'utilisateur n'est pas authentifié, retourne une réponse JSON avec un statut 401 (Non autorisé).

    if request.method == 'GET':
        # Gère la récupération de tous les documents ou d'un document spécifique.

        docs = Doc_clt.objects.filter()
        # Récupère tous les documents clients dans la base de données.

        doc_serializer = DocumentSerializer(docs, many=True)
        # Sérialise les documents récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données enrichies des documents.

        for doc in doc_serializer.data:
            # Parcourt chaque document sérialisé.

            client = Client.objects.get(ID_clt=doc['ID_CLT'])
            # Récupère les informations du client associé au document en fonction de l'ID_CLT.

            doc["client"] = client.raison_sociale
            # Ajoute le champ "raison_sociale" du client au dictionnaire du document.

            data.append(doc)
            # Ajoute le document enrichi dans la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON avec le nombre total de documents et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouveau document (opération CREATE).

        doc_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        doc_serializer = DocumentSerializer(data=doc_data)
        # Sérialise les données du document pour les valider et les sauvegarder.

        if doc_serializer.is_valid():
            # Vérifie si les données du document sont valides.

            doc_serializer.save()
            # Sauvegarde le document dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": doc_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que le document a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": doc_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un document existant (opération UPDATE).

        doc_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        doc = Doc_clt.objects.get(ID_DOC_CLT=doc_data["ID_DOC_CLT"])
        # Récupère le document à mettre à jour en fonction de l'ID_DOC_CLT fourni.

        doc_serializer = DocumentSerializer(doc, data=doc_data)
        # Sérialise les données mises à jour pour les valider.

        if doc_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            doc_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": doc_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": doc_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un document (opération DELETE).

        try:
            doc = Doc_clt.objects.get(ID_DOC_CLT=id)
            # Récupère le document à supprimer en fonction de l'ID_DOC_CLT fourni dans l'URL.

            doc.delete()
            # Supprime le document de la base de données.

            return JsonResponse("Deleted Succeffuly!!", safe=False)
            # Retourne une réponse JSON indiquant que le document a été supprimé avec succès.

        except Exception as e:
            # Capture les exceptions, par exemple si le document n'existe pas.

            return JsonResponse({
                "status": 404,
                "msg": "col n'existe pas"
            }, safe=False)
            # Retourne une réponse JSON avec un message d'erreur.

    
# Create your views here.
@csrf_exempt
def esn_view(request, id=0):
    # Vue pour gérer les opérations CRUD (Create, Read, Update, Delete) sur les ESN (Entreprises de Services du Numérique).

    # if checkAuth(request) == False:
    #     # Vérifie si l'utilisateur est authentifié via la fonction `checkAuth`.
    #     return JsonResponse({
    #         "status": False,
    #         "msg": "Non authentifié"
    #     }, safe=False, status=401)
        # Si l'utilisateur n'est pas authentifié, retourne une réponse JSON avec un statut HTTP 401 (Non autorisé).

    if request.method == 'GET':
        # Gère la récupération des ESN (opération READ).

        ESNS = ESN.objects.filter()
        # Récupère toutes les ESN de la base de données.

        ens_serializer = ESNSerializer(ESNS, many=True)
        # Sérialise les données des ESN récupérées pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des ESN.

        for esn in ens_serializer.data:
            # Parcourt les données sérialisées des ESN.
            data.append(esn)
            # Ajoute chaque ESN à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total d'ESN et leurs données.

    if request.method == 'POST':
        # Gère la création d'une nouvelle ESN (opération CREATE).

        esn_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        # Hash password
        password = esn_data["password"]
        # Récupère le mot de passe fourni dans les données JSON.

        pwd_utf = password.encode()
        # Encode le mot de passe en UTF-8 pour le préparer au hachage.

        pwd_sh = hashlib.sha1(pwd_utf)
        # Calcule le hachage SHA-1 du mot de passe encodé.

        password_crp = pwd_sh.hexdigest()
        # Convertit le hachage en chaîne hexadécimale.

        # updated password to hashed password
        esn_data["password"] = password_crp
        # Remplace le mot de passe dans les données par le mot de passe haché.

        esn_serializer = ESNSerializer(data=esn_data)
        # Sérialise les données de l'ESN pour les valider et les sauvegarder.

        if esn_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            esn_serializer.save()
            # Sauvegarde la nouvelle ESN dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!e",
                "errors": esn_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que l'ESN a été ajoutée avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": esn_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'une ESN existante (opération UPDATE).

        esn_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        esn = ESN.objects.get(ID_ESN=esn_data["ID_ESN"])
        # Récupère l'ESN à mettre à jour en fonction de l'ID_ESN fourni.

        # Hash password
        password = esn_data["password"]
        # Récupère le mot de passe fourni dans les données JSON.
        if password != None:

            pwd_utf = password.encode()
            # Encode le mot de passe en UTF-8 pour le préparer au hachage.

            pwd_sh = hashlib.sha1(pwd_utf)
            # Calcule le hachage SHA-1 du mot de passe encodé.

            password_crp = pwd_sh.hexdigest()
            # Convertit le hachage en chaîne hexadécimale.

            # updated password to hashed password
            esn_data["password"] = password_crp
            # Remplace le mot de passe dans les données par le mot de passe haché.

        esn_serializer = ESNSerializer(esn, data=esn_data)
        # Sérialise les données mises à jour pour les valider.

        if esn_serializer.is_valid():
            # Vérifie si les données sérialisées mises à jour sont valides.

            esn_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Upadated Successfully!!",
                "errors": esn_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Update",
            "errors": esn_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'une ESN (opération DELETE).

        try:
            esn = ESN.objects.get(ID_ESN=id)
            # Récupère l'ESN à supprimer en fonction de l'ID_ESN fourni dans l'URL.

            esn.delete()
            # Supprime l'ESN de la base de données.

            return JsonResponse("Deleted Succeffuly!!", safe=False)
            # Retourne une réponse JSON indiquant que l'ESN a été supprimée avec succès.

        except Exception as e:
            # Capture les exceptions en cas d'erreur (par exemple, si l'ESN n'existe pas).

            return JsonResponse({
                "status": 404,
                "msg": "esn n'existe pas"
            }, safe=False)
            # Retourne une réponse JSON avec un message d'erreur.



# Document view
@csrf_exempt
def docEsn_view(request, id=0):
    # Vue permettant de gérer les documents associés aux ESN avec des opérations CRUD (Create, Read, Update, Delete).

    if checkAuth(request) == False:
        # Vérifie si l'utilisateur est authentifié via la fonction `checkAuth`.
        return JsonResponse({
            "status": False,
            "msg": "Non authentifié"
        }, safe=False, status=401)
        # Si l'utilisateur n'est pas authentifié, retourne une réponse JSON avec un statut 401 (Non autorisé).

    if request.method == 'GET':
        
        # Gère la récupération des documents ESN (opération READ).

        docesns = DocumentESN.objects.filter()
        # Récupère tous les documents ESN depuis la base de données.

        docesn_serializer = DocumentESNSerializer(docesns, many=True)
        # Sérialise les documents récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données enrichies des documents ESN.

        for doc in docesn_serializer.data:
            # Parcourt chaque document sérialisé.

            esn = ESN.objects.get(ID_ESN=doc['ID_ESN'])
            # Récupère l'ESN associée au document en fonction de l'ID_ESN.

            doc["esn"] = esn.Raison_sociale
            # Ajoute le champ "Raison sociale" de l'ESN au dictionnaire du document.

            data.append(doc)
            # Ajoute le document enrichi dans la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de documents et leurs données enrichies.

    if request.method == 'POST':
        # Gère la création d'un nouveau document ESN (opération CREATE).

        doc_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        doc_serializer = DocumentESNSerializer(data=doc_data)
        # Sérialise les données du document pour les valider et les sauvegarder.

        if doc_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            doc_serializer.save()
            # Sauvegarde le document ESN dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": doc_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que le document a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": doc_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un document existant (opération UPDATE).

        doc_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        doc = DocumentESN.objects.get(ID_DOC_ESN=doc_data["ID_DOC_ESN"])
        # Récupère le document à mettre à jour en fonction de l'ID_DOC_ESN fourni.

        doc_serializer = DocumentESNSerializer(doc, data=doc_data)
        # Sérialise les données mises à jour pour les valider.

        if doc_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            doc_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": doc_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": doc_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un document ESN (opération DELETE).

        try:
            doc = DocumentESN.objects.get(ID_DOC_ESN=id)
            # Récupère le document à supprimer en fonction de l'ID_DOC_ESN fourni dans l'URL.

            doc.delete()
            # Supprime le document de la base de données.

            return JsonResponse("Deleted Succeffuly!!", safe=False)
            # Retourne une réponse JSON indiquant que le document a été supprimé avec succès.

        except Exception as e:
            # Capture les exceptions en cas d'erreur (par exemple, si le document n'existe pas).

            return JsonResponse({
                "status": 404,
                "msg": "docESN n'existe pas"
            }, safe=False)
            # Retourne une réponse JSON avec un message d'erreur.


# collaborateur_view
@csrf_exempt
def collaborateur_view(request, id=0):
    # Vue pour gérer les collaborateurs avec des opérations CRUD (Create, Read, Update, Delete).

    if checkAuth(request) == False:
        # Vérifie si l'utilisateur est authentifié via la fonction `checkAuth`.
        return JsonResponse({
            "status": False,
            "msg": "Non authentifié"
        }, safe=False, status=401)
        # Si l'utilisateur n'est pas authentifié, retourne une réponse JSON avec un statut 401 (Non autorisé).

    if request.method == 'GET':
        # Gère la récupération des collaborateurs (opération READ).

        colls = Collaborateur.objects.filter()
        # Récupère tous les collaborateurs dans la base de données.

        Collaborateur_serializer = CollaborateurSerializer(colls, many=True)
        # Sérialise les collaborateurs récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des collaborateurs.

        for col in Collaborateur_serializer.data:
            # Parcourt les collaborateurs sérialisés.
            data.append(col)
            # Ajoute chaque collaborateur à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de collaborateurs et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouveau collaborateur (opération CREATE).

        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = CollaborateurSerializer(data=Collaborateur_data)
        # Sérialise les données du collaborateur pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()
            # Sauvegarde le collaborateur dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que le collaborateur a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un collaborateur existant (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = Collaborateur.objects.get(ID_collab=col_data["ID_collab"])
        # Récupère le collaborateur à mettre à jour en fonction de l'ID_collab fourni.

        col_serializer = CollaborateurSerializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un collaborateur (opération DELETE).

        try:
            col = Collaborateur.objects.get(ID_collab=id)
            # Récupère le collaborateur à supprimer en fonction de l'ID_collab fourni dans l'URL.

            col.delete()
            # Supprime le collaborateur de la base de données.

            return JsonResponse("Deleted Succeffuly!!", safe=False)
            # Retourne une réponse JSON indiquant que le collaborateur a été supprimé avec succès.

        except Exception as e:
            # Capture les exceptions en cas d'erreur (par exemple, si le collaborateur n'existe pas).

            return JsonResponse({
                "status": 404,
                "msg": "col n'existe pas"
            }, safe=False)
            # Retourne une réponse JSON avec un message d'erreur.


# Admin views .
@csrf_exempt
def admin_view(request, id=0):
    # Vue permettant de gérer les administrateurs avec des opérations CRUD (Create, Read, Update, Delete).

    if checkAuth(request) == False:
        # Vérifie si l'utilisateur est authentifié via la fonction `checkAuth`.
        return JsonResponse({
            "status": False,
            "msg": "Non authentifié"
        }, safe=False, status=401)
        # Si l'utilisateur n'est pas authentifié, retourne une réponse JSON avec un statut HTTP 401 (Non autorisé).

    if request.method == 'GET':
        # Gère la récupération des administrateurs (opération READ).

        admins = Admin.objects.filter()
        # Récupère tous les administrateurs dans la base de données.

        admin_serializer = AdminSerializer(admins, many=True)
        # Sérialise les administrateurs récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des administrateurs.

        for admin in admin_serializer.data:
            # Parcourt les administrateurs sérialisés.
            data.append(admin)
            # Ajoute chaque administrateur à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total d'administrateurs et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouvel administrateur (opération CREATE).

        admin_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        # Hash password
        mdp = admin_data["mdp"]
        # Récupère le mot de passe fourni dans les données JSON.

        pwd_utf = mdp.encode()
        # Encode le mot de passe en UTF-8 pour le préparer au hachage.

        pwd_sh = hashlib.sha1(pwd_utf)
        # Calcule le hachage SHA-1 du mot de passe encodé.

        password_crp = pwd_sh.hexdigest()
        # Convertit le hachage en chaîne hexadécimale.

        # updated password to hashed password
        admin_data["mdp"] = password_crp
        # Met à jour le mot de passe avec sa version hachée.

        admin_serializer = AdminSerializer(data=admin_data)
        # Sérialise les données de l'administrateur pour les valider et les sauvegarder.

        if admin_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            admin_serializer.save()
            # Sauvegarde l'administrateur dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": admin_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que l'administrateur a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": admin_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un administrateur existant (opération UPDATE).

        admin_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        admin = Admin.objects.get(ID_Admin=admin_data["ID_Admin"])
        # Récupère l'administrateur à mettre à jour en fonction de l'ID_Admin fourni.

        # Hash password
        mdp = admin_data["mdp"]
        # Récupère le mot de passe fourni dans les données JSON.

        pwd_utf = mdp.encode()
        # Encode le mot de passe en UTF-8 pour le préparer au hachage.

        pwd_sh = hashlib.sha1(pwd_utf)
        # Calcule le hachage SHA-1 du mot de passe encodé.

        password_crp = pwd_sh.hexdigest()
        # Convertit le hachage en chaîne hexadécimale.

        # updated password to hashed password
        admin_data["mdp"] = password_crp
        # Met à jour le mot de passe avec sa version hachée.

        admin_serializer = AdminSerializer(admin, data=admin_data)
        # Sérialise les données mises à jour pour les valider.

        if admin_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            admin_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": admin_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": admin_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un administrateur (opération DELETE).

        admin = Admin.objects.get(ID_Admin=id)
        # Récupère l'administrateur à supprimer en fonction de l'ID_Admin fourni dans l'URL.

        admin.delete()
        # Supprime l'administrateur de la base de données.

        return JsonResponse("Deleted Succeffuly!!", safe=False)
        # Retourne une réponse JSON indiquant que l'administrateur a été supprimé avec succès.

    
@csrf_exempt
def get_appel_offre_with_candidatures_by_esn(request):
    esn_id = request.GET.get("esn_id")
    if request.method == 'GET':
    
        if not esn_id:
            return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False, status=400)

        appel_offres = AppelOffre.objects.filter(
            id__in=Candidature.objects.filter(esn_id=esn_id).values_list('AO_id', flat=True)
        ).distinct().order_by('-id')

        # Sérialiser les données des appels d'offres
        appel_offre_serializer = AppelOffreSerializer(appel_offres, many=True)
        data = appel_offre_serializer.data  # No need to iterate manually

        return JsonResponse({"status": True, "data": data}, safe=False)   
@csrf_exempt
def appelOffre_view(request, id=0):
    # Vue permettant de gérer les appels d'offres avec des opérations CRUD (Create, Read, Update, Delete).

    if request.method == 'GET':
        # Gère la récupération des appels d'offres (opération READ).

        colls = AppelOffre.objects.filter()
        # Récupère tous les appels d'offres dans la base de données.

        Collaborateur_serializer = AppelOffreSerializer(colls, many=True)
        # Sérialise les appels d'offres récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des appels d'offres.

        for col in Collaborateur_serializer.data:
            # Parcourt les appels d'offres sérialisés.
            data.append(col)
            # Ajoute chaque appel d'offre à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total d'appels d'offres et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouvel appel d'offre (opération CREATE).

        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = AppelOffreSerializer(data=Collaborateur_data)
        # Sérialise les données de l'appel d'offre pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()

            # Sauvegarde l'appel d'offre dans la base de données.
            esn_tokens = list(ESN.objects.values_list('token', flat=True))

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": col_serializer.errors,
                "id" : col_serializer.data["id"],
                "data" : col_serializer.data,
                "esn_tokens": esn_tokens
            }, safe=False)
            # Retourne une réponse JSON indiquant que l'appel d'offre a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un appel d'offre existant (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = AppelOffre.objects.get(id=col_data["id"])
        # Récupère l'appel d'offre à mettre à jour en fonction de l'identifiant fourni.

        col_serializer = AppelOffreSerializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un appel d'offre (opération DELETE).

        col = AppelOffre.objects.get(id=id)
        # Récupère l'appel d'offre à supprimer en fonction de son identifiant fourni dans l'URL.

        col.delete()
        # Supprime l'appel d'offre de la base de données.

        return JsonResponse("Deleted Successfully!!", safe=False)
        # Retourne une réponse JSON indiquant que l'appel d'offre a été supprimé avec succès.

    
@csrf_exempt
def candidature_view(request, id=0):
    # Vue pour gérer les candidatures avec des opérations CRUD (Create, Read, Update, Delete).

    if request.method == 'GET':
        # Gère la récupération des candidatures (opération READ).

        colls = Candidature.objects.filter()
        # Récupère toutes les candidatures de la base de données.

        Collaborateur_serializer = CandidatureSerializer(colls, many=True)
        # Sérialise les candidatures récupérées pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des candidatures.

        for col in Collaborateur_serializer.data:
            # Parcourt les candidatures sérialisées.
            data.append(col)
            # Ajoute chaque candidature à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de candidatures et leurs données.

    if request.method == 'POST':
        # Gère la création d'une nouvelle candidature (opération CREATE).
        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = CandidatureSerializer(data=Collaborateur_data)
        # Sérialise les données de la candidature pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()
            # Sauvegarde la candidature dans la base de données.

            # Fetch the project and client token
            token = None

        # Fetch the project and client token
            try:
                project = AppelOffre.objects.get(id=Collaborateur_data["AO_id"])
                client = Client.objects.get(ID_clt=project.client_id)
                token = client.token

            except AppelOffre.DoesNotExist:
                return JsonResponse({
                    "status": False,
                    "msg": "Appel d'offre not found"
                }, safe=False)    
            except Client.DoesNotExist:
                token = None

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "id": col_serializer.data["id_cd"],
                "errors": col_serializer.errors,
                "token": token
            }, safe=False)        # Retourne une réponse JSON indiquant que la candidature a été ajoutée avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'une candidature existante (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = Candidature.objects.get(id_cd=col_data["id_cd"])
        # Récupère la candidature à mettre à jour en fonction de l'identifiant fourni.

        col_serializer = CandidatureSerializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'une candidature (opération DELETE).

        col = Candidature.objects.get(id_cd=id)
        # Récupère la candidature à supprimer en fonction de son identifiant fourni dans l'URL.

        col.delete()
        # Supprime la candidature de la base de données.

        return JsonResponse("Deleted Successfully!!", safe=False)
        # Retourne une réponse JSON indiquant que la candidature a été supprimée avec succès.


@csrf_exempt
def update_candidature_status(request):
    if request.method == 'PUT':
        # Parse the JSON data from the request
        data = JSONParser().parse(request)

        # Check if 'id' and 'status' are in the data
        if 'id_cd' not in data or 'statut' not in data:
            return JsonResponse({
                "status": False,
                "msg": "Missing 'id' or 'status' in request data"
            }, safe=False)

        # Update the status of the candidature
        id = data['id_cd']
        statut = data['statut']

        try:
            candidature = Candidature.objects.get(id_cd=id)
            candidature.statut = statut
            candidature.save()

            return JsonResponse({
                "status": True,
                "msg": "Status updated successfully"
            }, safe=False)
        except Candidature.DoesNotExist:
            return JsonResponse({
                "status": False,
                "msg": "Candidature not found"
            }, safe=False)

    return JsonResponse({
        "status": False,
        "msg": "Invalid request method"
    }, safe=False)


    
@csrf_exempt
def notification_view(request, id=0):
    # Vue pour gérer les notifications avec des opérations CRUD (Create, Read, Update, Delete).

    if request.method == 'GET':
        # Gère la récupération des notifications (opération READ).

        colls = Notification.objects.filter()
        # Récupère toutes les notifications dans la base de données.

        Collaborateur_serializer = NotificationSerializer(colls, many=True)
        # Sérialise les notifications récupérées pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des notifications.

        for col in Collaborateur_serializer.data:
            # Parcourt les notifications sérialisées.
            data.append(col)
            # Ajoute chaque notification à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de notifications et leurs données.

    if request.method == 'POST':
        # Gère la création d'une nouvelle notification (opération CREATE).

        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = NotificationSerializer(data=Collaborateur_data)
        # Sérialise les données de la notification pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()
            # Sauvegarde la notification dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la notification a été ajoutée avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'une notification existante (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = Notification.objects.get(id=col_data["id"])
        # Récupère la notification à mettre à jour en fonction de l'identifiant fourni.

        if 'status' in col_data:
            col.status = col_data['status']
        # Met à jour le champ status dans la notification.

        if 'event_id' not in col_data:
            col_data['event_id'] = col.event_id
        # Assure que l'event_id n'est pas nul.

        col_serializer = NotificationSerializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON indiquant que la mise à jour a échoué.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON indiquant que la mise à jour a échoué.
        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'une notification (opération DELETE).

        col = Notification.objects.get(id=id)
        # Récupère la notification à supprimer en fonction de l'identifiant fourni dans l'URL.

        col.delete()
        # Supprime la notification de la base de données.

        return JsonResponse("Deleted Successfully!!", safe=False)
        # Retourne une réponse JSON indiquant que la notification a été supprimée avec succès.

@csrf_exempt
def update_token(request):
    if request.method == 'PUT':
        # Parse the JSON data from the request
        data = JSONParser().parse(request)
        # Check if 'type', 'id', and 'token' are in the data
        if 'type' not in data or 'id' not in data or 'token' not in data:
            return JsonResponse({
                "status": False,
                "msg": "Missing 'type', 'id' or 'token' in request data"
            }, safe=False)

        # Update the token based on the type and id
        type = data['type']
        id = data['id']
        token = data['token']

        try:
            if type == 'esn':
                esn = ESN.objects.get(ID_ESN=id)
                esn.token = token
                esn.save()
            elif type == 'client':
                client = Client.objects.get(ID_clt=id)
                client.token = token
                client.save()
            else:
                return JsonResponse({
                    "status": False,
                    "msg": "Invalid type"
                }, safe=False)

            return JsonResponse({
                "status": True,
                "msg": "Token updated successfully"
            }, safe=False)
        except (Esn.DoesNotExist, Client.DoesNotExist):
            return JsonResponse({
                "status": False,
                "msg": f"{type.capitalize()} not found"
            }, safe=False)

    return JsonResponse({
        "status": False,
        "msg": "Invalid request method"
    }, safe=False)




@csrf_exempt
def Bondecommande_view(request, id=0):
    # Vue permettant de gérer les bons de commande avec des opérations CRUD (Create, Read, Update, Delete).

    if request.method == 'GET':
        # Gère la récupération des bons de commande (opération READ).

        colls = Bondecommande.objects.filter()
        # Récupère tous les bons de commande depuis la base de données.

        Collaborateur_serializer = BondecommandeSerializer(colls, many=True)
        # Sérialise les bons de commande récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des bons de commande.

        for col in Collaborateur_serializer.data:
            # Parcourt les bons de commande sérialisés.
            data.append(col)
            # Ajoute chaque bon de commande à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de bons de commande et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouveau bon de commande (opération CREATE).

        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = BondecommandeSerializer(data=Collaborateur_data)
        # Sérialise les données du bon de commande pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()
            # Sauvegarde le bon de commande dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": col_serializer.errors,
                "id": col_serializer.data["id_bdc"],  # Include the ID of the created Bondecommande
            }, safe=False)
            # Retourne une réponse JSON indiquant que le bon de commande a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un bon de commande existant (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = Bondecommande.objects.get(id_bdc=col_data["id_bdc"])
        # Récupère le bon de commande à mettre à jour en fonction de son identifiant.

        col_serializer = BondecommandeSerializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un bon de commande (opération DELETE).

        col = Bondecommande.objects.get(id_bdc=id)
        # Récupère le bon de commande à supprimer en fonction de son identifiant fourni dans l'URL.

        col.delete()
        # Supprime le bon de commande de la base de données.

        return JsonResponse("Deleted Successfully!!", safe=False)
        # Retourne une réponse JSON indiquant que le bon de commande a été supprimé avec succès.

@csrf_exempt
def Contrat_view(request, id=0):
    # Vue permettant de gérer les contrats avec des opérations CRUD (Create, Read, Update, Delete).

    if request.method == 'GET':
        # Gère la récupération des contrats (opération READ).

        # Récupère tous les contrats depuis la base de données.
        colls = Contrat.objects.filter().order_by('-id_contrat')
        # Récupère tous les contrats depuis la base de données en ordre décroissant.

        Collaborateur_serializer = ContratSerializer(colls, many=True)
        # Sérialise les contrats récupérés pour les convertir en JSON.

        data = list(Collaborateur_serializer.data)

            # Ajoute chaque contrat à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de contrats et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouveau contrat (opération CREATE).

        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = ContratSerializer(data=Collaborateur_data)
        # Sérialise les données du contrat pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()
            # Sauvegarde le contrat dans la base de données.
            candidature_id = col_serializer.data["candidature_id"]
            esn_id = None
            try:
                candidature = Candidature.objects.get(id_cd=candidature_id)
                esn_id = candidature.esn_id
            except Candidature.DoesNotExist:
                esn_id = None

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": col_serializer.errors,
                "id_contrat": col_serializer.data["id_contrat"],
                "esn_id" : esn_id
            }, safe=False)
            # Retourne une réponse JSON indiquant que le contrat a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un contrat existant (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = Contrat.objects.get(id_contrat=col_data["id_contrat"])
        # Récupère le contrat à mettre à jour en fonction de son identifiant.

        col_serializer = ContratSerializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un contrat (opération DELETE).

        col = Contrat.objects.get(id_contrat=id)
        # Récupère le contrat à supprimer en fonction de son identifiant fourni dans l'URL.

        col.delete()
        # Supprime le contrat de la base de données.

        return JsonResponse("Deleted Successfully!!", safe=False)
        # Retourne une réponse JSON indiquant que le contrat a été supprimé avec succès.
    
   
@csrf_exempt
def partenariats_view(request, id=0):
    # Vue permettant de gérer les partenariats avec des opérations CRUD (Create, Read, Update, Delete).

    if request.method == 'GET':
        # Gère la récupération des partenariats (opération READ).

        colls = Partenariat1.objects.filter()
        # Récupère tous les partenariats dans la base de données.

        Collaborateur_serializer = Partenariat1Serializer(colls, many=True)
        # Sérialise les partenariats récupérés pour les convertir en JSON.

        data = []
        # Initialise une liste pour stocker les données des partenariats.

        for col in Collaborateur_serializer.data:
            # Parcourt les partenariats sérialisés.
            data.append(col)
            # Ajoute chaque partenariat à la liste `data`.

        return JsonResponse({"total": len(data), "data": data}, safe=False)
        # Retourne une réponse JSON contenant le nombre total de partenariats et leurs données.

    if request.method == 'POST':
        # Gère la création d'un nouveau partenariat (opération CREATE).

        Collaborateur_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête POST.

        col_serializer = Partenariat1Serializer(data=Collaborateur_data)
        # Sérialise les données du partenariat pour les valider et les sauvegarder.

        if col_serializer.is_valid():
            # Vérifie si les données sérialisées sont valides.

            col_serializer.save()
            # Sauvegarde le partenariat dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "Added Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que le partenariat a été ajouté avec succès.

        return JsonResponse({
            "status": False,
            "msg": "Failed to Add",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'PUT':
        # Gère la mise à jour d'un partenariat existant (opération UPDATE).

        col_data = JSONParser().parse(request)
        # Parse les données JSON envoyées dans la requête PUT.

        col = Partenariat1.objects.get(id_part=col_data["id_part"])
        # Récupère le partenariat à mettre à jour en fonction de son identifiant.

        col_serializer = Partenariat1Serializer(col, data=col_data)
        # Sérialise les données mises à jour pour les valider.

        if col_serializer.is_valid():
            # Vérifie si les données mises à jour sont valides.

            col_serializer.save()
            # Sauvegarde les modifications dans la base de données.

            return JsonResponse({
                "status": True,
                "msg": "updated Successfully!!",
                "errors": col_serializer.errors
            }, safe=False)
            # Retourne une réponse JSON indiquant que la mise à jour a réussi.

        return JsonResponse({
            "status": False,
            "msg": "Failed to update",
            "errors": col_serializer.errors
        }, safe=False)
        # Retourne une réponse JSON contenant les erreurs si la validation échoue.

    if request.method == 'DELETE':
        # Gère la suppression d'un partenariat (opération DELETE).

        col = Partenariat1.objects.get(id_part=id)
        # Récupère le partenariat à supprimer en fonction de son identifiant fourni dans l'URL.

        col.delete()
        # Supprime le partenariat de la base de données.

        return JsonResponse("Deleted Successfully!!", safe=False)
        # Retourne une réponse JSON indiquant que le partenariat a été supprimé avec succès.
@csrf_exempt
def Client_by_id(request):
    if request.method == 'GET':
        clientId = request.GET["clientId"]
        client = Client.objects.filter(ID_clt=clientId)
       
        client_serializer = ClientSerializer(client, many=True)
        data = []
        for S in client_serializer.data:
            data.append(S)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    
@csrf_exempt
def apprlOffre_by_idClient(request):
    if request.method == 'GET':
        clientId = request.GET["clientId"]
        appel = AppelOffre.objects.filter(client_id=clientId)
       
        appelOffre_serializer = AppelOffreSerializer(appel, many=True)
        data = []
        for S in appelOffre_serializer.data:
            data.append(S)
        return JsonResponse({"total": len(data),"data": data}, safe=False)

@csrf_exempt
def get_candidatures_by_esn(request):
    if request.method == 'GET':
        esn_id = request.GET.get("esn_id")
        
        if not esn_id:
            return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False)

        # Filtrer les candidatures associées à l'ESN
        candidatures = Candidature.objects.filter(esn_id=esn_id)

        if not candidatures.exists():
            return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour cet ESN"}, safe=False)

        # Sérialiser les données des candidatures
        candidature_serializer = CandidatureSerializer(candidatures, many=True)

        return JsonResponse({"status": True, "data": candidature_serializer.data}, safe=False)

    return JsonResponse({"status": False, "message": "Invalid request method"}, safe=False)


@csrf_exempt
def get_collaborateur_by_id(request, collaborateur_id):
    if request.method == 'GET':
        try:
            # Get collaborateur by ID
            collaborateur = Collaborateur.objects.get(ID_collab=collaborateur_id)
            
            # Serialize the data
            collaborateur_serializer = CollaborateurSerializer(collaborateur)

            return JsonResponse({
                "status": True,
                "data": collaborateur_serializer.data
            }, safe=False)

        except Collaborateur.DoesNotExist:
            return JsonResponse({
                "status": False,
                "message": "Collaborateur not found"
            }, safe=False)
        except Exception as e:
            return JsonResponse({
                "status": False,
                "message": str(e)
            }, safe=False)

    return JsonResponse({
        "status": False,
        "message": "Invalid request method"
    }, safe=False)

@csrf_exempt
def get_candidatures_by_client(request):
    if request.method == 'GET':
        client_id = request.GET.get("client_id")
        
        if not client_id:
            return JsonResponse({"status": False, "message": "client_id manquant"}, safe=False)

        # Récupérer les appels d'offre associés au client
        appels_offre = AppelOffre.objects.filter(client_id=client_id)
        if not appels_offre.exists():
            return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client"}, safe=False)

        # Récupérer les candidatures liées à ces appels d'offre
        candidatures = Candidature.objects.filter(AO_id__in=appels_offre.values_list('id', flat=True))
        if not candidatures.exists():
            return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour ce client"}, safe=False)

        # Sérialiser les données des candidatures
        candidature_serializer = CandidatureSerializer(candidatures, many=True)

        return JsonResponse({"status": True, "data": candidature_serializer.data}, safe=False)

    return JsonResponse({"status": False, "message": "Invalid request method"}, safe=False)

@csrf_exempt
def notification_by_type(request):
    if request.method == 'GET':
        notif_type = request.GET.get("type")  # Use `get` to avoid potential `KeyError`
        user_id = request.GET.get("id")

        if not notif_type or not user_id:  # Validate input
            return JsonResponse({"error": "Both 'type' and 'id' are required."}, status=400)

        # Filter notifications by type and destination ID
        notif = Notification.objects.filter(categorie=notif_type, dest_id=user_id).order_by('-id')
        notif_serializer = NotificationSerializer(notif, many=True)
        data = notif_serializer.data  # No need to iterate manually

        return JsonResponse({"total": len(data), "data": data}, safe=False)
    
    # Handle unsupported methods
    return JsonResponse({"error": "Only GET method is allowed."}, status=405)

@csrf_exempt
def DocumentClient(request):
    if request.method == 'GET':
        ClientId = request.GET["ClientId"]
        doc = Doc_clt.objects.filter(ID_CLT=ClientId)
       
        doc_serializer = DocumentSerializer(doc, many=True)
        data = []
        for S in doc_serializer.data:
            data.append(S)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    
@csrf_exempt
def DocumentESNs(request):
    if request.method == 'GET':
        esnId = request.GET["esnId"]
        doc = DocumentESN.objects.filter(ID_ESN=esnId)
       
        doc_serializer = DocumentESNSerializer(doc, many=True)
        data = []
        for S in doc_serializer.data:
            data.append(S)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    
# @csrf_exempt
# def PartenariatESNs(request):
#     if request.method == 'GET':
#         esnId = request.GET["esnId"]
#         parte = Partenariat1.objects.filter(id_esn=esnId)
       
#         part_serializer = Partenariat1Serializer(parte, many=True)
#         data = []
#         for S in part_serializer.data:
#             data.append(S)
#         return JsonResponse({"total": len(data),"data": data}, safe=False)
@csrf_exempt
def get_esn_partenariats(request):
    esn_id = request.GET.get("esn_id")
    
    if not esn_id:
        return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False, status=400)

    # Filtrer les partenariats associés à l'ESN
    partenariats = Partenariat1.objects.filter(id_esn=esn_id)

    # Sérialiser les données des partenariats
    partenariat_serializer = Partenariat1Serializer(partenariats, many=True)

    return JsonResponse({"status": True, "data": partenariat_serializer.data}, safe=False)

@csrf_exempt
def PartenariatESNs(request):
    if request.method == 'GET':
        try:
            esnId = request.GET["esnId"]
            

            if not esnId:
                return JsonResponse({"status": False, "message": "clientId requis"}, safe=False)
            

            # Filtrer les partenariats pour le client donné et le nom de l'ESN
            partenariats = Partenariat1.objects.filter(id_esn=esnId)

            # Ajouter un filtre supplémentaire pour le nom de l'ESN
            data = []
            for partenariat in partenariats:
                try:
                    clt = Client.objects.get(ID_clt=partenariat.id_client)
                    data.append({
                        "id_part": partenariat.id_part,
                        "id_client": partenariat.id_client,
                        "id_esn": partenariat.id_esn,
                        "client_name": clt.raison_sociale,
                        "date_debut": partenariat.date_debut,
                        "date_fin": partenariat.date_fin,
                        "statut": partenariat.statut,
                        "description": partenariat.description,
                        "categorie": partenariat.categorie,
                    })
                except ESN.DoesNotExist:
                    continue  # Si l'ESN ne correspond pas, passez au suivant

            return JsonResponse({"total": len(data), "data": data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)   
        
# @csrf_exempt
# def PartenariatClients(request):
#     if request.method == 'GET':
#         clientId = request.GET["clientId"]
#         parte = Partenariat1.objects.filter(id_client=clientId)
       
#         part_serializer = Partenariat1Serializer(parte, many=True)
#         data = []
#         for S in part_serializer.data:
#             data.append(S)
#         return JsonResponse({"total": len(data),"data": data}, safe=False)
    
@csrf_exempt
def PartenariatClients(request):
    if request.method == 'GET':
        try:
            clientId = request.GET.get("clientId")
         

            if not clientId:
                return JsonResponse({"status": False, "message": "clientId requis"}, safe=False)
           

            # Filtrer les partenariats pour le client donné et le nom de l'ESN
            partenariats = Partenariat1.objects.filter(id_client=clientId)

            # Ajouter un filtre supplémentaire pour le nom de l'ESN
            data = []
            for partenariat in partenariats:
                try:
                    esn = ESN.objects.get(ID_ESN=partenariat.id_esn)
                    data.append({
                        "id_part": partenariat.id_part,
                        "id_client": partenariat.id_client,
                        "id_esn": partenariat.id_esn,
                        "esn_name": esn.Raison_sociale,
                        "date_debut": partenariat.date_debut,
                        "date_fin": partenariat.date_fin,
                        "statut": partenariat.statut,
                        "description": partenariat.description,
                        "categorie": partenariat.categorie,
                    })
                except ESN.DoesNotExist:
                    continue  # Si l'ESN ne correspond pas, passez au suivant

            return JsonResponse({"total": len(data), "data": data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)


def get_candidatures_by_project_and_esn(request):
    esn_id = request.GET.get("esn_id")
    project_id = request.GET.get("project_id")
    
    if not esn_id:
        return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False)
    
    if not project_id:
        return JsonResponse({"status": False, "message": "project_id manquant"}, safe=False)

    # Filtrer les candidatures associées à l'ESN et au projet
    candidatures = Candidature.objects.filter(esn_id=esn_id, AO_id=project_id)
    # Sérialiser les données des candidatures
    candidature_serializer = CandidatureSerializer(candidatures, many=True)

    return JsonResponse({"status": True, "data": candidature_serializer.data}, safe=False)


@csrf_exempt
def get_candidatures_by_project_and_client(request):
    project_id = request.GET.get("project_id")
    client_id = request.GET.get("client_id")
    
    if not project_id:
        return JsonResponse({"status": False, "message": "project_id manquant"}, safe=False)
    
    if not client_id:
        return JsonResponse({"status": False, "message": "client_id manquant"}, safe=False)

    # Filtrer les appels d'offre associés au client et au projet
    appels_offre = AppelOffre.objects.filter(id=project_id, client_id=client_id)

    if not appels_offre.exists():
        return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client et ce projet"}, safe=False)

    # Filtrer les candidatures associées aux appels d'offre trouvés
    candidatures = Candidature.objects.all().filter(AO_id=project_id)

    if not candidatures.exists():
        return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour ce client et ce projet"}, safe=False)

    # Sérialiser les données des candidatures
    candidature_serializer = CandidatureSerializer(candidatures, many=True)

    return JsonResponse({"status": True, "data": candidature_serializer.data}, safe=False)

@csrf_exempt
def clients_par_esn(request):
    if request.method == 'GET':
        try:
            # Récupération de l'identifiant de l'ESN
            esn_id = request.GET.get("esn_id")
            if not esn_id:
                return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False)

            # Filtrer les candidatures associées à l'ESN
            candidatures = Candidature.objects.filter(esn_id=esn_id)
            # if not candidatures.exists():
            #     return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour cet ESN"}, safe=False)

            # Extraire les IDs des appels d'offres associés
            appels_offres_ids = candidatures.values_list('AO_id', flat=True)

            # Filtrer les appels d'offres associés
            appels_offres = AppelOffre.objects.filter(id__in=appels_offres_ids)
            # if not appels_offres.exists():
            #     return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé"}, safe=False)

            # Extraire les IDs des clients associés
            clients_ids = appels_offres.values_list('client_id', flat=True).distinct()

            # Filtrer les clients associés
            clients = Client.objects.filter(ID_clt__in=clients_ids)

            # Sérialiser les données des clients
            client_serializer = ClientSerializer(clients, many=True)
            return JsonResponse({"total": len(client_serializer.data), "data": client_serializer.data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

    esn_id = request.GET.get("esn_id")
    if not esn_id:
        return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False)

    # Filtrer les candidatures associées à l'ESN
    candidatures = Candidature.objects.filter(esn_id=esn_id)

    # Sérialiser les données des consultants
    consultant_serializer = CandidatureSerializer(candidatures, many=True)

    return JsonResponse({"status": True, "consultants": consultant_serializer.data}, safe=False)

@csrf_exempt
def consultants_par_client(request):
    if request.method == 'GET':
        try:
            # Récupération de l'identifiant du client
            client_id = request.GET.get("client_id")
            if not client_id:
                return JsonResponse({"status": False, "message": "client_id manquant"}, safe=False)

            # Filtrer les appels d'offres associés au client
            appels_offres = AppelOffre.objects.filter(client_id=client_id)
            if not appels_offres.exists():
                return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client"}, safe=False)

            # Extraire les IDs des appels d'offres
            appels_offres_ids = appels_offres.values_list('id', flat=True)

            # Filtrer les candidatures liées à ces appels d'offres
            candidatures = Candidature.objects.filter(AO_id__in=appels_offres_ids)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée"}, safe=False)

            # Extraire les IDs des consultants associés
            consultants_ids = candidatures.values_list('id_consultant', flat=True).distinct()

            # Filtrer les consultants associés
            consultants = Collaborateur.objects.filter(ID_collab__in=consultants_ids)

            # Sérialiser les données des consultants
            consultant_serializer = CollaborateurSerializer(consultants, many=True)
            return JsonResponse({"total": len(consultant_serializer.data), "data": consultant_serializer.data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

    
@csrf_exempt
def candidatures_par_client(request):
    if request.method == 'GET':
        try:
            # Récupération de l'identifiant du client
            client_id = request.GET.get("client_id")
            if not client_id:
                return JsonResponse({"status": False, "message": "client_id manquant"}, safe=False)

            # Filtrer les appels d'offres associés au client
            appels_offres = AppelOffre.objects.filter(client_id=client_id)
            if not appels_offres.exists():
                return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client"}, safe=False)

            # Extraire les IDs des appels d'offres
            appels_offres_ids = appels_offres.values_list('id', flat=True)

            # Filtrer les candidatures liées à ces appels d'offres
            candidatures = Candidature.objects.filter(AO_id__in=appels_offres_ids)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée"}, safe=False)

            # Sérialiser les candidatures
            candidatures_serializer = CandidatureSerializer(candidatures, many=True)
            return JsonResponse({"total": len(candidatures_serializer.data), "data": candidatures_serializer.data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)
        
@csrf_exempt
def consultants_par_esn1(request):
    if request.method == 'GET':
            esn_id = request.GET.get("esn_id")
    
            if not esn_id:
                return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False, status=400)

            # Filtrer les candidatures associées à l'ESN
            candidatures = Collaborateur.objects.filter(ID_ESN=esn_id)

            # Sérialiser les données des candidatures
            candidature_serializer = CollaborateurSerializer(candidatures, many=True)

            return JsonResponse({"status": True, "data": candidature_serializer.data}, safe=False)

@csrf_exempt
def consultants_par_esn_et_projet(request):
    if request.method == 'GET':
        esn_id = request.GET.get("esn_id")
        project_id = request.GET.get("project_id")
        
        if not esn_id:
            return JsonResponse({"status": False, "message": "esn_id manquant"}, safe=False, status=400)
        
        if not project_id:
            return JsonResponse({"status": False, "message": "project_id manquant"}, safe=False, status=400)

        # Obtenir les consultants qui ont déjà soumis une candidature pour ce projet et cet ESN
        submitted_consultants = Candidature.objects.filter(esn_id=esn_id, AO_id=project_id).values_list('id_consultant', flat=True)

        # Obtenir les consultants qui n'ont pas encore soumis de candidature pour ce projet et cet ESN
        consultants = Collaborateur.objects.filter(ID_ESN=esn_id).exclude(ID_collab__in=submitted_consultants)

        # Sérialiser les données des consultants
        consultant_serializer = CollaborateurSerializer(consultants, many=True)

        return JsonResponse({"status": True, "data": consultant_serializer.data}, safe=False)

@csrf_exempt
def candidatures_par_appel_offre(request):
    if request.method == 'GET':
        try:
            # Récupération de l'identifiant de l'appel d'offre depuis les paramètres GET
            AO_id = request.GET.get("AO_id")
            if not AO_id:
                return JsonResponse({"status": False, "message": "AO_id manquant"}, safe=False)

            # Filtrer les candidatures associées à l'appel d'offre
            candidatures = Candidature.objects.filter(AO_id=AO_id)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour cet appel d'offre"}, safe=False)

            # Sérialiser les données des candidatures
            candidatures_serializer = CandidatureSerializer(candidatures, many=True)
            return JsonResponse({"total": len(candidatures_serializer.data), "data": candidatures_serializer.data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)
        
@csrf_exempt
def get_candidates(request):
    if request.method == 'GET':
        try:
            # Récupération des paramètres clientId et appelOffreId depuis les paramètres GET
            client_id = request.GET.get("clientId")
            appel_offre_id = request.GET.get("appelOffreId")

            # Vérification des paramètres requis
            if not client_id:
                return JsonResponse({"status": False, "message": "clientId manquant"}, safe=False)
            if not appel_offre_id:
                return JsonResponse({"status": False, "message": "appelOffreId manquant"}, safe=False)

            # Vérification que l'appel d'offre appartient au client
            appel_offre = AppelOffre.objects.filter(client_id=client_id, id=appel_offre_id).first()
            if not appel_offre:
                return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client"}, safe=False)

            # Filtrer les candidatures associées à cet appel d'offre
            candidatures = Candidature.objects.filter(AO_id=appel_offre_id)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée"}, safe=False)

            # Sérialisation des données des candidatures
            candidatures_serializer = CandidatureSerializer(candidatures, many=True)
            return JsonResponse({"total": len(candidatures_serializer.data), "data": candidatures_serializer.data}, safe=False)

        except Exception as e:
            # Gestion des exceptions générales
            return JsonResponse({"status": False, "message": str(e)}, safe=False)



@csrf_exempt
def get_contract(request):
    if request.method == 'GET':
        try:
            # Récupération des paramètres
            client_id = request.GET.get('clientId')
            esn_id = request.GET.get('esnId')

            # Validation des paramètres
            if not client_id or not esn_id:
                return JsonResponse({"status": False, "message": "clientId et esnId requis"}, safe=False)

            # Rechercher les appels d'offres liés au client
            appels_offres = AppelOffre.objects.filter(client_id=client_id)
            if not appels_offres.exists():
                return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client"}, safe=False)

            # Récupérer les IDs des appels d'offres
            appels_offres_ids = appels_offres.values_list('id', flat=True)

            # Filtrer les candidatures liées à ces appels d'offres et à l'ESN
            candidatures = Candidature.objects.filter(AO_id__in=appels_offres_ids, esn_id=esn_id)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour cette combinaison client et ESN"}, safe=False)

            # Récupérer les IDs des candidatures
            candidatures_ids = candidatures.values_list('id_cd', flat=True)

            # Rechercher les contrats liés à ces candidatures
            contrats = Contrat.objects.filter(candidature_id__in=candidatures_ids)
            if not contrats.exists():
                return JsonResponse({"status": False, "message": "Aucun contrat trouvé pour cette combinaison client et ESN"}, safe=False)

            # Sérialiser les contrats
            contrats = Contrat.objects.filter(candidature_id__in=candidatures.values_list('id_cd', flat=True)).order_by('-id_contrat')
            contrats_serializer = ContratSerializer(contrats, many=True)
            return JsonResponse({"total": len(contrats_serializer.data), "data": contrats_serializer.data}, safe=False)

        except Exception as e:
            # Gestion des erreurs
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def get_combined_info(request, bon_commande_id):
    if request.method == 'GET':
        try:
            # Get bon de commande
            bon_commande = Bondecommande.objects.get(id_bdc=bon_commande_id)
            bon_commande_data = BondecommandeSerializer(bon_commande).data

            # Get related candidature
            candidature = Candidature.objects.get(id_cd=bon_commande.candidature_id)
            candidature_data = CandidatureSerializer(candidature).data

            # Get related appel offre
            appel_offre = AppelOffre.objects.get(id=candidature.AO_id)
            appel_offre_data = AppelOffreSerializer(appel_offre).data

            # Combine all data
            combined_data = {
                "bon_commande": bon_commande_data,
                "candidature": candidature_data,
                "appel_offre": appel_offre_data
            }

            return JsonResponse({
                "status": True,
                "data": combined_data
            }, safe=False)

        except Bondecommande.DoesNotExist:
            return JsonResponse({
                "status": False,
                "message": "Bon de commande not found"
            }, safe=False)
        except Exception as e:
            return JsonResponse({
                "status": False,
                "message": str(e)
            }, safe=False)

    return JsonResponse({
        "status": False,
        "message": "Invalid request method"
    }, safe=False)


@csrf_exempt
def check_esn_status(request):
    if request.method == 'GET':
        try:
            # Get ESN ID from request parameters
            esn_id = request.GET.get('esn_id')
            
            # Validate the parameter
            if not esn_id:
                return JsonResponse({
                    "status": False, 
                    "message": "esn_id parameter is required"
                }, safe=False)
                
            # Check if ESN exists
            try:
                esn = ESN.objects.get(ID_ESN=esn_id)
                            # Simple activity check - if ESN has any candidatures, it's considered active
                is_active = esn.Statut.lower() == "actif"
                print(esn.Statut.lower())
                return JsonResponse({
                    "status": True,
                    "is_active": is_active
                }, safe=False)

            except ESN.DoesNotExist:
                return JsonResponse({
                    "status": False,
                    "message": "ESN not found"
                }, safe=False)
            
            
        except Exception as e:
            return JsonResponse({
                "status": False,
                "message": str(e)
            }, safe=False)
    
    return JsonResponse({
        "status": False,
        "message": "Invalid request method"
    }, safe=False)

@csrf_exempt
def get_bon_de_commande_by_client(request):
    if request.method == 'GET':
        try:
            client_id = request.GET.get('client_id')

            if not client_id:
                return JsonResponse({"status": False, "message": "client_id requis"}, safe=False)

            appels_offres = AppelOffre.objects.filter(client_id=client_id)
            if not appels_offres.exists():
                return JsonResponse({"status": False, "message": "Aucun appel d'offre trouvé pour ce client"}, safe=False)

            appels_offres_ids = appels_offres.values_list('id', flat=True)

            candidatures = Candidature.objects.filter(AO_id__in=appels_offres_ids)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour ce client"}, safe=False)

            candidatures_ids = candidatures.values_list('id_cd', flat=True)

            # Add order_by to reverse the order
            bons_de_commande = Bondecommande.objects.filter(
                candidature_id__in=candidatures_ids
            ).order_by('-id_bdc')
            
            if not bons_de_commande.exists():
                return JsonResponse({"status": False, "message": "Aucun bon de commande trouvé pour ce client"}, safe=False)

            serializer = BondecommandeSerializer(bons_de_commande, many=True)
            return JsonResponse({"total": len(serializer.data), "data": serializer.data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)
@csrf_exempt
def get_bon_de_commande_by_esn(request):
    if request.method == 'GET':
        try:
            # Récupération du esn_id depuis les paramètres de la requête
            esn_id = request.GET.get('esn_id')

            # Validation du paramètre
            if not esn_id:
                return JsonResponse({"status": False, "message": "esn_id requis"}, safe=False)

            # Trouver les candidatures liées à l'ESN
            candidatures = Candidature.objects.filter(esn_id=esn_id)
            if not candidatures.exists():
                return JsonResponse({"status": False, "message": "Aucune candidature trouvée pour cette ESN"}, safe=False)

            # Récupérer les IDs des candidatures
            candidatures_ids = candidatures.values_list('id_cd', flat=True)

            # Trouver les bons de commande associés aux candidatures de l'ESN
            bons_de_commande = Bondecommande.objects.filter(candidature_id__in=candidatures_ids)
            if not bons_de_commande.exists():
                return JsonResponse({"status": False, "message": "Aucun bon de commande trouvé pour cette ESN"}, safe=False)

            # Sérialiser les bons de commande
            serializer = BondecommandeSerializer(bons_de_commande, many=True)
            return JsonResponse({"total": len(serializer.data), "data": serializer.data}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)


def send_notification(user_id, message, categorie):
    """
    Fonction utilitaire pour envoyer une notification.
    """
    try:
        notification = Notification(
            user_id=user_id,
            message=message,
            status="Unread",
            categorie=categorie
        )
        notification.save()
        return notification
    except Exception as e:
        raise Exception(f"Erreur lors de l'envoi de la notification : {str(e)}")

@csrf_exempt
def notify_appel_offre(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            client_id = data.get('client_id')
            appel_offre_id = data.get('appel_offre_id')

            if not client_id or not appel_offre_id:
                return JsonResponse({"status": False, "message": "client_id et appel_offre_id requis"}, safe=False)

            partenaires = Partenariat1.objects.filter(id_client=client_id)
            for partenaire in partenaires:
                message = f"Un nouvel appel d'offre {appel_offre_id} a été publié par le client {client_id}."
                send_notification(user_id=partenaire.id_esn, message=message, categorie="Appel d'Offre")

            return JsonResponse({"status": True, "message": "Notifications envoyées aux partenaires."}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def notify_reponse_appel_offre(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            esn_id = data.get('esn_id')
            client_id = data.get('client_id')
            appel_offre_id = data.get('appel_offre_id')

            if not esn_id or not client_id or not appel_offre_id:
                return JsonResponse({"status": False, "message": "esn_id, client_id, et appel_offre_id requis"}, safe=False)

            message = f"L'ESN {esn_id} a soumis une réponse à l'appel d'offre {appel_offre_id}."
            send_notification(user_id=client_id, message=message, categorie="Réponse à l'Appel d'Offre")

            return JsonResponse({"status": True, "message": "Notification envoyée au client."}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def notify_validation_candidature(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            client_id = data.get('client_id')
            esn_id = data.get('esn_id')
            candidature_id = data.get('candidature_id')

            if not client_id or not esn_id or not candidature_id:
                return JsonResponse({"status": False, "message": "client_id, esn_id, et candidature_id requis"}, safe=False)

            message = f"Votre candidature {candidature_id} a été validée par le client {client_id}."
            send_notification(user_id=esn_id, message=message, categorie="Validation de Candidature")

            return JsonResponse({"status": True, "message": "Notification envoyée à l'ESN."}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)
@csrf_exempt
def notify_bon_de_commande(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            esn_id = data.get('esn_id')
            client_id = data.get('client_id')
            bon_de_commande_id = data.get('bon_de_commande_id')

            if not esn_id or not client_id or not bon_de_commande_id:
                return JsonResponse({"status": False, "message": "esn_id, client_id, et bon_de_commande_id requis"}, safe=False)

            message = f"Le Client {client_id} a généré un bon de commande {bon_de_commande_id}."
            event = "Bon de Commande"
            event_id = bon_de_commande_id
            send_notification(user_id=client_id, dest_id=esn_id, message=message, categorie="ESN", event=event, event_id=event_id)
            send_notification(user_id=client_id, dest_id=client_id, message=message, categorie="Client", event=event, event_id=event_id)

            return JsonResponse({"status": True, "message": "Notification envoyée au client."}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def notify_validation_bon_de_commande(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            client_id = data.get('client_id')
            esn_id = data.get('esn_id')
            bon_de_commande_id = data.get('bon_de_commande_id')

            if not client_id or not esn_id or not bon_de_commande_id:
                return JsonResponse({"status": False, "message": "client_id, esn_id, et bon_de_commande_id requis"}, safe=False)

            message = f"Le bon de commande {bon_de_commande_id} a été validé par le client {client_id}."
            send_notification(user_id=esn_id, message=message, categorie="Validation de Bon de Commande")

            return JsonResponse({"status": True, "message": "Notification envoyée à l'ESN."}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def notify_signature_contrat(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            client_id = data.get('client_id')
            esn_id = data.get('esn_id')
            contrat_id = data.get('contrat_id')

            if not client_id or not esn_id or not contrat_id:
                return JsonResponse({"status": False, "message": "client_id, esn_id, et contrat_id requis"}, safe=False)

            # Notification pour le client
            message_client = f"Le contrat {contrat_id} a été signé avec l'ESN {esn_id}."
            send_notification(user_id=esn_id, dest_id=esn_id, message=message_client, categorie="Client", event="Contrat", event_id=contrat_id)

            # Notification pour l'ESN
            message_esn = f"Le contrat {contrat_id} a été signé avec le client {client_id}."
            send_notification(user_id=client_id, dest_id=client_id, message=message_esn, categorie="ESN", event="Contrat", event_id=contrat_id)

            return JsonResponse({"status": True, "message": "Notifications envoyées au client et à l'ESN."}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def contrat_by_idClient(request):
    if request.method == 'GET':
        try:
            clientId = request.GET.get("clientId")
            if not clientId:
                return JsonResponse({"status": False, "message": "clientId requis"}, safe=False)

            # Récupérer tous les appels d'offres liés au client
            appels = AppelOffre.objects.filter(client_id=clientId)

            # Récupérer les IDs des appels d'offres
            appel_ids = appels.values_list('id', flat=True)

            # Récupérer toutes les candidatures liées aux appels d'offres
            candidatures = Candidature.objects.filter(AO_id__in=appel_ids)

            # Récupérer tous les contrats liés aux candidatures
            contrats = Contrat.objects.filter().order_by('-id_contrat')
            contrat_serializer = ContratSerializer(contrats, many=True)
            data = contrat_serializer.data

            return JsonResponse({"status": True, "data": data}, safe=False)
        except Exception as e:
                    return JsonResponse({"status": False, "message": str(e)}, safe=False)

    
@csrf_exempt
def contrat_by_idEsn(request):
    if request.method == 'GET':
        try:
            esnId = request.GET.get("esnId")
            if not esnId:
                return JsonResponse({"status": False, "message": "esnId requis"}, safe=False)

                        # Récupérer toutes les candidatures liées à l'ESN
            candidatures = Candidature.objects.filter(esn_id=esnId)

            # Récupérer les IDs des candidatures
            candidature_ids = candidatures.values_list('id_cd', flat=True)

            # Récupérer tous les contrats liés aux candidatures en ordre décroissant
            contrats = Contrat.objects.filter(candidature_id__in=candidature_ids).order_by('-id_contrat')

            # Sérialiser les contrats
            contrat_serializer = ContratSerializer(contrats, many=True)

            return JsonResponse({"status": True, "data": contrat_serializer.data}, safe=False) 
        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt 
def download_contract(request, contract_id):
    if request.method == 'GET':
        try:
            # Get contract and related data
            contract = Contrat.objects.get(id_contrat=contract_id)
            candidature = Candidature.objects.get(id_cd=contract.candidature_id)
            esn = ESN.objects.get(ID_ESN=candidature.esn_id)
            appel_offre = AppelOffre.objects.get(id=candidature.AO_id)
            client = Client.objects.get(ID_clt=appel_offre.client_id)

            # Structure contract information
            contract_info = {
                "numero_contrat": contract.numero_contrat,
                "date_signature": contract.date_signature,
                "esn": esn.Raison_sociale,
                "client": client.raison_sociale,
                "date_debut": contract.date_debut,
                "date_fin": contract.date_fin,
                "montant": contract.montant,
                "statut": contract.statut,
                "conditions": contract.conditions or ""
            }

            return JsonResponse({
                "status": True,
                "data": contract_info
            }, safe=False)

        except Contrat.DoesNotExist:
            return JsonResponse({"status": False, "message": "Contract not found"}, safe=False)
        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

    return JsonResponse({"status": False, "message": "Invalid request method"}, safe=False)



@csrf_exempt
def Esn_by_id(request):
    if request.method == 'GET':
        esnId = request.GET["esnId"]
        esn = ESN.objects.filter(ID_ESN=esnId)
       
        esn_serializer = ESNSerializer(esn, many=True)
        data = []
        for S in esn_serializer.data:
            data.append(S)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    

def send_notification(user_id, dest_id, message, categorie, event, event_id):
    """
    Fonction pour créer une notification.

    Arguments :
    - user_id : L'ID de l'utilisateur ayant généré l'événement.
    - dest_id : L'ID du destinataire de la notification.
    - message : Le message de la notification.
    - categorie : La catégorie de la notification (Client, ESN, etc.).
    - event : Le type d'événement déclencheur (ex. "AO", "Candidature").
    - event_id : L'ID de l'événement (ID de l'appel d'offre, de la candidature, etc.).
    """
    notification = Notification(
        user_id=user_id,
        dest_id=dest_id,
        message=message,
        categorie=categorie,
        event=event,
        event_id=event_id,
        status="Not_read"
    )
    notification.save()
    return notification

@csrf_exempt
def notify_new_candidature(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            appel_offre_id = data.get('appel_offre_id')
            candidature_id = data.get('condidature_id')
            # Get id client base on the appel d'offer 
            appels_offres = AppelOffre.objects.filter(id=appel_offre_id)
            client_id = appels_offres.first().client_id

            # Validation des paramètres
            if not client_id or not appel_offre_id or not candidature_id:
                return JsonResponse({"status": False, "message": "Paramètres manquants (client_id, appel_offre_id, candidature_id)"}, safe=False)

            # Vérification que le client existe
            try:
                client = Client.objects.get(ID_clt=client_id)
            except Client.DoesNotExist:
                return JsonResponse({"status": False, "message": "Client introuvable"}, safe=False)

            # Préparation du message de notification
            message = f"Vous avez reçu une nouvelle candidature ID_CD={candidature_id} relative à l'AO ID_AO={appel_offre_id}."

            # Envoi de la notification au client
            send_notification(
                user_id=client_id,  # L'utilisateur ayant généré l'événement
                dest_id=client_id,  # Le client est aussi le destinataire ici
                message=message,
                categorie="Client",
                event="Candidature",
                event_id=candidature_id
            )

            return JsonResponse({"status": True, "message": "Notification envoyée"}, safe=False)

        except Exception as e:
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def notify_candidature_accepted(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        candidature_id = data.get('candidature_id')
        esn_id = data.get('esn_id')

        if not all([candidature_id, esn_id]):
            return JsonResponse({"status": False, "message": "Tous les champs sont requis."}, safe=False)

        token = ESN.objects.filter(ID_ESN=esn_id).values_list('token', flat=True).first()

        if token is None:
            return JsonResponse({"status": False, "message": "Token not found for the given ESN ID"}, safe=False)        
        message = f"Votre candidature ID={candidature_id} a été acceptée."
        send_notification(
            user_id=None,
            dest_id=esn_id,
            event_id=candidature_id,
            event="CNDT",
            message=message,
            categorie="ESN"
        )
        return JsonResponse({"status": True, "data": token}, safe=False)
    
@csrf_exempt
def notify_expiration_ao(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)

            ao_id = data.get('ao_id')
            client_id = data.get('client_id')

            list_esn = []
            # assume we need to get the list from the database base on the client id 
            partenaires = ESN.objects.all()
            for partenaire in partenaires:
                list_esn.append(partenaire.ID_ESN)
            if len(list_esn) == 0:
                return JsonResponse({"status": True, "message": "Non partenaire découvert"}, safe=False)
            
            if not all([ao_id, client_id, list_esn]):
                return JsonResponse({"status": False, "message": "Tous les champs sont requis."}, safe=False)

            message_client = f"L'appel d'offre ID={ao_id} est arrivé à expiration."
            send_notification(
                user_id=None,  # Aucun utilisateur spécifique
                dest_id=client_id,
                event_id=ao_id,
                event="AO",
                message=message_client,
                categorie="Client"
            )

            for esn_id in list_esn:
                message_esn = f"L'appel d'offre ID={ao_id} est arrivé à expiration."
                send_notification(
                    user_id=None,  # Aucun utilisateur spécifique
                    dest_id=esn_id,
                    event_id=ao_id,
                    event="AO",
                    message=message_esn,
                    categorie="ESN"
                )

            return JsonResponse({"status": True, "message": "Notifications envoyées aux parties concernées."}, safe=False)

        except Exception as e:
            print(f"Erreur: {e}")  # Déboguer l'erreur
            return JsonResponse({"status": False, "message": str(e)}, safe=False)

@csrf_exempt
def notify_end_of_mission(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        contrat_id = data.get('contrat_id')
        client_id = data.get('client_id')
        esn_id = data.get('esn_id')

        if not all([contrat_id, client_id, esn_id]):
            return JsonResponse({"status": False, "message": "Tous les champs sont requis."}, safe=False)

        message = f"La mission liée au contrat ID={contrat_id} est terminée."

        send_notification(
            user_id=None,
            dest_id=client_id,
            event_id=contrat_id,
            event="Contrat",
            message=message,
            categorie="Client"
        )
        send_notification(
            user_id=None,
            dest_id=esn_id,
            event_id=contrat_id,
            event="Contrat",
            message=message,
            categorie="ESN"
        )

        return JsonResponse({"status": True, "message": "Notifications de fin de mission envoyées."}, safe=False)
