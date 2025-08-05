// Typing animation for main title
const titleText = "Welcome to CramFam!";
const typedTitle = document.getElementById("typedTitle");
let index = 0;

function typeWriterTitle() {
  if (index < titleText.length) {
    typedTitle.textContent += titleText.charAt(index);
    index++;
    setTimeout(typeWriterTitle, 100);
  }
}

// Start typing animation when page loads
document.addEventListener("DOMContentLoaded", () => {
  typeWriterTitle();
});

// Create event button handler
document.getElementById("createBtn").addEventListener("click", async () => {
  const userName = document.getElementById("name").value.trim();
  const eventName = document.getElementById("event").value.trim();

  if (!userName || !eventName) {
    alert("Please enter both your name and event name.");
    return;
  }

  try {
    const response = await fetch("/createEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, eventName })
    });

    if (!response.ok) throw new Error("Failed to create event");

    const data = await response.json();

    // Store details for next page
    localStorage.setItem("eventId", data.eventId);
    localStorage.setItem("userName", userName);
    localStorage.setItem("eventName", eventName);

    window.location.href = "page2.html?eventId=" + data.eventId;
  } catch (err) {
    console.error("Error creating event:", err);
    alert("Something went wrong. Please try again.");
  }
});