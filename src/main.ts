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
clearButton.id = 'clear-button';
app.appendChild(clearButton);

//undo button
const undoButton = document.createElement("button");
undoButton.textContent = 'Undo';
undoButton.id = 'undo-button';
app.appendChild(undoButton);

//redo button
const redoButton = document.createElement("button");
redoButton.textContent = 'Redo';
redoButton.id = 'redo-button';
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

  currentSticker = null;
  stickerButtons.forEach((btn) => btn.classList.remove('active'));
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

  currentSticker = null;
  stickerButtons.forEach((btn) => btn.classList.remove('active'));
});


//sticker buttons

// Initial stickers array (data-driven)
const stickers = [
  { icon: '😏', name: 'Sticker A' },
  { icon: '👩🏽‍🎤', name: 'Sticker B' },
  { icon: '😼', name: 'Sticker C' }
];

interface Sticker {
  icon: string;
  name: string;
}

// Function to create a sticker button dynamically
function createStickerButton(sticker: Sticker) {
  const button = document.createElement('button');
  button.textContent = sticker.icon;
  app.appendChild(button);

  button.addEventListener('click', () => {
    currentSticker = sticker.icon;
    isDrawing = false; // Disable drawing mode when selecting a sticker
    stickerButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active'); // Highlight the active sticker
    canvas.dispatchEvent(new Event('tool-moved')); // Trigger tool-moved event
  });

  return button;
}

// Create sticker buttons from the array
const stickerButtons = stickers.map(sticker => createStickerButton(sticker));


// Custom sticker button
const customStickerButton = document.createElement('button');
customStickerButton.textContent = 'Create Custom Sticker';
app.appendChild(customStickerButton);

customStickerButton.addEventListener('click', () => {
  const userSticker = prompt("Enter your custom sticker (e.g., emoji or text):", "👀");
  if (userSticker) {
    // Add new sticker to stickers array and create a button for it
    const newSticker = { icon: userSticker, name: `Custom Sticker ${stickers.length + 1}` };
    stickers.push(newSticker);
    const newButton = createStickerButton(newSticker); // Create the new sticker button
    stickerButtons.push(newButton); // Add to the array of sticker buttons
  }
});



//export button

// Create the export button
const exportButton = document.createElement('button');
exportButton.textContent = 'Export';
app.appendChild(exportButton);

// Add the export button functionality
exportButton.addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext('2d');
  
  if (!exportContext) return; // Ensure we have a context
  
  exportContext.scale(4, 4);

  for (const displayable of displayList) {
    if (!(displayable instanceof ToolPreview)) {
      displayable.display(exportContext);
    }
  }

  const anchor = document.createElement('a');
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});




interface Command {
  execute(): void;
}

class StickerPreviewCommand implements Command {
  sticker: string;
  x: number;
  y: number;

  constructor(sticker: string, x: number, y: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
  }

  execute() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(this.sticker, this.x, this.y);
  }
}

class StickerPlacementCommand implements Command {
  sticker: string;
  x: number;
  y: number;
  size: number;

  constructor(sticker: string, x: number, y: number, size: number = 20) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
    this.size = size;
  }

  execute() {
    if (!context) return;
    context.font = `${this.size}px sans-serif`;
    context.fillText(this.sticker, this.x, this.y);
  }

  display() {
    this.execute();
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.execute();
  }
}

let currentSticker: string | null = null;



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
    // Update tool preview position or create if missing
    if (!toolPreview) {
      toolPreview = new ToolPreview(event.offsetX, event.offsetY, lineWidth);
    } else {
      toolPreview.updatePosition(event.offsetX, event.offsetY);
      toolPreview.lineWidth = lineWidth; // Ensure thickness reflects current tool
    }
  
    // If drawing, update the line with new points
    if (isDrawing && currentLine) {
      currentLine.drag(event.offsetX, event.offsetY);
    }
  
    // Dispatch 'drawing-changed' event to continuously update the canvas
    canvas.dispatchEvent(drawingChanged);
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


// Handle tool-moved event to preview the sticker
canvas.addEventListener('tool-moved', (event: Event) => {
  const mouseEvent = event as MouseEvent;
  if (currentSticker) {
    const stickerPreviewCommand = new StickerPreviewCommand(currentSticker, mouseEvent.offsetX, mouseEvent.offsetY);
    stickerPreviewCommand.execute();
  }
});

canvas.addEventListener('mousedown', (event) => {
  // If a sticker is selected, place the sticker
  if (currentSticker) {
    const stickerPlacementCommand = new StickerPlacementCommand(currentSticker, event.offsetX, event.offsetY);
    displayList.push(stickerPlacementCommand); // Add the sticker to the display list
    canvas.dispatchEvent(drawingChanged);
  } else {
    // Otherwise, begin a new line
    currentLine = new MarkerLine(event.offsetX, event.offsetY, lineWidth);
    displayList.push(currentLine);
    isDrawing = true;
  }
});
