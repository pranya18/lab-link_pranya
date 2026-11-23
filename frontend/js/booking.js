
// LABLINK BOOKING SYSTEM

// Ensure sample equipment exists
let items = getData("equipment");

if (items.length === 0) {
    items = [
        {id: 1, name: "Arduino Uno Kit", department: "ECE", quantity: 3, available: 3, emoji: "🔌"},
        {id: 2, name: "Raspberry Pi", department: "CSE", quantity: 2, available: 2, emoji: "💻"},
        {id: 3, name: "FPGA Development Kit", department: "EEE", quantity: 2, available: 1, emoji: "⚡"},
        {id: 4, name: "IoT Sensor Kit", department: "ECE", quantity: 4, available: 4, emoji: "📡"},
        {id: 5, name: "Computer Workstation", department: "CSE", quantity: 5, available: 5, emoji: "🖥️"},
        {id: 6, name: "Robotics Kit", department: "MECH", quantity: 3, available: 2, emoji: "🤖"}
    ];

    saveData("equipment", items);
}

// Populate equipment dropdown
const equipmentSelect = document.getElementById("equipmentSelect");

if (equipmentSelect) {

    items.forEach(item => {

        const option = document.createElement("option");

        option.value = item.id;
        option.textContent = item.name + " - " + item.department;

        equipmentSelect.appendChild(option);

    });

    const selected = localStorage.getItem("selectedEquipment");

    if (selected) {
        equipmentSelect.value = selected;
    }
}

// Set minimum dates
const today = new Date();
const todayString = today.toISOString().split("T")[0];

document.getElementById("bookingDate").min = todayString;
document.getElementById("deadline").min = todayString;

// Check for booking conflicts
function findConflict(equipmentId, date, start, end) {

    const bookings = getData("bookings");

    return bookings.find(booking => {

        if (
            String(booking.equipmentId) !== String(equipmentId) ||
            booking.date !== date ||
            !["Pending", "Approved"].includes(booking.status)
        ) {
            return false;
        }

        // Two slots conflict when their time ranges overlap
        return start < booking.end && end > booking.start;

    });
}

// Find an alternative available slot
function suggestAlternative(equipmentId, date) {

    const slots = [
        ["09:00", "10:00"],
        ["10:00", "11:00"],
        ["11:00", "12:00"],
        ["12:00", "13:00"],
        ["13:00", "14:00"],
        ["14:00", "15:00"],
        ["15:00", "16:00"]
    ];

    const bookings = getData("bookings");

    for (const slot of slots) {

        const conflict = bookings.some(booking => {

            return (
                String(booking.equipmentId) === String(equipmentId) &&
                booking.date === date &&
                ["Pending", "Approved"].includes(booking.status) &&
                slot[0] < booking.end &&
                slot[1] > booking.start
            );

        });

        if (!conflict) {
            return slot;
        }
    }

    return null;
}

// Submit booking
const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const user = getCurrentUser();

        if (!user || user.role !== "student") {
            alert("Please login as a student first.");
            window.location.href = "login.html";
            return;
        }

        const project = document.getElementById("projectName").value.trim();
        const description = document.getElementById("projectDescription").value.trim();
        const equipmentId = Number(equipmentSelect.value);
        const deadline = document.getElementById("deadline").value;
        const date = document.getElementById("bookingDate").value;
        const start = document.getElementById("startTime").value;
        const end = document.getElementById("endTime").value;

        const result = document.getElementById("bookingResult");

        if (!project || !description || !equipmentId || !date || !deadline || !start || !end) {
            alert("Please fill all fields.");
            return;
        }

        if (date < todayString || deadline < todayString) {
            alert("Please select valid future dates.");
            return;
        }

        if (deadline < date) {
            alert("Project deadline cannot be before the booking date.");
            return;
        }

        if (start >= end) {
            alert("End time must be after start time.");
            return;
        }

        const item = items.find(i => i.id === equipmentId);

        if (!item || item.available <= 0) {
            alert("No units of this equipment are currently available.");
            return;
        }

        const conflict = findConflict(equipmentId, date, start, end);

        if (conflict) {

            const alternative = suggestAlternative(equipmentId, date);

            result.innerHTML = `
                <div class="result-card">
                    <h3>⚠ Scheduling Conflict!</h3>
                    <p>This time slot has already been requested or approved.</p>
                    <p>Existing request: ${escapeHTML(conflict.start)} - ${escapeHTML(conflict.end)}</p>
                    ${
                        alternative
                        ? `<p>Suggested alternative: ${alternative[0]} - ${alternative[1]}</p>`
                        : `<p>No free alternative slot was found for this date.</p>`
                    }
                    <p>Please select another time and submit again.</p>
                </div>
            `;

            return;
        }

        const bookings = getData("bookings");

        const newBooking = {

            id: Date.now(),
            email: user.email,
            project: project,
            description: description,
            equipmentId: equipmentId,
            equipment: item.name,
            department: item.department,
            deadline: deadline,
            date: date,
            start: start,
            end: end,
            status: "Pending"

        };

        bookings.push(newBooking);

        saveData("bookings", bookings);

        localStorage.removeItem("selectedEquipment");

        result.innerHTML = `
            <div class="result-card">
                <h3>✓ Request Submitted!</h3>
                <p>Project: ${escapeHTML(project)}</p>
                <p>Equipment: ${escapeHTML(item.name)}</p>
                <p>Date: ${escapeHTML(date)}</p>
                <p>Time: ${escapeHTML(start)} - ${escapeHTML(end)}</p>
                <p>Status: Pending Faculty Approval</p>
            </div>
        `;

        bookingForm.reset();

    });

}
