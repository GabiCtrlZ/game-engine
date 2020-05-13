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

// vector functions

function addVectors(vector1 = [], vector2 = []) {
    return vector1.map((e, i) => (e + vector2[i]) || e)
}

function subtractVectors(vector1 = [], vector2 = []) {
    return vector1.map((e, i) => (e - vector2[i]) || e)
}

function distVectors(vector1 = [], vector2 = []) {
    if (vector1.length != vector2.length) return
    let dist = 0
    vector1.forEach((e, i) => dist += Math.pow(e - vector2[i], 2))
    return Math.sqrt(dist)
}

// matrix functions

function vectorMatrixMultiplay(vector, matrix) {
    if (vector.length != matrix.length) return null
    const resultVector = []
    for (let i = 0; i < matrix[0].length; i++) {
        let sum = 0
        vector.forEach((e, j) => sum += e * matrix[j][i])
        resultVector.push(sum)
    }
    return resultVector
}

function rotateMatrix(degree) {
    const rad = (degree * Math.PI) / 180
    return [
        [Math.cos(rad), -Math.sin(rad)],
        [Math.sin(rad), Math.cos(rad)],
    ]
}

function matrixTraspose(matrix) {
    const transpose = []
    for (let i = 0; i < matrix[0].length; i++) {
        transpose.push(matrix.map(e => e[i]))
    }
    return transpose
}

// physics functions

function calcAngleDegrees(vector) {
    const x = vector[0]
    const y = vector[1]
    return Math.atan2(x, y) * 180 / Math.PI
}

function elasticCollisionSpeed(m1, m2, v1, v2) {
    const u2 = (2 * m1 * v1 + m2 * v2 - m1 * v2) / (m1 + m2)
    const u1 = v2 + u2 - v1
    return { u1, u2 }
}

function elasticCollision(p1, p2, v1, v2, m1, m2) {
    const p = subtractVectors(p1, p2)
    const d = calcAngleDegrees(p)
    const rotate = rotateMatrix(d)
    const vRotate1 = vectorMatrixMultiplay(v1, rotate)
    const vRotate2 = vectorMatrixMultiplay(v2, rotate)
    const { u1, u2 } = elasticCollisionSpeed(m1, m2, vRotate1[0], vRotate2[0])
    vRotate1[0] = u1
    vRotate2[0] = u2
    const transposeRotate = matrixTraspose(rotate)
    const vFinal1 = vectorMatrixMultiplay(vRotate1, transposeRotate)
    const vFinal2 = vectorMatrixMultiplay(vRotate2, transposeRotate)
    return { vFinal1, vFinal2 }
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

    collisionStatic() {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = (i + 1); j < this.objects.length; j++) {
                this.detectCollision(this.objects[i], this.objects[j])
            }
        }
    }

    detectCollision(object1, object2) {
        if (distVectors(object1.pos, object2.pos) <= (object1.radius + object2.radius)) {
            console.log('colission!', object1.pos)
            object1.collision(object2)
        }
    }
}

// advanced classes
class Ball extends Circle {
    constructor(pos, radius, gravity, friction, m = 1, color, borderColor) {
        super(pos, radius, color, borderColor)
        this.dx = 0
        this.dy = 0
        this.gravity = gravity * GRAVITY
        this.friction = friction * AIR_FRICTION
        this.m = m
    }

    gravityForce() {
        this.dy += this.gravity - (this.dy * this.friction)
        this.dx += - (this.dx * this.friction)
        this.move([this.dx, this.dy])
    }

    frictionForce() {

    }

    collision(object) {
        const { m: m1, dy: vy1, dx: vx1 } = this
        const { m: m2, dy: vy2, dx: vx2 } = object
        const { vFinal1, vFinal2 } = elasticCollision(this.pos, object.pos, [vx1, vy1], [vx2, vy2], m1, m2)
        this.dx = vFinal1[0]
        this.dy = vFinal1[1]
        object.dx = vFinal2[0]
        object.dy = vFinal2[1]
    }
}

// declaring objects

const controller = new Controller
controller.AddObject(new Ball([500, 500], 50, 0, 1))

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
    controller.collisionStatic()
}

init()
animate()

// event listeners
window.addEventListener('resize', () => {
    init()
})

onkeydown = onkeyup = onmousedown = onmouseup = controller.handleKeyPress.bind(controller)