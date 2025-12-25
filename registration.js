import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const form = document.querySelector('form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePasswordBtn = document.getElementById('toggle-password');
const registerButton = document.getElementById('register-button');

function validateEmail(email) {
    return email.includes('@') && email.includes('.');
}

function validatePassword(password) {
    return password.length >= 6;
}

async function isEmailUnique(email) {
    try {
        const authRef = ref(database, 'Authorization');
        const snapshot = await get(authRef);
        
        if (!snapshot.exists()) return true;
        
        const users = snapshot.val();
        for (const userId in users) {
            if (users[userId] && users[userId].Login && 
                users[userId].Login === email) {
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Ошибка при проверке email:', error);
        return false;
    }
}

async function createUser(userData) {
    try {
        const authRef = ref(database, 'Authorization');
        const newUserRef = push(authRef);
        
        await set(newUserRef, {
            ID_Post: 2, // 2 = клиент
            Login: userData.email,
            Password: userData.password,
            NickName: userData.username
        });
        
        return { success: true };
    } catch (error) {
        console.error('Ошибка:', error);
        return { success: false, error: error.message };
    }
}

async function registerUser(event) {
    event.preventDefault();
    
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!username || username.length < 2) {
        Swal.fire('Ошибка', 'Имя должно быть не менее 2 символов', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        Swal.fire('Ошибка', 'Введите правильный email', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        Swal.fire('Ошибка', 'Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        Swal.fire('Ошибка', 'Пароли не совпадают', 'error');
        return;
    }
    
    const isUnique = await isEmailUnique(email);
    if (!isUnique) {
        Swal.fire('Ошибка', 'Этот email уже используется', 'error');
        return;
    }
    
    registerButton.textContent = 'Регистрация...';
    registerButton.disabled = true;
    
    const userData = { username, email, password };
    const result = await createUser(userData);
    
    registerButton.textContent = 'Зарегистрироваться';
    registerButton.disabled = false;
    
    if (result.success) {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Регистрация успешна!',
            showConfirmButton: false,
            timer: 2000,
            backdrop: 'rgba(0,0,0,0.5)'
        }).then(() => {
            window.location.href = 'autorization.html';
        });
    } else {
        Swal.fire('Ошибка', result.error || 'Ошибка регистрации', 'error');
    }
}

form.addEventListener('submit', registerUser);

emailInput.addEventListener('blur', async function() {
    const email = this.value.trim();
    if (email && validateEmail(email)) {
        const isUnique = await isEmailUnique(email);
        if (!isUnique) {
            this.style.borderColor = 'red';
        } else {
            this.style.borderColor = '';
        }
    }
});

confirmPasswordInput.addEventListener('input', function() {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = 'red';
    } else {
        this.style.borderColor = '';
    }
});

