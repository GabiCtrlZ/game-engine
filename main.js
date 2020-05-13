// canvas initialization

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// consts

const ASSETS = './assets'
const DEFAULT_COLOR = 'rgba(125, 125, 125)'
const GRAVITY = 1
const TERMINAL_VELOCITY = 30
const AIR_FRICTION = GRAVITY / TERMINAL_VELOCITY

// functions

const addVectors = (vector1 = [], vector2 = []) => {
    return vector1.map((e, i) => (e + vector2[i]) || e)
}

const distVectors = (vector1 = [], vector2 = []) => {
    if (vector1.length != vector2.length) return
    let dist = 0
    vector1.forEach((e, i) => dist += Math.pow(e - vector2[i], 2))
    return Math.sqrt(dist)
}

// basic classes

class Circle {
    constructor(pos, radius, color = DEFAULT_COLOR, borderColor = DEFAULT_COLOR) {
        this.pos = pos
        this.radius = radius
        this.color = color
        this.borderColor = borderColor
    }

    draw() {
        c.beginPath()
        c.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, false)
        c.strokeStyle = this.borderColor
        c.fillStyle = this.color
        c.stroke()
        c.fill()
    }

    move(dPos) {
        this.pos = addVectors(this.pos, dPos)
    }

}

class Rectangle {
    constructor(pos, width, height, color = DEFAULT_COLOR, borderColor = DEFAULT_COLOR) {
        this.pos = pos
        this.width = width
        this.height = height
        this.color = color
        this.borderColor = borderColor
    }

    draw() {
        c.beginPath()
        c.rect(this.pos[0], this.pos[1], this.width, this.height)
        c.strokeStyle = this.borderColor
        c.fillStyle = this.color
        c.stroke()
        c.fill()
    }

    move(dPos) {
        this.pos = addVectors(this.pos, dPos)
    }
}

class Line {
    constructor() {
        this.points = []
    }

    draw() {
        if (!this.points.length) return
        c.beginPath()
        c.moveTo(this.points[0].x, this.points[0].y)
        this.points.forEach((point) => c.lineTo(point.x, point.y))
    }

    addPoint(point) {
        this.points.push(point)
    }

    removePoint() {
        this.points.pop()
    }
}

class Sprite {
    constructor(pos, width, height, imgSource) {
        this.img = document.createElement("img");
        this.img.setAttribute("src", imgSource);
        this.pos = pos
        this.width = width
        this.height = height
    }

    draw() {
        c.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height)
    }

    move(dPos) {
        this.pos = addVectors(this.pos, dPos)
    }
}

class Controller {
    constructor() {
        this.objects = []
        this.sprites = []
    }

    handleKeyPress(e) {
        e = e || event
        const { type, clientX, clientY } = e
        console.log(e)
        switch (type) {
            case 'mousedown':
                this.AddObject(new Ball([clientX, clientY], 50, 1, 1))
                return
            default:
                return
        }
    }

    AddObject(object) {
        this.objects.push(object)
    }

    AddSprite(sprite) {
        this.sprites.push(sprite)
    }

    handleForces() {
        this.objects.forEach((o) => {
            o.gravityForce()
        })
    }

    draw() {
        this.objects.forEach((o) => {
            o.draw()
        })
    }
}

// advanced classes
class Ball extends Circle {
    constructor(pos, radius, gravity, friction, color, borderColor) {
        super(pos, radius, color, borderColor)
        this.dx = 0
        this.dy = 0
        this.gravity = gravity * GRAVITY
        this.friction = friction * AIR_FRICTION
    }

    gravityForce() {
        this.dy += this.gravity - (this.dy * this.friction)
        this.move([this.dx, this.dy])
    }

    frictionForce() {

    }
}

// declaring objects

const controller = new Controller

// initialization function

function init() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 10
}

// animating

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    controller.draw()
    controller.handleForces()
}

init()
animate()

// event listeners
window.addEventListener('resize', () => {
    init()
})

onkeydown = onkeyup = onmousedown = onmouseup = controller.handleKeyPress.bind(controller)