# Using the IBM Watson Language Translator
#
# Note: the demo version of JEM provides only slow and
# restricted access to selected IBM Watson services.
from ibm.watson import *

service = TextToSpeech()
service.setLanguage(service.ITALIAN)
service.synthesize("Buongiorno. Come stai?")