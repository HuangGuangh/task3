import Rectangle from "./rectangle";
import { Circle } from "./rectangle";

const canvas = document.getElementById("cnvs");
const context = canvas.getContext('2d');

const gameState = {
    rects: [],
    lastTick: 0,
    lastRender: 0,
    tickLength: 15, // ms
};

let frameTimes = [];
const maxFrames = 60;
function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick += gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameState.rects.forEach((figure) => {
        context.fillStyle = figure.color || "rgb(0, 0, 200)";
        if (figure instanceof Circle) {
            context.beginPath();
            context.arc(figure.x, figure.y, figure.radius, 0, Math.PI * 2);
            context.fill();
        } else {
            context.fillRect(figure.x, figure.y, figure.w, figure.h);
        }
    });

    const estimatedGraphics = estimateGraphics();
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Estimated graphics: ${estimatedGraphics}`, 10, 30);
}

function update() {
    gameState.rects.forEach((figure) => {
        figure.x += figure.speed.x;
        figure.y += figure.speed.y;

        gameState.rects.forEach((otherFigure) => {
            if (figure !== otherFigure &&
                (figure.intersects(otherFigure) || (figure instanceof Circle && otherFigure.intersects(figure)))) {

                handleCollision(figure, otherFigure);
            }
        });


        if (figure.x < 0 || figure.x + (figure instanceof Circle ? figure.radius * 2 : figure.w) > canvas.width) {
            figure.speed.x *= -1;
        }
        if (figure.y < 0 || figure.y + (figure instanceof Circle ? figure.radius * 2 : figure.h) > canvas.height) {
            figure.speed.y *= -1;
        }
    });
}

function handleCollision(figure, otherFigure) {
    const dx = (otherFigure.x + (otherFigure instanceof Circle ? otherFigure.radius : otherFigure.w / 2)) -
        (figure.x + (figure instanceof Circle ? figure.radius : figure.w / 2));
    const dy = (otherFigure.y + (otherFigure instanceof Circle ? otherFigure.radius : otherFigure.h / 2)) -
        (figure.y + (figure instanceof Circle ? figure.radius : figure.h / 2));
    const distance = Math.sqrt(dx * dx + dy * dy);

    const overlap = (figure instanceof Circle ? figure.radius : figure.w / 2) +
        (otherFigure instanceof Circle ? otherFigure.radius : otherFigure.w / 2) - distance;

    if (distance < overlap) {
        const normX = dx / distance;
        const normY = dy / distance;

        figure.x -= normX * (overlap * 0.5);
        figure.y -= normY * (overlap * 0.5);
        otherFigure.x += normX * (overlap * 0.5);
        otherFigure.y += normY * (overlap * 0.5);

        const speedMagnitude = Math.sqrt(figure.speed.x * figure.speed.x + figure.speed.y * figure.speed.y);
        const newDirection = Math.atan2(normY, normX) + Math.PI; // 反向

        figure.speed.x = Math.cos(newDirection) * speedMagnitude;
        figure.speed.y = Math.sin(newDirection) * speedMagnitude;

        figure.color = getRandomColor();
        figure.collisions = (figure.collisions || 0) + 1;

        otherFigure.color = getRandomColor();
        otherFigure.collisions = (otherFigure.collisions || 0) + 1;

        if (figure.collisions >= 3) {
            const index = gameState.rects.indexOf(figure);
            if (index > -1) {
                gameState.rects.splice(index, 1);
            }
        }
        if (otherFigure.collisions >= 3) {
            const index = gameState.rects.indexOf(otherFigure);
            if (index > -1) {
                gameState.rects.splice(index, 1);
            }
        }
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function estimateGraphics() {
    const averageTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length || 0;
    const estimatedFPS = 1000 / averageTime;
    return Math.floor(estimatedFPS * 0.8);
}

function run(tFrame) {
    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }

    const startTime = performance.now();
    queueUpdates(numTicks);
    draw();
    gameState.lastRender = tFrame;

    const endTime = performance.now();
    const frameTime = endTime - startTime;
    frameTimes.push(frameTime);

    if (frameTimes.length > maxFrames) {
        frameTimes.shift();
    }

    window.requestAnimationFrame(run);
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.lastTick = performance.now();

    const rectangle = new Rectangle(10, 10, 30, 30);
    rectangle.setSpeed(5, 5);
    gameState.rects.push(rectangle);

    const rectangle2 = new Rectangle(600, 10, 30, 30);
    rectangle2.setSpeed(-5, 5);
    gameState.rects.push(rectangle2);

    const circle = new Circle(300, 300, 20);
    circle.setSpeed(3, 3);
    gameState.rects.push(circle);
}

setup();
run();
