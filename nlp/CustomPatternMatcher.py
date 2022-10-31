import ast
import nltk
import pandas as pd
from nltk.stem import PorterStemmer
import pickle
import traceback
from spacy.lang.en import English


class CBExtraction:
    def extractor(self, text):
        result = []
        try:
            # nlp = spacy.load("en_core_web_lg")
            nlp = English()
            ruler = nlp.add_pipe('entity_ruler')

            patterns = []
            # with open(r'D:/chatbot_version_3/CAMI/nlp/domainConcepts/CB_patterns_nov2021.pkl', 'rb') as handle:
            with open(r'nlp/domainConcepts/CB_patterns_nov2021.pkl', 'rb') as handle:
                patterns = pickle.load(handle)

            ruler.add_patterns(patterns)
            doc = nlp(text.lower())
            for ent in doc.ents:
                result.append((ent.text, ent.label_, "NER"))
        except:
            traceback.print_exc()

        return result


class MatchPattern:

    def __init__(self, pattern_file, sheet_name):
        self.stop_list = list()
        self.ps = PorterStemmer()
        self.type = sheet_name
        with open(r"nlp/domainConcepts/stop_words.txt") as file:
        # with open(r"D:/chatbot_version_3/CAMI/nlp/domainConcepts/stop_words.txt") as file:
            self.stop_list = ast.literal_eval(file.readline())
        self.pattern_dict = dict()

        df2 = pd.read_excel(pattern_file, sheet_name=sheet_name)
        if self.type == "Challenging Behavior":
            self.cb_concept_cat = dict()
        self.pattern_dict = dict()
        for index, row in df2.iterrows():
            text = row[0]
            if self.type == "Challenging Behavior":
                self.cb_concept_cat[text] = row[1]
            stemmed_dict = self.parse_text(text)
            if len(stemmed_dict['stemmed']) == 0:
                continue
            self.pattern_dict[index] = stemmed_dict

    def parse_text(self, sent):
        """
        :param sent: text to be tokenized and stem
        :return: dictionary of original text, tokens and respective stemmed words
        """
        tokenizer = nltk.RegexpTokenizer(r"\w+")
        words = tokenizer.tokenize(sent)
        new_words = [word for word in words if word not in self.stop_list]
        stemmed_words = []
        for w in words:
            stemmed_words.append(self.ps.stem(w))
        return {'text': sent, 'original_words': new_words, 'stemmed': stemmed_words}

    def check_for_pattern(self, dictn):
        matches = list()
        text_stems = dictn['stemmed']
        for k, v in self.pattern_dict.items():
            stemmed_pattern = v['stemmed']
            if stemmed_pattern[0] in text_stems:
                flag = self.find_pattern_ngram(text_stems, stemmed_pattern)
                if flag:
                    matches.append(v['text'])
        return list(matches)

    def find_pattern_ngram(self, text_stems, stemmed_pattern):
        stem_index = text_stems.index(stemmed_pattern[0])
        start = 0
        if stem_index - 5 > 0:
            start = stem_index - 5
        end = len(text_stems)
        if stem_index + 5 < end:
            end = stem_index + 5

        partial_text = text_stems[start:end]
        flag = True

        for each_stem in stemmed_pattern:
            if each_stem not in partial_text:
                flag = False
                break
        return flag

    def run(self, ptext):
        """
        :param ptext:
        :param type: CB or Trigger
        :return:
        """
        try:
            text_dict = self.parse_text(ptext)
            matches = self.check_for_pattern(text_dict)
            raw_result = []
            # cb_categories = []
            if self.type == "Challenging Behavior":
                for match in matches:
                    category = self.cb_concept_cat[match]
                    raw_result.append((match, category))
                    # cb_categories.append(category)
                return raw_result
            else:
                return matches
        except:
            traceback.print_exc()
        return []


def get_cb(text):
    ce = CBExtraction()
    result = ce.extractor(text)
    # ms = MatchPattern(r"D:/chatbot_version_3/CAMI/nlp/domainConcepts/Domain_Concepts.xlsx",
    #                   "Challenging Behavior")
    ms = MatchPattern(r"nlp/domainConcepts/Domain_Concepts.xlsx",
                      "Challenging Behavior")
    result.extend(ms.run(text))
    raw = []
    categories = []
    for _ in result:
        raw.append(_[0])
        categories.append(_[1])
    return raw, categories


def get_trigger(text):
    ms = MatchPattern("nlp/domainConcepts/Domain_Concepts.xlsx", "Triggers")
    return ms.run(text)


# cb_cases = ['bites others and yells at everyone and yells biting others', 'He lines up all his toys and refuses to stop it']
# for _ in cb_cases:
#     print("CB:", get_cb(_))
#
# trigger_cases = ['difficulty in falling asleep']
# for _ in trigger_cases:
#     print("trigger:", get_trigger(_))

if __name__ == "__main__":
    from utils import get_websites_list, update_resource

    resources = get_websites_list("IA_english_webpages_august30")
    print(len(resources))
    for index, resource in enumerate(resources):
        if index <= 80610:
            continue
        print(index, resource['url'])
        text = ""
        if 'removed_boilerplate' in resource:
            text = resource['removed_boilerplate']
        else:
            text = resource['text']

        raw, categories = get_cb(text)
        print(categories)
        filter_q = {'url': {'$eq': resource['url']}}
        update_q = {"$set": {'raw_cb': raw, 'cb_category': categories}}
        update_resource("IA_english_webpages_august30_annotations", filter_q, update_q)
