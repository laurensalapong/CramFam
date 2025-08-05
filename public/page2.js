// Typing animation for title
const headingText = "Choose Your Availability";
const typedAvailability = document.getElementById("typedAvailability");
let index = 0;

function typeWriterHeading() {
  if (index < headingText.length) {
    typedAvailability.textContent += headingText.charAt(index);
    index++;
    setTimeout(typeWriterHeading, 80);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  typeWriterHeading();
});

// Flatpickr for date range
flatpickr("#dateRange", {
  mode: "range",
  dateFormat: "Y-m-d",
  onClose: function (selectedDates) {
    if (selectedDates.length === 2) {
      generateDateBlocks(selectedDates[0], selectedDates[1]);
    }
  }
});

// Format date
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function generateDateBlocks(startDate, endDate) {
  const container = document.getElementById("availability-container");
  container.innerHTML = "";

  const currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    const formatted = formatDate(currentDate);
    const dateISO = currentDate.toISOString().split("T")[0];

    const block = document.createElement("div");
    block.className = "date-block";
    block.innerHTML = `
      <h3>${formatted}</h3>
      <label>
        <input type="checkbox" class="allday-toggle" data-date="${dateISO}">
        Available All Day
      </label>
      <label style="margin-left: 1rem;">
        <input type="checkbox" class="notavailable-toggle" data-date="${dateISO}">
        Not Available
      </label>
      <div class="time-range" id="range-${dateISO}">
        <label>From: <input type="time" name="start-${dateISO}" required></label>
        <label>To: <input type="time" name="end-${dateISO}" required></label>
      </div>
    `;

    container.appendChild(block);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  document.getElementById("submitWrapper").style.display = "flex";

  document.querySelectorAll(".allday-toggle, .notavailable-toggle").forEach(input => {
    input.addEventListener("change", handleMutualExclusivity);
  });

  document.querySelectorAll('input[type="time"]').forEach(input => {
    input.addEventListener("input", handleMutualExclusivity);
  });

  validateInputs();
}

function handleMutualExclusivity() {
  const blocks = document.querySelectorAll(".date-block");

  blocks.forEach(block => {
    const allDayCB = block.querySelector(".allday-toggle");
    const notAvailCB = block.querySelector(".notavailable-toggle");
    const inputs = block.querySelectorAll('input[type="time"]');

    if (notAvailCB.checked) {
      allDayCB.disabled = true;
      inputs.forEach(input => {
        input.disabled = true;
        input.value = "";
      });
    } else if (allDayCB.checked) {
      notAvailCB.disabled = true;
      inputs.forEach(input => {
        input.disabled = true;
        input.value = "";
      });
    } else if ([...inputs].some(i => i.value)) {
      allDayCB.disabled = true;
      notAvailCB.disabled = true;
    } else {
      allDayCB.disabled = false;
      notAvailCB.disabled = false;
      inputs.forEach(input => input.disabled = false);
    }
  });
}

function validateInputs() {
  const blocks = document.querySelectorAll(".date-block");
  let allValid = true;

  blocks.forEach(block => {
    const checkboxAllDay = block.querySelector(".allday-toggle");
    const checkboxNotAvail = block.querySelector(".notavailable-toggle");
    const timeInputs = block.querySelectorAll('input[type="time"]');

    if (!checkboxAllDay.checked && !checkboxNotAvail.checked) {
      const start = timeInputs[0].value;
      const end = timeInputs[1].value;
      if (!start || !end) {
        allValid = false;
      }
    }
  });

  const submitBtn = document.getElementById("submitAvailabilityBtn");
  submitBtn.disabled = !allValid;
}

document.addEventListener("input", validateInputs);
document.addEventListener("change", validateInputs);

// Submit handler
document.getElementById("submitAvailabilityBtn").addEventListener("click", async () => {
  const blocks = document.querySelectorAll(".date-block");
  let availability = [];

  for (const block of blocks) {
    const dateText = block.querySelector("h3").textContent;
    const date = block.querySelector(".allday-toggle").dataset.date;
    const allDayCB = block.querySelector(".allday-toggle");
    const notAvailCB = block.querySelector(".notavailable-toggle");
    const inputs = block.querySelectorAll("input[type='time']");

    if (notAvailCB.checked) {
      // Skip "not available" days - don't add them to availability
      continue;
    } else if (allDayCB.checked) {
      availability.push({ date, start: `${date}T00:00`, end: `${date}T23:59` });
    } else {
      const start = inputs[0].value;
      const end = inputs[1].value;
      if (!start || !end) {
        alert(`Please enter time range for ${dateText}`);
        return;
      }

      availability.push({
        date,
        start: `${date}T${start}`,
        end: `${date}T${end}`
      });
    }
  }

  // Get the data from localStorage
  const name = localStorage.getItem("userName");
  const eventId = localStorage.getItem("eventId");

  // Debug logging
  console.log("Submitting availability:", { name, eventId, availability });

  if (!eventId) {
    alert("Missing event ID. Please start from the beginning.");
    return;
  }

  if (!name) {
    alert("Missing user name. Please start from the beginning.");
    return;
  }

  try {
    const response = await fetch("/saveAvailability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, eventId, availability })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      alert("Failed to save availability. Please try again.");
      return;
    }

    const result = await response.json();
    console.log("Success:", result);

    // Add a small delay to ensure server has processed the data
    setTimeout(() => {
      window.location.href = `page3.html?eventId=${eventId}`;
    }, 500);

  } catch (error) {
    console.error("Error saving availability:", error);
    alert("Something went wrong. Please try again.");
  }
});