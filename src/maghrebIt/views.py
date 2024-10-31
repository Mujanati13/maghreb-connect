from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404             


from .models import *
from .serializers import *
from rest_framework import status


import hashlib
import jwt

def checkAuth(request):
    token = request.META.get('HTTP_AUTHORIZATION')
    print(token)
    if token == None:
        print("Non authentifié 1")
        return False
    try:
        token = token.replace('Bearer ', "")
        payload = jwt.decode(token, 'secret', algorithms=["HS256"])
        return True
    except Exception as e:
        print("Non authentifié 2")
        print(e)
        return False

# Create your views here.
@csrf_exempt
def client_view(request, id=0):
    if checkAuth(request) == False:
        return JsonResponse({
                "status": False,
                "msg": "Non authentifié"
                }, safe=False, status=401)
    if request.method == 'GET':
        clients = Client.objects.filter()
        client_serializer = ClientSerializer(clients, many=True)
        data = []
        for client in client_serializer.data:
           
            data.append(client)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    if request.method == 'POST':
        client_data = JSONParser().parse(request)

         # Hash password
        password = client_data["password"]
        pwd_utf = password.encode()
        pwd_sh = hashlib.sha1(pwd_utf)
        password_crp = pwd_sh.hexdigest()

        # updated password to hashed password
        client_data["password"] = password_crp

        client_serializer = ClientSerializer(data=client_data)
        if client_serializer.is_valid():
            client_serializer.save()
            return JsonResponse({
                    "status": True,
                    "msg": "Added Successfully!!e",
                    "errors": client_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Add",
                        "errors": client_serializer.errors
                        }, safe=False)
    if request.method == 'PUT':
        client_data = JSONParser().parse(request)
        client = Client.objects.get(ID_clt=client_data["ID_clt"])

            # Hash password
        password = client_data["password"]
        pwd_utf = password.encode()
        pwd_sh = hashlib.sha1(pwd_utf)
        password_crp = pwd_sh.hexdigest()

        # updated password to hashed password
        client_data["password"] = password_crp

        client_serializer = ClientSerializer(client, data=client_data)
        if client_serializer.is_valid():
            client_serializer.save()
            return JsonResponse({
                        "status": True,
                        "msg": "Upadated Successfully!!",
                        "errors": client_serializer.errors
                        }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Update",
                        "errors": client_serializer.errors
                        }, safe=False)
    if request.method == 'DELETE':
        client = Client.objects.get(ID_clt=id)
        client.delete()
        return JsonResponse("Deleted Succeffuly!!", safe=False)
    
# Document view
@csrf_exempt
def Document_view(request, id=0):
    if checkAuth(request) == False:
        return JsonResponse({
                "status": False,
                "msg": "Non authentifié"
                }, safe=False, status=401)
    if request.method == 'GET':
        docs = Doc_clt.objects.filter()
        doc_serializer = DocumentSerializer(docs, many=True)
        data = []
        for doc in doc_serializer.data:
            client = Client.objects.get(ID_clt=doc['ID_CLT'])
            doc["client"] = client.raison_sociale
            data.append(doc)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    if request.method == 'POST':
        doc_data = JSONParser().parse(request)
        doc_serializer = DocumentSerializer(data=doc_data)
        if doc_serializer.is_valid():
            doc_serializer.save()
            return JsonResponse({
                    "status": True,
                    "msg": "Added Successfully!!",
                    "errors": doc_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Add",
                        "errors": doc_serializer.errors
                        }, safe=False)
    if request.method == 'PUT':
        doc_data = JSONParser().parse(request)
        doc = Doc_clt.objects.get(ID_DOC_CLT=doc_data["ID_DOC_CLT"])
        doc_serializer = DocumentSerializer(doc, data=doc_data)
        if doc_serializer.is_valid():
            doc_serializer.save()
            return JsonResponse({"status": True,
                    "msg": "updated Successfully!!",
                    "errors": doc_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to update",
                        "errors": doc_serializer.errors
                        }, safe=False)
    if request.method == 'DELETE':
        doc = Doc_clt.objects.get(ID_DOC_CLT=id)
        doc.delete()
        return JsonResponse("Deleted Succeffuly!!", safe=False)
    
