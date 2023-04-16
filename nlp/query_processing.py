import pandas as pd
from .NDD_NER import named_entities, initialize_nlp, filter_canonicals
from .CustomPatternMatcher import get_cb
from py2neo import Graph
import numpy as np
from .utils import nltk_process
import traceback
import re
import pickle
from collections import deque
import requests
from .owa_aggregation import OWA_generic
from collections import OrderedDict


graph = Graph("bolt://localhost:7687/", auth=('neo4j', '1234'))
initialize_nlp()

API_URL = "https://api-inference.huggingface.co/models/navidre/autism"
headers = {"Authorization": "Bearer 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"}


def resource_labels():
    resource_labels = []
    # with open(r"nlp\results\webpage_labels_March08.pkl", 'rb') as file:
    with open(r"/home/ashwanisingla/cami/CAMI/nlp/results/webpage_labels_March08.pkl", 'rb') as file:
    # with open(r"D:\chatbot_version_3\CAMI\nlp\results\webpage_labels.pkl", 'rb') as file:
        resource_labels = pickle.load(file)  # would be dict(dict) (keys-url : value-dict(major_category,labels)
    # print(len(resource_labels))
    return resource_labels


rs_labels = resource_labels()


def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

def get_max(output):
    label = []
    values = []
    print(output)
    for dc in output[0]:
        label.append(dc['label'])
        values.append(dc['score'])
    max_index = values.index(max(values))
    final_class = label[max_index]
    return final_class, max(values)


def classify(text):
    try:
        output = query({"inputs": text})
        final_class,score = get_max(output)
        print(f"classified as:{final_class} with score {score}")
        return final_class,score
    except:
        print(traceback.format_exc())
        return "error",0


def map_age(age_num):
    if age_num <=12:
        return "Child"
    elif age_num>12 and age_num <=18:
        return "Teen"
    else:
        return "Adult"

def age_regex(user_query):
    """
    matches the age patterns 5 yrs old etc. and maps the age to Child 0-12, teen 13-18, adult above 18)
    :param user_query:
    :return:
    """
    pattern = r"(\d{1,2}\s+(years|yr|yrs|year)\s+(old|son|daughter|girl|boy|child|kid))"
    age = ""
    try:
        matches = re.findall(pattern,user_query)
        print(matches)
        print(type(matches), len(matches))
        if matches:
            age_num = re.findall(r"\d{1,2}",matches[0][0])[0]
            print(age_num)
            age = map_age(int(age_num))
            return age
        else:
            return age
    except Exception as err:
        print(err)
        return age


def annotate(text: str) -> dict:
    """
    :param text: text to be annotated
    :return: {''}
    """
    entities = named_entities(text)
    filtered_canonicals = filter_canonicals(entities)
    raw, categories = get_cb(text)
    uniques = []
    for _ in categories:
        if _ not in uniques:
            uniques.append(_)
    filtered_canonicals['Matched CB concept'] = raw
    filtered_canonicals['cb_category'] = uniques
    if 'AGE' not in filtered_canonicals:
        age = age_regex(text)
        if age:
            filtered_canonicals['AGE'] = [age]
    return filtered_canonicals


def create_df_from_query_results(data):
    urls_list = []
    # print(data)
    for _ in data:
        entity = {'url': _['url'], 'title': _.get('title',""), 
                 'type': _['type'], 'imageFileName':_.get('imageFileName',""),
                 'category':_['category'], 'age': _.get('age', 1),
                  'location': _.get('location', 1)}
        for i in range(len(_['terms'])):
            term = _['terms'][i]
            label = _['labels'][i][0]
            weight = _['weights'][i]
            column = term + "_" + label
            entity[column] = weight
        urls_list.append(entity)

    return urls_list


def generate_query(labels):
    start = " ("
    mid = ""
    end = ") "
    for index, label in enumerate(labels):
        mid += "t:" + label
        if index < len(labels) - 1:
            mid += " OR "
    label_condition = start + mid + end
    # print(label_condition)
    query = ("MATCH (r:Resource)-[rl:containsSubliearPivot]->(t) where t.term in $terms " +
             " AND " + label_condition +
             " RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category,  collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights")
    return query


