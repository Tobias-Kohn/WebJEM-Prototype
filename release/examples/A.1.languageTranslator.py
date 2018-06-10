# Using the IBM Watson Language Translator
#
# Note: the demo version of JEM provides only slow and
# restricted access to selected IBM Watson services.
from ibm.watson import *

translator = LanguageTranslator()
translator.setSourceLanguage("french")
translator.setDestinationLanguage("english")
print translator.translate("bonjour", "bienvenu", "au revoir")
