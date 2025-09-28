// Mock AI APIs
const writerAPI = {
  generate(prompt) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Today's planetary alignment for ${prompt.sign} emphasizes rest and deep creative work. Avoid major social commitments and instead focus on introspective hobbies.`);
      }, 500);
    });
  }
};

const promptAPI = {
  generate(prompt) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          activities: ["creative writing", "meditation", "reading a novel"],
          energy_level: "low",
          search_keywords: ["quiet coffee shop", "local library", "used bookstore"]
        });
      }, 500);
    });
  }
};

const summarizerAPI = {
  summarize(text) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("Focus on Communication");
      }, 500);
    });
  }
};

// Core logic
async function getRecommendations(zodiacSign) {
  const forecast = await writerAPI.generate({ sign: zodiacSign, date: new Date().toISOString().slice(0, 10), tone: "Motivational and introspective." });
  const structuredData = await promptAPI.generate(forecast);
  const summary = await summarizerAPI.summarize(forecast);

  // Location search
  const places = await new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const promises = structuredData.search_keywords.map(keyword => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&keyword=${keyword}&key=YOUR_GOOGLE_MAPS_API_KEY`;
        return fetch(url).then(response => response.json());
      });
      const results = await Promise.all(promises);
      resolve(results.flatMap(result => result.results));
    }, () => {
      resolve([]);
    });
  });

  return {
    forecast,
    structuredData,
    summary,
    places
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getRecommendations") {
    getRecommendations(request.zodiacSign).then(sendResponse);
    return true;
  }
});

// Set badge
function setBadge(energyLevel) {
  let badgeText = "";
  let badgeColor = "";

  if (energyLevel === "low") {
    badgeText = "Low";
    badgeColor = "#FF0000";
  } else if (energyLevel === "medium") {
    badgeText = "Mid";
    badgeColor = "#FFFF00";
  } else if (energyLevel === "high") {
    badgeText = "High";
    badgeColor = "#00FF00";
  }

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

// Update badge daily
chrome.alarms.create("daily-update", {
  periodInMinutes: 1440 // 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "daily-update") {
    chrome.storage.sync.get("zodiacSign", ({ zodiacSign }) => {
      if (zodiacSign) {
        getRecommendations(zodiacSign).then(response => {
          setBadge(response.structuredData.energy_level);
        });
      }
    });
  }
});