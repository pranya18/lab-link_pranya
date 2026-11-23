
// LABLINK COMMON JAVASCRIPT

// Get saved data
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

// Save data
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Get logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("lablinkUser") || "null");
}

// Logout
function logout() {
    localStorage.removeItem("lablinkUser");
    window.location.href = "login.html";
}

// STUDENT DASHBOARD
const totalEquipment = document.getElementById("totalEquipment");

if (totalEquipment) {
    const equipment = getData("equipment");
    const bookings = getData("bookings");
    const user = getCurrentUser();

    const myBookings = bookings.filter(
        b => user && b.email === user.email
    );

    totalEquipment.textContent = equipment.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    document.getElementById("myBookings").textContent =
        myBookings.length;

    document.getElementById("pendingRequests").textContent =
        myBookings.filter(b => b.status === "Pending").length;

    document.getElementById("approvedRequests").textContent =
        myBookings.filter(b => b.status === "Approved").length;

    const recent = document.getElementById("recentBookings");

    if (myBookings.length === 0) {
        recent.textContent = "You haven't made any bookings yet.";
    } else {
        recent.innerHTML = `
            <table>
                <tr>
                    <th>Project</th>
                    <th>Equipment</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
                ${myBookings.map(b => `
                    <tr>
                        <td>${escapeHTML(b.project)}</td>
                        <td>${escapeHTML(b.equipment)}</td>
                        <td>${escapeHTML(b.date)}</td>
                        <td>${escapeHTML(b.status)}</td>
                    </tr>
                `).join("")}
            </table>
        `;
    }
}

// Basic HTML escaping for displayed user input
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// DEMO AI CHAT
const chatForm = document.getElementById("chatForm");

if (chatForm) {
    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const input = document.getElementById("chatInput");
        const messages = document.getElementById("chatMessages");

        const question = input.value.trim();

        if (!question) return;

        const userMessage = document.createElement("div");
        userMessage.className = "user-message";
        userMessage.textContent = question;

        messages.appendChild(userMessage);

        const response = document.createElement("div");
        response.className = "bot-message";

        const text = question.toLowerCase();

        if (text.includes("iot") || text.includes("smart home")) {
            response.textContent =
                "For an IoT project, consider Arduino or ESP32, sensors, relay modules, breadboards and connecting wires. Check the Equipment page for availability.";
        } else if (text.includes("robot")) {
            response.textContent =
                "For a robotics project, consider a robotics kit, motors, motor driver, sensors and a microcontroller.";
        } else if (text.includes("machine learning") || text.includes("ai project")) {
            response.textContent =
                "For an AI project, consider a high-performance workstation, GPU-enabled computer and suitable development software.";
        } else {
            response.textContent =
                "Please describe your project in more detail. Include its purpose and the technology you plan to use. This is a basic demo assistant; the actual AI API will be connected later.";
        }

        messages.appendChild(response);
        input.value = "";

        messages.scrollTop = messages.scrollHeight;
    });
}
