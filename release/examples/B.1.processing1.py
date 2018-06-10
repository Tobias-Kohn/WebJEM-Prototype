from processing import *

def setup():
    size(400,400)
    noStroke()
    smooth()
    noLoop()

def draw():
    drawCircle(200,170,6)

def drawCircle(x, radius, level):
    tt = 128.0 * level / 4.0
    fill(tt)
    ellipse(x, 200, radius*2, radius*2)
    if level > 1:
        level = level - 1
        drawCircle(x - radius / 2, radius/2, level)
        drawCircle(x + radius / 2, radius/2, level)

run()