def generate_query_with_province(labels):
    start = " ("
    mid = ""
    end = ") "
    for index, label in enumerate(labels):
        mid += "t:" + label
        if index < len(labels) - 1:
            mid += " OR "
    label_condition = start + mid + end
    # print(label_condition)
    query = ("MATCH (r:Resource)-[pw:IS_LOCATED_IN]->(p) where  (p:Province or p:City) AND p.name = $province WITH r,pw "
             "MATCH (r)-[rl:containsSubliearPivot]->(t) where t.term in $terms " +
             " AND " + label_condition +
             " RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, pw.weight as location, collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights")
    return query


def generate_query_with_age(labels):
    start = " ("
    mid = ""
    end = ") "
    for index, label in enumerate(labels):
        mid += "t:" + label
        if index < len(labels) - 1:
            mid += " OR "
    label_condition = start + mid + end
    # print(label_condition)
    query = (
            "MATCH (a:Age)<-[ca:containsSubliearPivot]-(r:Resource) WHERE a.term = $age WITH r,ca MATCH (r)-[rl:containsSubliearPivot]->(t) where t.term in $terms " +
            " AND " + label_condition +
            " RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, ca.weight as age,  collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights")
    return query


def generate_query_with_age_province(labels):
    start = " ("
    mid = ""
    end = ") "
    for index, label in enumerate(labels):
        mid += "t:" + label
        if index < len(labels) - 1:
            mid += " OR "
    label_condition = start + mid + end
    # print(label_condition)
    query = (
            "MATCH (a:Age)<-[ca:containsSubliearPivot]-(r:Resource) WHERE a.term = $age " +
            "WITH r, ca " +
            "MATCH (r)-[pw:IS_LOCATED_IN]->(p) where (p:Province or p:City) AND p.name= $province "
            "WITH r, ca, pw " +
            "MATCH (r)-[rl:containsSubliearPivot]->(t) where t.term in $terms " +
            " AND " + label_condition +
            " RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, ca.weight as age, pw.weight as location, collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights")
    return query


def generate_unigram_query():
    query = """MATCH (r:Resource)-[rl:containsNgram]->(t:Unigram) where t.term in $terms
            RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights"""
    return query


def generate_unigram_query_with_province():
    query = """MATCH (r:Resource)-[pw:IS_LOCATED_IN]->(p) where (p:Province or p:City) AND p.name = $province
                WITH r,pw
                MATCH (r)-[rl:containsNgram]->(t:Unigram) where t.term in $terms 
                RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, pw.weight as location, collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights"""
    return query


def generate_unigram_query_with_age():
    query = """
            MATCH (r:Resource)-[ca:containsSubliearPivot]->(a:Age) where a.term = $age
            WITH r,ca
            MATCH (r)-[rl:containsNgram]->(t:Unigram) where t.term in $terms 
            RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, ca.weight as age, collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights
            """
    return query


def generate_unigram_query_with_age_province():
    query = """
            MATCH (a:Age)<-[ca:containsSubliearPivot]-(r:Resource) where a.term = $age
            WITH r,ca
            MATCH (r)-[pw:IS_LOCATED_IN]->(p) where (p:Province or p:City) AND p.name = $province
            WITH r,ca,pw
            MATCH (r)-[rl:containsNgram]->(t:Unigram) where t.term in $terms
            RETURN DISTINCT r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category, ca.weight as age,  pw.weight as location,  collect(t.term) as terms, collect(labels(t)) as labels, collect(rl.weight) as weights
            """
    return query


def query_database_all_age_entities(parameters, labels, province):
    if province == "all":
        query = generate_query(labels)
    else:
        query = generate_query_with_province(labels)
        parameters['province'] = province
    # print(query)
    data = graph.run(query, parameters=parameters).data()
    return data


def query_database_with_age_entities(parameters, labels, age, province):
    parameters['age'] = age
    if province == "all":
        query = generate_query_with_age(labels)
    else:
        query = generate_query_with_age_province(labels)
        parameters['province'] = province
    # print(query)
    data = graph.run(query, parameters=parameters).data()
    return data


def query_database_all_age_topic(parameters, province):
    if province == "all":
        query = generate_unigram_query()
    else:
        query = generate_unigram_query_with_province()
        parameters['province'] = province
    print(parameters)
    data = graph.run(query, parameters=parameters).data()
    return data


