from div_classes import *
import sys

courses = parse_simon_links()
#courses = courses[0:15]
print("no. of courses from Simonymous:")
print(len(courses))

total_count = 0

things_range = range(0,len(courses)-1)

# 1st For alle kurser, set prereqs (parents)
for i in things_range:
    prereqs = parse_prereqs(courses[i])
    total_count += len(prereqs) # For statistics
    #print(courses[i].number)
    for prereq in prereqs:
        courses[i].add_prereq(courses, prereq)


print(total_count)

# 2nd for alle kurser (child), tag deres prereqs (parent) og tilfoej current (child)

for i in things_range:
    courses[i].add_to_prereqs()

# 3rd remove isolated vertices
print("Before trimming:")
print(len(courses))
print("After trimming:")
courses = [course for course in courses if len(course.parents) > 0 or len(course.children) > 0]
print(len(courses))

# 4th spyt ud til JSON

index = 0
for course in courses:
    course.index = str(index)
    index += 1

print("{")
print("  \"nodes\":[")

i = 0
for course in courses:
    if i != 0:
        print(",")
    print("    {\"name\":\""+course.number+"\",\"group\":1}"),
    i += 1

print(" ")
print("  ],")
print("  \"links\":[")

first_found = 0
for course in courses:
    for parent in course.parents:
        if first_found != 0:
            print(",")
        print("    {\"source\":"+course.index+", \"target\":"+parent.index+", \"value\":1}"),
        first_found += 1

print(" ")
print("  ]")
print("}")
# {
#   "nodes":[
#     {"name":"Myriel","group":1},
#     {"name":"Napoleon","group":1},
#     {"name":"Mme.Hucheloup","group":8}
#   ],
#   "links":[
#     {"source":1,"target":0,"value":1},
#     {"source":2,"target":0,"value":8},
#     {"source":76,"target":48,"value":1},
#     {"source":76,"target":58,"value":1}
#   ]
# }
