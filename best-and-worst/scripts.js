const telegram = window.Telegram.WebApp;
const DEVICE_TYPE = telegram.platform;

telegram.expand();
if (telegram.isVersionAtLeast("6.1")) {
  telegram.BackButton.show()
  const currentUrl = window.location.href;
  let targetBackLink = '../../';
  if (currentUrl.includes('series')) {
    targetBackLink = '../../series';
  }
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





// Выставление пддингов и маргинов в зависимости от безопасной зоны
document.addEventListener('DOMContentLoaded', () => {
  const bottomMenu = document.querySelector('.sorting');
  const topSearch = document.querySelector('#search');
  const searchCollaps = document.querySelector('.search-collaps');
  const moviesContainer = document.getElementById('movies-container');
  const keyboards = document.querySelector('.keyboards');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? '0.5rem' : `${bottom}px`;
    const bottomValueMoviesContainer = bottom === 0 ? '0.5rem' : `${bottom * 2}px`;
    const topValue = top === 0 ? '2.5vw' : `${top}px`;
    bottomMenu.style.paddingBottom = bottomValue;
    keyboards.style.paddingBottom = bottom === 0 ? '0.5rem' : `${bottom * 2}px`;
    topSearch.style.marginTop = topValue;

    searchCollaps.style.marginBottom = `calc(${bottom + 97 + 37}px + 0.5rem)`;

    moviesContainer.style.marginTop = topValue;
    moviesContainer.style.marginBottom = `calc(${bottomValue} + calc(100 / 1284 * (134 * 5 + 33 * 5 + 140) * 1vw))`;
  };
  SafeAreaManager.init();
});






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
  if (!movieData || !movieData.movies_data || !movieData.sort) return;

  const urlParams = new URLSearchParams(window.location.search);
  const sort1 = urlParams.get("sort1");
  const sort2 = urlParams.get("sort2");
  const sort3 = urlParams.get("sort3");

  // === ДОБАВЛЯЕМ: выделение пользователя ===
  if (sort1) {
    const userItems = document.querySelectorAll("#sort1 .sorting-user");
    userItems.forEach((item) => {
      const name = item.textContent.trim();
      if (name === sort1) {
        item.classList.add("selected");
        item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  const key = `${sort1}/${sort2}/${sort3}`;
  const movieIds = movieData.sort[key];

  const container = document.getElementById("movies-container");
  container.innerHTML = '';

  if (!movieIds || movieIds.length === 0) return;

  movieIds.forEach((id, index) => {
    const movie = movieData.movies_data[id];
    if (!movie) return;
    const card = document.createElement("div");
    card.className = "movie-card";

    let tagsHTML = "";
    if (movie["9"] || movie["10"] || movie["11"]) {
      tagsHTML = '<div class="movie-tags">';
      if (movie["9"]) tagsHTML += `<span onclick='hapticFeedback("soft", "${movie["9"]}")'>HDREZKA</span>`;
      if (movie["10"]) tagsHTML += `<span onclick='hapticFeedback("soft", "${movie["10"]}")'>IMDb</span>`;
      if (movie["11"]) tagsHTML += `<span onclick='hapticFeedback("soft", "${movie["11"]}")'>КП</span>`;
      tagsHTML += "</div>";
    }
    card.innerHTML = `
      <div class="movie-number">${index + 1}</div>
      <div class="movie-info">
        <div class="movie-title">${movie["1"]}</div>
        <span class="movie-title-en">${movie["2"]}</span>
        <span class="movie-meta">${movie["3"]}</span>
        <div class="movie-rating-row">
          <div class="movie-score">
            <svg class="score-icon"><use href="#icon-star"/></svg>
            <span>${movie["4"]}</span>
          </div>
          <div class="movie-ratings"><span>IMDb: ${movie["5"]}</span><span>${movie["6"]}</span></div>
          <div class="movie-ratings"><span>КП: ${movie["7"]}</span><span>${movie["8"]}</span></div>
        </div>
        ${tagsHTML}
      </div>
    `;
    container.appendChild(card);
  });

  const children = container.querySelectorAll(':scope > *');
  const hasNewLoad = urlParams.get('new-load') === 'true';

  if (hasNewLoad) {
    urlParams.delete('new-load');
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  children.forEach((child, index) => {
    if (index < 10) {
      if (hasNewLoad) {
        setTimeout(() => {
          child.classList.add('visible');
        }, index * 25);
      } else {
        child.classList.add('visible');
      }
    }
  });

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  children.forEach((child, index) => {
    if (index >= 10) {
      observer.observe(child);
    }
  });
}

// Выделение кнопок 2-й и 3-й сортировок
function updateSortButtonsFromURL() {
  const params = new URLSearchParams(window.location.search);

  // === STEP 2: sort2 – таблица по ID ===
  const sort2 = params.get("sort2");
  if (sort2) {
    const sort2Container = document.getElementById("sort2");
    if (sort2Container) {
      sort2Container.querySelectorAll("div").forEach((div) => {
        div.classList.toggle("selected", div.id === sort2);
      });
    }
  }

  // === STEP 3: sort3 – аналогично sort2 ===
  const sort3 = params.get("sort3");
  if (sort3) {
    const sort3Container = document.getElementById("sort3");
    if (sort3Container) {
      sort3Container.querySelectorAll("div").forEach((div) => {
        div.classList.toggle("selected", div.id === sort3);
      });
    }
  }
}

// Загрузка json
let movieData = null;
async function loadMoviesJson() {
  try {
    const response = await fetch('data.json');
    movieData = await response.json();
    populateUserSorting(movieData.users);
    applySortingFromURL();
  } catch (e) {
    console.error('Ошибка при загрузке JSON:', e);
  }
}

function change(sortKey, value) {
  hapticFeedback('change')
  const url = new URL(window.location);
  url.searchParams.set(sortKey, value);
  window.history.replaceState({}, '', url);

  updateSortButtonsFromURL();
  applySortingFromURL();
  window.scrollTo({ top: 0, behavior: 'auto' });
  // window.scrollTo({ top: 0, behavior: 'smooth' });
}


/**
 * 
 * 1) Последний элемент конструкции DOMContentLoaded запускает loadMoviesJson и @see updateSortButtonsFromURL
 * --- 1) @see loadMoviesJson загружает json и запускает @see populateUserSorting с @see applySortingFromURL
 * --- --- 1) @see populateUserSorting в нижнее меню с сортировкой добавляет кнопки с именами
 * --- --- 2) @see applySortingFromURL выделяет нужную кнопку с именем и добавляет фильмы / сериалы из json
 * --- 2) @see updateSortButtonsFromURL выделяет нужные кнопки 2-й и 3-й сортировки
 * Функция @see change запускат @see updateSortButtonsFromURL и @see applySortingFromURL
 * 
 * 
 * 
 * 
*/


window.addEventListener("DOMContentLoaded", () => {
  loadMoviesJson();
  updateSortButtonsFromURL();
});

























// Нижнее меню сортировки убирается при поиске на телефонах
// const input = document.getElementById('input');
// const sorting = document.querySelector('.sorting');
// input.addEventListener('focus', () => {
//   if (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios') {
//     sorting?.classList.add('hidden');
//   }
// });
// input.addEventListener('blur', () => {
//   if (document.activeElement !== input) {
//     if (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios') {
//       sorting?.classList.remove('hidden');
//     }
//   }
// });



// Фокус с input пропадает при клике вне его области
const overlay = document.getElementById('overlay');
input.addEventListener('focus', () => {
  overlay.style.display = 'block';
});
overlay.addEventListener('click', () => {
  hapticFeedback('medium');
  input.blur();
  overlay.style.display = 'none';
});
input.addEventListener('blur', () => {
  overlay.style.display = 'none';
});





const sorting = document.querySelector('.sorting');

const searchCollaps = document.querySelector('.search-collaps');
const searchCollapsSvg = document.querySelector('.search-collaps-svg');
const search = document.getElementById('search');
const close = document.querySelector('.close');
const keyboards = document.querySelector(".keyboards");

// Открытие поиска
searchCollaps.addEventListener('click', () => {
  hapticFeedback('medium');

  searchCollaps.style.display = 'none';
  search.style.display = 'flex';

  // const input = search.querySelector('input');
  // if (input) input.focus();
  keyboards.classList.remove("hidden");
  sorting.classList.add("hidden");

});





close.addEventListener('click', () => {
  hapticFeedback('medium');

  searchCollaps.style.display = 'flex';
  search.style.display = 'none';

  // Сброс поиска
  const searchInput = document.querySelector('#input');
  searchInput.value = '';

  document.querySelectorAll('.movie-card').forEach(card => {
    card.classList.remove('hidden');
  });

  keyboards.classList.add("hidden");
  sorting.classList.remove("hidden");

  // Обновляем safe area
  // SafeAreaManager.onChange = ({ top, bottom }) => {
  //   moviesContainer.style.marginTop = top === 0 ? '2.5vw' : `${top}px`;
  // };
  // SafeAreaManager.init();
});










// ПОИСК
const searchInput = document.querySelector('#input');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll('.movie-card');

  cards.forEach(card => {
    const title = card.querySelector('.movie-title')?.textContent.toLowerCase() || '';
    const titleEn = card.querySelector('.movie-title-en')?.textContent.toLowerCase() || '';

    if (query && !(title.includes(query) || titleEn.includes(query))) {
      card.classList.add('hidden');
    } else {
      card.classList.remove('hidden');
    }
  });
});










// Переключение языков клавиатуры
function changeLang() {
  hapticFeedback("light");
  const keyboardRowsRu = document.querySelectorAll('.keyboard .ru');
  const keyboardRowsEn = document.querySelectorAll('.keyboard .en');
  if (keyboardRowsRu) {
    keyboardRowsRu.forEach((row) => {
      row.classList.toggle('hidden');
    });
  }
  if (keyboardRowsEn) {
    keyboardRowsEn.forEach((row) => {
      row.classList.toggle('hidden');
    });
  }
}


function showHideNumbers() {
  hapticFeedback("light");
  const numbers = document.querySelector('.keyboard .numbers');
  const actionButtons = document.querySelectorAll('.show-hide-numbers');
  if (numbers) numbers.classList.toggle('hidden');
  if (actionButtons) {
    actionButtons.forEach((actionButton) => {
      actionButton.classList.toggle('active');
    });
  }

}



