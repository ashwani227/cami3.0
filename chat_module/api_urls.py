

from django.urls import path, include
from chat_module.views import *
from django.conf import settings
from django.urls import re_path
from django.views.static import serve

app_name = 'chat'



urlpatterns = [
    path('saveResource', save_resources),
    path('getQuestion',get_question),
    path('getResources', get_resources),
    path('checkResponse', check_response),
    path('getEntities', get_entities),
    path('getRelatedResources', get_related_resources),
    path('getAllQuestions', get_all_questions),
    path('shareResource', share_resource),
    path('sendText', send_text),
    re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),

    
]
