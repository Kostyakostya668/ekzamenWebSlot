
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

import { firebaseConfig } from "./firebase-config.js";

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        Swal.fire({
            icon: "error",
            title: "Ошибка...",
            text: "Введите логин и пароль!",
          });
          
        return;
    }
    

    try {
        const snapshot = await get(ref(database, 'Authorization'));
        const users = snapshot.val();

        const filteredUsers = Object.values(users).filter(u => u);

        const user = filteredUsers.find(u => u.Login.toLowerCase() === email.toLowerCase() && u.Password === password);

        if (user) {
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

document.getElementById('loginbutton').addEventListener('click', loginUser);