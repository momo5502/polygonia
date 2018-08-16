window.addEventListener("load", run);

function run() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');

    var gradient = [];
    var colors = parseInt(Math.random() * 2) + 2;

    for (var i = 0; i < colors; ++i) {
        gradient.push([parseInt(Math.random() * 256), parseInt(Math.random() * 256), parseInt(Math.random() * 256)]);
    }

    var polygonRenderer = new PolygonRenderer(context, {
        //generateTriangles: true,
        distortionScale: 0.45,
        polygonDimensions: [80, 80],
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
