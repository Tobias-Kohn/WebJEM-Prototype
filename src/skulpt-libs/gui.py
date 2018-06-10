import jygui

class Color():
    BLACK = "black"

    def __init__(self, r, g, b):
        s = hex(r * 0x10000 + g * 0x100 + b)[2:]
        self.value = "#" + ("0" * (6 - len(s)) + s)
    
###############################################################################
# Drawable
#
# Class to encapsulate common functionality (mainly color, fill, thickness) for 
# drawable gaphics objects.
#

class Drawable():
   """
   This class defines common GUI drawable object functionality.
   """

   def __init__(self, color=Color.BLACK, fill=False, thickness=1):
      """
      Create a drawable object.
      """
      self.color = color
      self.fill = fill
      self.thickness = thickness
      self.display = None
 
   def setColor(self, color=None):
      """
      Change the color of the drawable object.  If no color provided, use dialog box to select.
      """
      self.color = color

   def getColor(self):
      """
      Returns the color of the drawable object.
      """
      return self.color
      
   def applyColor(self, context):
      if type(self.color) is str:
          clr = self.color
      else:
          clr = self.color.value
      if self.fill:
          jygui.setFillColor(context, clr)
      else:
          jygui.setStrokeColor(context, clr)

###############################################################################
# Widget
#
# Class to encapsulate common functionality (mainly event handling) for 
# widget objects.
#
class Widget():
   """
   This class defines common GUI widget functionality.
   """

   def __init__(self):
      """
      Set up instance variables.
      """
      self.display = None

###############################################################################
# Display
#
# Class for generating a GUI window.  A program may open several Displays.  
# Extends Swing's JFrame class.
#
# Methods:
#
# Display()
# Display(title)
# Display(title, width, height)
#   Creates a new Display.
#   --title - Gives the Display a Title (displayed at the top of the window)
#   --width - The width (in pixels) of the Display window.
#   --height - The height (in pixels) of the Display window.
#
# show()
#   Displays the window.  
#
# hide()
#   Hide the window.
#
# add(widget)
#   Adds a widget to the Display.  Widgets are positioned using FlowLayout.
#
# NOTE:  This class was originally called Window, but was renamed for simplicity
# due to the presence of a Window class in jMusic.
###############################################################################

class Display():
   """
   GUI Window to hold widgets.
   """

   def __init__(self, title = "", width = 600, height = 400, x=0, y=0, color = None):
      """
      Create a new window.
      """
      self.width = width
      self.height = height
      self.display = jygui.getDisplay(width, height)
      self.context = jygui.getContext(self.display)
      
   def getWidth(self):
      return self.width
      
   def getHeight(self):
      return self.height
      
   def show(self):
      """Shows the display."""
      pass

   def hide(self):
      """Hides the display."""
      pass

   def place(self, item, x=None, y=None, order = 0):
      """
      Place an object in the display, at coordinates by x and y.
      If the object already appears on another display it is removed from there, first.
      """
      if isinstance(item, Widget):
         if x is None: x = 0
         if y is None: y = 0
         jygui.addWidget(item.widget, x, y)
      else:
         item.applyColor(self.context)
         item.paint(self.context)
      
   def add(self, item, x=None, y=None):
      """
      Same as place(), i.e., places an object in the display, at coordinates by x and y.
      If the object already appears on another display it is removed from there, first.
      """
      self.place(item, x, y)

   def remove(self, item):
      """
      Remove the item from the display.
      """
      pass

   # drawing functions (for convenience)
   def drawLine(self, x1, y1, x2, y2, color=Color.BLACK, thickness=1):
      """
      Draw a line between the points (x1, y1) and (x2, y2) with given color and thickness.
      
      Returns the line object (in case we want to move it or delete it later).
      """
      line = Line(x1, y1, x2, y2, color, thickness)   # create line
      self.add(line)                                  # add it      
      return line                                     # and return it

   def drawCircle(self, x, y, radius, color = Color.BLACK, fill = False, thickness=1):
      """
      Draw a circle at (x, y) with the given radius, color, fill, and thickness.
      
      Returns the circle object (in case we want to move it or delete it later).
      """
      circle = Circle(x, y, radius, color, fill, thickness)   # create circle
      self.add(circle)   # add it      
      return circle      # and return it

   def drawRectangle(self, x1, y1, x2, y2, color = Color.BLACK, fill = False, thickness = 1):
      """
      Draw a rectangle using the provided coordinates, color, fill, and thickness.
      
      Returns the rectangle object (in case we want to move it or delete it later).
      """
      rec = Rectangle(x1, y1, x2, y2, color, fill, thickness)   # create rectangle
      self.add(rec)   # add it      
      return rec      # and return it

###############################################################################
# Drawable Objects
#
# These classes are all used by Display's paint method.  The paint method will
# call the paint method of each of these to create an image on the display
#

# Line
#
# Creates a line to be added to a display.

class Line(Drawable):
   """
   A simple line specified through its end points.
   """

   def __init__(self, x1, y1, x2, y2, color = Color.BLACK, thickness = 1):
      """
      Create a new line
      """
      Drawable.__init__(self, color, True, thickness)  # set up color, fill, thickness, etc.
      self.x1 = x1
      self.y1 = y1
      self.x2 = x2
      self.y2 = y2
      self.offset = (0,0)        # offset of object placement relative to the first (x,y) point (no offset for lines)

   def paint(self, context):
      """
      Paint me on the display
      """
      jygui.drawLine(context, self.x1, self.y1, self.x2, self.y2)

# Circle
#
# Creates a circle to be added to a display.

class Circle(Drawable):
   """
   A simple circle
   """
   
   def __init__(self, x, y, radius, color = Color.BLACK, fill = False, thickness=1):
      """
      Create a new circle
      """
      Drawable.__init__(self, color, fill, thickness)  # set up color, fill, thickness, etc.
      self.x = x
      self.y = y
      self.radius = radius
      self.diameter = self.radius*2
      self.offset = (self.radius, self.radius)   # offset circle inside JPanel according to its center

   def paint(self, context):
      """
      Paint me on the display
      """
      jygui.drawCircle(context, self.x, self.y, self.radius, self.fill)

# Rectangle
#
# Creates a rectangle to be added to a display.

class Rectangle(Drawable):
   """
   A simple rectangle specified by two diagonal corners.
   """

   def __init__(self, x1, y1, x2, y2, color = Color.BLACK, fill = False, thickness=1):
      """
      Create a new rectangle
      """
      Drawable.__init__(self, color, fill, thickness)  # set up color, fill, thickness, etc.
      self.x1 = x1
      self.y1 = y1
      self.x2 = x2
      self.y2 = y2

      self.offset = (0,0)        # offset of object placement relative to the first (x,y) point (no offset for rectangles)

   def paint(self, context):
      """
      Paint me on the display
      """
      jygui.drawRectangle(context, self.x1, self.y1, self.x2, self.y2, self.fill)

###############################################################################
# Button
#
# Class for creating pushbuttons.  Extends Swing's JButton class.
#
# Methods:
#
# Button(label, event)
#   Creates a new pushbutton widget.
#   --label - A text label to be placed on the button.
#   --event - The user-defined event-handling function called when this button
#             is clicked.
###############################################################################

class Button(Widget):
   """
   Push Button
   """

   def __init__(self, label, eventFunction):
      """
      Create a new button
      """
      self.label = label
      self.eventFunction = eventFunction
      self.widget = jygui.createButton(label, eventFunction)
      self.offset = (0,0)
      self.position = (0,0)
      self.display = None
