import "./style.css";

const APP_NAME = "Eder's Cool App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;


const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'canvas';
app.appendChild(canvas);

const context = canvas.getContext('2d');


//clear button
const clearButton = document.createElement('button');
clearButton.textContent = 'Clear';
app.appendChild(clearButton);

let isDrawing = false;
let points: [number, number] [] [] = [];
let currentPath: [number, number] [] = [];

const drawingChanged = new Event("drawing-changed");

function addPoint(x: number, y: number) {
    currentPath.push([x, y]);
    canvas.dispatchEvent(drawingChanged);
}

canvas.addEventListener('mousedown', (event) => {
    currentPath = [];
    addPoint(event.offsetX, event.offsetY);
    isDrawing = true;
  });
  
  
  globalThis.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
      if (currentPath.length > 0) {
        points.push(currentPath);
      }
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
        addPoint(event.offsetX, event.offsetY);
    }
  });

  //observer for drawing-changed
  canvas.addEventListener('drawing-changed', redrawCanvas);

  function redrawCanvas() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;
    context.strokeStyle = 'blue';

    for (const path of points) {
        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);
        for (const point of path) {
            context.lineTo(point[0], point[1]);
        }
        context.stroke();
        context.closePath();
    }

    /*this part needed to be added because before when I would
    try to draw lines, they would only appear after I had released the mouse
    and when I had begun to start the other line
    this way, they are now appearing as you draw them*/
    if (currentPath.length > 0) {
        context.beginPath();
        context.moveTo(currentPath[0][0], currentPath[0][1]);
        for (const point of currentPath) {
            context.lineTo(point[0], point[1]);
        }
        context.stroke();
        context.closePath();
    }
  }
  

  
  //clearButton
  clearButton.addEventListener('click', () => {
    if (!context) return; //this line included to get pass a 'context possibly null error' that was being thrown
    context.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
  });


