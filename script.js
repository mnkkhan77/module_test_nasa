const apiKey = import.meta.env.VITE_API_KEY;

let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

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

    // cause sometimes in the response there is youtube video url instead of am image
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

  if (!searchHistory.includes(date)) {
    searchHistory.push(date);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    updateSearchHistory();
  }
}

function updateSearchHistory() {
  const historyList = document.getElementById("search-history");
  historyList.innerHTML = "";

  searchHistory.forEach((date) => {
    const listItem = document.createElement("li");
    listItem.textContent = date;

    listItem.addEventListener("click", () => {
      getCurrentImageOfTheDay(date);
    });

    historyList.appendChild(listItem);
  });
}

document
  .getElementById("searchButton")
  .addEventListener("click", getImageOfTheDay);

getCurrentImageOfTheDay();
updateSearchHistory();
