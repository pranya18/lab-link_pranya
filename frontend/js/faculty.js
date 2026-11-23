
// LABLINK FACULTY DASHBOARD

function displayRequests() {

    const bookings = getData("bookings");

    const container = document.getElementById("facultyRequests");

    const pending = bookings.filter(
        b => b.status === "Pending"
    );

    const approved = bookings.filter(
        b => b.status === "Approved"
    );

    document.getElementById("facultyPending").textContent =
        pending.length;

    document.getElementById("facultyApproved").textContent =
        approved.length;

    if (bookings.length === 0) {
        container.innerHTML =
            '<div class="empty-message">No booking requests available.</div>';
        return;
    }

    container.innerHTML = bookings.map(booking => {

        return `
            <div class="request-card">

                <h3>${escapeHTML(booking.project)}</h3>

                <p>Student: ${escapeHTML(booking.email)}</p>

                <p>Equipment: ${escapeHTML(booking.equipment)}</p>

                <p>Department: ${escapeHTML(booking.department)}</p>

                <p>Project Description: ${escapeHTML(booking.description)}</p>

                <p>Project Deadline: ${escapeHTML(booking.deadline)}</p>

                <p>Booking Date: ${escapeHTML(booking.date)}</p>

                <p>Time: ${escapeHTML(booking.start)} - ${escapeHTML(booking.end)}</p>

                <p>Status: <strong>${escapeHTML(booking.status)}</strong></p>

                ${
                    booking.status === "Pending"
                    ? `
                        <button class="approve-btn"
                            onclick="updateRequest(${booking.id}, 'Approved')">
                            Approve
                        </button>

                        <button class="reject-btn"
                            onclick="updateRequest(${booking.id}, 'Rejected')">
                            Reject
                        </button>
                    `
                    : ""
                }

            </div>
        `;

    }).join("");

}

// Approve or reject
function updateRequest(id, status) {

    const bookings = getData("bookings");

    const index = bookings.findIndex(
        b => b.id === id
    );

    if (index === -1) return;

    if (status === "Approved") {

        // Recheck the schedule before approval
        const conflict = bookings.some(booking => {

            if (
                booking.id === id ||
                booking.equipmentId !== bookings[index].equipmentId ||
                booking.date !== bookings[index].date ||
                booking.status !== "Approved"
            ) {
                return false;
            }

            return (
                bookings[index].start < booking.end &&
                bookings[index].end > booking.start
            );

        });

        if (conflict) {
            alert("Another approved booking conflicts with this request.");
            return;
        }

    }

    bookings[index].status = status;

    saveData("bookings", bookings);

    displayRequests();

    alert("Request " + status + " successfully!");

}

displayRequests();
