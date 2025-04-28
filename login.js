document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const selectedRole = document.getElementById('login-role').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matchedUser = users.find(user => user.email === email && user.password === password);

    if (matchedUser) {
        let finalRole = selectedRole;

        // If admin selected, ask for secret PIN
        if (selectedRole === 'admin') {
            const enteredPin = prompt('Enter Admin Secret PIN:');
            const secretAdminPin = "1234"; // Your secret PIN

            if (enteredPin !== secretAdminPin) {
                alert("Incorrect PIN! You are logged in as a normal user.");
                finalRole = 'user'; // Downgrade to user
            }
        }

        // Save login with corrected role
        const loggedInUser = {
            name: matchedUser.name,
            email: matchedUser.email,
            department: matchedUser.department,
            role: finalRole
        };

        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        alert("Login Successful!");
        window.location.href = "admin.html";
    } else {
        alert("Invalid Email or Password!");
    }
});
