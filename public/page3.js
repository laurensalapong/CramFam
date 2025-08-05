document.addEventListener("DOMContentLoaded", async () => {
  const typedTitle = document.getElementById("typedCalendarTitle");
  const cursor = document.querySelector(".cursor");
  const shareBtn = document.getElementById("shareBtn");
  const calendarEl = document.getElementById("calendar");

  // Get eventId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("eventId");

  if (!eventId) {
    typedTitle.textContent = "Error loading event";
    cursor.style.display = "none";
    return;
  }

  try {
    // Fetch metadata (host name + event name)
    const res = await fetch(`/getEventDetails?eventId=${eventId}`);
    if (!res.ok) throw new Error("Failed to fetch event details");
    const { eventName, hostName } = await res.json();

    // Typing animation
    const message = `Welcome to ${hostName}'s event, ${eventName}!`;
    let index = 0;

    function typeWriter() {
      if (index < message.length) {
        typedTitle.textContent += message.charAt(index);
        index++;
        setTimeout(typeWriter, 70);
      }
    }

    typeWriter();

    // Fetch availability data
    const availRes = await fetch(`/getAvailability?eventId=${eventId}`);
    const data = await availRes.json();
// Define pastel colors to rotate through
const pastelColors = [
  '#fcb1cf', // pink
  '#b5ead7', // mint
  '#c7ceea', // lavender
  '#fcd5ce', // peach
  '#ffdac1', // soft orange
  '#d5aaff', // lilac
  '#a0e7e5', // cyan
  '#ffcbf2', // light pink-purple
];

// Map names to pastel colors
const colorMap = {};
let colorIndex = 0;

const eventsWithColors = data.map(entry => {
  if (!colorMap[entry.title]) {
    colorMap[entry.title] = pastelColors[colorIndex % pastelColors.length];
    colorIndex++;
  }

  return {
    title: entry.title,
    start: entry.start,
    end: entry.end,
    backgroundColor: colorMap[entry.title],
    borderColor: colorMap[entry.title],
  };
});
    console.log("Received availability data:", data);

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "timeGridWeek",
      height: "auto",
      allDaySlot: false,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay"
      },
      events: eventsWithColors
    });
    

    calendar.render();

    // Share button
    shareBtn.addEventListener("click", async () => {
      const shareUrl = `${window.location.origin}/page4.html?eventId=${eventId}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        shareBtn.textContent = "Link Copied!";
        console.log("Link copied:", shareUrl);
        setTimeout(() => {
          shareBtn.textContent = "Copy Link to Share";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          shareBtn.textContent = "Link Copied!";
          setTimeout(() => {
            shareBtn.textContent = "Copy Link to Share";
          }, 2000);
        } catch (fallbackErr) {
          console.error("Fallback copy failed:", fallbackErr);
          alert(`Copy failed. Link: ${shareUrl}`);
        }
        document.body.removeChild(textArea);
      }
    });

  } catch (err) {
    console.error("Error loading event:", err);
    typedTitle.textContent = "Error loading event";
    cursor.style.display = "none";
  }
});