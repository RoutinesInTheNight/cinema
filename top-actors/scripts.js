const telegram = window.Telegram.WebApp;
const DEVICE_TYPE = telegram.platform;

telegram.expand();
if (telegram.isVersionAtLeast("6.1")) {
  telegram.BackButton.show()
  const currentUrl = window.location.href;
  let targetBackLink = '../../';
  if (currentUrl.includes('series')) targetBackLink = '../../series';
  else if (currentUrl.includes('general')) targetBackLink = '../../general';
  telegram.BackButton.onClick(() => hapticFeedback('soft', targetBackLink));
}
if (telegram.isVersionAtLeast("7.7")) telegram.disableVerticalSwipes();
if (telegram.isVersionAtLeast("8.0")) {
  telegram.requestFullscreen();
  telegram.lockOrientation();
}



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
    const externalPrefixes = ['http://hdrezka', 'https://www.imdb', 'https://www.kinopoisk'];
    const isExternal = externalPrefixes.some(prefix => redirectUrl.startsWith(prefix));
    // Открытие ссылки вне телеграм / Переход на другую страницу с анимацией исчезновения
    if (isExternal) {
      telegram.openLink(redirectUrl);
    } else {
      const children = document.querySelectorAll('#movies-container > *');
      const visibleChildren = Array.from(children).filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });
      visibleChildren.forEach((child, index) => {
        setTimeout(() => {
          child.classList.remove('visible');
        }, index * 25);
      });
      const delay = visibleChildren.length * 25;
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, delay);
    }
  }
}


// Определение границ безопасных зон
const SafeAreaManager = (() => {
  let safeAreaTop = 0;
  let safeAreaBottom = 0;
  let contentSafeAreaTop = 0;
  let contentSafeAreaBottom = 0;

  function getTotalSafeAreas() {
    return {
      top: safeAreaTop + contentSafeAreaTop,
      bottom: safeAreaBottom + contentSafeAreaBottom
    };
  }

  function updateFromTelegram() {
    const content = telegram.contentSafeAreaInset || {};
    const system = telegram.safeAreaInset || {};

    contentSafeAreaTop = content.top || 0;
    contentSafeAreaBottom = content.bottom || 0;
    safeAreaTop = system.top || 0;
    safeAreaBottom = system.bottom || 0;
  }

  function init() {
    const updateAndNotify = () => {
      updateFromTelegram();
      if (typeof SafeAreaManager.onChange === 'function') {
        SafeAreaManager.onChange(getTotalSafeAreas());
      }
    };

    telegram.onEvent('safeAreaChanged', updateAndNotify);
    telegram.onEvent('contentSafeAreaChanged', updateAndNotify);
    updateAndNotify();
  }

  return {
    init,
    getTotalSafeAreas,
    onChange: null // Можно назначить слушатель изменений
  };
})();





// Выставление паддингов и маргинов в зависимости от безопасной зоны
document.addEventListener('DOMContentLoaded', () => {
  const description = document.querySelector('.description');
  const numbersContainer = document.querySelector('.numbers-container');
  const bottomMenu = document.querySelector('.sorting');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? 'calc((100 / 428) * 8 * var(--vw))' : `${bottom}px`;
    const topValue = top === 0 ? 'calc(2.5 * var(--vw))' : `${top}px`;

    description.style.marginTop = topValue;

    bottomMenu.style.paddingBottom = bottomValue;

    numbersContainer.style.paddingBottom = bottom === 0 ? 'calc(((100 / 428) * (37 + 16) * var(--vw)) + 2.5 * var(--vw))' : `calc(${bottom}px + ((100 / 428) * (37 + 8) * var(--vw)) + 2.5 * var(--vw))`
  };
  SafeAreaManager.init();
});



// Скрытие .movie у нижней границы верхней безопаной зоны
function updateMovieOpacity() {
  console.log(1);
  const movies = document.querySelectorAll('.movie');
  const { top, bottom } = SafeAreaManager.getTotalSafeAreas();
  const vw = getCustomVw();
  const safeAreaTopPx = top === 0 ? 2.5 * vw : top;
  const heightInfo = 100 / 428 * 40 * vw;
  const fadeStartY = safeAreaTopPx + heightInfo;
  const fadeEndY = safeAreaTopPx;
  movies.forEach(movie => {
    const top = movie.getBoundingClientRect().top;
    if (top <= fadeStartY && top >= fadeEndY) {
      const opacity = (top - fadeEndY) / (fadeStartY - fadeEndY);
      movie.style.opacity = opacity;
    } else if (top < fadeEndY) {
      movie.style.opacity = 0;
    } else {
      movie.style.opacity = 1;
    }
  });
}

