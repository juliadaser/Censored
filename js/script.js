const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = parseInt(canvas.dataset.width, 10);
let isDragging = false;
let splitX;

let fallbackImg = null;
let usingFallback = false;

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

// INFO POPUP BUTTON
let infoBtn = document.getElementById("infoButton");
let infoPopup = document.getElementById("infoPopup");
let popUpShowing = false;

// CANVAS SIZING
function getResponsiveCanvasWidth() {
  if (window.matchMedia("(max-width: 700px)").matches) {
    return 350; // mobile
  } else if (window.matchMedia("(max-width: 780px)").matches) {
    return 650; // tablet
  } else {
    return 750; // desktop
  }
}

function displayInfo() {
  if (popUpShowing == false) {
    infoPopup.style.display = "block";
    if (window.matchMedia("(max-width: 780px)").matches) {
      infoPopup.scrollIntoView({ behavior: "smooth" });
    }
    scrambleText(dataTitle, "Data", 900, 20);
    scrambleText(defTitle, "Definition", 700, 20);
    popUpShowing = true;
  } else if (popUpShowing == true) {
    infoPopup.style.display = "none";
    popUpShowing = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let title = document.getElementById("mainTitle");
  let subtitle = document.getElementById("subtitle");
  let infoButton = document.getElementById("infoButton");

  title.addEventListener("mouseenter", () => {
    scrambleText(title, "CENSORED", 1000, 20);
  });
  infoButton.addEventListener("mouseenter", () => {
    scrambleText(infoButton, "INFO", 400, 20);
  });
});

function updateCanvasSizeWithAspectRatio() {
  const canvasWidth = getResponsiveCanvasWidth();
  canvas.setAttribute("data-width", canvasWidth);
  splitX = canvasWidth / 2;

  const aspectRatio = video.videoWidth / video.videoHeight || 4 / 3; // Fallback ratio
  const calculatedHeight = canvasWidth / aspectRatio;

  canvas.width = canvasWidth;
  canvas.height = calculatedHeight;
  // document.getElementById('infoPopup').style.height = calculatedHeight;

  dropDowns.style.width = canvasWidth + 2 + "px";
  dropDownMenu.style.height = calculatedHeight - 1 + "px";
}

window.addEventListener("resize", () => {
  if (usingFallback && fallbackImg?.videoWidth) {
    resizeCanvasToFallbackVideo();
  } else if (video.videoWidth) {
    updateCanvasSizeWithAspectRatio();
  }
});

function resizeCanvasToFallbackVideo() {
  const responsiveWidth = getResponsiveCanvasWidth();
  const aspectRatio = fallbackImg.videoHeight / fallbackImg.videoWidth;
  const responsiveHeight = responsiveWidth * aspectRatio;

  canvas.width = responsiveWidth;
  canvas.height = responsiveHeight;

  splitX = canvas.width / 2;
  dropDowns.style.width = canvas.width + 2 + "px";
  dropDownMenu.style.height = canvas.height - 1 + "px";
}

// Step 4: Get webcam and update canvas
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;

    video.addEventListener("loadedmetadata", () => {
      updateCanvasSizeWithAspectRatio(); // Initial draw once we have metadata
    });
  })
  .catch((err) => {
    console.error("Webcam error:", err);
    useFallbackVideo();
  });

function useFallbackVideo() {
  const fallbackVideo = document.createElement("video");
  fallbackVideo.src = "asset/Untitled.mov";
  fallbackVideo.loop = true;
  fallbackVideo.muted = true;
  fallbackVideo.autoplay = true;
  fallbackVideo.playsInline = true;

  fallbackVideo.addEventListener("loadedmetadata", () => {
    usingFallback = true;
    fallbackImg = fallbackVideo; // reuse the same variable

    const responsiveWidth = getResponsiveCanvasWidth();
    const aspectRatio = fallbackVideo.videoHeight / fallbackVideo.videoWidth;
    const responsiveHeight = responsiveWidth * aspectRatio;

    canvas.width = responsiveWidth;
    canvas.height = responsiveHeight;

    splitX = responsiveWidth / 2;
    dropDowns.style.width = responsiveWidth + 2 + "px";
    dropDownMenu.style.height = responsiveHeight - 1 + "px";

    fallbackVideo.play();
    requestAnimationFrame(draw);
  });

  fallbackVideo.onerror = () => {
    console.error("Failed to load fallback video.");
  };
}

// Checking if mouse is within 10px of splitX.
canvas.addEventListener("mousedown", (e) => {
  if (Math.abs(e.offsetX - splitX) < 60) isDragging = true;
});

// Updating splitX when dragging mouse
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) splitX = Math.max(26, Math.min(canvas.width - 24, e.offsetX));
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

const arrowIcon = document.getElementById("arrow-icon");

function updateIconPosition() {
  const rect = canvas.getBoundingClientRect();
  const handleWidth = arrowIcon.offsetWidth;
  const handleHeight = arrowIcon.offsetHeight;

  arrowIcon.style.left = `${
    rect.left + window.scrollX + splitX - handleWidth / 2
  }px`;
  arrowIcon.style.top = `${
    rect.top +
    window.scrollY +
    canvas.height -
    10 -
    30 +
    (30 - handleHeight) / 2
  }px`;
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

  const source = usingFallback ? fallbackImg : video;

  offLeftCtx.drawImage(
    source,
    0,
    0,
    UsrCountryCanvas.width,
    UsrCountryCanvas.height
  );
  offRightCtx.drawImage(
    source,
    0,
    0,
    SelCountryCanvas.width,
    SelCountryCanvas.height
  );
  // offLeftCtx.drawImage(
  //   video,
  //   0,
  //   0,
  //   UsrCountryCanvas.width,
  //   UsrCountryCanvas.height
  // );
  // offRightCtx.drawImage(
  //   video,
  //   0,
  //   0,
  //   SelCountryCanvas.width,
  //   SelCountryCanvas.height
  // );

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
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke();

  const rectWidth = 40;
  const rectHeight = 30;
  const rectX = splitX - rectWidth / 2;
  const rectY = canvas.height - 10 - rectHeight;

  // update position of arrow-icon:
  updateIconPosition();

  requestAnimationFrame(draw);
}

video.addEventListener("play", () => requestAnimationFrame(draw));

//ADD COUNTRIES

const dropdown = document.getElementById("dropdown");
const toggle = document.getElementById("dropdownToggle");
const menu = document.getElementById("dropdownMenu");
const options = menu.querySelectorAll("li");

menu.style.fontFamily = "Geist";

// Open/close dropdown on toggle button click
dropdown.addEventListener("click", () => {
  dropdown.classList.toggle("open");
});

options.forEach((option) => {
  option.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent container click toggle
    toggle.textContent = option.textContent;
    toggle.setAttribute("data-value", option.getAttribute("data-value"));
    dropdown.classList.remove("open");
    console.log("Selected:", option.getAttribute("data-value"));
  });
});

// Close dropdown on outside click stays the same
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("open");
  }
});