def query_database_with_age_topic(parameters, age, province):
    parameters['age'] = age
    if province == "all":
        query = generate_unigram_query_with_age()
    else:
        query = generate_unigram_query_with_age_province()
        parameters['province'] = province
    # print(query)
    data = graph.run(query, parameters=parameters).data()
    return data


def query_database_entities(terms, labels, age, province):
    parameters = {'terms': terms}
    if age.lower() == "all":
        data = query_database_all_age_entities(parameters, labels, province)
    elif age in ['Child', 'Teen', 'Adult']:
        data = query_database_with_age_entities(parameters, labels, age, province)
    else:
        return []
    urls_list = create_df_from_query_results(data)
    return urls_list


def query_database_topic(terms, age, province):
    parameters = {'terms': terms}
    print(terms)
    if age.lower() == "all":
        data = query_database_all_age_topic(parameters, province)
    elif age in ['Child', 'Teen', 'Adult']:
        data = query_database_with_age_topic(parameters, age, province)
    else:
        print("age term is not correct.It should be any of the [all, Child, Teen, adult]")
        return []
    urls_list = create_df_from_query_results(data)
    return urls_list


def owa_on_resource_df_depreciated(urls_list, age, weight_col_name, increase_age_weight):
    """
    :param urls_list: unordered urls list returned by KG
    :return: resources ordered using Owa aggregation
    """
    urls_list_df = pd.DataFrame(urls_list)
    urls_list_df.drop_duplicates(subset=['url'], inplace=True)
    urls_list_df.fillna(0, inplace=True)

    # apply OWA aggregation row wise
    # convert dff to numpy matrix

    if age == "all":
        weight_np_matrix = urls_list_df.iloc[:, 2:].to_numpy()
        result = np.apply_along_axis(OWA_generic, 1, weight_np_matrix)
    elif increase_age_weight:
        urls_list_df['age'] = urls_list_df['age'] * 10
        weight_np_matrix = urls_list_df.iloc[:, 2:].to_numpy()
        result = np.apply_along_axis(OWA_generic, 1, weight_np_matrix)
    else:
        weight_np_matrix = urls_list_df.iloc[:, 3:].to_numpy()
        urls_list_df['term_owa'] = np.apply_along_axis(OWA_generic, 1, weight_np_matrix)
        result = urls_list_df['age'] * urls_list_df['term_owa']
        urls_list_df.drop(columns=['term_owa'], inplace=True)
    urls_list_df[weight_col_name] = result
    # order by OWA
    # ordered_urls = urls_list_df.sort_values(by=[weight_col_name], ascending=False)
    # return ordered_urls.to_dict(orient='records')
    return urls_list_df


def owa_on_resource_df_v1(urls_list, age, weight_col_name, increase_age_weight):
    """
    :param urls_list: unordered urls list returned by KG
    :return: resources ordered using Owa aggregation
    """
    urls_list_df = pd.DataFrame(urls_list)
    urls_list_df.drop_duplicates(subset=['url'], inplace=True)
    urls_list_df.fillna(0, inplace=True)
    # print(urls_list_df.columns)
    # exclude_col_owa = urls_list_df[['url', 'title', 'age', 'location']].copy()
    # terms_df_for_owa = urls_list_df.drop(columns=['url', 'title', 'age', 'location']).copy()

    # convert df to matrix from column_index 7 because first seven columns are ['url', 'title', 'type', 'imageFileName','category', 'age', 'location']
    weight_np_matrix = urls_list_df.iloc[:, 7:].to_numpy()

    urls_list_df['term_owa'] = np.apply_along_axis(OWA_generic, 1, weight_np_matrix)

    # by default age=1, so multiplication is okay in both cases- whether age is given or not
    result = urls_list_df['age'] * urls_list_df['term_owa']

    urls_list_df.drop(columns=['term_owa'], inplace=True)
    urls_list_df[weight_col_name] = result

    return urls_list_df


