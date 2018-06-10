from math import sin, sqrt
from processing import *

X = 30
Y = 30
delay = 16
radius = 30

def setup():
    strokeWeight(10)
    frameRate(20)
    size(300,300)

def ellipseFun():
    global X, Y, radius
    background(100)
    fill(0,121,184)
    stroke(255)
    fc = environment.frameCount

    X += (mouse.x-X)/delay;
    Y += (mouse.y-Y)/delay;

    radius = radius + sin(fc / 4)

    ellipse(X,Y,radius,radius)

def colorFun():
    noStroke()
    noLoop()
    colorMode(RGB,300)
    for r in range(300):
        for g in range(300):
            stroke(r, g, 0)
            point(r,g)

def dist(x1,y1,x2,y2):
    o = y2-y1
    a = x2-x1
    return sqrt(o*o + a*a)

def distanceFun():
    background(51)
    strokeWeight(1)
    for i in range(0,environment.width,20):
        for j in range(0,environment.width,20):
            size = dist(mouse.x,mouse.y,i,j)
            size = size/dist(0,0,environment.height,environment.width) * 100
            ellipse(i,j,size,size)

draw = distanceFun    # try colorFun or ellipseFun
run()