# Create your views here.
@csrf_exempt
def esn_view(request, id=0):
    if checkAuth(request) == False:
        return JsonResponse({
                "status": False,
                "msg": "Non authentifié"
                }, safe=False, status=401)
    if request.method == 'GET':
        ESNS = ESN.objects.filter()
        ens_serializer = ESNSerializer(ESNS, many=True)
        data = []
        for esn in ens_serializer.data:
           
            data.append(esn)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    if request.method == 'POST':
        esn_data = JSONParser().parse(request)

         # Hash password
        password = esn_data["password"]
        pwd_utf = password.encode()
        pwd_sh = hashlib.sha1(pwd_utf)
        password_crp = pwd_sh.hexdigest()

        # updated password to hashed password
        esn_data["password"] = password_crp

        esn_serializer = ESNSerializer(data=esn_data)
        if esn_serializer.is_valid():
            esn_serializer.save()
            return JsonResponse({
                    "status": True,
                    "msg": "Added Successfully!!e",
                    "errors": esn_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Add",
                        "errors": esn_serializer.errors
                        }, safe=False)
    if request.method == 'PUT':
        esn_data = JSONParser().parse(request)
        esn = ESN.objects.get(ID_ESN=esn_data["ID_ESN"])

            # Hash password
        password = esn_data["password"]
        pwd_utf = password.encode()
        pwd_sh = hashlib.sha1(pwd_utf)
        password_crp = pwd_sh.hexdigest()

        # updated password to hashed password
        esn_data["password"] = password_crp

        esn_serializer = ESNSerializer(esn, data=esn_data)
        if esn_serializer.is_valid():
            esn_serializer.save()
            return JsonResponse({
                        "status": True,
                        "msg": "Upadated Successfully!!",
                        "errors": esn_serializer.errors
                        }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Update",
                        "errors": esn_serializer.errors
                        }, safe=False)
    if request.method == 'DELETE':
        esn = ESN.objects.get(ID_ESN=id)
        esn.delete()
        return JsonResponse("Deleted Succeffuly!!", safe=False)

# Document view
@csrf_exempt
def docEsn_view(request, id=0):
    if checkAuth(request) == False:
        return JsonResponse({
                "status": False,
                "msg": "Non authentifié"
                }, safe=False, status=401)
    if request.method == 'GET':
        docesns = DocumentESN.objects.filter()
        docesn_serializer = DocumentESNSerializer(docesns, many=True)
        data = []
        for doc in docesn_serializer.data:
            esn = ESN.objects.get(ID_ESN=doc['ID_ESN'])
            doc["esn"] = esn.Raison_sociale
            data.append(doc)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    if request.method == 'POST':
        doc_data = JSONParser().parse(request)
        doc_serializer = DocumentESNSerializer(data=doc_data)
        if doc_serializer.is_valid():
            doc_serializer.save()
            return JsonResponse({
                    "status": True,
                    "msg": "Added Successfully!!",
                    "errors": doc_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Add",
                        "errors": doc_serializer.errors
                        }, safe=False)
    if request.method == 'PUT':
        doc_data = JSONParser().parse(request)
        doc = DocumentESN.objects.get(ID_DOC_ESN=doc_data["ID_DOC_ESN"])
        doc_serializer = DocumentESNSerializer(doc, data=doc_data)
        if doc_serializer.is_valid():
            doc_serializer.save()
            return JsonResponse({"status": True,
                    "msg": "updated Successfully!!",
                    "errors": doc_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to update",
                        "errors": doc_serializer.errors
                        }, safe=False)
    if request.method == 'DELETE':
        doc = DocumentESN.objects.get(ID_DOC_ESN=id)
        doc.delete()
        return JsonResponse("Deleted Succeffuly!!", safe=False)
    

