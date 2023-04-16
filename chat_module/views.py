
from django.conf import settings
from rest_framework import permissions
from rest_framework.decorators import permission_classes, api_view
from django.http import JsonResponse, HttpResponse
from .models import Chat_module
from profile_app.models import Profile
from django.core import serializers
from nlp.query_processing import main, nlp_processing, related_condition_resources
from django.templatetags.static import static
from spellchecker import SpellChecker
from datetime import date,datetime
import os
from django.core.mail import send_mail
import os
from twilio.rest import Client
import googlemaps
from tips.models import Tip, tipSubscriber
from goals.models import goalSubscriber 


# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = 'AC7e434de64b759e5041ebd022f30c2363'
auth_token = 'b011b9e6e8d95f2a4a937010d5ee6e1f'
client = Client(account_sid, auth_token)

def add_to_logs(log_type, log_text):
    log_file = "logs/"+ str(date.today()) + ".txt"
    mode = 'a+' if os.path.exists(log_file) else 'w'
    file_object = open(log_file,"a")
    file_object.write(str(datetime.now())+"\n")
    file_object.write(log_type + "\n")
    file_object.write(log_text+"\n")
    file_object.write("---------------------------------------------------\n")
    file_object.close()
    return True

def spell_checker(word):
    spell = SpellChecker()
    misspelled = spell.unknown([word])
    for word in misspelled:
        return HttpResponse(spell.correction(word))

def get_entities_local(request):
    data = nlp_processing(request.GET['userResponse'])
    data['userQueryMeaning'] = local_spell_check(request.GET['userResponse'])
    return JsonResponse(data)

def showIstTip(request):
    data = Tip.objects.get(tipId = 1)
    return JsonResponse({"Tip": data.text})

def add_subscriber(phoneNumber):
    p, created = tipSubscriber.objects.get_or_create(
    phoneNumber= phoneNumber,
    subscribedDate = datetime.now())
    if created: 
        message = "Added to subscribers"
        tip = Tip.objects.get(tipId = 1)
        p.tipsShared.add(tip)
    else: 
        message = "Already a subscriber"
    add_to_logs("Add Subscriber: ", str(phoneNumber))
    return JsonResponse({"Message": message})


def local_spell_check(word):
    spell = SpellChecker()
    words = word.split(' ')
    updated_query = ''
    for word in words:
        misspelled = spell.unknown([word])
        for incorrect in misspelled:
            word = spell.correction(incorrect)
        updated_query +=(word + ' ')
    return updated_query



response_function_map = {
    'checkSpelling': spell_checker,
    'getEntities': get_entities_local,
    'showTips': showIstTip,
    'addSubscriber': add_subscriber
}

def fetch_resources(entityData):
    resource_set = main(dict(entityData))
    resources = []
    for resource in resource_set['resources']:
        resources.append(resource['url'])
    add_to_logs("Input: ", str(entityData))
    add_to_logs("Resources: ", str(resources))
    return resource_set

@api_view(('GET',))
def get_entities(request):
    userResponse = local_spell_check(request.GET['userResponse'])
    add_to_logs("User Input Value: ", request.GET['userResponse'])
    data = nlp_processing(userResponse)
    data['userQueryMeaning'] = "If I understood correctly, you want to know about "
    length_HPO_retrieved = len(data["HPO-DDD"])
    if length_HPO_retrieved > 0:
        for i in range(length_HPO_retrieved):
            if i > 0 and i < length_HPO_retrieved:
                data['userQueryMeaning'] += " and "
            data['userQueryMeaning'] += data['HPO-DDD'][i]
            
        data['userQueryMeaning'] += '.Is that right?'
    elif data['cb_category']!= []:

        cb_category_retrieved = data['cb_category']
        if(len(cb_category_retrieved)> 1):
            print(set(cb_category_retrieved))
            cb_category_retrieved = list(set(cb_category_retrieved))
        for i in range(len(cb_category_retrieved)):
            if i > 0 and i < len(cb_category_retrieved):
                data['userQueryMeaning'] += " and "
            data['userQueryMeaning'] += cb_category_retrieved[i]
            
        data['userQueryMeaning'] += '.Is that right?'
    elif data['UMLS']!= []:
        cb_umls_received = data['UMLS']
        if(len(cb_umls_received)> 1):
            print(set(cb_umls_received))
            cb_umls_received = list(set(cb_umls_received))
        for i in range(len(cb_umls_received)):
            if i > 0 and i < len(cb_umls_received):
                data['userQueryMeaning'] += " and "
            data['userQueryMeaning'] += cb_umls_received[i]
            
        data['userQueryMeaning'] += '.Is that right?'
        add_to_logs("Check with user if they mean: ", data['userQueryMeaning'])
    else:
        data['userQueryMeaning'] = "I am sorry, I am not able to find any information on the topic you are searching. Can you please click on try again?"
        add_to_logs("Query Error: ", "Cannot understand the term "+ request.GET['userResponse'])
    # data['userQueryMeaning'] = userResponse

    return JsonResponse(data)