def get_term_labels(entities: dict):
    terms = []
    labels = []
    kg_labels = {'HPO-DDD': 'HPO', 'EricTerm': 'EricTerm', 'UMLS': 'UMLS', 'AGE': 'Age',
                 'cb_category': 'ChallengingBehavior', 'AIRs': 'AIRs'}

    for k, v in entities.items():
        if v:
            label = kg_labels.get(k, "")
            if label:
                terms.extend(v)
                labels.append(label)

    return terms, labels


def topic_processing(user_query: str):
    print("In topic processing")
    lemmatized_unigram_terms = [_[1] for _ in nltk_process(user_query.lower())]
    print(lemmatized_unigram_terms)
    return lemmatized_unigram_terms


def topic_based_resource_ranking(terms, age, province, increase_age_weight=False):
    if terms:
        raw_urls_list = query_database_topic(terms, age, province)
        print(f"number of resources returned by topic modelling: {len(raw_urls_list)}")
        if raw_urls_list:
            ordered_urls = owa_on_resource_df_v1(raw_urls_list, age, "OWA_weight_topic", increase_age_weight)
            return ordered_urls
    return []


def entities_based_resource_ranking(terms, labels, age, province, increase_age_weight=False):
    if terms:
        raw_urls_list = query_database_entities(terms, labels, age, province)
        if raw_urls_list:
            ordered_urls = owa_on_resource_df_v1(raw_urls_list, age, "OWA_weight_entities", increase_age_weight)
            return ordered_urls
    return []


