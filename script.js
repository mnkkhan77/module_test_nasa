const apiKey = import.meta.env.VITE_API_KEY;

// Initialize search history with object format
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
// Migrate old string format to object format
searchHistory = searchHistory.map((item) =>
  typeof item === "string" ? { date: item } : item
);

async function getCurrentImageOfTheDay(enteredDate) {
  try {
    const today = new Date();
    const date = enteredDate || today.toISOString().split("T")[0];
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.url.includes("youtube.com") || data.url.includes("youtu.be")) {
      const videoId = getYouTubeVideoId(data.url);
      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        document.getElementById("current-image").src = thumbnailUrl;
      }
    } else {
      document.getElementById("current-image").src = data.url;
    }

    document.getElementById("image-title").textContent = data.title;
    document.getElementById("image-description").textContent = data.explanation;
  } catch (error) {
    console.error("Error fetching the image:", error);
  }
}

function getYouTubeVideoId(url) {
  const regex =
    /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/))([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getImageOfTheDay() {
  const date = document.getElementById("search-input").value;
  if (!date) return;

  getCurrentImageOfTheDay(date);

  // Check if date exists as object
  const exists = searchHistory.some((item) => item.date === date);
  if (!exists) {
    searchHistory.push({ date }); // Store as object
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    updateSearchHistory();
  }
}

function updateSearchHistory() {
  const historyList = document.getElementById("search-history");
  historyList.innerHTML = "";

  // Show newest first
  searchHistory
    .slice()
    .reverse()
    .forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item.date;
      listItem.style.cursor = "pointer";
      listItem.title = "Click to view this date";

      listItem.addEventListener("click", () => {
        // Update date picker and reload
        document.getElementById("search-input").value = item.date;
        getCurrentImageOfTheDay(item.date);
      });

      historyList.appendChild(listItem);
    });
}

document
  .getElementById("searchButton")
  .addEventListener("click", getImageOfTheDay);

// Initial setup
getCurrentImageOfTheDay();
updateSearchHistory();
