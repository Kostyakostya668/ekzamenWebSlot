import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentCarsData = {};
let currentClientsData = {};


const nickname = localStorage.getItem('adminNickname');
if (nickname) {
  document.getElementById("text-output").innerText = nickname;
}

{
  const alert = document.getElementById('alert_admin');
  if (alert) {
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => alert.style.display = 'none', 500);
    }, 2500);
  }
}

// функции алертов

function showAlert(type, title, text) {
  Swal.fire({
    icon: type,
    title: title,
    text: text,
    timer: 2000,
    showConfirmButton: false
  });
}

function showConfirm(title, text, callback) {
  Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Да',
    cancelButtonText: 'Отмена'
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
}

// вкладки

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs[0].classList.add('border-yellow-500', 'text-black');
  tabs[0].classList.remove('text-gray-600');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('border-yellow-500', 'text-black');
        t.classList.add('text-gray-600');
      });
      
      contents.forEach(content => {
        content.classList.add('hidden');
      });
      
      tab.classList.add('border-yellow-500', 'text-black');
      tab.classList.remove('text-gray-600');
      
      const tabId = tab.id.replace('tab-', '');
      document.getElementById(`content-${tabId}`).classList.remove('hidden');
      
      loadTabData(tabId);
    });
  });
}

function loadTabData(tabName) {
  switch(tabName) {
    case 'cars':
      loadCars();
      break;
    case 'clients':
      loadClients();
      break;
    case 'contracts':
      loadContracts();
      break;
    case 'employees':
      loadEmployees();
      break;
  }
}

// автомобили

function loadCars() {
  const refCars = ref(db, 'Cars');
  const container = document.getElementById('cars-list');
  
  if (!container) return;
  
  onValue(refCars, (snapshot) => {
    const data = snapshot.val();
    currentCarsData = data || {};
    container.innerHTML = '';
    
    if (!data) {
      container.innerHTML = '<p class="text-center py-4 dark:text-black">Нет автомобилей</p>';
      return;
    }
    
    for (const key in data) {
      if (data[key]) {
        const car = data[key];
        const carCard = document.createElement('div');
        carCard.className = 'bg-white dark:bg-yellow-100 p-4 rounded-lg shadow';
        carCard.innerHTML = `
          <div class="flex justify-between">
            <div>
              <h4 class="font-bold dark:text-black">${car.Model || 'Не указано'}</h4>
              <p class="text-sm dark:text-gray-800">ID: ${car.CarId || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">Статус: ${car.Status || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">Цена: ${car.Cost || 0} ₽/день</p>
            </div>
            <div class="flex gap-2">
              <button onclick="editCar('${key}')" class="px-3 py-1 bg-blue-500 text-white text-sm rounded">Ред.</button>
              <button onclick="deleteCar('${key}')" class="px-3 py-1 bg-red-500 text-white text-sm rounded">Удл.</button>
            </div>
          </div>
        `;
        container.appendChild(carCard);
      }
    }
  });
}

function addCar() {
  const carId = document.getElementById('car-id').value.trim();
  const model = document.getElementById('car-model').value.trim();
  const status = document.getElementById('car-status').value;
  const cost = document.getElementById('car-cost').value;
  
  if (!carId || !model || !status || !cost) {
    showAlert('error', 'Ошибка', 'Заполните все поля');
    return;
  }
  
  if (isCarIdExists(carId)) {
    showAlert('error', 'Ошибка', 'Машина с таким ID уже существует');
    return;
  }
  
  const carsRef = ref(db, 'Cars');
  push(carsRef, {
    CarId: carId,
    Model: model,
    Status: status,
    Cost: parseInt(cost),
    CreatedAt: new Date().toISOString()
  }).then(() => {
    showAlert('success', 'Успех', 'Автомобиль добавлен');
    document.getElementById('car-id').value = '';
    document.getElementById('car-model').value = '';
    document.getElementById('car-cost').value = '';
  }).catch(error => {
    showAlert('error', 'Ошибка', error.message);
  });
}

