export default class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = { x: 0, y: 0 };
        this.collisions = 0; // 碰撞计数
        this.color = 'rgb(0, 0, 200)'; // 默认颜色
    }

    setSpeed(x, y) {
        this.speed.x = x;
        this.speed.y = y;
    }

    contains(point) {
        return (point.x >= this.x &&
            point.x < this.x + this.w &&
            point.y >= this.y &&
            point.y < this.y + this.h);
    }

    intersects(rect) {
        return (this.x < rect.x + rect.w) &&
            (rect.x < this.x + this.w) &&
            (this.y < rect.y + rect.h) &&
            (rect.y < this.y + this.h);
    }
}
export class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = { x: 0, y: 0 };
        this.collisions = 0; // 碰撞计数
        this.color = 'rgb(0, 0, 200)'; // 默认颜色
    }

    setSpeed(x, y) {
        this.speed.x = x;
        this.speed.y = y;
    }

    intersects(rect) {
        const closestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.h));
        const distanceX = this.x - closestX;
        const distanceY = this.y - closestY;
        return (distanceX * distanceX + distanceY * distanceY) < (this.radius * this.radius);
    }
}
