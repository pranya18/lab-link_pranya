
// LABLINK ADMIN DASHBOARD

function displayAdminEquipment() {

    const equipment = getData("equipment");

    const total = equipment.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const available = equipment.reduce(
        (sum, item) => sum + item.available, 0
    );

    document.getElementById("adminTotal").textContent = total;

    document.getElementById("adminAvailable").textContent =
        available;

    const container = document.getElementById("adminEquipment");

    if (equipment.length === 0) {
        container.innerHTML =
            '<div class="empty-message">No equipment added.</div>';
        return;
    }

    container.innerHTML = equipment.map(item => {

        return `
            <div class="request-card">

                <h3>${escapeHTML(item.name)}</h3>

                <p>Department: ${escapeHTML(item.department)}</p>

                <p>Quantity: ${item.quantity}</p>

                <p>Available: ${item.available}</p>

                <button class="delete-btn"
                    onclick="deleteEquipment(${item.id})">
                    Delete
                </button>

            </div>
        `;

    }).join("");

}

// Add equipment
const equipmentForm = document.getElementById("equipmentForm");

if (equipmentForm) {

    equipmentForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("newEquipment").value.trim();

        const department = document.getElementById("newDepartment").value;

        const quantity = Number(document.getElementById("newQuantity").value);

        if (!name || !department || !Number.isInteger(quantity) || quantity < 1) {
            alert("Enter valid equipment details.");
            return;
        }

        const equipment = getData("equipment");

        const newItem = {

            id: Date.now(),
            name: name,
            department: department,
            quantity: quantity,
            available: quantity,
            emoji: "🔬"

        };

        equipment.push(newItem);

        saveData("equipment", equipment);

        equipmentForm.reset();

        displayAdminEquipment();

        alert("Equipment added successfully!");

    });

}

// Delete equipment
function deleteEquipment(id) {

    const bookings = getData("bookings");

    const hasActiveBookings = bookings.some(
        b => b.equipmentId === id &&
        ["Pending", "Approved"].includes(b.status)
    );

    if (hasActiveBookings) {
        alert("Cannot delete equipment with pending or approved bookings.");
        return;
    }

    if (!confirm("Are you sure you want to delete this equipment?")) {
        return;
    }

    const equipment = getData("equipment").filter(
        item => item.id !== id
    );

    saveData("equipment", equipment);

    displayAdminEquipment();

}

displayAdminEquipment();
