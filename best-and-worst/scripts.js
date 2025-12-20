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
  const search = document.getElementById('search');
  const moviesContainer = document.getElementById('movies-container');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? 'calc((100 / 428) * 8 * var(--vw))' : `${bottom}px`;
    const topValue = top === 0 ? 'calc(2.5 * var(--vw))' : `${top}px`;
    bottomMenu.style.paddingBottom = bottomValue;

    search.style.marginTop = topValue;

    moviesContainer.style.marginTop = topValue;
    moviesContainer.style.marginBottom = bottom === 0 ? 'calc(0.5rem + 124.5px + 2.5vw)' : `calc(${bottom}px + 124.5px + 2.5vw)`
  };
  SafeAreaManager.init();
});






function openCloseSorting() {
  hapticFeedback('change');
  const closingSorting = document.querySelector('.closing-sorting');
  const svg = document.querySelector('.open-close-sorting svg');
  closingSorting.classList.toggle('close');
  svg.classList.toggle('rotate');
}





// Добавление кнопок с именами
function addNameButtons(usersList) {
  const container = document.getElementById("sort1");
  container.innerHTML = `<div class="sorting-user" onclick="changeSorting('sort1', 'Все')"><span>Все</span></div>`;
  usersList.forEach(user => {
    const userDiv = document.createElement("div");
    userDiv.className = "sorting-user";
    userDiv.setAttribute("onclick", `changeSorting('sort1', '${user}')`);
    userDiv.innerHTML = `<span>${user}</span>`;
    container.appendChild(userDiv);
  });
}


// Выделение кнопок в сортировке
function selectButtonsInSorting() {
  const urlParams = new URLSearchParams(window.location.search);
  const sort1 = urlParams.get("sort1");
  const sort2 = urlParams.get("sort2");
  const sort3 = urlParams.get("sort3");

  const userItems = document.querySelectorAll("#sort1 .sorting-user");
  userItems.forEach((item) => {
    const name = item.textContent.trim();
    if (name === sort1) {
      item.classList.add("selected");
      item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } else item.classList.remove("selected");
  });

  const sort2Container = document.getElementById("sort2");
  sort2Container.querySelectorAll("div").forEach((div) => {
    div.classList.toggle("selected", div.id === sort2);
  });

  const sort3Container = document.getElementById("sort3");
  sort3Container.querySelectorAll("div").forEach((div) => {
    div.classList.toggle("selected", div.id === sort3);
  });
}






// РЕНДЕР КАРТОЧЕК
function renderCards(movieIDs, movieIDsFromSearch = null) {
  const BATCH_SIZE = 10; // по сколько карточек рендерить
  let renderedCount = 0;

  const container = document.getElementById("movies-container");
  container.innerHTML = "";
  const sentinel = document.createElement('div');
  sentinel.id = 'lazy-sentinel';
  container.appendChild(sentinel);

  function renderNextBatch() {
    let nextBatch = movieIDs.slice(renderedCount, renderedCount + BATCH_SIZE);
    if (movieIDsFromSearch) nextBatch = movieIDsFromSearch.slice(renderedCount, renderedCount + BATCH_SIZE);

    nextBatch.forEach((id, index) => {
      const movie = moviesDataJson.movies_data[id];
      if (!movie) return;
      const card = document.createElement("div");
      card.className = "movie";

      let movieRatingsHTML = '<div class="movie-ratings">';
      const ratingTotal = movie["5"];
      const ratingTotalLeft = ratingTotal.slice(0, 4);
      const ratingTotalRight = ratingTotal.slice(4);

      movieRatingsHTML += `<div class="movie-rating-total"><span class="left">${ratingTotalLeft}</span><span class="right">${ratingTotalRight}</span></div>`;
      movieRatingsHTML += `<div class="movie-rating-imdb"><span>IMDb: ${movie["6"]}</span><span>${movie["7"]}</span></div>`;
      movieRatingsHTML += `<div class="movie-rating-kp"><span>КП: ${movie["8"]}</span><span>${movie["9"]}</span></div>`;
      movieRatingsHTML += "</div>";

      const whoViewedHTML = movie["10"]
        .map(name => `<span class="user">${name}</span>`)
        .join('');

      card.innerHTML = `
        <div class="poster">
          <img src="${movie["1"]}" loading="lazy">
        </div>
        <div class="info">
          <div class="title-ru">${movieIDs.indexOf(id) + 1}. ${movie["2"]}</div>
          <span class="title-en">${movie["3"]}</span>
          <span class="meta">${movie["4"]}</span>
          ${movieRatingsHTML}
          <div class="who-viewed">${whoViewedHTML}</div>
        </div>
      `;

      container.insertBefore(card, sentinel); // вставка карточки перед sentinel
    });

    renderedCount += nextBatch.length;

    // удаление sentinel, когда все карточки отрендерены
    if (renderedCount >= movieIDs.length) {
      observer.disconnect();
      sentinel.remove();
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const last = entries[0];
      if (last.isIntersecting) {
        renderNextBatch();
      }
    },
    {
      rootMargin: '200px',
    }
  );

  observer.observe(sentinel);

  // рендер первых карточек
  renderNextBatch();
}






