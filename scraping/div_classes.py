import urllib2
from BeautifulSoup import BeautifulSoup

class Course:
    def __init__(self, number, link):
        self.number = number
        self.link = link
        self.index = -1
        self.children = []
        self.parents = []

    def add_prereq(self, courses, prereq):
        parent_i = lookup_course(courses, prereq)
        if parent_i > -1:
            if courses[parent_i] in self.parents: #Add only if not already in parents
                print("Course is already in parents: "+courses[parent_i].number)
            else:
                self.parents.append(courses[parent_i])

    def add_follow_up(self, course):
        if not course in self.children:
            self.children.append(course)

    def add_to_prereqs(self):
        for parent in self.parents:
            parent.add_follow_up(self)

def lookup_course(courses, course_number):
    for i in range(len(courses)):
        course = courses[i];
        if course.number == course_number:
            return i
    return -1


def parse_simon_links():
    courses = []
    fname = "compute_links.txt"
    with open(fname) as f:
        lines = f.readlines()
        for line in lines:
            course_number = line[25:30]
            new_course = Course(course_number, line)
            courses.append(new_course)
    return courses

def parse_prereqs(course):
    prereqs = []
    soup = BeautifulSoup(urllib2.urlopen(course.link).read())
    h3s = soup.findAll("h3")
    # Finder alle h3-tags, og leder efter prerequisites
    for h3 in h3s:
        for text in h3.contents:
            if not "prerequisite" in text.lower(): continue
            # It's a match!
            this_td = h3.parent
            next_td = this_td.nextSibling
            the_as = next_td.findAll("a")
            #print(len(the_as))
            #print(the_a.contents[0])
            for the_a in the_as:
                course_number = the_a.contents[0]
                prereqs.append(course_number)
    return prereqs
