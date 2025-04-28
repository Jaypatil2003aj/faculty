document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const department = document.getElementById('department').value.trim().toUpperCase();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('signup-role').value; // Admin/User dropdown

    if (!name || !email || !department || !password || !role) {
        alert("Please fill all fields!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let departments = JSON.parse(localStorage.getItem('departments')) || {};

    // Check if user already exists
    const alreadyExists = users.find(user => user.email === email);
    if (alreadyExists) {
        alert("Email already registered. Please login!");
        window.location.href = "login.html";
        return;
    }

    // Add user to users array
    const newUser = { name, email, department, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Add user to department data (without password)
    if (!departments[department]) {
        departments[department] = [];
    }
    departments[department].push({ name, email, role });
    localStorage.setItem('departments', JSON.stringify(departments));

    alert("Signup Successful! Please Login.");
    window.location.href = "login.html";
});
