import xml.etree.ElementTree as ET
import requests
import json
import Models

### get all the courses and write them to disk
### NB: don't do this unless needed

# all_courses_url = 'http://www.kurser.dtu.dk/coursewebservicev2/course.asmx/SearchDtuShb?courseCode=&searchWords=&department=&teachingPeriod=&CourseCatalogVersion=2013/2014&courseCodeStart=&teachingLanguage=&courseIDList=&resultType=fullXml&education=&CourseType=&MasterRegular=&openUniversity='

# print('Getting courses...')
# raw = requests.get(all_courses_url)

# print('Writing courses...')
# f = open('data/courses_full.xml', 'w')
# f.write(raw.text)


### parse the full xml files and extract the relevant data

print('Parsing courses...')
data = ET.parse('data/courses_full.xml').getroot()

print(str(len(data)) + ' courses found')
courses = []
    
for course in data.findall('Courses/FullXML/Course'):
    title = course.find('Title[@Lang="en-GB"]').attrib.get('Title')
    ects = course.find('Point').text
    lang = course.find('Teaching_Language').attrib.get('LangCode')
    prereqs = []
    prereq_node = course.find('Qualified_Prerequisites/Qualified_Prerequisites_Txt[@Lang="en-GB"]')
    if prereq_node != None:
        prereqs = Models.parse_prereqs(prereq_node.attrib.get('Txt'))
            
    course = Models.Course(title,
                           course.attrib.get('CourseID'),
                           course.attrib.get('CourseCode'),
                           prereqs,
                           ects,
                           lang)

    courses.append(course)

dicts = [c.__dict__ for c in courses]
f = open('data/courses_full.json', 'w')
f.write(json.dumps(dicts) + '\n')
f.close()

print('All done')
