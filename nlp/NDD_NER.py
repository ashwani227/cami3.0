import spacy
import traceback
from .utils import nltk_process, read_pickle
from spacy.util import filter_spans
from collections import OrderedDict
from scispacy.linking import EntityLinker

HPO_ERIC = r"nlp/domainConcepts/Age_Location_HPO_ERIC_processed_unique_term_dict.pkl"
# HPO_AIRs_ERIC = r"D:/chatbot_version_3/CAMI/nlp/domainConcepts/Age_Location_HPO_ERIC_AIRs_processed_unique_term_dict_updated.pkl"
HPO_AIRs_ERIC = r"nlp/domainConcepts/Age_Location_HPO_ERIC_AIRs_processed_unique_term_dict_updated.pkl"


def remove_punct(term):
    return term.replace(",", "").replace("(", "").replace(")", "").replace("'", "")


class RuleBasedNER:

    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm", exclude=['parser', 'ner'])
        self.all_patterns = self.create_patterns()
        self.ruler = self.nlp.add_pipe("entity_ruler")
        self.ruler.add_patterns(self.all_patterns)
        # print(self.nlp.pipe_names)

    @staticmethod
    def create_patterns():
        """
        key (space-seperated lemmas as key)
        value is a dict of 'canonical_term' and 'label'
        """
        patterns = []
        term_dict = read_pickle(HPO_AIRs_ERIC)
        for key, value in term_dict.items():
            token_lemma = key.split(" ")
            entity = {'label': value['label'], 'pattern': [{'Lemma': t} for t in token_lemma],
                      'id': value['canonical_term']}
            patterns.append(entity)
        return patterns

    def get_entities(self, text):
        doc = self.nlp(text)
        detected_ents = {}
        # displacy.serve(doc, style='ent', options=options)
        for ent in doc.ents:
            if ent.label_ in ['EricTerm', 'HPO-DDD', 'AGE', 'CITY', 'PROVINCE','AIRs']:
                rule_entity = {'origincal_text': ent.text, 'canonical_term': remove_punct(ent.ent_id_),
                               'span': doc[ent.start:ent.end]}
                if ent.label_ in detected_ents:
                    detected_ents[ent.label_].append(rule_entity)
                else:
                    detected_ents[ent.label_] = [rule_entity]
                # print((ent.text, ent.label_, ent.ent_id_))
        return detected_ents


class UMLSLinking:

    def __init__(self):
        self.nlp = spacy.load("en_core_sci_lg")
        self.nlp.add_pipe("scispacy_linker", config={"linker_name": "umls"})
        self.linker = self.nlp.get_pipe("scispacy_linker")


    def get_entities(self, text: str) -> dict:
        """
        :param text:  text to be processed
        :return: dict of all detected entities having score greater than 0.60. detected_ents[tuple_key] = list of dict as values.
        tuple_key = semantictype and list of dict contains dict_keys[original_text, concept, cui, score]
        """
        doc = self.nlp(text)
        detected_ents = {'UMLS': []}
        # displacy.serve(doc, style='ent', options=options)
        # detected_ents = []
        try:
            for ent in doc.ents:
                if ent._.kb_ents:
                    umls_ent = ent._.kb_ents[0]  # get top scored concept only
                    # print(type(umls_ent))  #umls_ent is a tuple of (concept_id CUI, score)
                    if umls_ent[1] > 0.80:
                        result = self.linker.kb.cui_to_entity[umls_ent[0]]
                        semantic_type = tuple(result.types)
                        if 'T100' in semantic_type or 'T098' in semantic_type:
                            continue
                        entity_info = {'original_text': ent.text, 'canonical_term': remove_punct(result.canonical_name),
                                       'cui': umls_ent[0], 'score': umls_ent[1], 'span': doc[ent.start:ent.end],
                                       'semantic_type': semantic_type}
                        detected_ents['UMLS'].append(entity_info)
                        # if semantic_type in detected_ents:
                        #     detected_ents[semantic_type].append(entity_info)
                        # else:
                        #     detected_ents[semantic_type] = [entity_info]
        except:
            traceback.print_exc()

        return detected_ents