function addUsersCards(searcText = null) {
  const urlParams = new URLSearchParams(window.location.search);
  const sort1 = urlParams.get("sort1");
  const sort2 = urlParams.get("sort2");
  const sort3 = urlParams.get("sort3");
  const key = `${sort1}/${sort2}/${sort3}`;
  const movieIDs = moviesDataJson.sort[key];
  if (!searcText) renderCards(movieIDs);
  else {
    movieIDsFromSearch = [];

    // Собираем данные для Fuse
    const moviesArray = movieIDs.map(id => {
      const m = moviesDataJson.movies_data[id];
      return {
        id: id,
        titleRu: String(m["2"] ?? ""),
        titleEn: String(m["3"] ?? "")
      };
    });

    // Настройки Fuse
    const options = {
      keys: ["titleRu", "titleEn"],
      includeScore: true,
      threshold: 0.3, // чувствительность: меньше = строже, больше = мягче
      ignoreLocation: true,
      ignoreFieldNorm: true
    };

    // Создаём Fuse
    const fuse = new Fuse(moviesArray, options);

    // Поиск
    const results = fuse.search(searcText);

    // Берём только id найденных фильмов
    movieIDsFromSearch = results.map(r => r.item.id);

    renderCards(movieIDs, movieIDsFromSearch);
  }
}



















let moviesDataJson = null;
async function loadMoviesJson() {
  try {
    const response = await fetch('data.json');
    moviesDataJson = await response.json();
    addNameButtons(moviesDataJson.users);
    selectButtonsInSorting();
    addUsersCards();
  } catch (e) {
    console.error('Ошибка при загрузке "data.json":', e);
  }
}

function changeSorting(sortKey, value) {
  hapticFeedback('change');
  const url = new URL(window.location);
  url.searchParams.set(sortKey, value);
  window.history.replaceState({}, '', url);
  selectButtonsInSorting();
  addUsersCards();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

window.addEventListener("DOMContentLoaded", () => {
  loadMoviesJson();
});





















// Нижнее меню сортировки убирается при поиске на телефонах
// const input = document.getElementById('input');
// const sorting = document.querySelector('.sorting');




// Фокус с input пропадает при клике вне его области
// const overlay = document.getElementById('overlay');
// input.addEventListener('focus', () => {
//   overlay.style.display = 'block';
// });
// overlay.addEventListener('click', () => {
//   hapticFeedback('medium');
//   input.blur();
//   overlay.style.display = 'none';
// });
// input.addEventListener('blur', () => {
//   overlay.style.display = 'none';
// });







const sorting = document.querySelector('.sorting');

const searchEl = document.getElementById('search');
const openSearchEl = document.querySelector('#search .open');
const inputSearchEl = document.querySelector('#search .input');
const closeSearchEl = document.querySelector('#search .close');
const searchOverlay = document.getElementById('search-overlay');
const inputField = inputSearchEl.querySelector('input');

const searchInput = document.querySelector('#input');


isSearchOpen = false;

function openSearch() {
  hapticFeedback('medium');
  requestAnimationFrame(() => {
    inputField.focus();
  });
  searchEl.style.width = "calc(90 * var(--vw))";
  inputSearchEl.style.width = "calc(100% - (100 / 428 * (32 + 32) * var(--vw)))";
  closeSearchEl.style.width = "calc(100 / 428 * 32 * var(--vw))";
  searchOverlay.style.display = "block";
  if (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios') {
    sorting.classList.add('hidden');
  }
}

function closeSearch() {
  hapticFeedback('medium');
  inputField.blur();
  searchEl.style.width = "calc(100 / 428 * 32 * var(--vw))";
  inputSearchEl.style.width = "0";
  closeSearchEl.style.width = "0";
  searchOverlay.style.display = "none";
  sorting.classList.remove('hidden');
}




function keyboardCollapse() {
  hapticFeedback('medium');
  inputField.blur();
  searchOverlay.style.display = "none";
  sorting.classList.remove('hidden');
}


inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    keyboardCollapse();
  }
});




