# sliderControl.py
#
# It creates a simple slider control surface.
#

from gui import *

class SliderControl:

    def __init__(self, title="Slider", updateFunction=None,
                 minValue=10, maxValue=1000, startValue=None,
                 x=0, y=0):
        """Initializes a SliderControl object."""

        # holds the title of the control display
        self.title = title

        # external function to call when slider is updated
        self.updateFunction = updateFunction

        # determine slider start value
        if startValue == None:  # if startValue is undefined

            # start at middle point between min and max value
            startValue = (minValue + maxValue) / 2

            # create slider
        self.slider = Slider(HORIZONTAL, minValue, maxValue,
                             startValue, self.setValue)

        # create control surface display
        self.display = Display(self.title, 250, 50, x, y)

        # add slider to display
        self.display.add(self.slider, 25, 10)

        # finally, initialize value and title (using 'startValue')
        self.setValue( startValue )

    def setValue(self, value):
        """Updates the display title, and calls the external update
           function with given 'value'.
        """

        self.display.setTitle(self.title + " = " + str(value))
        self.updateFunction(value)
