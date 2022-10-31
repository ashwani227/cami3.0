import json
from py2neo import Graph
import pandas as pd
from nltk import WordNetLemmatizer
from nltk.corpus import stopwords
import nltk
import pickle
import re
import spacy
import functools
import time
import googlemaps
import pymongo
import traceback


def timer(func):
    """prints execution time taken by func"""

    @functools.wraps(func)
    def timer_wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        value = func(*args, **kwargs)
        end_time = time.perf_counter()
        run_time = end_time - start_time
        print(f"Finished {func.__name__!r} in {run_time:.4f} secs")
        return value

    return timer_wrapper


# lemmatize each term before adding to token patterns
def spacy_process(text):
    # print(nlp.disabled)
    # Tokenization and lemmatization are done with the spacy nlp pipeline commands
    nlp = spacy.load("en_core_web_sm", exclude=['parser', 'ner'])
    doc = nlp(text)
    lemma_list = []
    for token in doc:
        lemma_list.append((token.text, token.lemma_))
    return lemma_list


def nltk_process(text):
    text = text.replace("-", " ")
    text = text.replace("/", " ")
    # text = text.translate(str.maketrans(" ", " ", '-/'))
    stop_words = set(stopwords.words('english'))
    stop_words = stop_words.union(['plan', 'sad', 'mad'])
    ignore_stop_words = ['down', 'no', 'not', 'and']
    stop_words = [w for w in stop_words if w not in ignore_stop_words]
    lemmatizer = WordNetLemmatizer()
    word_list = nltk.word_tokenize(text.lower().strip())
    word_list = [w for w in word_list if not w.lower() in stop_words]
    lemma_list = [(w, lemmatizer.lemmatize(w)) for w in word_list]
    return lemma_list


def write_json(data, file_path: str) -> None:
    with open(file_path, "w") as outfile:
        outfile.write(json.dumps(data))


def write_pickle(all_patterns, file_name):
    """
    :param file_name:
    :param all_patterns:  list of ERIC patterns to be pickled
    :return: None
    """
    with open(file_name, "wb") as file:
        pickle.dump(all_patterns, file)


def read_pickle(file_name):
    with open(file_name, "rb") as file:
        return pickle.load(file)


def match_address_regex(text):
    """
    matches regex of postal code (canada-US) and if found calls the geocode_api
    :param text:
    :return:
    """
    pattern_list = ['[A-Za-z]*[,\s]*([A-Za-z]+[.,\s]+([A-Za-z]\d[A-Za-z][\s-]*\d[A-Za-z]\d))',
                    '[A-Za-z]*,\s*([A-Za-z]+\s*[A-Za-z]*[,\s]+(\d{5}))']
    postal_codes = set()
    for pattern in pattern_list:
        m = re.findall(pattern, text)
        for match in m:
            postal_codes.add(match[1])
    return postal_codes


def address_from_postalcode(codes:set):
    city, province, country = set(), set(), set()
    for code in codes:
            # print("++match++",match)
            city_, province_, country_ = geocode_api(code)
            if city_ is not None: city.add(city_)
            if province_ is not None: province.add(province_)
            if country_ is not None: country.add(country_)
    return city, province, country


def geocode_api(postal_code: str) -> tuple:
    """
    :param postal_code:
    :return: tuple containing 3 entities i.e. city, province and country
    """
    city_, province_, country_ = None, None, None
    gmaps = googlemaps.Client(key='AIzaSyAvb_NbVzpVqpQJpuLi3MmnI9SmvTPSppM')
    geocode_result = gmaps.geocode(postal_code)
    # json_formatted_str = json.dumps(geocode_result, indent=2)
    if len(geocode_result) > 0:
        address_components = geocode_result[0]['address_components']
        result = []
        needed = ['locality', 'administrative_area_level_1', 'country']
        for d in address_components:
            key = d['types'][0]
            value = d['long_name']

            if key in needed:
                if key == "locality":
                    # result.append((value, 'CITY'))
                    city_ = value
                elif key == "administrative_area_level_1":
                    province_ = value
                    # result.append((value, 'PROVINCE'))
                else:
                    country_ = value
                    # result.append((value, 'COUNTRY'))

    return city_, province_, country_


def age_regex(text):
    """
    required for understanding parents' text
    """
    pass


def get_db_connection(collection_name):
    # client = pymongo.MongoClient(
    #     'mongodb+srv://manpreet:chatbot2021@annotations.svlkw.mongodb.net/Chatbot?retryWrites=true&w=majority')
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["Chatbot"]
    collection = db[collection_name]
    return collection


def exists_in_db(query: dict, collection_name) -> bool:
    """
    Returns true if exists in mongoDB collection, else false
    """
    collection = get_db_connection(collection_name)
    result = collection.find(query)
    flag = False
    for i in result:
        # print("already exists in database")
        flag = True
        break
    return flag


def mongodb_delete_document(collection: str, filter_q, many=False):
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client["Chatbot"]
    collection = db[collection]
    if many:
        collection.delete_many(filter_q)
    else:
        collection.delete_one(filter_q)


def store_in_mongodb(info, collection_name, delete_all_first=False):
    try:
        collection = get_db_connection(collection_name)
        if isinstance(info, list):
            if delete_all_first:
                mongodb_delete_document(collection_name, {}, many=True)
            collection.insert_many(info)
        else:
            collection.insert_one(info)
    except:
        traceback.print_exc()


