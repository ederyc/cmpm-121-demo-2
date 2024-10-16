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
let x = 0;
let y = 0;

canvas.addEventListener('mousedown', (event) => {
    x = event.offsetX;
    y = event.offsetY;
    isDrawing = true;
  });
  
  
  globalThis.addEventListener('mouseup', () => {
    if (isDrawing) {
      isDrawing = false;
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
      drawLine(x, y, event.offsetX, event.offsetY);
      x = event.offsetX;
      y = event.offsetY;
    }
  });
  
  //function to draw
  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (!context) return; //this line included to get pass a 'context possibly null error' that was being thrown
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = 'blue';
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }
  
  //clearButton
  clearButton.addEventListener('click', () => {
    if (!context) return; //this line included to get pass a 'context possibly null error' that was being thrown
    context.clearRect(0, 0, canvas.width, canvas.height);
  });


