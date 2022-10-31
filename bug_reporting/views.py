from django.http import JsonResponse, HttpResponse
from .models import Bugs
from rest_framework.decorators import permission_classes, api_view
from django.core import serializers



@api_view(('POST',))
def report(request, *args, **kwargs):
    session_id = request.data['session_id']
    chat_file = request.data['chat_file']
    report_message = request.data['report_message']
    if chat_file == {}:
        return JsonResponse({'message': 'Missing File'}, status=400)
    else:
        Bugs.objects.create(chat_file=chat_file, report_message=report_message, session_id=session_id)
        return JsonResponse({'message': 'Bug Reported'}, status=200)


@api_view(('GET',))
def findAll(request, *args, **kwargs):
    bugs = Bugs.objects.all()
    bugs_json = serializers.serialize('json', bugs)
    return HttpResponse(bugs_json, content_type='application/json')