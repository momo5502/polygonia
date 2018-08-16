window.addEventListener("load", run);

function run() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');

    var gradient = [];
    var colors = parseInt(Math.random() * 3) + 2;

    for (var i = 0; i < colors; ++i) {
        gradient.push("hsl(" + Math.random() * 360 + ", 100%," + (((colors - (i + 1)) * 70) / colors) + "%)");
    }

    var triangles = parseInt(Math.random() * 100) % 2 == 0;

    var polygonRenderer = new PolygonRenderer(context, {
        generateTriangles: triangles,
        distortionScale: triangles ? 0.25 : 0.45,
        polygonDimensions: triangles ? [100, 100] : [80, 80],
        gradient: gradient
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