// inputField.addEventListener('focus', () => {
//   const searchInput = document.querySelector('#input');
// });


// inputField.addEventListener('blur', () => {
//   sorting.classList.remove('hidden');

//   // if (document.activeElement !== input) {
//   //   if (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios') {
//   //     sorting?.classList.remove('hidden');
//   //   }
//   // }
// });










// При нажатии на свёрнутую иконку поиска открывается клавиатура
// searchCollaps.addEventListener('click', () => {
//   hapticFeedback('medium');

//   searchCollaps.classList.add('expanded');
//   searchCollapsSvg.classList.add('faded');

//   search.style.display = 'flex';

//   const input = search.querySelector('input');
//   if (input) input.focus();

//   requestAnimationFrame(() => {
//     search.classList.add('visible');
//   });
// });





// close.addEventListener('click', () => {
//   hapticFeedback('medium');

//   // Скрываем строку поиска
//   search.classList.remove('visible');

//   requestAnimationFrame(() => {
//     searchCollaps.classList.remove('expanded');
//     searchCollapsSvg.classList.remove('faded');
//   });

//   setTimeout(() => {
//     search.style.display = 'none';
//   }, 250);

//   // Сброс поиска
//   const searchInput = document.querySelector('#input');
//   searchInput.value = '';

//   document.querySelectorAll('.movie-card').forEach(card => {
//     card.classList.remove('hidden');
//   });

//   // Обновляем safe area
//   SafeAreaManager.onChange = ({ top, bottom }) => {
//     moviesContainer.style.marginTop = top === 0 ? '2.5vw' : `${top}px`;
//   };
//   SafeAreaManager.init();
// });










// ПОИСК
searchInput.addEventListener('input', () => {
  const searchText = searchInput.value.trim().toLowerCase();
  if (!searchText) return;
  addUsersCards(searchText);
});













// const container = document.querySelector('.who-viewed');
// const fadeLeft = document.querySelector('.fade-left');
// const fadeRight = document.querySelector('.fade-right');

// function updateFades() {
//   const scrollLeft = container.scrollLeft;
//   const scrollWidth = container.scrollWidth;
//   const clientWidth = container.clientWidth;
//   const tolerance = 2; // пикселей запаса, чтобы избежать "мигания"

//   // если в начале
//   if (scrollLeft <= tolerance) {
//     fadeLeft.classList.add('hidden');
//   } else {
//     fadeLeft.classList.remove('hidden');
//   }

//   // если в конце
//   if (scrollLeft + clientWidth >= scrollWidth - tolerance) {
//     fadeRight.classList.add('hidden');
//   } else {
//     fadeRight.classList.remove('hidden');
//   }
// }

// // следим за скроллом
// container.addEventListener('scroll', updateFades);
// // следим за ресайзом (вдруг ширина окна изменилась)
// window.addEventListener('resize', updateFades);

// // инициализация
// updateFades();