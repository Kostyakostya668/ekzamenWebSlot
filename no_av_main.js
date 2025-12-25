import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Функция загрузки автомобилей
function loadCars() {
  const carsRef = ref(db, 'Cars');
  const container = document.getElementById('cars-container');
  const noCars = document.getElementById('no-cars');
  
  // Показываем загрузку
  container.innerHTML = '<p class="text-center py-8 dark:text-black">Загрузка автомобилей...</p>';
  
  onValue(carsRef, (snapshot) => {
    const data = snapshot.val();
    
    if (!data) {
      container.innerHTML = '';
      noCars.classList.remove('hidden');
      return;
    }
    
    noCars.classList.add('hidden');
    container.innerHTML = '';
    
    // Преобразуем объект в массив
    const cars = [];
    for (const key in data) {
      if (data[key]) {
        cars.push({
          id: key,
          ...data[key]
        });
      }
    }
    
    // Фильтруем только доступные
    const availableCars = cars.filter(car => car.Status === 'Доступен');
    
    if (availableCars.length === 0) {
      container.innerHTML = '<p class="dark:text-black">Нет доступных автомобилей</p>';
      return;
    }
    
    // Создаем карточки
    availableCars.forEach(car => {
      const carCard = document.createElement('div');
      carCard.className = 'bg-yellow-50 dark:bg-yellow-200 p-4 rounded-lg';
      
      carCard.innerHTML = `
        <div class="mb-2">
          <h3 class="font-bold text-lg dark:text-black">${car.Model || 'Не указано'}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-800">Статус: ${car.Status || 'Не указан'}</p>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-bold dark:text-black">${car.Cost || 0} ₽/день</span>
          <a href="autorization.html" class="text-blue-600 hover:text-blue-800 text-sm">Арендовать →</a>
        </div>
      `;
      
      container.appendChild(carCard);
    });
  });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadCars);