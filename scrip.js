function filterForUsers(filter) {
	const foundDiv = document.getElementById('FilteredUsersResult');
	if (!filter) {
		foundDiv.textContent = 'Filtered Users:';
		return;
	}
	const filtered = users.filter(user => String(user.age).includes(filter) || user.email.includes(filter));
	if (filtered.length > 0) {
		foundDiv.innerHTML = 'Filtered Users:<br>' + filtered.map(u => `Username: ${u.username}, Email: ${u.email}, Age: ${u.age}`).join('<br>');
	} else {
		foundDiv.textContent = 'Filtered Users: No users found.';
	}
}
const users = [];
function searchUsers(searchTerm) {
	const foundDiv = document.getElementById('foundUser');
	const foundUser = users.find(user => user.username === searchTerm);
	if (foundUser) {
		foundDiv.textContent = `Found: ${foundUser.username}, Email: ${foundUser.email}, Age: ${foundUser.age}`;
	} else {
		foundDiv.textContent = 'Found: No user found.';
	}
}
function renderUsers() {
	const tbody = document.getElementById('usersTableBody');
	tbody.innerHTML = '';
	users.forEach((user, index) => {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${user.username}</td>
			<td>${user.email}</td>
			<td>${user.age}</td>
			<td><button onclick="deleteUser(${index})">Delete</button></td>
		`;
		tbody.appendChild(row);
	});
}
function deleteUser(index) {
	const user = users[index];
	const confirmDelete = window.confirm(`Are you sure you want to delete user: ${user.username}?`);
	if (confirmDelete) {
		users.splice(index, 1);
		renderUsers();
	}
}
document.addEventListener('DOMContentLoaded', function() {
	const passwordInput = document.getElementById('password');
	const confirmPasswordInput = document.getElementById('confirmPassword');
	const showPassword = document.getElementById('showPassword');
	const showConfirmPassword = document.getElementById('showConfirmPassword');
	if (showPassword) {
		showPassword.addEventListener('change', function() {
			passwordInput.type = this.checked ? 'text' : 'password';
		});
	}
	if (showConfirmPassword) {
		showConfirmPassword.addEventListener('change', function() {
			confirmPasswordInput.type = this.checked ? 'text' : 'password';
		});
	}

	// Blur/focus logic for email and age inputs
	const emailInput = document.getElementById('email');
	const ageInput = document.getElementById('age');

	emailInput.addEventListener('blur', function(e) {
		if (e.relatedTarget && (e.relatedTarget.tagName === 'INPUT' || e.relatedTarget.tagName === 'BUTTON')) {
			const email = emailInput.value;
			const emailIsValid = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
			const emailNamePart = email.split('@')[0] || '';
			if (!emailIsValid || emailNamePart.length < 6) {
				alert('Please enter a valid email with at least 6 characters before the @ symbol.');
				emailInput.focus();
			}
		}
	});

	ageInput.addEventListener('blur', function(e) {
		if (e.relatedTarget && (e.relatedTarget.tagName === 'INPUT' || e.relatedTarget.tagName === 'BUTTON')) {
			const age = ageInput.value;
			if (Number(age) < 18) {
				alert('Age must be 18 or above!');
				ageInput.focus();
			}
		}
	});

	// Form submit handler
	const form = document.getElementById('registerForm');
	form.addEventListener('submit', async function(event) {
		event.preventDefault();
		const username = document.getElementById('username').value;
		const email = document.getElementById('email').value;
		const age = document.getElementById('age').value;
		const password = passwordInput.value;
		const confirmPassword = confirmPasswordInput.value;

		// Remove domain from email for comparison
		const emailNameOnly = email.split('@')[0];
		if (username === emailNameOnly) {
			alert('Username and email must not be the same, HACKERS can use this to their advantage!');
			return;
		}

		if (Number(age) < 18) {
			alert('Age must be 18 or above!');
			return;
		}

		if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
			alert('Password must be at least 8 characters, include at least 1 uppercase letter, 1 number, and 1 special character.');
			event.preventDefault();
			passwordInput.focus();
			return;
		}

		if (password !== confirmPassword) {
			alert('Passwords do not match!');
			return;
		}

		const emailIsValid = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
		const emailNamePart = email.split('@')[0] || '';
		if (!emailIsValid || emailNamePart.length < 6) {
			alert('Email must be valid and have at least 6 characters before the @ symbol!');
			return;
		}

		// Check for duplicate username or email
		const usernameExists = users.some(user => user.username === username);
		const emailExists = users.some(user => user.email === email);
		if (usernameExists) {
			alert('Username already exists! Please choose another.');
			return;
		}
		if (emailExists) {
			alert('Email already exists! Please use another.');
			return;
		}

		const hashedPassword = await hashPassword(password);
		users.push({ username, email, age, password: hashedPassword });
		renderUsers();
		alert('Registration successful!');
		form.reset();
		// Reset show password checkboxes and input types
		if (showPassword) {
			showPassword.checked = false;
			passwordInput.type = 'password';
		}
		if (showConfirmPassword) {
			showConfirmPassword.checked = false;
			confirmPasswordInput.type = 'password';
		}
	});
	renderUsers();

	// Live search by username as user types
	const searchInput = document.getElementById('SearchUsers');
	if (searchInput) {
		searchInput.addEventListener('keyup', function() {
			searchUsers(searchInput.value.trim());
		});
	}

	// Live filter for users by age or email as user types
	const filterInput = document.getElementById('FilterUsersInput');
	if (filterInput) {
		filterInput.addEventListener('keyup', function() {
			filterForUsers(filterInput.value.trim());
		});
	}
});
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // Convert buffer to hex string
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