def store_umls_concept_info(umls_ents: list):
    """
    :param umls_ents:
    :return: None
    for now storing all the detected_UMLS concepts info in mongodb
    """
    for term in umls_ents:
        qt = {"canonical_term": {'$eq': term['canonical_term']}}
        if not exists_in_db(qt, "umls_entity_info"):
            store_in_mongodb({'canonical_term': term['canonical_term'], 'cui': term['cui'],
                              'semantic_type': list(term['semantic_type'])}, "umls_entity_info")


def update_resource(collection_name: str, filter_q: dict, update_q: dict) -> None:
    """
       filter_q example: {"URL": {'$eq': wb['URL']}}
       update_q example: {  "$set": {'Source': wb['Source'], 'Category': wb['Category']}, }
       """
    collection = get_db_connection(collection_name)
    collection.update_one(filter_q, update_q)


def get_websites_list(collection: str, start_index=0) -> list:
    """
    :return: list of dict: every dict represent one Resource's information
    """
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client["Chatbot"]
    collection = db[collection]
    docs = collection.find({})
    all_websites = []
    for doc in docs:
        all_websites.append(doc)

    return all_websites[start_index:]


def webpage_text_dataset():
    # resources = get_websites_list("ResourceWebpageContent")
    resources = get_websites_list("MIRA")
    english, french, unknown = [], [], []
    no_text_boiler, events, scrapping_issue = [], [], []

    for index, resource in enumerate(resources):
        print(index)
        search_q = {'url':{'$eq':resource['url']}}
        if resource.get('items') is None:
            if not exists_in_db(search_q,"MIRA_scrapping_issue"):
                scrapping_issue.append(resource)
            continue
        items = []
        parent_url = ""
        if resource['type'] == 'webpage':
            items = resource['items'][:1]
        elif resource['type'] == 'website':
            items = resource['items']
            parent_url = resource['url']
        else:  # pdfs are added directly to english
            resource['parent_url'] = ""
            if not exists_in_db(search_q, "MIRA_english_webpages"):
                english.append(resource)

        # print("adding to list")
        for item in items:
            search_q = {'url': {'$eq': item['url']}}
            item['parent_url'] = parent_url
            if 'event' in item['url']:
                if not exists_in_db(search_q, "MIRA_events"):
                    events.append(item)
            elif len(item['removed_boilerplate']) < 10:
                if not exists_in_db(search_q, "MIRA_no_boiler_text"):
                    no_text_boiler.append(item)
            elif 'en' in item['language']:
                if not exists_in_db(search_q, "MIRA_english_webpages"):
                    english.append(item)
            elif 'fr' in item['language']:
                if not exists_in_db(search_q, "MIRA_French_webpages"):
                    french.append(item)
            elif not exists_in_db(search_q, "MIRA_unknown_language"):
                unknown.append(item)
    store_in_mongodb(english, "MIRA_english_webpages", delete_all_first=True)
    store_in_mongodb(french, "MIRA_French_webpages", delete_all_first=True)
    store_in_mongodb(events, "MIRA_event_webpages", delete_all_first=True)
    store_in_mongodb(scrapping_issue, "MIRA_scrapping_issue", delete_all_first=True)
    store_in_mongodb(no_text_boiler, "MIRA_no_boiler_text", delete_all_first=True)
    store_in_mongodb(unknown, "MIRA_unknown_language", delete_all_first=True)

    print(f"{len(english)} english webpages")
    print(f"{len(french)} french webpages")
    print(f"{len(unknown)} unknown language webpages")
    print(f"{len(no_text_boiler)} no text after removing boilerplate")
    print(f"{len(events)} events ")
    print(f"{len(scrapping_issue)} scrapping issue")


def add_topics_to_kg():
    graph = Graph("bolt://localhost:7687/", auth=('neo4j', '1234'))
    query1 = "MATCH (n:Unigram) DETACH DELETE n"
    query2 = "MATCH (n:Bigram) DETACH DELETE n"
    query3 = "MATCH (r:Resource)-[rs:IS_RELATED_TO]-() DETACH DELETE rs"
    df = pd.read_csv(
        r"C:\Users\CamiS\Documents\Projects\ResourceScrapping\datasets\results\TopicModelling\wp_indiv_aug18_n2_weights_notext.csv")
    topics = dict()
    urls = dict()
    for index,row in df.iterrows():
        urls[row['url']] = row['dominant_topic']

    for key, value in urls.items():
        query = "MATCH (r:Resource{url:$url}) MATCH (t:BigramTopic{number:$topicnum}) CREATE (r)-[:IS_RELATED_TO]->(t) RETURN r.url as url"
        data = graph.run(query,parameters = {'url':key,'topicnum':value}).data()
        if not data:
            print(f"not found:{key}")
    # for index, row in df.iterrows():
    #     topic = row['dominant_topic']
    #     words = []
    #     for i in range(10):
    #         word = row['word_' + str(i)]
    #         word_weight = row['word_' + str(i) + "_weight"]
    #         words.append((word, word_weight))
    #     if topic not in topics:
    #         topics[topic] = words
    # print(len(topics))
    # for key in topics.keys():
    #     query = "CREATE (n:UnigramTopic) SET n.number = $num"
    #     graph.run(query, parameters={'num': int(key)})
    #
    # for key, value in topics.items():
    #     # print(key, value)
    #     for term in value:
    #         query = """MATCH (n:UnigramTopic) WHERE n.number = $topicnum
    #             MERGE (t:Unigram{term:$unigram})
    #             MERGE (t)-[:EXISTS_IN{weight:$weight}]->(n)
    #             """
    #         graph.run(query, parameters={'topicnum': key, 'unigram': term[0], 'weight': term[1]})
    # print(len(topics))

# from ResourceCrawler.utils import get_url_subparts


if __name__ == "__main__":
    # add_topics_to_kg()
    webpage_text_dataset()