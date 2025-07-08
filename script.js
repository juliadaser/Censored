const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const leftSlider = document.getElementById("leftPixelSlider");
const rightSlider = document.getElementById("rightPixelSlider");

const video = Object.assign(document.createElement("video"), {
  autoplay: true,
  playsInline: true,
});

// Dynamic offscreen canvases for pixelation
let offLeft = document.createElement("canvas");
let offRight = document.createElement("canvas");
let offLeftCtx = offLeft.getContext("2d");
let offRightCtx = offRight.getContext("2d");

// Split location and drag state
let splitX = canvas.width / 2;
let isDragging = false;

// Mouse/touch events for dragging the handle

// Below: Checks if the pointer is within 10px of the split line (splitX).
canvas.addEventListener("mousedown", (e) => {
  if (Math.abs(e.offsetX - splitX) < 40) isDragging = true;
});

//Below: While dragging it updates splitX to the current mouse x position (e.offsetX). also clamps the value so splitX stays between 0 and canvas.width.
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) splitX = Math.max(0, Math.min(canvas.width, e.offsetX));
});

//Below: Stopps dragging when mouse is released or cursor leaves canvas area
canvas.addEventListener("mouseup", () => (isDragging = false));
canvas.addEventListener("mouseleave", () => (isDragging = false));

// SAME THING FOR PHONE
canvas.addEventListener("touchstart", (e) => {
  const x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (Math.abs(x - splitX) < 40) isDragging = true;
});

canvas.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    splitX = Math.max(0, Math.min(canvas.width, x));
  }
});

canvas.addEventListener("touchend", () => (isDragging = false));

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Webcam error:", err);
  });

function draw() {
  //default values instead of leftSlider/rightSlider.value
  const leftPixelSize = parseInt(20, 10);
  const rightPixelSize = parseInt(5, 10);

  // Resize offscreen buffers
  offLeft.width = Math.floor(canvas.width / leftPixelSize);
  offLeft.height = Math.floor(canvas.height / leftPixelSize);
  offRight.width = Math.floor(canvas.width / rightPixelSize);
  offRight.height = Math.floor(canvas.height / rightPixelSize);

  offLeftCtx = offLeft.getContext("2d");
  offRightCtx = offRight.getContext("2d");

  offLeftCtx.drawImage(video, 0, 0, offLeft.width, offLeft.height);
  offRightCtx.drawImage(video, 0, 0, offRight.width, offRight.height);

  ctx.imageSmoothingEnabled = false;

  // Mirror the canvas horizontally
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);

  // LEFT side (on screen: right side after mirror)
  ctx.save();
  ctx.beginPath();
  ctx.rect(canvas.width - splitX, 0, splitX, canvas.height);
  ctx.clip();
  ctx.drawImage(
    offLeft,
    0,
    0,
    offLeft.width,
    offLeft.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  // RIGHT side (on screen: left side after mirror)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width - splitX, canvas.height);
  ctx.clip();
  ctx.drawImage(
    offRight,
    0,
    0,
    offRight.width,
    offRight.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  // Draw draggable split handle (just a vertical white line)
  ctx.restore(); // undo mirror
  ctx.beginPath();
  ctx.moveTo(splitX, 0);
  ctx.lineTo(splitX, canvas.height);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  const rectWidth = 40;
  const rectHeight = 30;
  const rectX = splitX - rectWidth / 2;
  const rectY = canvas.height - 10 - rectHeight;

  // Draw filled white rectangle with black border
  ctx.fillStyle = "white";
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

  // Draw "<>" text inside the rectangle
  ctx.fillStyle = "black";
  ctx.font = "23px manrope";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("< >", splitX, rectY + rectHeight / 2);


  requestAnimationFrame(draw);
}

video.addEventListener("play", () => requestAnimationFrame(draw));