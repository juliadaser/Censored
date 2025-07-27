let pressFreedomVals = null; // containes CSV File of all press freedom indexes downloaded from RSF
let userCountry = null; // user's live location

let userCountryVal = null; // press freedom index of user's live location
let SelectedCountryVal = null; // press freedom index of user's selected country

let highestScore = null;
let lowestScore = null;

/*

In this code we are: 
  1. Accessing and processing .csv file
  2. Accessing user's location via API
  3. Setting Left Pixellation Value (by matching user's location to county in .csv file)
  4. Populating the dropdown with countries from csv file. 
  5. Setting Right Pixellation Value (by matching dropdown selection with country in .csv file)
  6. Finding the lowest and highest score (needed in script.js file)

*/

// fetching the CSV file
fetch("data/2025.csv")
  .then((res) => res.text())
  .then((text) => {
    pressFreedomVals = parseCSV(text);
    matchUserCountry(pressFreedomVals); // finding match between unser's location and CSV file
    populateCountryDropdown(pressFreedomVals);
    calculateMinMaxScores(pressFreedomVals);
  });

// processing the CSV file into usable form
function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows[0].split(";").map((h) => h.trim());

  return rows.slice(1).map((line) => {
    // for each data row
    const cols = line.split(";");
    const obj = {};
    headers.forEach((h, i) => {
      let val = cols[i]?.trim() ?? "";
      if (/^[\d,]+$/.test(val)) {
        val = parseFloat(val.replace(",", "."));
      }
      obj[h] = val;
    });
    return obj;
  });
}

/*
END RESULT OF DATA IS:
    [
    { ISO: "FIN", Country_EN: "Finland", "Score 2025": 87.18 },
    { ISO: "EST", Country_EN: "Estonia", "Score 2025": 85.66 },
    ...
    ]
ACCESS COUNTRIES LIKE THIS (Example Finland):
    console.log(data[0]["Score 2025"]); // 87.18 (press freedom score)
    console.log(data[0]["Country_EN"]); // e.g. (full english name)
*/

// getting user's location + matching the user's live location to a country in the csv file.
async function matchUserCountry(csvData) {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("Failed to fetch location");
    }
    const locationData = await response.json();
    userCountry = locationData.country_name;

    // Set website text to user's current location
    const countryElement = document.getElementById("userCountry");
    if (countryElement) {
      countryElement.textContent = userCountry;
    }

    // Matching user's location to their countries press freedom score
    const match = csvData.find(
      (row) => row["Country_EN"]?.toLowerCase() === userCountry.toLowerCase()
    );

    if (match) {
      userCountryVal = match["Score 2025"];
    } else {
      userCountryVal = null;
    }
  } catch (error) {
    console.error("Error fetching location:", error);
    const countryElement = document.getElementById("userCountry");
    if (countryElement) {
      countryElement.textContent = "Unknown";
    }
  }
}

function populateCountryDropdown(csvData) {
  const menu = document.getElementById("dropdownMenu");
  const toggle = document.getElementById("dropdownToggle");
  const dropdown = document.getElementById("dropdown");

  // Clear existing options
  menu.innerHTML = "";

  // Create <li> items for each country
  csvData.forEach((row) => {
    const countryName = row["Country_EN"];
    if (countryName) {
      const li = document.createElement("li");
      li.setAttribute("data-value", countryName);
      li.style.padding = "5px";
      li.style.cursor = "pointer";

      const span = document.createElement("span");
      span.textContent = countryName;
      li.appendChild(span);

      li.addEventListener("click", () => {
        event.stopPropagation();
        toggle.textContent = countryName;
        toggle.setAttribute("data-value", countryName);
        dropdown.classList.remove("open");

        const match = csvData.find(
          (row) =>
            row["Country_EN"]?.toLowerCase() === countryName.toLowerCase()
        );
        SelectedCountryVal = match ? match["Score 2025"] : null;

        console.log("Selected:", countryName, SelectedCountryVal);

        const political_score = row["Political Context"];
        const economic_score = row["Economic Context"];
        const legislative_score = row["Legal Context"];
        const social_score = row["Social Context"];
        const security_score = row["Safety"];

        dataviz(
          countryName,
          political_score,
          economic_score,
          legislative_score,
          social_score,
          security_score
        );
      });

      // (Optional) JS hover for debug/logging
      li.addEventListener("mouseenter", () => {
        console.log("Hovering:", countryName);
      });

      menu.appendChild(li);
    }
  });
}

// Calculating the lowest and highest score
function calculateMinMaxScores(data) {
  const scores = data
    .map((row) => row["Score 2025"])
    .filter((val) => typeof val === "number" && !isNaN(val));

  lowestScore = Math.min(...scores);
  highestScore = Math.max(...scores);
}

function dataviz(
  selectedCounty, // <== parameter name
  political_score,
  economic_score,
  legislative_score,
  social_score,
  security_score
) {
  let container = document.getElementById("analyzed-country");

  let prefix = "Score Breakdown of ";
  let countryName = selectedCounty; // Use the parameter passed in!

  // First set static prefix
  container.textContent = prefix;

  // Create a span for the country name that you scramble
  let countrySpan = document.createElement("span");
  countrySpan.style.fontWeight = "bold";
  container.appendChild(countrySpan);

  // Run scrambleText on countrySpan
  scrambleText(countrySpan, countryName, 200, 20);

  const political_categoy = document.getElementById("political");
  const economic_categoy = document.getElementById("economic");
  const legislative_categoy = document.getElementById("legislative");
  const social_categoy = document.getElementById("social");
  const security_categoy = document.getElementById("security");

  political_categoy.style.width = political_score + "%";
  economic_categoy.style.width = economic_score + "%";
  legislative_categoy.style.width = legislative_score + "%";
  social_categoy.style.width = social_score + "%";
  security_categoy.style.width = security_score + "%";

  const political_categoy_num = document.getElementById("political_num");
  const economic_categoy_num = document.getElementById("economic_num");
  const legislative_categoy_num = document.getElementById("legislative_num");
  const social_categoy_num = document.getElementById("social_num");
  const security_categoy_num = document.getElementById("security_num");

  political_categoy_num.innerHTML = Math.round(political_score) + "/100";
  economic_categoy_num.innerHTML = Math.round(economic_score) + "/100";
  legislative_categoy_num.innerHTML = Math.round(legislative_score) + "/100";
  social_categoy_num.innerHTML = Math.round(social_score) + "/100";
  security_categoy_num.innerHTML = Math.round(security_score) + "/100";
}
