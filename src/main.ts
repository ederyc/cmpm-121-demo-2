import "./style.css";

const APP_NAME = "Eder's Cool App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;


const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'canvas';
app.appendChild(canvas);
//default line width (thin)
let lineWidth = 2; 

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

//thin button
const thinButton = document.createElement('button');
thinButton.textContent = 'Thin';
thinButton.id = 'thin-button';
app.appendChild(thinButton);

thinButton.classList.add('active');

thinButton.addEventListener('click', () => {
  lineWidth = 2;
  thinButton.classList.add('active');
  thickButton.classList.remove('active');
});

//thick button
const thickButton = document.createElement('button');
thickButton.textContent = 'Thick';
thickButton.id = 'thick-button';
app.appendChild(thickButton);

thickButton.addEventListener('click', () => {
  lineWidth = 6;
  thickButton.classList.add('active');
  thinButton.classList.remove('active');
});

let isDrawing = false;
const _points: Point[] [] = [];
const currentPath: Point[] = [];

interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}


class ToolPreview implements Displayable {
  lineWidth: number;
  private x: number = 0;
  private y: number = 0;

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  constructor(x: number, y: number, lineWidth: number) {
    this.lineWidth = lineWidth;
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.save();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = 'white'; 
    context.beginPath();
    context.arc(this.x, this.y, this.lineWidth / 2, 0, Math.PI * 2); 
    context.stroke();
    context.restore();
  }
  

}


class MarkerLine implements Displayable {
  private points: Point [] = [];
  private lineWidth: number;

  constructor(startX: number, startY: number, lineWidth: number) {
    this.points.push({x: startX, y: startY});
    this.lineWidth = lineWidth;
  }

  drag(x: number, y: number) {
    this.points.push({x, y});
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    //set stroke style and width
    context.strokeStyle = 'blue';

    context.beginPath();
    context.lineWidth = this.lineWidth;
    context.moveTo(this.points[0].x, this.points[0].y);
    for (const point of this.points) {
      context.lineTo(point.x, point.y);
    }
    context.stroke();
    context.closePath();
  }
    
}

interface Point {
    x: number;
    y: number;
  }
  
  //Arrays to hold drawing states
  let displayList: Displayable[] = [];
  let redoStack: Displayable[] = []; 
  let currentLine: MarkerLine | null = null; 
  

const drawingChanged = new Event("drawing-changed");


canvas.addEventListener('mousedown', (event) => {
    currentLine = new MarkerLine(event.offsetX, event.offsetY, lineWidth);
    displayList.push(currentLine);
    isDrawing = true;
  });
  
  
  globalThis.addEventListener('mouseup', () => {
    if (isDrawing && currentLine) {
      redoStack = [];
      isDrawing = false;
      canvas.dispatchEvent(drawingChanged);
      currentLine = null
    }

  });

  let toolPreview: ToolPreview | null = null;

  canvas.addEventListener('mousemove', (event) => {
    if (!toolPreview) {
      toolPreview = new ToolPreview(event.offsetX, event.offsetY, lineWidth);
    } else {
      toolPreview.updatePosition(event.offsetX, event.offsetY);
      toolPreview.lineWidth = lineWidth;
    }
    
    if (isDrawing && currentLine) {
      currentLine.drag(event.offsetX, event.offsetY);
      canvas.dispatchEvent(drawingChanged);
    }
    
    // Always dispatch tool-moved to draw the preview
    canvas.dispatchEvent(new Event('tool-moved'));
  });
  
  

  //observer for drawing-changed
  canvas.addEventListener('drawing-changed', redrawCanvas);

  function redrawCanvas() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const displayable of displayList) {
      displayable.display(context);
    }

    if (!isDrawing && toolPreview) {
      toolPreview.display(context);
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
    displayList = []; //clear the displayList
    redoStack = []; //clear the redoStack
    canvas.dispatchEvent(drawingChanged);
  });

  undoButton.addEventListener('click', () => {
    if (displayList.length > 0) {
        const lastPath = displayList.pop();
        if (lastPath) {
            redoStack.push(lastPath);
            canvas.dispatchEvent(drawingChanged);
        }
    }
  });

  redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const redoPath = redoStack.pop();
        if (redoPath) {
            displayList.push(redoPath);
            canvas.dispatchEvent(drawingChanged);
        }
    }
  });


  canvas.addEventListener('tool-moved', () => {
    redrawCanvas();
  });