# Using the IBM Watson Visual Recognition
#
# Note: the demo version of JEM provides only slow and
# restricted access to selected IBM Watson services.
from ibm.watson import *
from gui import *

# Select one of the following pictures.
# The pictures are all from "wikipedia.org".
pictures = [
    "wiki_tiger_1",           #  0
    "wiki_tiger_2",           #  1
    "wiki_elvis_1",           #  2
    "wiki_windmill_1",        #  3
    "wiki_lenna_1",           #  4
    "wiki_guitar_1",          #  5
    "wiki_grand_piano_1",     #  6
    "wiki_olympus_1",         #  7
    "wiki_parthenon_1",       #  8
    "wiki_humpback_1",        #  9
    "wiki_humpback_2",        # 10
    "wiki_dolphin_1"          # 11
]

picture = pictures[0]

image = Icon(picture)
display = Display("Visual Recognition", image.getWidth(), image.getHeight())
display.add(image)

visualRecognizer = VisualRecognizer()
answers = visualRecognizer.recognize(picture)

for answer in answers:
    print "%s (%g)" % (answer['name'], answer['score'])
print "Done"