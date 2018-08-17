class PolygonRenderer {
    constructor(context, options) {
        options = options || {};

        this.ctx = context;

        this.polygonDimensions = [100, 100];
        this.generateTriangles = false;
        this.distortionScale = 0.25;
        this.leftColor = true;

        this.gradient = [
            [252, 186, 42],
            [26, 42, 108]
        ];

        Object.keys(options).forEach(key => {
            this[key] = options[key];
        });

        this.resize();
    }

    convertColors() {
        for (var i = 0; i < this.gradient.length; ++i) {
            this.gradient[i] = this.convertColor(this.gradient[i]);
        }
    }

    convertColor(color) {
        if (Array.isArray(color)) return color;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, 1, 1);

        color = [];
        var data = this.ctx.getImageData(0, 0, 1, 1).data;
        for (var i = 0; i < 3; ++i) {
            color[i] = data[i];
        }

        this.clear();

        return color;
    }

    resize() {
        this.ctx.canvas.width = this.ctx.canvas.clientWidth;
        this.ctx.canvas.height = this.ctx.canvas.clientHeight;

        this.generatePolygons();
        this.render();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render() {
        this.convertColors();
        this.clear();

        for (var i = 0; i < this.polygons.length; ++i) {
            this.renderPolygon(this.polygons[i]);
        }
    }

    renderPolygon(polygon) {
        this.ctx.beginPath();

        for (var i = 0; i < polygon.length; i++) {
            var vertex = this.getVertex(polygon[i]);
            if (i == 0) {
                this.ctx.moveTo(vertex.x, vertex.y);
            } else {
                this.ctx.lineTo(vertex.x, vertex.y);
            }
        }

        var colors = polygon.calculateGradient(this.gradient, this.leftColor);
        var bounds = polygon.calculateBounds(this.vertices, false);
        bounds = this.rotateArea(bounds, polygon.angle);

        var gr = this.getGradient(colors, bounds);

        this.ctx.strokeStyle = gr;
        this.ctx.fillStyle = gr;
        this.ctx.lineWidth = 2;
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    getVertex(index) {
        return this.vertices[index];
    }

    getGradient(colors, bounds) {
        var gradient = this.ctx.createLinearGradient(bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]);

        for (var i = 0; i < colors.length; ++i) {
            var string = "rgb(" + colors[i][0] + "," + colors[i][1] + "," + colors[i][2] + ")";
            gradient.addColorStop(i / (colors.length - 1), string);
        }

        return gradient;
    }

    generatePolygons() {
        var xStep = this.polygonDimensions[0];
        var yStep = this.polygonDimensions[1];

        var height = this.ctx.canvas.height;
        var width = this.ctx.canvas.width;

        var yElements = parseInt(height / yStep) + 2;
        var xElements = parseInt(width / xStep) + 2;

        this.vertices = new Array(xElements * yElements);
        this.polygons = [];

        for (var y = 0; y < yElements; ++y) {
            for (var x = 0; x < xElements; ++x) {
                this.vertices[y * xElements + x] = this.generateVertex(x, y, xStep, yStep, xElements, yElements);

                if ((y + 1) < yElements && (x + 1) < xElements) {
                    var polygon = new Polygon(x, y, xElements, yElements, 0);
                    polygon.push(y * xElements + x);
                    polygon.push(y * xElements + x + 1);
                    if (!this.generateTriangles) polygon.push((y + 1) * xElements + x + 1);
                    polygon.push((y + 1) * xElements + x);
                    this.polygons.push(polygon);

                    if (this.generateTriangles) {
                        polygon = new Polygon(x, y, xElements, yElements, 1);
                        polygon.push(y * xElements + x + 1);
                        polygon.push((y + 1) * xElements + x);
                        polygon.push((y + 1) * xElements + x + 1);

                        this.polygons.push(polygon);
                    }
                }
            }
        }
    }

    generateVertex(x, y, xStep, yStep, xElements, yElements) {
        var xDistortion = (x > 0 && (x + 1) < xElements) * xStep * this.distortionScale;
        var yDistortion = (y > 0 && (y + 1) < yElements) * yStep * this.distortionScale;

        xDistortion = (Math.random() * (xDistortion * 2)) - xDistortion;
        yDistortion = (Math.random() * (yDistortion * 2)) - yDistortion;

        var xCoord = x * xStep + xDistortion;
        var yCoord = y * yStep + yDistortion;

        return new Vector2(xCoord, yCoord);
    }

    rotateArea(area, angle) {
        var degree = angle * (180 / Math.PI);

        var c1 = area[0];
        var c2 = area[1];

        var center = [
            (c2[0] + c1[0]) / 2,
            (c2[1] + c1[1]) / 2
        ];

        var d1 = c2[0] - center[0];
        var d2 = c2[1] - center[1];
        var radius = Math.sqrt(d1 * d1 + d2 * d2);

        var point1 = [
            center[0] + radius * Math.cos(degree),
            center[1] + radius * Math.sin(degree)
        ];

        d1 = point1[0] - center[0];
        d2 = point1[1] - center[1];
        var point2 = [
            center[0] - d1,
            center[1] - d2
        ];

        return [point2, point1];
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Polygon extends Array {
    constructor(x, y, xEnd, yEnd, offset) {
        super();

        this.x = x;
        this.y = y;
        this.xEnd = xEnd;
        this.yEnd = yEnd;
        this.offset = offset;
        this.angle = Math.random() * 360;
    }

    calculateColor(colors, offset, left) {
        offset = (offset || 0) + this.offset;
        var xFactor = ((left ? this.x : this.xEnd - this.x) * 2 + offset) / (this.xEnd * 2);
        var yFactor = (this.y * 2 + offset) / (this.yEnd * 2);

        var factor = (xFactor + yFactor) / 2;

        var startIndex = parseInt(factor * (colors.length - 1));

        var step = 1 / (colors.length - 1);
        var cFactor = (factor - (startIndex * step)) / step;

        var result = [];

        for (var i = 0; i < colors[0].length; ++i) {
            var value1 = colors[startIndex][i];
            var value2 = colors[startIndex + 1][i];

            var value = value2 * cFactor + (1 - cFactor) * value1;
            result[i] = parseInt(value);
        }

        return result;
    }

    calculateGradient(colors, left) {
        var color1 = this.calculateColor(colors, 0, left);
        var color2 = this.calculateColor(colors, 1, left);

        return [color1, color2];
    }

    calculateBounds(vertices, relative) {
        var vertex = vertices[this[0]];
        var min = [vertex.x, vertex.y];
        var max = [vertex.x, vertex.y];

        for (var i = 0; i < this.length; ++i) {
            vertex = vertices[this[i]];

            if (vertex.x < min[0]) min[0] = vertex.x;
            if (vertex.y < min[0]) min[0] = vertex.y;

            if (vertex.x > max[0]) max[0] = vertex.x;
            if (vertex.y > max[0]) max[0] = vertex.y;
        }

        if (relative) {
            max[0] -= min[0];
            max[1] -= min[1];

            min = [0, 0];
        }

        return [min, max];
    }
}