document.addEventListener("DOMContentLoaded", () => {
  const onboarding = document.getElementById("onboarding");
  const mainContent = document.getElementById("main-content");
  const saveSignButton = document.getElementById("save-sign");
  const zodiacSignInput = document.getElementById("zodiac-sign");
  const forecastTitle = document.getElementById("forecast-title");
  const forecastSummary = document.getElementById("forecast-summary");
  const recommendationsDiv = document.getElementById("recommendations");
  const exportSheetsButton = document.getElementById("export-sheets");

  // Check if zodiac sign is saved
  chrome.storage.sync.get("zodiacSign", ({ zodiacSign }) => {
    if (zodiacSign) {
      onboarding.style.display = "none";
      mainContent.style.display = "block";
      displayRecommendations(zodiacSign);
    }
  });

  // Save zodiac sign
  saveSignButton.addEventListener("click", () => {
    const zodiacSign = zodiacSignInput.value;
    if (zodiacSign) {
      chrome.storage.sync.set({ zodiacSign }, () => {
        onboarding.style.display = "none";
        mainContent.style.display = "block";
        displayRecommendations(zodiacSign);
      });
    }
  });

  // Display recommendations
  function displayRecommendations(zodiacSign) {
    chrome.runtime.sendMessage({ action: "getRecommendations", zodiacSign }, (response) => {
      forecastTitle.textContent = `Today's Forecast for ${zodiacSign}`;
      forecastSummary.textContent = response.summary;

      recommendationsDiv.innerHTML = "";
      response.structuredData.activities.forEach(activity => {
        const recommendation = document.createElement("div");
        recommendation.className = "recommendation";
        recommendation.textContent = activity;
        recommendationsDiv.appendChild(recommendation);
      });

      if (response.places && response.places.length > 0) {
        const placesTitle = document.createElement("h2");
        placesTitle.textContent = "Nearby Places";
        recommendationsDiv.appendChild(placesTitle);

        response.places.forEach(place => {
          const placeDiv = document.createElement("div");
          placeDiv.className = "recommendation";
          placeDiv.innerHTML = `<strong>${place.name}</strong><br>${place.vicinity}`;
          recommendationsDiv.appendChild(placeDiv);
        });
      }
    });
  }

  // Export to Sheets
  exportSheetsButton.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        return;
      }

      gapi.load("client", () => {
        gapi.client.setToken({ access_token: token });
        gapi.client.load("sheets", "v4", () => {
          const spreadsheetBody = {
            properties: {
              title: "AstroLocal Recommendations"
            }
          };
          gapi.client.sheets.spreadsheets.create(spreadsheetBody).then((response) => {
            const spreadsheetId = response.result.spreadsheetId;
            const values = [
              ["Forecast", "Summary", "Activities"],
              [forecastSummary.textContent, forecastTitle.textContent, ""]
            ];
            response.structuredData.activities.forEach((activity, index) => {
              if (index === 0) {
                values[1][2] = activity;
              } else {
                values.push(["", "", activity]);
              }
            });
            const body = {
              values: values
            };
            gapi.client.sheets.spreadsheets.values.update({
              spreadsheetId: spreadsheetId,
              range: "Sheet1!A1",
              valueInputOption: "RAW",
              resource: body
            }).then(() => {
              alert(`Successfully exported to Google Sheets! Spreadsheet ID: ${spreadsheetId}`);
            });
          });
        });
      });
    });
  });
});
