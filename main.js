window.addEventListener("load", run);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function run() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');

    var gradient = [];
    var colors = parseInt(Math.random() * 3) + 2;

    for (var i = 0; i < colors; ++i) {
        var hue = getRandomInt(0, 360);
        var saturation = getRandomInt(30, 100);
        var lightness = getRandomInt(((colors - (i + 1)) * 70) / colors, ((colors - (i)) * 70) / colors);
        gradient.push("hsl(" + hue + ", " + saturation + "%," + lightness + "%)");
    }

    var triangles = parseInt(Math.random() * 100) % 2 == 0;
    var colorFromLeft = parseInt(Math.random() * 100) % 2 == 0;

    var polygonRenderer = new PolygonRenderer(context, {
        generateTriangles: triangles,
        distortionScale: triangles ? 0.25 : 0.45,
        polygonDimensions: triangles ? [120, 100] : [80, 80],
        gradient: gradient,
        leftColor: colorFromLeft
    });

    var render = (loop) => {
        polygonRenderer.render();
        if (loop) requestAnimationFrame(render.bind(this, loop));
    };

    window.addEventListener("resize", () => {
        polygonRenderer.resize();
    });

    render(false);
}