# collaborateur_view
@csrf_exempt
def collaborateur_view(request, id=0):
    if checkAuth(request) == False:
        return JsonResponse({
                "status": False,
                "msg": "Non authentifié"
                }, safe=False, status=401)
    if request.method == 'GET':
        colls = Collaborateur.objects.filter()
        Collaborateur_serializer = CollaborateurSerializer(colls, many=True)
        data = []
        for col in Collaborateur_serializer.data:
            data.append(col)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    if request.method == 'POST':
        Collaborateur_data = JSONParser().parse(request)
        col_serializer = CollaborateurSerializer(data=Collaborateur_data)
        if col_serializer.is_valid():
            col_serializer.save()
            return JsonResponse({
                    "status": True,
                    "msg": "Added Successfully!!",
                    "errors": col_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Add",
                        "errors": col_serializer.errors
                        }, safe=False)
    if request.method == 'PUT':
        col_data = JSONParser().parse(request)
        col = Collaborateur.objects.get(ID_collab=col_data["ID_collab"])
        col_serializer = CollaborateurSerializer(col, data=col_data)
        if col_serializer.is_valid():
            col_serializer.save()
            return JsonResponse({"status": True,
                    "msg": "updated Successfully!!",
                    "errors": col_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to update",
                        "errors": col_serializer.errors
                        }, safe=False)
    if request.method == 'DELETE':
        col = Collaborateur.objects.get(ID_collab=id)
        col.delete()
        return JsonResponse("Deleted Succeffuly!!", safe=False)
    

# collaborateur_view
@csrf_exempt
def admin_view(request, id=0):
    if checkAuth(request) == False:
        return JsonResponse({
                "status": False,
                "msg": "Non authentifié"
                }, safe=False, status=401)
    if request.method == 'GET':
        admins = Admin.objects.filter()
        admin_serializer = AdminSerializer(admins, many=True)
        data = []
        for admin in admin_serializer.data:
            data.append(admin)
        return JsonResponse({"total": len(data),"data": data}, safe=False)
    if request.method == 'POST':
        admin_data = JSONParser().parse(request)
         # Hash password
        mdp = admin_data["mdp"]
        pwd_utf = mdp.encode()
        pwd_sh = hashlib.sha1(pwd_utf)
        password_crp = pwd_sh.hexdigest()

        # updated password to hashed password
        admin_data["mdp"] = password_crp
        
        admin_serializer = AdminSerializer(data=admin_data)
        if admin_serializer.is_valid():
            admin_serializer.save()
            return JsonResponse({
                    "status": True,
                    "msg": "Added Successfully!!",
                    "errors": admin_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to Add",
                        "errors": admin_serializer.errors
                        }, safe=False)
    if request.method == 'PUT':
        admin_data = JSONParser().parse(request)
        admin = Admin.objects.get(ID_Admin=admin_data["ID_Admin"])
        
             # Hash password
        mdp = admin_data["mdp"]
        pwd_utf = mdp.encode()
        pwd_sh = hashlib.sha1(pwd_utf)
        password_crp = pwd_sh.hexdigest()

        # updated password to hashed password
        admin_data["mdp"] = password_crp

        admin_serializer = ESNSerializer(admin, data=admin_data)
        if admin_serializer.is_valid():
            admin_serializer.save()
            return JsonResponse({"status": True,
                    "msg": "updated Successfully!!",
                    "errors": admin_serializer.errors
                    }, safe=False)
        return JsonResponse({
                        "status": False,
                        "msg": "Failed to update",
                        "errors": admin_serializer.errors
                        }, safe=False)
    if request.method == 'DELETE':
        admin = Admin.objects.get(ID_Admin=id)
        admin.delete()
        return JsonResponse("Deleted Succeffuly!!", safe=False)