function getCustomVw() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < 500) {
    return width / 100;
  } else {
    return (height * 0.5) / 100;
  }
}

window.addEventListener('scroll', updateMovieOpacity);
window.addEventListener('resize', updateMovieOpacity);
window.addEventListener('load', updateMovieOpacity);






// Открытие и закрытие списка фильмов
function showHideMovies(button, number, actor) {
  hapticFeedback('medium');
  const card = button.closest('.card');
  const movies = card.querySelector('.movies');
  const current = movies.style.height;

  const user = new URLSearchParams(window.location.search).get('user');
  const movieIds = jsonData.sort?.[user]?.[number]?.[actor] || [];
  console.log(movieIds);

  if (current && current !== '0px') {
    // Закрытие
    button.classList.remove('open');
    movies.style.height = movies.scrollHeight + 'px';
    movies.offsetHeight;
    movies.style.height = '0px';

    // Очистка .movies
    movies.addEventListener('transitionend', function handler() {
      movies.removeEventListener('transitionend', handler);
      movies.innerHTML = '';
    });

    // Скролл вверх, если .card выше безопасной зоны
    const { top, bottom } = SafeAreaManager.getTotalSafeAreas();
    const vw = getCustomVw();
    const safeAreaTop = top === 0 ? 2.5 * vw : top;
    const rect = card.getBoundingClientRect();
    if (rect.top < safeAreaTop || rect.top > window.innerHeight) {
      const scrollY = window.scrollY + rect.top - safeAreaTop;
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
    }

  } else {
    // Открытие
    button.classList.add('open');

    movies.innerHTML = ''; // на всякий случай очищаем

    // === Расчёт среднего рейтинга актёра ===
    let sum = 0;
    let count = 0;

    movieIds.forEach(id => {
      const movie = jsonData.movies_data?.[id];
      if (!movie) return;

      const score = movie["4"];
      const numericScore = parseFloat(score?.replace(',', '.'));
      if (!isNaN(numericScore)) {
        sum += numericScore;
        count += 1;
      }
    });

    const average = count > 0 ? (sum / count).toFixed(3) : 'н/д';

    // === Специальный .movie с рейтингом и ссылкой ===
    const specialMovie = document.createElement('div');
    specialMovie.className = 'movie';
    specialMovie.innerHTML = `
      <img src="../images/${actor}.webp" />
      <div class="person-add">
        <div class="average-rating">
          <span class="average-rating-num">Средний рейтинг: ${average}</span>
        </div>
        <div class="kp-page">
          <span onclick="hapticFeedback('soft', 'https://www.kinopoisk.ru/name/${actor}/')" class="kp-page-button">Открыть на Кинопоиске</span>
        </div>
      </div>
    `;
    movies.appendChild(specialMovie);


    // === Генерация .movie элементов ===
    movieIds.forEach(id => {
      const movie = jsonData.movies_data?.[id];
      if (!movie) return;

      const title = movie["1"] || '';
      const titleEn = movie["2"] || '';
      const year = movie["3"] || '';
      const score = movie["4"] || '';
      const duration = movie["5"];
      const link1 = movie["6"];
      const link2 = movie["7"];
      const link3 = movie["8"];

      const metaParts = [score, year];
      if (duration) metaParts.push(duration);

      const meta = metaParts.join(' • ');

      const movieEl = document.createElement('div');
      movieEl.className = 'movie';

      movieEl.innerHTML = `
        <div class="content">
          <div class="movie-title">${title}</div>
          <span class="movie-title-en">${titleEn}</span>
          <span class="movie-meta">
            <svg class="score-icon"><use href="#icon-star"></use></svg>
            ${meta}
          </span>
        </div>
        ${link1 || link2 || link3
          ? `<div class="open-links">
                <svg><use href="#more"></use></svg>
              </div>`
          : ''
        }
      `;
      movies.appendChild(movieEl);
    });


    // ${link3 ? `<svg onclick="hapticFeedback('soft', '${link3}')"><use href="#kinopoisk-logo"></use></svg>` : ''}

    // Установка высоты после наполнения
    movies.style.height = movies.scrollHeight + 'px';

    movies.addEventListener('transitionend', function handler() {
      movies.removeEventListener('transitionend', handler);
    });
  }
}
























