let title = document.getElementById("intro-title");
let credits = document.getElementById("intro-credits");
let description = document.getElementById("intro-description");
let analyzeTitle = document.getElementById("analyzed-country");
let dataTitle = document.getElementById("dataTitle");
let defTitle = document.getElementById("defTitle");

function removeOverlay() {
  document.getElementById("landing-overlay").style.display = "none";
}

function togglePopups(popupId, titleId) {
  const allPopups = document.querySelectorAll(".pop-up");
  const allTitles = document.querySelectorAll(".title");

  allPopups.forEach((popup) => {
    if (popup.id === popupId) {
      const isHidden = window.getComputedStyle(popup).display === "none";
      popup.style.display = isHidden ? "block" : "none";
      document.getElementById(titleId).innerHTML = isHidden
        ? "&uarr;"
        : "&darr;";
    } else {
      popup.style.display = "none";
    }
  });

  allTitles.forEach((title) => {
    if (title.id !== titleId) {
      title.innerHTML = "&darr;";
    }
  });
}

window.onload = function () {
  scrambleText(title, "Censored", 1000, 20);
  document.querySelectorAll(".fade-in").forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, index * 300);
  });
};

function scrambleText(element, finalText, duration, fps) {
  const chars = "!@BLIWNCP1FEqrguwievslqWGWLA90247{";
  const intervalTime = 1000 / fps;
  const totalFrames = Math.floor(duration / intervalTime);
  let frame = 0;
  const length = finalText.length;

  const interval = setInterval(() => {
    let output = "";

    for (let i = 0; i < length; i++) {
      const currentChar = finalText[i];

      if (currentChar === " ") {
        output += " "; // Always show spaces
      } else if (frame / totalFrames > i / length) {
        output += currentChar;
      } else {
        output += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = output;
    frame++;

    if (frame >= totalFrames) {
      clearInterval(interval);
      element.textContent = finalText;
    }
  }, intervalTime);
}
