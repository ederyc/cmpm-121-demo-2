import "./style.css";

const APP_NAME = "Eder's Cool App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;


const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'canvas';
app.appendChild(canvas);