@api_view(('POST', 'GET'))
@permission_classes((permissions.IsAuthenticated, ))
def save_resources(request):
    email = request.GET['email']
    newResources = request.GET['resource']
    userProfile = Profile.objects.get(email=email)
    previous_resources = userProfile['savedResources']
    previous_resources +=newResources
    userProfile['savedResources'] = previous_resources
    userProfile.save()

    return JsonResponse({'message': 'Success'})


@api_view(('GET',))
def get_question(request):
    requested_question = request.GET['question']
    question = Chat_module.objects.filter(questionId = requested_question)
    question = serializers.serialize('json', question)
    return HttpResponse(question, content_type='application/json')


@api_view(('POST',))
def get_resources(request):
    resource_set = fetch_resources(request.data)
    if(len(resource_set['resources'])==0):
        gmaps = googlemaps.Client(key='AIzaSyAvb_NbVzpVqpQJpuLi3MmnI9SmvTPSppM')
        geocode_result = gmaps.geocode(request.data['location'])
        location = geocode_result[0]['address_components'][1]['long_name']
        entityData = request.data
        entityData['location'] = location
        resource_set = fetch_resources(entityData)
    return JsonResponse(resource_set, safe=False)

@api_view(('GET',))
def check_response(request):
    function_call = request.GET['function_call']
    user_response = request.GET['user_response']
    if response_function_map[function_call]:
        response = response_function_map[function_call](user_response)
        return HttpResponse(response, content_type='application/json')
    else:
        return HttpResponse(user_response, content_type='application/json')


@api_view(('GET',))
def get_related_resources(request):
    condition = request.GET.getlist('condition')
    data = related_condition_resources(condition)
    return JsonResponse(data)


@api_view(('GET',))
def get_all_questions(request):
    questions = serializers.serialize("json", Chat_module.objects.all())
    data = {"questions": questions}
    return JsonResponse(data)

@api_view(('POST',))
def share_resource(request):
    email_address = request.data['email']
    resource_url = request.data['resource']
    print(settings.EMAIL_HOST_USER)
    send_mail(subject='Resource from CAMI',message='Hello!!! Someone you know shared this resource '+ resource_url + ' with you.',from_email=settings.EMAIL_HOST_USER,recipient_list=[email_address])
    return JsonResponse({"message": "Email sent"})

@api_view(('POST',))
def send_text(request):
    textContent = request.data['resource']
    phoneNumber = request.data['phoneNumber']
    message = client.messages \
                .create(
                     body= textContent,
                     from_='+15108226811',
                     to= phoneNumber
                 )
    return JsonResponse({"message": "Text sent"})

@api_view(('POST',))
def add_goal_subscriber(request):
    goalEntities = request.data['goalEntities']
    phoneNumber = request.data['phoneNumber']
    emailId = request.data['emailId']
    resources = fetch_resources(goalEntities)
    subscriptionPrimaryKey = ""
    subscriptionType = ""
    if(phoneNumber):
        subscriptionPrimaryKey = phoneNumber
        subscriptionType = "phone"
    elif emailId:
        subscriptionPrimaryKey = emailId
        subscriptionType = "email"
    p, created = goalSubscriber.objects.get_or_create(
    subscriptionKey= subscriptionPrimaryKey,
    subscribedDate = datetime.now(),resources = resources[:20])
    if created: 
        message = "Added to Goal subscribers"
        resources = resources[:5]
    else: 
        message = "Already a subscriber"
    return JsonResponse({"Message": message})
    