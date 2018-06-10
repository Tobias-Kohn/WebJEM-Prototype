# Using the IBM Bluemix Insights for Twitter
#
# Note: the demo version of JEM provides only slow and
# restricted access to selected IBM Bluemix services.
#
# Note: IBM is retiring its Twitter-service by spring 2017.
# https://www.ibm.com/blogs/bluemix/2017/03/retirement-insights-twitter-service/
from ibm.dataAnalytics import *

t = TwitterInsights()
t.setMaximumAge(30)   # In days (optional)
q = t.query("Bluemix")

print "Number of Tweets:", q['count']

for message in q['messages']:
    print "=" * 40
    print "FROM:", message['actor']
    print "TIME:", message['time']
    print "VERB:", message['verb']
    print message['message']
print "=" * 40
