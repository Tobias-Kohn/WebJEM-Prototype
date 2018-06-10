# musicalSphere.py
#
# Demonstrates how to create an animation of a 3D sphere using
# GUI points on a Display.  The sphere is modeled using points on
# a spherical coordinate system
# (see http://en.wikipedia.org/wiki/Spherical_coordinate_system).
# We convert from spherical 3D coordinates to cartesian 2D
# coordinates to position the individual points on the display.
# The z axis (3D depth) is mapped to color, using an orange gradient,
# ranging from white (front surface of sphere) to black (back
# surface of sphere).  Also, when a point passes the primary meridian
# (the imaginary vertical line closest to the viewer), a note is
# played using the point's latitude for pitch (low to high).
# Also the point turns red momentarily.
#

from gui import *
from music import *
from random import *
from math import *

class MusicalSphere:
    """Creates a revolving sphere that plays music."""

    def __init__(self, radius, density, velocity=0.01, frameRate=30):
        """
        Construct a revolving sphere with given 'radius', 'density'
        number of points (all on the surface), moving with 'velocity'
        angular (theta / azimuthal) velocity, at 'frameRate' frames
        (or movements) per second.  Each point plays a note when
        crossing the zero meridian (the sphere's meridian (vertical
        line) closest to the viewer).
        """

        ### musical parameters #######################################
        self.instrument = XYLOPHONE
        self.scale = PENTATONIC_SCALE
        self.lowPitch = C2
        self.highPitch = C7
        self.noteDuration = 100    # milliseconds

        Play.setInstrument(self.instrument, 0)   # set the instrument


        ### visual parameters ########################################
        # create display to draw sphere (with black background)
        self.display = Display("3D Sphere", radius*3, radius*3)
        self.display.setColor( Color.BLACK )

        self.radius = radius       # how wide sphere is
        self.numPoints = density   # how many points on sphere surface
        self.velocity = velocity   # how far sphere rotates per frame
        self.frameRate = frameRate # how many frames to do per second

        # place sphere at display's center
        self.xCenter = self.display.getWidth() / 2
        self.yCenter = self.display.getHeight() / 2


        ### sphere data structure (parallel lists) ###################
        self.points      = []  # holds all the points
        self.thetaValues = []  # holds point rotation (azimuthal angle)
        self.phiValues   = []  # holds point latitude (polar angle)

        ### timer to drive animation #################################
        delay = 1000 / frameRate   # convert frame rate to delay (ms)
        self.timer = Timer(delay, self.movePoints)   # create timer

        ### control surface for animation frame rate #################
        xPosition = self.display.getWidth() / 3    # position control
        yPosition = self.display.getHeight() + 45

        ### color gradient (used to display depth) ###################
        black = [0, 0, 0]         # RGB values for black (back)
        orange = [251, 147, 14]   # RGB values for orange (middle)
        white = [255, 255, 255]   # RGB values for white (front)

        # create list of gradient colors from black to orange, and from
        # orange to white (a total of 25 colors)
        self.gradientColors = colorGradient(black, orange, 12) + \
                              colorGradient(orange, white, 12) + \
                              [white]  # include the final color

        self.initSphere()      # create the circle

        self.start()           # and start rotating!
        self.display.run()


    def start(self):
        """Starts sphere animation."""
        self.timer.start()

    def stop(self):
        """Stops sphere animation."""
        self.timer.stop()

    def setFrameRate(self, frameRate=30):
        """Controls speed of sphere animation (by setting how many
           times per second to move points).
        """

        # convert from frame rate to delay between each update
        delay = 1000 / frameRate     # (in milliseconds)
        self.timer.setDelay(delay)   # and set timer delay

    def initSphere(self):
        """Generate a sphere of 'radius' out of points (placed on the
           surface of the sphere).
        """

        for i in range(self.numPoints):     # create all the points

            # get random spherical coordinates for this point
            r = self.radius                   # placed *on* the surface
            theta = mapValue( random(), 0.0, 1.0, 0.0, 2*pi) # rotation
            phi = mapValue( random(), 0.0, 1.0, 0.0, pi)     # latitude

            # remember this point's spherical coordinates by appending
            # them to the two parallel lists (since r = self.radius
            # for all points, no need to save that)
            self.thetaValues.append( theta )
            self.phiValues.append( phi )

            # project spherical to cartesian 2D coordinates (z is depth)
            x, y, z = self.sphericalToCartesian(r, phi, theta)

            # convert depth (z) to color
            color = self.depthToColor(z, self.radius)

            # create point at these x, y coordinates, with this color
            # and thickness 1
            point = Point(x, y, color, 1)

            # remember point by appending it to the third parallel list
            self.points.append( point )       # this point

            # now, display this point
            self.display.add( point )
        self.display.disableAutoRepaint()

    def sphericalToCartesian(self, r, phi, theta):
        """Convert spherical to cartesian coordinates."""

        # adjust rotation so that theta is 0 at max z (near viewer)
        x = r * sin(phi) * cos(theta + pi/2)     # horizontal axis
        y = r * cos(phi)                         # vertical axis
        z = r * sin(phi) * sin(theta + pi/2)     # depth axis

        # move sphere's center to display's center
        x = int( x + self.xCenter )   # pixel coordinates are integer
        y = int( y + self.yCenter )
        z = int( z )

        return x, y, z

    def depthToColor(self, depth, radius):
        """Create color based on depth."""

        # map depth to gradient index (farther away less luminosity)
        colorIndex = mapValue(depth, -self.radius, self.radius,
                              0, len(self.gradientColors))

        # get corresponding gradient (RBG value), and create the color
        colorRGB = self.gradientColors[colorIndex]
        color = Color(colorRGB[0], colorRGB[1], colorRGB[2])

        return color

    def movePoints(self):
        """Rotate points on y axis as specified by angular velocity."""

        self.display.setColor(Color.BLACK)
        for i in range(self.numPoints):  # for every point

            point = self.points[i]         # get this point
            theta = self.thetaValues[i]    # get rotation angle
            phi = self.phiValues[i]        # get latitude (altitude)

            # animate by incrementing angle to simulate rotation
            theta = theta + self.velocity

            # wrap around at the primary meridian (i.e., 360 degrees
            # become 0 degrees) - needed to decide when to play note
            theta = theta % (2*pi)

            # convert from spherical to cartesian 2D coordinates
            x, y, z = self.sphericalToCartesian(self.radius, phi, theta)

            # check if point crossed the primary meridian (0 degrees),
            # and if so, play musical note, and change its color to red
            if self.thetaValues[i] > theta:   # did we just wrap around?

                # yes, so play note
                pitch = mapScale(phi, 0, pi,
                                 self.lowPitch, self.highPitch,
                                 self.scale)  # phi is latitude
                dynamic = randint(0, 127)     # get random dynamic

                Play.note(pitch, 0, self.noteDuration, dynamic)

                # set point's color to red
                color = Color.RED

            else:   # otherwise, not at the primary meridian, so

                # set point's color based on depth, as usual
                color = self.depthToColor(z, self.radius)

            # now, we have the point's new color and x, y coordinates

            #self.display.move(point, x, y)  # move point to new position
            self.display.drawPoint(x, y, color)
            #point.setColor(color)           # and update its color

            # finally, save this point's new rotation angle
            self.thetaValues[i] = theta
        self.display.repaint()

sphere = MusicalSphere(radius = 200, density = 150, velocity = 0.05, frameRate = 25)
