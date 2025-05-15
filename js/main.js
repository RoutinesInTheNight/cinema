const telegram = window.Telegram.WebApp;
const USER_ID = telegram.initDataUnsafe.user ? telegram.initDataUnsafe.user.id : null;
const DEVICE_TYPE = telegram.platform;

telegram.expand();
if (telegram.isVersionAtLeast("6.1")) telegram.BackButton.hide();
if (telegram.isVersionAtLeast("7.7")) telegram.disableVerticalSwipes();
if (telegram.isVersionAtLeast("8.0")) {
  telegram.requestFullscreen();
  telegram.lockOrientation();
}
// if (telegram.isVersionAtLeast("6.0")) window.location.href = "ban.html";


// Анимированное появление контента
// При открытии мини-приложения: вибрация, удаление из ссылки "?start", отправка времени захода в бд






window.addEventListener('DOMContentLoaded', async () => {

  // const balance = await getTGItem('balance');
  // const league = await getTGItem('league');
  const balance = 500000000000;
  const league = 24;

  // Функция для форматирования чисел
  const formatNumber = (num) => Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const leagues = {
    "1": {
      "start": 0,
      "name": "Сопля мелкая"
    },
    "2": {
      "start": 10000,
      "name": "Недохват"
    },
    "3": {
      "start": 25000,
      "name": "Инцел"
    },
    "4": {
      "start": 50000,
      "name": "..."
    },
    "5": {
      "start": 100000,
      "name": "..."
    },
    "6": {
      "start": 250000,
      "name": "..."
    },
    "7": {
      "start": 500000,
      "name": "..."
    },
    "8": {
      "start": 1000000,
      "name": "..."
    },
    "9": {
      "start": 2500000,
      "name": "..."
    },
    "10": {
      "start": 5000000,
      "name": "..."
    },
    "11": {
      "start": 10000000,
      "name": "..."
    },
    "12": {
      "start": 25000000,
      "name": "..."
    },
    "13": {
      "start": 50000000,
      "name": "..."
    },
    "14": {
      "start": 100000000,
      "name": "..."
    },
    "15": {
      "start": 250000000,
      "name": "..."
    },
    "16": {
      "start": 500000000,
      "name": "..."
    },
    "17": {
      "start": 1000000000,
      "name": "..."
    },
    "18": {
      "start": 2500000000,
      "name": "..."
    },
    "19": {
      "start": 5000000000,
      "name": "..."
    },
    "20": {
      "start": 10000000000,
      "name": "..."
    },
    "21": {
      "start": 25000000000,
      "name": "..."
    },
    "22": {
      "start": 50000000000,
      "name": "..."
    },
    "23": {
      "start": 100000000000,
      "name": "..."
    },
    "24": {
      "start": 250000000000,
      "name": "..."
    },
    "25": {
      "start": 500000000000,
      "name": "..."
    }
  }

  const currentLeague = leagues[league];
  const nextLeague = leagues[parseInt(league) + 1];

  document.getElementById('balance').textContent = formatNumber(balance);
  document.getElementById('league-num').textContent = `${league} ЛИГА:`;
  document.getElementById('league-name').textContent = currentLeague.name.toUpperCase();
  if (nextLeague) {
    document.getElementById('next-league-start').textContent = formatNumber(nextLeague.start);
  } else {
    document.getElementById('next-league-start').textContent = 'Нет следующей лиги';
  }
  const nextStart = nextLeague ? nextLeague.start : balance;
  const percent = Math.min((balance / nextStart) * 100, 100);
  document.getElementById('league-percent').textContent = `${Math.floor(percent)}%`;
  const minProgress = (100 / 709) * 25;
  const maxProgress = 100 - ((100 / 709) * 12.5);
  const progress = Math.max(Math.min(percent, maxProgress), minProgress);
  document.getElementById('league-progress').style.width = `${progress}%`;




  const children = document.querySelectorAll('.content > *');
  children.forEach((child, index) => {
    setTimeout(() => {
      child.classList.add('visible');
    }, index * 25);
  });






  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('start')) {
    hapticFeedback('success');

    urlParams.delete('start');
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);

    const db = await getTGItem('db');
    const user_name = await getTGItem('user_name');

    if (db === null || user_name === null) {
      // window.location.href = "ban"
    } else {
      try {
        const response = await fetch(db, {
          method: 'POST',
          body: JSON.stringify({
            method: "login",
            user_name: user_name,
            time: Math.floor(Date.now() / 1000),
          }),
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
          }
        });
        const result = await response.text();
        console.log("Ответ сервера:", result);
      } catch {
        // window.location.href = "error"
      }
    }
  }
});












