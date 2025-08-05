// Get eventId from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get("eventId");

// Typing animation
document.addEventListener("DOMContentLoaded", async () => {
  const typedGuestTitle = document.getElementById("typedGuestTitle");
  
  if (!eventId) {
    typedGuestTitle.textContent = "Error: Invalid event link";
    return;
  }

  try {
    // Fetch event details to show in the title
    const eventRes = await fetch(`/getEventDetails?eventId=${eventId}`);
    if (eventRes.ok) {
      const { eventName, hostName } = await eventRes.json();
      const message = `Welcome to ${hostName}'s event: "${eventName}"!`;
      
      let i = 0;
      function typeWriter() {
        if (i < message.length) {
          typedGuestTitle.textContent += message.charAt(i);
          i++;
          setTimeout(typeWriter, 70);
        }
      }
      typeWriter();
    } else {
      typedGuestTitle.textContent = "Welcome! Add your availability below.";
    }
  } catch (err) {
    console.error("Error fetching event details:", err);
    typedGuestTitle.textContent = "Welcome! Add your availability below.";
  }
});

flatpickr("#guestDateRange", {
  mode: "range",
  dateFormat: "Y-m-d",
  onClose: function (selectedDates) {
    if (selectedDates.length === 2) {
      generateGuestDateBlocks(selectedDates[0], selectedDates[1]);
    }
  }
});

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function generateGuestDateBlocks(startDate, endDate) {
  const container = document.getElementById("guest-availability-container");
  container.innerHTML = "";

  const current = new Date(startDate);
  const final = new Date(endDate);

  while (current <= final) {
    const dateStr = current.toISOString().split("T")[0];
    const formatted = formatDate(current);

    const block = document.createElement("div");
    block.className = "date-block";
    block.innerHTML = `
      <h3>${formatted}</h3>
      <label>
        <input type="checkbox" class="allday-toggle" data-date="${dateStr}"> Available All Day
      </label>
      <label>
        <input type="checkbox" class="notavailable-toggle" data-date="${dateStr}"> Not Available
      </label>
      <div class="time-range" id="range-${dateStr}">
        <label>From: <input type="time" name="start-${dateStr}" required></label>
        <label>To: <input type="time" name="end-${dateStr}" required></label>
      </div>
    `;
    container.appendChild(block);
    current.setDate(current.getDate() + 1);
  }

  document.getElementById("submitWrapper").style.display = "flex";

  document.querySelectorAll(".allday-toggle, .notavailable-toggle").forEach(cb => {
    cb.addEventListener("change", function () {
      const date = this.dataset.date;
      const range = document.getElementById(`range-${date}`);
      const start = range.querySelector(`input[name="start-${date}"]`);
      const end = range.querySelector(`input[name="end-${date}"]`);

      if (this.classList.contains("allday-toggle")) {
        document.querySelector(`.notavailable-toggle[data-date="${date}"]`).checked = false;
        if (this.checked) {
          start.disabled = true; end.disabled = true;
          start.value = ""; end.value = "";
        } else {
          start.disabled = false; end.disabled = false;
        }
      } else {
        document.querySelector(`.allday-toggle[data-date="${date}"]`).checked = false;
        if (this.checked) {
          start.disabled = true; end.disabled = true;
          start.value = ""; end.value = "";
        } else {
          start.disabled = false; end.disabled = false;
        }
      }
      validateInputs();
    });
  });

  document.querySelectorAll('input[type="time"]').forEach(input => {
    input.addEventListener("input", validateInputs);
  });

  validateInputs();
}

function validateInputs() {
  const blocks = document.querySelectorAll(".date-block");
  let allValid = true;

  blocks.forEach(block => {
    const allDay = block.querySelector(".allday-toggle").checked;
    const none = block.querySelector(".notavailable-toggle").checked;
    const inputs = block.querySelectorAll('input[type="time"]');
    if (!allDay && !none) {
      if (!inputs[0].value || !inputs[1].value) allValid = false;
    }
  });

  const btn = document.getElementById("submitGuestAvailabilityBtn");
  btn.disabled = !allValid;
}

document.getElementById("submitGuestAvailabilityBtn").addEventListener("click", async () => {
  const name = document.getElementById("guestName").value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  if (!eventId) {
    alert("Invalid event link. Please check the URL.");
    return;
  }

  const blocks = document.querySelectorAll(".date-block");
  const availability = [];

  for (const block of blocks) {
    const date = block.querySelector(".allday-toggle").dataset.date;
    const formatted = formatDate(new Date(date));
    const allDay = block.querySelector(".allday-toggle").checked;
    const none = block.querySelector(".notavailable-toggle").checked;
    const start = block.querySelector(`input[name="start-${date}"]`).value;
    const end = block.querySelector(`input[name="end-${date}"]`).value;

    if (none) continue; // Skip "not available" days

    if (allDay) {
      availability.push({ date, start: `${date}T00:00`, end: `${date}T23:59` });
    } else {
      if (!start || !end) {
        alert(`Please enter time range for ${formatted}`);
        return;
      }
      availability.push({ date, start: `${date}T${start}`, end: `${date}T${end}` });
    }
  }

  console.log("Submitting guest availability:", { name, availability, eventId });

  try {
    const res = await fetch(`/submitGuestAvailability?eventId=${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, availability })
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Success:", result);
      
      // Redirect to the shared calendar to see everyone's availability
      window.location.href = `page3.html?eventId=${eventId}`;
    } else {
      const errorText = await res.text();
      console.error("Server error:", errorText);
      alert("Error saving availability: " + errorText);
    }
  } catch (err) {
    console.error("Submit error:", err);
    alert("Submission failed. Please try again.");
  }
});