const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = parseInt(canvas.dataset.width, 10);
let splitX = canvasWidth / 2;
let isDragging = false;

const video = Object.assign(document.createElement("video"), {
  autoplay: true,
  playsInline: true,
});

// Offscreen canvases for pixelation
let UsrCountryCanvas = document.createElement("canvas");
let SelCountryCanvas = document.createElement("canvas");
let offLeftCtx = UsrCountryCanvas.getContext("2d");
let offRightCtx = SelCountryCanvas.getContext("2d");

// accessing the dropdown to adjust position according to screen size
const dropDowns = document.getElementById("dropDowns");
const dropDownMenu = document.querySelector(".dropdown-menu");

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;

    video.addEventListener("loadedmetadata", () => {
      const aspectRatio = video.videoWidth / video.videoHeight;
      const calculatedHeight = canvasWidth / aspectRatio;

      canvas.width = canvasWidth;
      canvas.height = calculatedHeight;

      dropDowns.style.width = canvasWidth + 2 + "px";
      dropDownMenu.style.height = calculatedHeight + "px";
    });
  })
  .catch((err) => {
    console.error("Webcam error:", err);
  });

// Checking if mouse is within 10px of splitX.
canvas.addEventListener("mousedown", (e) => {
  if (Math.abs(e.offsetX - splitX) < 40) isDragging = true;
});

// Updating splitX when dragging mouse
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) splitX = Math.max(0, Math.min(canvas.width, e.offsetX));
});

// Stop dragging when mouse is released or cursor leaves canvas area
canvas.addEventListener("mouseup", () => (isDragging = false));
canvas.addEventListener("mouseleave", () => (isDragging = false));

//phone
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

function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Transforming press freedom index into usable pixellation values
function adjustValue(value) {
  value = Math.max(0, Math.min(100, value));
  if (value == null || lowestScore == null || highestScore == null) {
    return map(value, 0, 100, 100, 1);
  }
  return map(value, lowestScore, highestScore - 1, 100, 1);
}

function draw() {
  //setting pixellation values of both sides
  const UsrCountryPixVal =
    userCountryVal == null ? 1 : adjustValue(userCountryVal);
  const SelCountryPixVal =
    SelectedCountryVal == null ? 1 : adjustValue(SelectedCountryVal);

  // Resize canvases based on pixellation values
  UsrCountryCanvas.width = Math.floor(canvas.width / UsrCountryPixVal);
  UsrCountryCanvas.height = Math.floor(canvas.height / UsrCountryPixVal);
  SelCountryCanvas.width = Math.floor(canvas.width / SelCountryPixVal);
  SelCountryCanvas.height = Math.floor(canvas.height / SelCountryPixVal);

  offLeftCtx = UsrCountryCanvas.getContext("2d");
  offRightCtx = SelCountryCanvas.getContext("2d");

  offLeftCtx.drawImage(
    video,
    0,
    0,
    UsrCountryCanvas.width,
    UsrCountryCanvas.height
  );
  offRightCtx.drawImage(
    video,
    0,
    0,
    SelCountryCanvas.width,
    SelCountryCanvas.height
  );

  ctx.imageSmoothingEnabled = false;

  // Mirror the canvas horizontally
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);

  // scaling the canvas back up, causing pixellation effect
  ctx.save();
  ctx.beginPath();
  ctx.rect(canvas.width - splitX, 0, splitX, canvas.height);
  ctx.clip();
  ctx.drawImage(
    UsrCountryCanvas,
    0,
    0,
    UsrCountryCanvas.width,
    UsrCountryCanvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  // scaling the canvas back up, causing pixellation effect
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width - splitX, canvas.height);
  ctx.clip();
  ctx.drawImage(
    SelCountryCanvas,
    0,
    0,
    SelCountryCanvas.width,
    SelCountryCanvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  // Draw draggable split handle
  ctx.restore();
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

//ADD COUNTRIES

const dropdown = document.getElementById("dropdown");
const toggle = document.getElementById("dropdownToggle");
const menu = document.getElementById("dropdownMenu");
const options = menu.querySelectorAll("li");

toggle.addEventListener("click", () => {
  dropdown.classList.toggle("open");
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    toggle.textContent = option.textContent;
    toggle.setAttribute("data-value", option.getAttribute("data-value"));
    dropdown.classList.remove("open");
    // Optional: trigger a callback or event
    console.log("Selected:", option.getAttribute("data-value"));
  });
});

// Optional: close on outside click
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("open");
  }
});
