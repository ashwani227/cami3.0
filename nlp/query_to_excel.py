from query_processing import annotate, query_database, owa_on_resource_df
import pandas as pd


queries = [
    'social skills and ADHD',
    'Autism and Repetitive Behavior',
]


if __name__ == "__main__":
    # terms = ['Attention deficit hyperactivity disorder','Behavioral concerns','Abnormal aggressive impulsive or violent behavior']
    # query_database(terms)
    text = ""
    writer = pd.ExcelWriter(r'./results/Multi_term_resource_analysis_set2.xlsx', engine='xlsxwriter')
    for text in queries:
        # text = input("Enter text:")
        entities = annotate(text)
        entities.pop("Matched CB concept", None)
        # entities = {'HPO-DDD': ['Attention deficit hyperactivity disorder', 'Abnormal aggressive impulsive or violent behavior'], 'UMLS': [], 'Challenging Behavior': ['Behavioral concerns']}
        # print(f"entities detected: {entities}")
        terms = []
        for k, v in entities.items():
            terms.extend(v)
        print(terms)
        urls_list = query_database(terms)
        print(f"number of urls: {len(urls_list)}")
        ordered_urls = owa_on_resource_df(urls_list)
        sheet_name = "_".join(terms)
        row = pd.Series({'url': f'SEARCH QUERY:{text}'}, name=0)
        ordered_urls.append(row)
        ordered_urls.to_excel(writer, sheet_name=text[:30])

    writer.save()
