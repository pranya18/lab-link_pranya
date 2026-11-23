
// LABLINK LOGIN SYSTEM - DEMO ONLY

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const role = document.getElementById("role").value;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("loginMessage");

        if (!role || !email || !password) {
            message.textContent = "Please fill all fields.";
            return;
        }

        // Demo login only: do not use this for real accounts.
        const user = {
            role: role,
            email: email
        };

        localStorage.setItem(
            "lablinkUser",
            JSON.stringify(user)
        );

        if (role === "student") {
            window.location.href = "dashboard.html";
        }

        else if (role === "faculty") {
            window.location.href = "faculty.html";
        }

        else if (role === "admin") {
            window.location.href = "admin.html";
        }

    });

}
