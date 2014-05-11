from div_classes import *

courses = parse_simon_links()
print("no. of courses from Simonymous:")
print(len(courses))

total_count = 0

things_range = range(0,12)

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



# 3rd spyt ud til JSON
for i in things_range:
    print("Current course: "+courses[i].number)
    for parent in courses[i].parents:
        print("\tParent: " + parent.number)
    for child in courses[i].children:
        print("\tChild: " + child.number)