function isCarIdExists(carId) {
  for (const key in currentCarsData) {
    if (currentCarsData[key] && currentCarsData[key].CarId === carId) {
      return true;
    }
  }
  return false;
}

window.editCar = function(carKey) {
  const carRef = ref(db, `Cars/${carKey}`);
  
  onValue(carRef, (snapshot) => {
    const car = snapshot.val();
    
    Swal.fire({
      title: 'Редактировать автомобиль',
      html: `
        <input id="edit-car-id" class="swal2-input" value="${car.CarId || ''}" placeholder="ID машины" readonly>
        <input id="edit-car-model" class="swal2-input" value="${car.Model || ''}" placeholder="Модель">
        <select id="edit-car-status" class="swal2-input">
          <option value="Доступен" ${car.Status === 'Доступен' ? 'selected' : ''}>Доступен</option>
          <option value="Арендован" ${car.Status === 'Арендован' ? 'selected' : ''}>Арендован</option>
          <option value="На обслуживании" ${car.Status === 'На обслуживании' ? 'selected' : ''}>На обслуживании</option>
        </select>
        <input id="edit-car-cost" class="swal2-input" value="${car.Cost || ''}" placeholder="Цена" type="number">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Сохранить',
      cancelButtonText: 'Отмена',
      preConfirm: () => {
        return {
          model: document.getElementById('edit-car-model').value,
          status: document.getElementById('edit-car-status').value,
          cost: document.getElementById('edit-car-cost').value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { model, status, cost } = result.value;
        
        update(carRef, {
          Model: model,
          Status: status,
          Cost: parseInt(cost)
        }).then(() => {
          showAlert('success', 'Успех', 'Автомобиль обновлен');
        });
      }
    });
  }, { onlyOnce: true });
}

window.deleteCar = function(carId) {
  showConfirm('Удалить автомобиль?', 'Это действие нельзя отменить', () => {
    const carRef = ref(db, `Cars/${carId}`);
    remove(carRef).then(() => {
      showAlert('success', 'Успех', 'Автомобиль удален');
    });
  });
}

// клиенты

function loadClients() {
  const refClients = ref(db, 'Clients');
  const container = document.getElementById('clients-list');
  
  if (!container) return;
  
  onValue(refClients, (snapshot) => {
    const data = snapshot.val();
    currentClientsData = data || {};
    container.innerHTML = '';
    
    if (!data) {
      container.innerHTML = '<p class="text-center py-4 dark:text-black">Нет клиентов</p>';
      return;
    }
    
    for (const key in data) {
      if (data[key]) {
        const client = data[key];
        const clientCard = document.createElement('div');
        clientCard.className = 'bg-white dark:bg-yellow-100 p-4 rounded-lg shadow';
        clientCard.innerHTML = `
          <div class="flex justify-between">
            <div>
              <h4 class="font-bold dark:text-black">${client.Name || 'Не указано'}</h4>
              <p class="text-sm dark:text-gray-800">ID: ${client.ClientId || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">Телефон: ${client.Phone || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">Email: ${client.Email || 'Не указан'}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="editClient('${key}')" class="px-3 py-1 bg-blue-500 text-white text-sm rounded">Ред.</button>
              <button onclick="deleteClient('${key}')" class="px-3 py-1 bg-red-500 text-white text-sm rounded">Удл.</button>
            </div>
          </div>
        `;
        container.appendChild(clientCard);
      }
    }
  });
}

function addClient() {
  const clientId = document.getElementById('client-id').value.trim();
  const name = document.getElementById('client-name').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const email = document.getElementById('client-email').value.trim();
  
  if (!clientId || !name || !phone) {
    showAlert('error', 'Ошибка', 'Заполните ID, имя и телефон');
    return;
  }
  
  if (isClientIdExists(clientId)) {
    showAlert('error', 'Ошибка', 'Клиент с таким ID уже существует');
    return;
  }
  
  const clientsRef = ref(db, 'Clients');
  push(clientsRef, {
    ClientId: clientId,
    Name: name,
    Phone: phone,
    Email: email,
    CreatedAt: new Date().toISOString()
  }).then(() => {
    showAlert('success', 'Успех', 'Клиент добавлен');
    document.getElementById('client-id').value = '';
    document.getElementById('client-name').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-email').value = '';
  });
}

function isClientIdExists(clientId) {
  for (const key in currentClientsData) {
    if (currentClientsData[key] && currentClientsData[key].ClientId === clientId) {
      return true;
    }
  }
  return false;
}

window.editClient = function(clientKey) {
  const clientRef = ref(db, `Clients/${clientKey}`);
  
  onValue(clientRef, (snapshot) => {
    const client = snapshot.val();
    
    Swal.fire({
      title: 'Редактировать клиента',
      html: `
        <input id="edit-client-id" class="swal2-input" value="${client.ClientId || ''}" placeholder="ID клиента" readonly>
        <input id="edit-client-name" class="swal2-input" value="${client.Name || ''}" placeholder="ФИО">
        <input id="edit-client-phone" class="swal2-input" value="${client.Phone || ''}" placeholder="Телефон">
        <input id="edit-client-email" class="swal2-input" value="${client.Email || ''}" placeholder="Email">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Сохранить',
      cancelButtonText: 'Отмена',
      preConfirm: () => {
        return {
          name: document.getElementById('edit-client-name').value,
          phone: document.getElementById('edit-client-phone').value,
          email: document.getElementById('edit-client-email').value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { name, phone, email } = result.value;
        
        update(clientRef, {
          Name: name,
          Phone: phone,
          Email: email
        }).then(() => {
          showAlert('success', 'Успех', 'Клиент обновлен');
        });
      }
    });
  }, { onlyOnce: true });
}

window.deleteClient = function(clientId) {
  showConfirm('Удалить клиента?', 'Это действие нельзя отменить', () => {
    const clientRef = ref(db, `Clients/${clientId}`);
    remove(clientRef).then(() => {
      showAlert('success', 'Успех', 'Клиент удален');
    });
  });
}

// Договоры

function loadContracts() {
  const refContracts = ref(db, 'Contracts');
  const container = document.getElementById('contracts-list');
  
  if (!container) return;
  
  onValue(refContracts, (snapshot) => {
    const data = snapshot.val();
    container.innerHTML = '';
    
    if (!data) {
      container.innerHTML = '<p class="text-center py-4 dark:text-black">Нет договоров</p>';
      return;
    }
    
    for (const key in data) {
      if (data[key]) {
        const contract = data[key];
        const contractCard = document.createElement('div');
        contractCard.className = 'bg-white dark:bg-yellow-100 p-4 rounded-lg shadow';
        contractCard.innerHTML = `
          <div class="flex justify-between">
            <div>
              <h4 class="font-bold dark:text-black">Договор ${key.slice(0, 8)}</h4>
              <p class="text-sm dark:text-gray-800">Клиент ID: ${contract.ClientId || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">Авто ID: ${contract.CarId || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">${contract.StartDate} - ${contract.EndDate}</p>
              <p class="text-sm dark:text-gray-800">Сумма: ${contract.TotalPrice || 0} ₽</p>
              <p class="text-sm dark:text-gray-800">Статус: ${contract.Status || 'Не указан'}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="editContract('${key}')" class="px-3 py-1 bg-blue-500 text-white text-sm rounded">Ред.</button>
              <button onclick="deleteContract('${key}')" class="px-3 py-1 bg-red-500 text-white text-sm rounded">Удл.</button>
            </div>
          </div>
        `;
        container.appendChild(contractCard);
      }
    }
  });
}

function addContract() {
  const clientId = document.getElementById('contract-client-id').value.trim();
  const carId = document.getElementById('contract-car-id').value.trim();
  const startDate = document.getElementById('contract-start-date').value;
  const endDate = document.getElementById('contract-end-date').value;
  const price = document.getElementById('contract-price').value;
  const status = document.getElementById('contract-status').value;
  
  if (!clientId || !carId || !startDate || !endDate || !price) {
    showAlert('error', 'Ошибка', 'Заполните все поля');
    return;
  }
  
  if (!isCarIdExists(carId)) {
    showAlert('error', 'Ошибка', 'Машина с указанным ID не найдена');
    return;
  }
  
  if (!isClientIdExists(clientId)) {
    showAlert('error', 'Ошибка', 'Клиент с указанным ID не найден');
    return;
  }
  
  const contractsRef = ref(db, 'Contracts');
  push(contractsRef, {
    ClientId: clientId,
    CarId: carId,
    StartDate: startDate,
    EndDate: endDate,
    TotalPrice: parseInt(price),
    Status: status,
    CreatedAt: new Date().toISOString()
  }).then(() => {
    showAlert('success', 'Успех', 'Договор добавлен');
    // Очистить поля
    ['contract-client-id', 'contract-car-id', 'contract-start-date', 'contract-end-date', 'contract-price'].forEach(id => {
      document.getElementById(id).value = '';
    });
  });
}

window.editContract = function(contractId) {
  const contractRef = ref(db, `Contracts/${contractId}`);
  
  onValue(contractRef, (snapshot) => {
    const contract = snapshot.val();
    
    Swal.fire({
      title: 'Редактировать договор',
      html: `
        <input id="edit-contract-client" class="swal2-input" value="${contract.ClientId || ''}" placeholder="ID Клиента">
        <input id="edit-contract-car" class="swal2-input" value="${contract.CarId || ''}" placeholder="ID Авто">
        <input id="edit-contract-start" type="date" class="swal2-input" value="${contract.StartDate || ''}">
        <input id="edit-contract-end" type="date" class="swal2-input" value="${contract.EndDate || ''}">
        <input id="edit-contract-price" class="swal2-input" value="${contract.TotalPrice || ''}" placeholder="Сумма">
        <select id="edit-contract-status" class="swal2-input">
          <option value="Активен" ${contract.Status === 'Активен' ? 'selected' : ''}>Активен</option>
          <option value="Завершен" ${contract.Status === 'Завершен' ? 'selected' : ''}>Завершен</option>
          <option value="Отменен" ${contract.Status === 'Отменен' ? 'selected' : ''}>Отменен</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Сохранить',
      cancelButtonText: 'Отмена',
      preConfirm: () => {
        return {
          clientId: document.getElementById('edit-contract-client').value,
          carId: document.getElementById('edit-contract-car').value,
          startDate: document.getElementById('edit-contract-start').value,
          endDate: document.getElementById('edit-contract-end').value,
          price: document.getElementById('edit-contract-price').value,
          status: document.getElementById('edit-contract-status').value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { clientId, carId, startDate, endDate, price, status } = result.value;
        
        update(contractRef, {
          ClientId: clientId,
          CarId: carId,
          StartDate: startDate,
          EndDate: endDate,
          TotalPrice: parseInt(price),
          Status: status
        }).then(() => {
          showAlert('success', 'Успех', 'Договор обновлен');
        });
      }
    });
  }, { onlyOnce: true });
}

window.deleteContract = function(contractId) {
  showConfirm('Удалить договор?', 'Это действие нельзя отменить', () => {
    const contractRef = ref(db, `Contracts/${contractId}`);
    remove(contractRef).then(() => {
      showAlert('success', 'Успех', 'Договор удален');
    });
  });
}

// ========== СОТРУДНИКИ (Employees) ==========

function loadEmployees() {
  const refEmployees = ref(db, 'Employees');
  const container = document.getElementById('employees-list');
  
  if (!container) return;
  
  onValue(refEmployees, (snapshot) => {
    const data = snapshot.val();
    container.innerHTML = '';
    
    if (!data) {
      container.innerHTML = '<p class="text-center py-4 dark:text-black">Нет сотрудников</p>';
      return;
    }
    
    for (const key in data) {
      if (data[key]) {
        const employee = data[key];
        const employeeCard = document.createElement('div');
        employeeCard.className = 'bg-white dark:bg-yellow-100 p-4 rounded-lg shadow';
        employeeCard.innerHTML = `
          <div class="flex justify-between">
            <div>
              <h4 class="font-bold dark:text-black">${employee.Name || 'Не указано'}</h4>
              <p class="text-sm dark:text-gray-800">Должность: ${employee.Position || 'Не указана'}</p>
              <p class="text-sm dark:text-gray-800">Телефон: ${employee.Phone || 'Не указан'}</p>
              <p class="text-sm dark:text-gray-800">Зарплата: ${employee.Salary || 0} ₽</p>
            </div>
            <div class="flex gap-2">
              <button onclick="editEmployee('${key}')" class="px-3 py-1 bg-blue-500 text-white text-sm rounded">Ред.</button>
              <button onclick="deleteEmployee('${key}')" class="px-3 py-1 bg-red-500 text-white text-sm rounded">Удл.</button>
            </div>
          </div>
        `;
        container.appendChild(employeeCard);
      }
    }
  });
}

function addEmployee() {
  const name = document.getElementById('employee-name').value.trim();
  const position = document.getElementById('employee-position').value.trim();
  const phone = document.getElementById('employee-phone').value.trim();
  const salary = document.getElementById('employee-salary').value;
  
  if (!name || !position || !salary) {
    showAlert('error', 'Ошибка', 'Заполните имя, должность и зарплату');
    return;
  }
  
  const employeesRef = ref(db, 'Employees');
  push(employeesRef, {
    Name: name,
    Position: position,
    Phone: phone,
    Salary: parseInt(salary),
    CreatedAt: new Date().toISOString()
  }).then(() => {
    showAlert('success', 'Успех', 'Сотрудник добавлен');
    document.getElementById('employee-name').value = '';
    document.getElementById('employee-position').value = '';
    document.getElementById('employee-phone').value = '';
    document.getElementById('employee-salary').value = '';
  });
}

window.editEmployee = function(employeeId) {
  const employeeRef = ref(db, `Employees/${employeeId}`);
  
  onValue(employeeRef, (snapshot) => {
    const employee = snapshot.val();
    
    Swal.fire({
      title: 'Редактировать сотрудника',
      html: `
        <input id="edit-employee-name" class="swal2-input" value="${employee.Name || ''}" placeholder="ФИО">
        <input id="edit-employee-position" class="swal2-input" value="${employee.Position || ''}" placeholder="Должность">
        <input id="edit-employee-phone" class="swal2-input" value="${employee.Phone || ''}" placeholder="Телефон">
        <input id="edit-employee-salary" class="swal2-input" value="${employee.Salary || ''}" placeholder="Зарплата" type="number">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Сохранить',
      cancelButtonText: 'Отмена',
      preConfirm: () => {
        return {
          name: document.getElementById('edit-employee-name').value,
          position: document.getElementById('edit-employee-position').value,
          phone: document.getElementById('edit-employee-phone').value,
          salary: document.getElementById('edit-employee-salary').value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { name, position, phone, salary } = result.value;
        
        update(employeeRef, {
          Name: name,
          Position: position,
          Phone: phone,
          Salary: parseInt(salary)
        }).then(() => {
          showAlert('success', 'Успех', 'Сотрудник обновлен');
        });
      }
    });
  }, { onlyOnce: true });
}

window.deleteEmployee = function(employeeId) {
  showConfirm('Удалить сотрудника?', 'Это действие нельзя отменить', () => {
    const employeeRef = ref(db, `Employees/${employeeId}`);
    remove(employeeRef).then(() => {
      showAlert('success', 'Успех', 'Сотрудник удален');
    });
  });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
  // Настройка табов
  setupTabs();
  
  // Загрузить данные для активной вкладки
  loadCars();
  
  // Кнопки добавления
  document.getElementById('add-car-btn').addEventListener('click', addCar);
  document.getElementById('add-client-btn').addEventListener('click', addClient);
  document.getElementById('add-contract-btn').addEventListener('click', addContract);
  document.getElementById('add-employee-btn').addEventListener('click', addEmployee);
  
})