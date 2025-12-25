
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Функция для входа пользователя
async function loginUser() {
    // Получение email и пароля из формы
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Простая валидация формы
    if (!email || !password) {
        Swal.fire({
            icon: "error",
            title: "Ошибка...",
            text: "Введите логин и пароль!",
          });
          
        return;
    }
    

    try {
        // Получение данных из коллекции "Authorization"
        const snapshot = await get(ref(database, 'Authorization'));
        const users = snapshot.val();

        // Фильтрация потенциальных пустых элементов
        const filteredUsers = Object.values(users).filter(u => u);

        // Поиск пользователя с соответствующим email и паролем (без учета регистра)
        const user = filteredUsers.find(u => u.Login.toLowerCase() === email.toLowerCase() && u.Password === password);

        if (user) {
            // Сохранение данных пользователя в localStorage
            //localStorage.setItem('userID', user.ID_PersonalAccount);
            //localStorage.setItem('userEmail', email);

            const isAdmin = user.ID_Post === 1;
            
            const isClient = user.ID_Post === 2;
            
            if (isAdmin) {
                const admin_data = await get(ref(database, 'Admin'));
                const admins = admin_data.val();

                if (!admins) {
                    console.error("Нет данных об администраторах");
                    return;
                }

                const adminList = Object.values(admins);

                for (const admin of adminList) {
                    if (admin.NickName === "author") {

                        localStorage.setItem('adminNickname', admin.NickName);

                        window.location.href = 'main_admin.html';
                        break;
                    }
                }

            } 
            else if (isClient) {
                window.location.href = 'client_1.html';
            }
            else {
                fail();
            }
        } else {
            fail();
        }
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
    }
}

function fail(){
    console.error('Пользователь не найден или неверный логин/пароль.');
            Swal.fire({
                icon: "error",
                title: "Ошибка...",
                text: "Неправильный логин или пароль!",
              });
}

// Добавление слушателя события click к кнопке входа
document.getElementById('loginbutton').addEventListener('click', loginUser);