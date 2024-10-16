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

//undo button
const undoButton = document.createElement("button");
undoButton.textContent = 'Undo';
app.appendChild(undoButton);

//redo button
const redoButton = document.createElement("button");
redoButton.textContent = 'Redo';
app.appendChild(redoButton);

let isDrawing = false;
let points: Point[] [] = [];
let currentPath: Point[] = [];

interface Point {
    x: number;
    y: number;
  }
  
  //Arrays to hold drawing states
  let displayList: Point[][] = [];
  let redoStack: Point[][] = []; 
  let currentLine: Point[] = []; 
  

const drawingChanged = new Event("drawing-changed");

function addPoint(x: number, y: number) {
    currentPath.push({x, y});
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
        displayList.push(currentPath);
        redoStack = [];
        canvas.dispatchEvent(drawingChanged);
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
        context.moveTo(path[0].x, path[0].y);
        for (const point of path) {
            context.lineTo(point.x, point.y);
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
        context.moveTo(currentPath[0].x, currentPath[0].y);
        for (const point of currentPath) {
            context.lineTo(point.x, point.y);
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

  undoButton.addEventListener('click', () => {
    if (displayList.length > 0) {
        const lastPath = displayList.pop();
        if (lastPath) {
            redoStack.push(lastPath);
            points.pop();
            canvas.dispatchEvent(drawingChanged);
        }
    }
  });

  redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const redoPath = redoStack.pop();
        if (redoPath) {
            displayList.push(redoPath);
            points.push(redoPath);
            canvas.dispatchEvent(drawingChanged);
        }
    }
  });


