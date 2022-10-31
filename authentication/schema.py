import graphene
from graphene_django import DjangoObjectType

from .models import CustomUser

class UserType(DjangoObjectType):
  class Meta: 
    model = CustomUser

class Query(graphene.ObjectType):
  users = graphene.List(UserType)

  def resolve_users(self, info,**kwargs):
    id=kwargs.get('id')
    if id is not None:
      print(CustomUser.objects.get(id=id))
      return CustomUser.objects.get(id=id)
    return CustomUser.objects.all()




class CreateUser(graphene.Mutation):
  id = graphene.Int()
  first_name = graphene.String()
  last_name = graphene.String()
  email = graphene.String()
  is_active = graphene.Boolean()
  is_staff = graphene.Boolean()
  is_superuser = graphene.Boolean()
  age = graphene.Int()
  city = graphene.String()
  country = graphene.String()

  class Arguments:
    first_name = graphene.String()
    last_name = graphene.String()
    email = graphene.String()
    is_active = graphene.Boolean()
    is_staff = graphene.Boolean()
    is_superuser = graphene.Boolean()
    age = graphene.Int()
    city = graphene.String()
    country = graphene.String()
  
  def mutate(self, info, first_name, last_name, email, is_active, is_staff, is_superuser, age, city, country):
    user = CustomUser(first_name=first_name, email=email, last_name=last_name,is_active=True, is_staff=is_staff, is_superuser=is_staff,age=age, city=city,country=country)
    user.save()

    return CreateUser(
      id=user.id,
      first_name=user.first_name,
      last_name=user.last_name,
      is_active=user.is_active,
      is_staff=user.is_staff,
      is_superuser=user.is_superuser,
      age=user.age,
      city=user.city,
      country=user.country,
      email=user.email,
    )

class Mutation(graphene.ObjectType):
  create_user = CreateUser.Field()

schema = graphene.Schema(
  query=Query,
  mutation=Mutation
)
  
