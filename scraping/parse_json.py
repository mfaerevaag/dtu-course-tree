import json


with open("compute_small.json", "r") as json_file:
    data = json_file.read().replace('\n','')

# print(data)

js = json.loads(data)
print(js)
print(type(js))
print(js['nodes'])
print(js['links'])

# Structure:

# js['nodes'] and js['links'] are lists

# elements are added like:
# js['links'].append({'source': 1337, 'target': "the D", 'value': "9000+"})

#print(type(js['links']))
# for link in js['links']:
#     print(link)
#     print("\t"+str(link['source']))