// Добавление кнопок с именами из json
function populateUserSorting(userList) {
  const container = document.getElementById("sort1");
  container.innerHTML = ''; // на всякий случай очищаем
  // Вставляем кнопку "Все"
  const allDiv = document.createElement("div");
  allDiv.className = "sorting-user";
  allDiv.setAttribute("onclick", `change('sort1', 'Все')`);
  allDiv.innerHTML = `<span>Все</span>`;
  container.appendChild(allDiv);
  // Вставляем имена
  userList.forEach(user => {
    const userDiv = document.createElement("div");
    userDiv.className = "sorting-user";
    userDiv.setAttribute("onclick", `change('sort1', '${user}')`);
    userDiv.innerHTML = `<span>${user}</span>`;
    container.appendChild(userDiv);
  });
}


// Выделение кнопки с именем и добавление фильмов / сериалов из json
function applySortingFromURL() {
  if (!jsonData || !jsonData.movies_data || !jsonData.sort) return;

  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");

  // === ДОБАВЛЯЕМ: выделение пользователя ===
  if (user) {
    const userItems = document.querySelectorAll("#sort1 .sorting-user");
    userItems.forEach((item) => {
      const name = item.textContent.trim();
      if (name === user) {
        item.classList.add("selected");
        item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  const userSort = jsonData.sort[user];

  const container = document.querySelector('.numbers-container');
  container.innerHTML = ''; // очищаем на всякий случай

  if (!userSort || Object.keys(userSort).length === 0) return;

  const numberKeys = Object.keys(userSort).sort((a, b) => b - a);


  numberKeys.forEach((numberKey, index) => {
    const actorsObj = userSort[numberKey]; // Например, { '34242': [...], '973': [...] }

    // === Создаем number-container ===
    const numberContainer = document.createElement('div');
    numberContainer.className = 'number-container';

    // === Создаем <span class="number"> ===
    const numberSpan = document.createElement('span');
    numberSpan.className = 'number';
    numberSpan.textContent = index + 1; // порядковый номер
    numberContainer.appendChild(numberSpan);

    // === Создаем <div class="cards"> ===
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'cards';

    // === Перебираем актёров внутри текущего numberKey ===
    for (const actorId in actorsObj) {
      const card = document.createElement('div');
      card.className = 'card';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = jsonData.actors[actorId] || `Актёр ${actorId}`;

      const moviesNumSpan = document.createElement('span');
      moviesNumSpan.className = 'movies-num';
      moviesNumSpan.textContent = numberKey;

      const toggleDiv = document.createElement('div');
      toggleDiv.className = 'show-hide-movies';
      toggleDiv.setAttribute('onclick', `showHideMovies(this, ${numberKey}, ${actorId})`);
      toggleDiv.innerHTML = `
        <svg>
          <use href="#show-hide-movies-svg"></use>
        </svg>`;

      const moviesDiv = document.createElement('div');
      moviesDiv.className = 'movies';

      // Сборка карточки
      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(moviesNumSpan);
      infoDiv.appendChild(toggleDiv);

      card.appendChild(infoDiv);
      card.appendChild(moviesDiv);

      cardsDiv.appendChild(card);
    }

    numberContainer.appendChild(cardsDiv);
    container.appendChild(numberContainer);
  });



  const numberAll = document.querySelectorAll('.number');
  const infoAll = document.querySelectorAll('.info');
  SafeAreaManager.onChange = ({ top, bottom }) => {
    const topValue = top === 0 ? 'calc(2.5 * var(--vw))' : `${top}px`;
    numberAll.forEach(number => {
      number.style.top = topValue;
    });
    infoAll.forEach(info => {
      info.style.top = topValue;
    });
  };
  SafeAreaManager.init();

}

// Загрузка json
let jsonData = null;
async function loadMoviesJson() {
  try {
    const response = await fetch('data.json');
    jsonData = await response.json();
    populateUserSorting(jsonData.users);
    applySortingFromURL();
  } catch (e) {
    console.error('Ошибка при загрузке JSON:', e);
  }
}


function change(sortKey, value) {
  hapticFeedback('change')
  const url = new URL(window.location);
  url.searchParams.set('user', value);
  window.history.replaceState({}, '', url);
  applySortingFromURL();
  window.scrollTo({ top: 0, behavior: 'auto' });
}


window.addEventListener("DOMContentLoaded", () => {
  loadMoviesJson();
});