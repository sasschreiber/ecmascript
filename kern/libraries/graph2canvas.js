var graph2canvas = (function (window) {
    "use strict";

    function findMax(coordinates) {
        var xMax = 0, yMax = 0;
        coordinates.forEach(function(points) {
            if (points.x > xMax) {
                xMax = points.x;
            }
            if (points.y > yMax) {
                yMax = points.y;
            }

        });
        return {xMax : xMax, yMax : yMax};

    }

    function convertCoordinates(coordinates, canvas) {
        var output = [], xMin = 0, yMin = 0;
        var maxValues = graph2canvas.findMax(coordinates);
        var ctx = canvas.getContext('2d');

        var w = ctx.canvas.width;
        var h = ctx.canvas.height;

        var dx = maxValues.xMax - xMin;  
        var dy = maxValues.yMax - yMin;
        coordinates.forEach(function(points) {
            output.push({
                x : Math.round(xMin + points.x * (w/dx)),
                y : Math.round(h - (yMin + points.y * (h/dy)))

            });

        });
        return output;
    }

    function drawPoints(coordinates, canvas) {

        var CTX = canvas.getContext('2d');
        CTX.strokeStyle = window.document.getElementById("graph-color").value;
        CTX.beginPath();

        coordinates.forEach(function(points, count){
            if (count === 0) {
                CTX.moveTo(points.x, points.y);
            } else {
                CTX.lineTo(points.x, points.y);
                CTX.stroke();

            }

        });
        CTX.closePath();

    }

    function createGraph(inputId, canvasId) {
        var input = window.document.getElementById(inputId).value;
        var canvas = window.document.getElementById(canvasId);
        var pointArr;
        coordinates = [];
        input.split(",").forEach(function(points) {
            pointArr = points.split(":");
            coordinates.push({x : parseInt(pointArr[0]), y : parseInt(pointArr[1])});


        });
        var coordinates = graph2canvas.sortByKey(coordinates, "x");
        var screenCoordinates = graph2canvas.convertCoordinates(coordinates, canvas);
        graph2canvas.drawPoints(screenCoordinates, canvas);


    }

    // Stackoverflow, sorting arrays by object key
    // http://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
    function sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    function setCanvasSize(canvasId, w, h) {
        var canvas = window.document.getElementById(canvasId);
        //var ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;

    }


return {convertCoordinates:convertCoordinates, findMax : findMax, drawPoints: drawPoints, createGraph : createGraph, sortByKey : sortByKey, setCanvasSize:setCanvasSize};
} (window));