def print_ent(detected_ents):
    for k, v in detected_ents.items():
        print(k, [_['canonical_term'] for _ in v])


def order_dict(entity):
    ordered_dict = OrderedDict()
    if 'CITY' in entity:
        ordered_dict['CITY'] = entity['CITY'].copy()
    if 'PROVINCE' in entity:
        ordered_dict['PROVINCE'] = entity['PROVINCE'].copy()
    if 'HPO-DDD' in entity:
        ordered_dict['HPO-DDD'] = entity['HPO-DDD'].copy()
    if 'AIRs' in entity:
        ordered_dict['AIRs'] = entity['AIRs'].copy()
    if 'EricTerm' in entity:
        ordered_dict['EricTerm'] = entity['EricTerm'].copy()
    if 'UMLS' in entity:
        ordered_dict['UMLS'] = entity['UMLS'].copy()
    return ordered_dict


def get_ent(detected_ents):
    results = []
    for k, v in detected_ents.items():
        entity = {'Source': k, 'selected_entities': [_['canonical_term'] for _ in v]}
        results.append(entity)
    return results


def filter_entities(detected_ents):
    spans = []
    for key, value in detected_ents.items():
        for ent in value:
            spans.append(ent['span'])
    filtered = filter_spans(spans)
    # print("Filtered spans are:", filtered)

    for key, value in detected_ents.items():
        detected_ents[key] = list(filter(lambda i: i['span'] in filtered, detected_ents[key]))

    for fil in filtered:
        exits_in_more_than_one = []
        for key, value in detected_ents.items():
            respected_entity = list(filter(lambda i: i['span'] == fil, value))
            if respected_entity:
                if len(exits_in_more_than_one) >= 1:
                    if ('HPO-DDD' in exits_in_more_than_one or 'CITY' in exits_in_more_than_one) and key in ['UMLS', 'EricTerm']:
                        detected_ents[key] = list(filter(lambda i: i['span'] != fil, detected_ents[key]))
                    if 'AIRs' in exits_in_more_than_one and key in ['UMLS', 'EricTerm']:
                        detected_ents[key] = list(filter(lambda i: i['span'] != fil, detected_ents[key]))
                    if 'EricTerm' in exits_in_more_than_one and key == 'UMLS':
                        detected_ents[key] = list(filter(lambda i: i['span'] != fil, detected_ents[key]))
                else:
                    exits_in_more_than_one.append(key)
    return detected_ents


def initialize_nlp():
    global ul
    global rules
    ul = UMLSLinking()
    rules = RuleBasedNER()


def named_entities(text):
    lemmatized_text = " ".join([_[1] for _ in nltk_process(text.lower())])
    entities = rules.get_entities(lemmatized_text)
    entities.update(ul.get_entities(lemmatized_text))
    ordered_entities = order_dict(entities.copy())
    filtered_ents = filter_entities(ordered_entities.copy())
    if 'AGE' in entities:
        filtered_ents['AGE'] = entities['AGE']
    if 'CITY' in entities:
        filtered_ents['CITY'] = entities['CITY']
    if 'PROVINCE' in entities:
        filtered_ents['PROVINCE'] = entities['PROVINCE']
    # print(f' -------------result before filtering:{pformat(ordered_entities)}\n'
    # f' +++++++++++++result after filtering:{pformat(filtered_ents)} ')
    # logging.debug(
    #     f'processed: {text}\n result before filtering:{pformat(ordered_entities)}\n'
    #     f' result after filtering:{pformat(filtered_ents)} ')
    return filtered_ents


def filter_canonicals(ent_dict):
    result = {key: [_['canonical_term'] for _ in value] for key, value in ent_dict.items()}
    return result


# if __name__ == "__main__":
#     initialize_nlp()
#     text = ""
#     while text != 'exit':
#         text = input("Enter Text: ")
#         print(filter_canonicals(named_entities(text)))