// Перемещение к нужному блоку с игрой после возвращения со страницы игры
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const elementId = urlParams.get('centerElementId');
  if (elementId) {
    const elementToCenter = document.getElementById(elementId);
    if (elementToCenter) {
      setTimeout(() => {
        elementToCenter.scrollIntoView({ behavior: 'smooth', block: 'center' });
        urlParams.delete('centerElementId');
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
      }, 100);
    }
  }
});





async function getTGItem(key) {
  return new Promise(resolve => {
    telegram.CloudStorage.getItem(key, (_, res) => {
      resolve(res === "" ? null : res);
    });
  });
}
























// ПЕРЕКЛЮЧАТЕЛЬ ИГР И АЧИВОК
function selectTab(tabId) {
  const gamesTab = document.getElementById('games');
  const achievementsTab = document.getElementById('achievements');
  const gamesContainer = document.getElementById('games-container');
  const achievementsContainer = document.getElementById('achievements-container');
  if (tabId === 'games') {
    gamesTab.classList.add('active');
    achievementsTab.classList.remove('active');
    gamesContainer.style.display = 'flex';
    achievementsContainer.style.display = 'none';
  } else if (tabId === 'achievements') {
    achievementsTab.classList.add('active');
    gamesTab.classList.remove('active');
    achievementsContainer.style.display = 'flex';
    gamesContainer.style.display = 'none';
  }
}
window.onload = () => {
  selectTab('games');
};
['games', 'achievements'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    selectTab(id);
    hapticFeedback('change');
  });
});


































// function getItem(key) {
//   telegram.CloudStorage.getItem(key, function (err, res) {
//     if (err) {
//       console.error(`Ошибка при получении ключа "${key}":`, err);
//     } else {
//       console.log(`Значение ключа "${key}":`, res);
//     }
//   });
// }

function removeItem(key) {
  telegram.CloudStorage.removeItem(key, function (err, res) {
    if (err) {
      console.error(`Ошибка при удалении ключа "${key}":`, err);
    } else {
      console.log(`Удалён ключ "${key}":`, res);
    }
  });
}

function setItem(key, value) {
  telegram.CloudStorage.setItem(key, value, function (err, res) {
    if (err) {
      console.error(`Ошибка при добавлении ключа "${key}" со значением "${value}":`, err);
    } else {
      console.log(`Добавлен ключ "${key}" со значением "${value}":`, res);
    }
  });
}

function getKeys() {
  telegram.CloudStorage.getKeys(function (err, keys) {
    if (err) {
      console.error('Ошибка при получении ключей из Cloud Storage:', err);
    } else {
      console.log('Ключи в Cloud Storage:', keys);
    }
  });
}


// getItem('user_name');


// setItem('access', "true");
// getItem('access');
// getKeys();

// removeItem('access')





// console.log('initDataUnsafe.user', telegram.initDataUnsafe.user);
console.log('User ID:', USER_ID);
// console.log('Premium:', IS_PREMIUM);
console.log('Device Type:', DEVICE_TYPE);






function hapticFeedback(type, redirectUrl) {
  if (telegram.isVersionAtLeast("6.1") && (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios')) {
    switch (type) {
      case 'light':
        telegram.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        telegram.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        telegram.HapticFeedback.impactOccurred('heavy');
        break;
      case 'rigid':
        telegram.HapticFeedback.impactOccurred('rigid');
        break;
      case 'soft':
        telegram.HapticFeedback.impactOccurred('soft');
        break;
      case 'error':
        telegram.HapticFeedback.notificationOccurred('error');
        break;
      case 'success':
        telegram.HapticFeedback.notificationOccurred('success');
        break;
      case 'warning':
        telegram.HapticFeedback.notificationOccurred('warning');
        break;
      case 'change':
        telegram.HapticFeedback.selectionChanged();
        break;
      default:
        console.warn('Unknown haptic feedback type:', type);
    }
  }

  if (redirectUrl && redirectUrl !== '#') {
    const children = document.querySelectorAll('.content > *');
    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.remove('visible');
        child.classList.add('hidden');
      }, index * 25);
    });

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, children.length * 25);
  }
}