def merge_topic_entities_uncommon(merged_df, tp_ordered_urls, entities_ordered_urls):
    """joins the both results when inner join is less than 20"""
    #select subsets with columns ['url','title','type','imageFileName','category']
    merged_df_subset = merged_df[['url','title','type','imageFileName','category',"final_OWA_weight"]]   
    # rename weight columns to final_OWA_weight so that all dataframes which we want to combine on axis=0,
    # will have same column names
    tp_ordered_urls.rename(columns={'OWA_weight_topic':'final_OWA_weight'}, inplace=True)
    entities_ordered_urls.rename(columns={'OWA_weight_entities':'final_OWA_weight'}, inplace=True)
    
    tp_subset = tp_ordered_urls[['url','title','type','imageFileName','category',"final_OWA_weight"]]
    ent_subset = entities_ordered_urls[['url','title','type','imageFileName','category',"final_OWA_weight"]]
    
    unique_urls = list(merged_df['url'])
    tp_subset = tp_subset.loc[~tp_subset['url'].isin(unique_urls)]  # consider rows which are not in merged_df
    ent_subset = ent_subset.loc[~ent_subset['url'].isin(unique_urls)]
    remaining_rs = 20-merged_df_subset.shape[0]  # sending 20 resources for first iteration
    if remaining_rs//2:
        merged_df = pd.concat([merged_df, tp_subset.head(remaining_rs//2)])
    left = remaining_rs - remaining_rs//2
    merged_df = pd.concat([merged_df,ent_subset.head(left)])
    return merged_df


def combine_topic_entities_result(tp_ordered_urls, entities_ordered_urls):
    # perform full join
    merged_df = pd.merge(tp_ordered_urls, entities_ordered_urls, how="inner", on="url", sort=False,
                         validate="one_to_one", suffixes=('', "_y"))
                             #dropping duplicate columns with _y suffix i.e. second table
    merged_df.drop(merged_df.filter(regex='_y$').columns.tolist(), axis=1, inplace=True)
    merged_df['final_OWA_weight'] = merged_df["OWA_weight_entities"] * merged_df["OWA_weight_topic"]

    # if tp_results or entities_results are greater than 20-but merge results are less than 20
    if merged_df.shape[0] < 20 and (tp_ordered_urls.shape[0] > 20 or entities_ordered_urls[0] > 20):
        merged_df = merge_topic_entities_uncommon(merged_df, tp_ordered_urls.head(50), entities_ordered_urls.head(50))       

    # fill nulls with 1 and then multiply the values
    # merged_df['OWA_weight_entities'] = merged_df['OWA_weight_entities'].fillna(1)    
    ordered_urls_df = merged_df.sort_values(by=['location', "final_OWA_weight"], ascending=[False, False])
    print(f"merged entity topic result_set size:{ordered_urls_df.shape[0]}")
    return ordered_urls_df


def get_final_output(tp_urls, entities_urls):
    """ returns dataframe """
    if len(tp_urls) and len(entities_urls):       
        return combine_topic_entities_result(tp_urls, entities_urls)
    elif len(entities_urls):
        entities_ordered_urls = entities_urls.sort_values(by=['location', "OWA_weight_entities"],
                                                          ascending=[False, False])
        # return entities_ordered_urls.to_dict(orient='records')
        return entities_ordered_urls
    elif len(tp_urls):
        tp_ordered_urls = tp_urls.sort_values(by=['location', 'OWA_weight_topic'], ascending=[False, False])
        # return tp_ordered_urls.to_dict(orient='records')
        return tp_ordered_urls
    else:
        return pd.DataFrame()


def filter_age_from_request(entities, age):
    age = entities.pop('AGE', age)  # AGE always exist in the entities - could be null
    if isinstance(age, list):
        return age[0]
    elif not age:
        return "all"
    else:
        return age


def filter_province_from_usertext(entities, province):
    """
    filters the location - checkes for city first, then province entity
    """
    province = entities.pop('CITY', province)
    if province == 'all':
        province = entities.pop('PROVINCE', province)
    if isinstance(province, list):
        return province[0].lower()
    else:
        return province.lower()


def get_province(city):
    province = ""

    return province


def filter_location_from_request(entities, location):
    location = entities.pop('location',location)
    if not location:
        return 'all'
    print(location)
    print(type(location))
    return location.lower()


def ngram_exists(ngrams):
    query = """
            MATCH (u:Unigram) where u.term in $terms
            RETURN u.term as term
            """
    data = graph.run(query, parameters={'terms': ngrams}).data()
    print(data)
    result = []
    for _ in data:
        result.append(_['term'])
    return result


def merge_lists(all_rs_dq, core_knlg_dq, video_dq):
    maximum_length = max(len(all_rs_dq), max(len(core_knlg_dq), len(video_dq)))
    final_list = []
    for i in range(maximum_length):
        if core_knlg_dq:
            final_list.append(core_knlg_dq.popleft())
        if video_dq:
            final_list.append(video_dq.popleft())
        if all_rs_dq:
            final_list.append(all_rs_dq.popleft())
    return final_list


def seperate_resource_type(resources, rs_labels):
    all_rs_dq, core_knlg_dq, video_dq = deque(), deque(), deque()

    for res in resources:
        res['labels '] = rs_labels.get(res['url'], {}).get("labels", [])
        major_category = rs_labels.get(res['url'], {}).get("major_category", ())
        if res['type'] == 'video':
            video_dq.append(res)
        elif major_category == ['Core_Knowledge']:
            core_knlg_dq.append(res)
        else:
            all_rs_dq.append(res)
    print(f"youtube: {len(video_dq)}, core_knowledge: {len(core_knlg_dq)}, all_other_resources:{len(all_rs_dq)}")
    return all_rs_dq, core_knlg_dq, video_dq


def arrange_resources_ac_to_category(resources):
    """
    :param resources: owa and location based ordered list of urls
    :return: list of resources with core knowledge and youtube at top if there is any - regardless of the resource rank
    """
    all_rs_dq, core_knlg_dq, video_dq = seperate_resource_type(resources, rs_labels)
    final_list = merge_lists(all_rs_dq, core_knlg_dq, video_dq)
    return final_list


def filter_related_conditions(conditions):
    """consider only those conditions which have resources"""
    query = "MATCH (r:Resource)-->(n) where n.term = $condition RETURN r.url as url LIMIT 1"
    filtered = []
    for condition in conditions:
        if 'severe' in condition.lower() or 'moderate' in condition.lower() or 'mild' in condition.lower():
            continue
        data = graph.run(query, parameters={'condition':condition}).data()
        if data:
            filtered.append(condition)
    return filtered



def related_hpo_conditions(entities):
    hpo_term = entities.get('HPO-DDD', '')
    result = []
    if hpo_term:
        query = """
                MATCH (p:HPO)-[a:IS_ASSOCIATED_WITH]->(h:HPO) where h.term = $condition
                RETURN p.term as term, a.weight as wt ORDER BY wt DESC LIMIT 25"""
        data = graph.run(query, parameters={'condition': hpo_term[0]}).data()
        result = []
        for _ in data:
            result.append(_['term'])
    filtered_terms = filter_related_conditions(result)[:10] # returns top 10 conditions for now
    return filtered_terms[::-1]  # front-end is popping the array- so reversing the list 

def related_condition_resources(conditions:list):
    """
    parameter: [condition1, condition2....] conditions ordered a/c to relevancy
    filters resources classified as core_knowledge only 
    returns: OrderedDict()  results[url] = {'conditions':[related1, related2, related3]}
    """
    results = OrderedDict()

    if not conditions:
        return results  

    # query = """
    #     MATCH (mc:Core_Knowledge)<-[:IS_ABOUT]-(r:Resource)-[rl:containsSubliearPivot]->(cn:HPO) where cn.term = $condition
    #     RETURN r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category ORDER BY rl.weight DESC LIMIT 20
    #     """
    query = """
        MATCH (r:Resource)-[rl:containsSubliearPivot]->(cn) where cn.term = $condition
        RETURN r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category ORDER BY rl.weight DESC LIMIT 20
        """ 

    # considering top 10 conditions only
    for condition in conditions[:10]:  
        data = graph.run(query,parameters={'condition':condition}).data()
        for _ in data:
            if _['url'] in results:
                results[_['url']]['relatedConditions'].append(condition)
            else:
                results[_['url']] = {
                                     'url':_['url'], 'title':_['title'], 'type':_['type'],
                                     'relatedConditions':[condition], 'imageFileName':_['imageFileName'],
                                     'category':_['category'],
                                     'labels':rs_labels.get(_['url'],{'labels':[]})['labels'],
                                     }
        result_set = []
        for key, value in results.items():
            result_set.append(value)

    return {'resources':result_set}


def set_location(filtered_canonicals):
    city = filtered_canonicals.get('CITY',[])
    province = filtered_canonicals.get('PROVINCE',[])
    location = ""
    print(province)
    if city:
        location = city[0]
    elif province:
        location = province[0]
    return location


def set_age(filtered_canonicals):
    age_entities = filtered_canonicals.get('AGE',[])
    if age_entities:
        return age_entities[0]
    else:
        return ""


def clean_entities_response(filtered_canonicals):
    nlp_response = {
        'HPO-DDD': filtered_canonicals.get('HPO-DDD',[]),
        'UMLS':filtered_canonicals.get('UMLS',[]),
        'EricTerm':filtered_canonicals.get('EricTerm',[]),
        'AIRs':filtered_canonicals.get('AIRs',[]),
        'cb_category':filtered_canonicals.get('cb_category',[]),
        'location':set_location(filtered_canonicals),
        'AGE': set_age(filtered_canonicals),
    }
    return nlp_response

def get_major_category(user_query):
    category = []
    if 'education' in user_query.lower():
        category.append('education')
    if 'service' in user_query.lower():
        category.append('services')
    if 'funding' in user_query.lower() or 'financial' in user_query.lower():
        category.append('financial help')
    if 'core knowledge' in user_query.lower():
        category.append('core knowledge')
    if not category:
        category = ['core knowledge']
    return category


def nlp_processing(user_query:str):
    """
    detects entities, classifies using Navid's model and checks unigrams in KG
    returns: dictionary of entities. 
    possible keys(HPO-DDD, AGE, PROVINCE, CITY, UMLS, EricTerm, AIRs, cb_category, ngrams)
    """
    print(user_query)
    entities = annotate(user_query)
    entities.pop("Matched CB concept", None)

    nlp_response = clean_entities_response(entities) 
    
    classification, score = classify(user_query)     # Navid's model   
    print("Navid's model")
    print(classification, score)
    if score >= 0.5:
        nlp_response['cb_category'].append(classification)

    ngrams = topic_processing(user_query)
    nlp_response['ngrams'] = ngram_exists(ngrams)
    nlp_response['relatedConditions'] = related_hpo_conditions(entities) 
    nlp_response['searchedCategory'] = get_major_category(user_query)
    # print("nlp results:")
    # for k, v in entities.items():
    #     print(f"{k},\t {v}")
    return nlp_response

def category_based_resources(category='financial help'):
    """ 
    irregadless of query-resource matching/relevance, get resources from database for a category. 
    by default: financial because mostly queries doesn't match with financial resources
    """
    query = """
                MATCH (r:Resource) where r.category = 'financial help'
                RETURN r.url as url, r.title as title, r.type as type, r.imageFileName as imageFileName, r.category as category
        """
    data = graph.run(query).data()
    result_set = []
    for resource in data:
        resource['labels'] = rs_labels.get(resource['url'],{'labels':[]})['labels']
        result_set.append(resource)
    return result_set


def category_based_filter(urls_df_col_subset, categories, location):
    """
    returns tuple(resource_list, resourceCategories)
    """
    print(f"[{urls_df_col_subset['category'].unique()}]: all resource categories before searchedCategory based filter")
    if categories and 'financial help' not in categories and list(urls_df_col_subset.columns):  # case: ['services','education'] etc and owa-query-matching set is not empty
        if categories ==['core knowledge'] and location != "all":
            urls_df_category_subset = urls_df_col_subset
        else:
            urls_df_category_subset = urls_df_col_subset.loc[urls_df_col_subset['category'].isin(categories)]
    else:
        if categories and list(urls_df_col_subset.columns):   # ['services','financial'] etc and owa-query-matching set is not empty
            urls_df_category_subset = urls_df_col_subset.loc[urls_df_col_subset['category'].isin(categories)]
        else:  # category = []
            urls_df_category_subset = urls_df_col_subset # consider all the resources
        # owa-query-matching is not returning any financial resources.
        # So combining financial resources explicitly
        financial_resources = category_based_resources(category='financial help')  
        urls_df_category_subset = urls_df_category_subset.append(financial_resources, ignore_index = True, sort=False)

    matched_rs_categories = list(urls_df_category_subset['category'].unique())  # gives an idea which resource categories are matched with query
    urls_list =  urls_df_category_subset.to_dict(orient='records')   

    return urls_list, matched_rs_categories


def clean_resource_response(final_ordered_urls_df):

    # list of required attributes
    cols = ['url','title','type','imageFileName','category']
    urls_df_col_subset = final_ordered_urls_df[cols]
    #get labels
    urls_df_col_subset['labels'] = urls_df_col_subset['url'].apply(lambda x: rs_labels.get(x,{'labels':[]})['labels'])
    return urls_df_col_subset   

def main(entities:dict,  age='all', location='all', topic_modelling_ranking=True, entities_ranking=True,
         increase_age_weight=False) -> dict:
    """
    returns     {'resources':final_mixed_type_urls:list,'matchedCategories':resource_categories:list} 
    matchedCategories is just for extra information and result exploration during demo
    """
    results = {'resources':[],'matchedCategories':[]}

    try:
        age = filter_age_from_request(entities, age)
        location = filter_location_from_request(entities, location)
        print(f"age: {age} and location is: {location}")


        terms, labels = get_term_labels(entities)
        print(f"final entities:{terms} and labels are {labels}")
       

        tp_urls = pd.DataFrame()
        entities_urls = pd.DataFrame()

        if topic_modelling_ranking:
            ngrams = entities.pop('ngrams', [])
            # print("unigrams are:", ngrams)
            tp_urls = topic_based_resource_ranking(ngrams, age, location, increase_age_weight)

        if entities_ranking:
            entities_urls = entities_based_resource_ranking(terms, labels, age, location, increase_age_weight)
            print(f"resources returned by entities: {len(entities_urls)}")

        final_ordered_urls_df = get_final_output(tp_urls, entities_urls)

        # final_mixed_type_urls = arrange_resources_ac_to_category(final_ordered_urls)

        if len(final_ordered_urls_df.columns):
            final_ordered_urls_df = clean_resource_response(final_ordered_urls_df)
       
        # filter resources if category given in entities and  also combine financial resources
        categories = entities['searchedCategory']
        category_filtered_rs, matched_rs_categories = category_based_filter(final_ordered_urls_df, categories,location)   
            
        # cleaned_resources_list, matched_rs_categories = clean_resource_response(final_ordered_urls_df, entities)
        results = {'resources':category_filtered_rs[:50],'matchedCategories':matched_rs_categories}

    except Exception:
        print(traceback.format_exc())
    
    return results
