import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

import { firebaseConfig } from "./firebase-config.js";

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Элементы DOM
const form = document.querySelector('form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePasswordBtn = document.getElementById('toggle-password');
const registerButton = document.getElementById('register-button');

// Простая проверка email
function validateEmail(email) {
    return email.includes('@') && email.includes('.');
}

// Простая проверка пароля
function validatePassword(password) {
    return password.length >= 6;
}

// Проверка уникальности email
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

// Создание пользователя
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

// Основная функция регистрации
async function registerUser(event) {
    event.preventDefault();
    
    // Получаем данные
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Простые проверки
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
    
    // Проверка уникальности email
    const isUnique = await isEmailUnique(email);
    if (!isUnique) {
        Swal.fire('Ошибка', 'Этот email уже используется', 'error');
        return;
    }
    
    // Показываем загрузку
    registerButton.textContent = 'Регистрация...';
    registerButton.disabled = true;
    
    // Создаем пользователя
    const userData = { username, email, password };
    const result = await createUser(userData);
    
    // Возвращаем кнопку
    registerButton.textContent = 'Зарегистрироваться';
    registerButton.disabled = false;
    
    if (result.success) {
        // Успешная регистрация
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

// Показать/скрыть пароль
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

// Отправка формы
form.addEventListener('submit', registerUser);

// Простая валидация при вводе
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (togglePasswordBtn && togglePasswordBtn.textContent === '') {
        togglePasswordBtn.textContent = '👁️';
    }
});