// Карусель маленьких изображений
const container = document.querySelector('.user-image-container');
const rootPath = window.location.origin;
const imageFolder = `img-circular-animation`;
const totalImages = 15;
const interval = 100;
const circleRadius = document.body.clientWidth * 0.75;
function getRandomPosition(radius) {
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
}
function createMovingImage(index) {
  const img = document.createElement('img');
  img.src = `${imageFolder}/${index}.png`;
  img.classList.add('moving-image');
  img.style.opacity = 0;
  const { x, y } = getRandomPosition(circleRadius);
  const randomRotation = Math.floor(Math.random() * 360);
  img.style.setProperty('--start-x', `${x}px`);
  img.style.setProperty('--start-y', `${y}px`);
  img.style.setProperty('--rotate-end', `${randomRotation}deg`);
  container.appendChild(img);
  setTimeout(() => {
    img.style.opacity = 1;
  }, 50);
  img.addEventListener('animationend', () => {
    setTimeout(() => {
      img.remove();
    }, 1000);
  });
}
function generateImages() {
  const count = 1
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * totalImages) + 1;
    createMovingImage(randomIndex);
  }
}
setInterval(generateImages, interval);





















function showTopAchievement(description, statusImageSrc) {

  hapticFeedback('light')

  // Создаем элемент баннера
  const banner = document.createElement('div');
  banner.className = 'top-achievement-banner';
  banner.style.top = '-25vw'; // Начальная позиция - за верхней границей
  banner.onclick = () => removeBanner(banner); // Удаление при клике



  // Внутренний контент баннера
  banner.innerHTML = `
      <div class="status"><img src="${statusImageSrc}"></div>
      <div class="info">
          <p class="description">${description}</p>
          <div class="reward">
              <img src="images/coin.png">
              <p>+ 10 000</p>
          </div>
      </div>
  `;

  // Добавляем баннер в начало body
  document.body.appendChild(banner);

  // Задержка перед выездом
  // setTimeout(() => {
  //     banner.style.top = 'calc(100 / 1284 * 300 * 1vw)'; // Баннер выезжает на место
  // }, 10);
  setTimeout(() => {
    const content = document.querySelector('.content');

    // Извлекаем текущее значение padding-top из элемента .content
    const contentPaddingTop = window.getComputedStyle(content).paddingTop;

    // Применяем это значение для баннера
    banner.style.top = contentPaddingTop;
  }, 10);


  // Убрать баннер через 5 секунд
  setTimeout(() => {
    removeBanner(banner);
  }, 5500);
}

function removeBanner(banner) {
  // Анимация уезда баннера
  banner.style.top = '-25vw';

  // Удаление баннера из DOM через 0.5 секунды
  setTimeout(() => {
    banner.remove();
  }, 500);
}

// Пример использования
document.querySelectorAll('.achievement').forEach(achievement => {
  achievement.onclick = () => {
    const description = achievement.querySelector('.description').textContent;
    // const reward = achievement.querySelector('.reward p').textContent;
    const statusImageSrc = achievement.querySelector('.status img').src;
    showTopAchievement(description, statusImageSrc);
  };
});






















// Нижний паддинг в нижнем меню с учётом безопасной зоны
document.addEventListener('DOMContentLoaded', () => {
  const bottomMenu = document.querySelector('.bottom-menu');
  const menuImage = document.querySelector('.bottom-menu .menu img');
  let safeAreaBottom = 0;
  let contentSafeAreaBottom = 0;
  bottomMenu.style.paddingBottom = '0px';
  function updatePadding() {
    const totalPadding = safeAreaBottom + contentSafeAreaBottom;
    bottomMenu.style.paddingBottom = `${totalPadding}px`;
    if (menuImage) {
      const menuImageMarginTop = parseFloat(getComputedStyle(menuImage).marginTop) || 0;
      const currentPadding = parseFloat(getComputedStyle(bottomMenu).paddingBottom) || 0;
      if (currentPadding < menuImageMarginTop) {
        bottomMenu.style.paddingBottom = `${menuImageMarginTop}px`;
      }
    }
  }
  function onContentSafeAreaChanged() {
    const contentSafeArea = telegram.contentSafeAreaInset || {};
    contentSafeAreaBottom = contentSafeArea.bottom || 0;
    updatePadding();
  }
  function onSafeAreaChanged() {
    const safeArea = telegram.safeAreaInset || {};
    safeAreaBottom = safeArea.bottom || 0;
    updatePadding();
  }
  telegram.onEvent('contentSafeAreaChanged', onContentSafeAreaChanged);
  telegram.onEvent('safeAreaChanged', onSafeAreaChanged);
  onContentSafeAreaChanged();
  onSafeAreaChanged();
});








