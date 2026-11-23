
// LABLINK EQUIPMENT SYSTEM

let equipment = getData("equipment");

// Initial demo equipment
if (equipment.length === 0) {

    equipment = [
        {
            id: 1,
            name: "Arduino Uno Kit",
            department: "ECE",
            quantity: 3,
            available: 3,
            emoji: "🔌"
        },
        {
            id: 2,
            name: "Raspberry Pi",
            department: "CSE",
            quantity: 2,
            available: 2,
            emoji: "💻"
        },
        {
            id: 3,
            name: "FPGA Development Kit",
            department: "EEE",
            quantity: 2,
            available: 1,
            emoji: "⚡"
        },
        {
            id: 4,
            name: "IoT Sensor Kit",
            department: "ECE",
            quantity: 4,
            available: 4,
            emoji: "📡"
        },
        {
            id: 5,
            name: "Computer Workstation",
            department: "CSE",
            quantity: 5,
            available: 5,
            emoji: "🖥️"
        },
        {
            id: 6,
            name: "Robotics Kit",
            department: "MECH",
            quantity: 3,
            available: 2,
            emoji: "🤖"
        }
    ];

    saveData("equipment", equipment);
}

// Display equipment
function displayEquipment() {

    const list = document.getElementById("equipmentList");

    if (!list) return;

    const search = document.getElementById("searchInput").value.toLowerCase();
    const department = document.getElementById("departmentFilter").value;
    const availability = document.getElementById("availabilityFilter").value;

    const bookings = getData("bookings");

    const filtered = equipment.filter(item => {

        const nameMatch = item.name.toLowerCase().includes(search);

        const departmentMatch =
            !department || item.department === department;

        // Status is a simplified catalogue-level indication.
        const status = item.available > 0 ? "Available" : "Booked";

        const availabilityMatch =
            !availability || status === availability;

        return nameMatch && departmentMatch && availabilityMatch;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-message">No matching equipment found.</div>';
        return;
    }

    list.innerHTML = filtered.map(item => {

        const status = item.available > 0 ? "Available" : "Booked";

        return `
            <div class="equipment-card">

                <div class="equipment-emoji">
                    ${item.emoji || "🔬"}
                </div>

                <h3>${escapeHTML(item.name)}</h3>

                <p>Department: ${escapeHTML(item.department)}</p>

                <p>Total Quantity: ${item.quantity}</p>

                <p>Available Units: ${item.available}</p>

                <span class="status ${status === "Available" ? "available" : "booked"}">
                    ${status}
                </span>

                <br>

                <button class="small-btn"
                    onclick="requestEquipment(${item.id})">
                    Request Equipment
                </button>

            </div>
        `;
    }).join("");
}

// Go to booking page
function requestEquipment(id) {
    localStorage.setItem("selectedEquipment", String(id));
    window.location.href = "booking.html";
}

// Search events
["searchInput", "departmentFilter", "availabilityFilter"]
.forEach(id => {
    const element = document.getElementById(id);

    if (element) {
        element.addEventListener("input", displayEquipment);
        element.addEventListener("change", displayEquipment);
    }
});

displayEquipment();
