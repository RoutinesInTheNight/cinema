const telegram = window.Telegram.WebApp;
const DEVICE_TYPE = telegram.platform;

telegram.expand();
if (telegram.isVersionAtLeast("6.1")) {
  telegram.BackButton.show()
  telegram.BackButton.onClick(() => hapticFeedback('soft', '../../'));
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

    if (isExternal) {
      telegram.openLink(redirectUrl);
    } else {
      const children = document.querySelectorAll('#movies-container > *');

      // Определяем видимые элементы
      const visibleChildren = Array.from(children).filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });

      // Запускаем анимацию только для видимых
      visibleChildren.forEach((child, index) => {
        setTimeout(() => {
          child.classList.remove('visible');
        }, index * 25);
      });

      // Переход после окончания анимации
      const delay = visibleChildren.length * 25;
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, delay);
    }
  }
}






// SafeAreaManager.js (или просто выше в коде)
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






document.addEventListener('DOMContentLoaded', () => {
  const bottomMenu = document.querySelector('.sorting');
  const topSearch = document.querySelector('#search');
  const searchCollaps = document.querySelector('.search-collaps');
  const moviesContainer = document.getElementById('movies-container');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? '0.5rem' : `${bottom}px`;
    const topValue = top === 0 ? '2.5vw' : `${top}px`;
    bottomMenu.style.paddingBottom = bottomValue;
    topSearch.style.marginTop = topValue;
    searchCollaps.style.marginTop = topValue;
    moviesContainer.style.marginTop = top === 0 ? 'calc(5vw + 38px)' : `calc(${top}px + 2.5vw + 38px)`;
    moviesContainer.style.marginBottom = bottom === 0 ? 'calc(0.5rem + 124.5px + 2.5vw)' : `calc(${bottom}px + 124.5px + 2.5vw)`
  };
  SafeAreaManager.init();
});














function updateSelectionsFromURL() {
  const params = new URLSearchParams(window.location.search);

  // === STEP 1: sort1 – имя пользователя ===
  const user = params.get("sort1");
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


















function change(sortKey, value) {
  hapticFeedback('change')
  const url = new URL(window.location);
  url.searchParams.set(sortKey, value);
  window.history.replaceState({}, '', url);

  updateSelectionsFromURL();
  applySortingFromURL();
  window.scrollTo({ top: 0, behavior: 'auto' });
  // window.scrollTo({ top: 0, behavior: 'smooth' });
}


function applySortingFromURL() {
  if (!movieData || !movieData.movies_data || !movieData.sort) return;

  const urlParams = new URLSearchParams(window.location.search);
  const sort1 = urlParams.get("sort1");
  const sort2 = urlParams.get("sort2");
  const sort3 = urlParams.get("sort3");

  const key = `${sort1}/${sort2}/${sort3}`;
  const movieIds = movieData.sort[key];

  const container = document.getElementById("movies-container");
  container.innerHTML = '';

  if (!movieIds || movieIds.length === 0) {
    container.innerHTML = '<div class="no-data">Нет данных для выбранной сортировки</div>';
    return;
  }

  movieIds.forEach((id, index) => {
    const movie = movieData.movies_data[id];
    if (!movie) return;
    const card = document.createElement("div");
    card.className = "movie-card";

    let tagsHTML = "";
    if (movie["8"] || movie["9"] || movie["10"]) {
      tagsHTML = '<div class="movie-tags">';
      if (movie["8"]) tagsHTML += `<span onclick='hapticFeedback("soft", "${movie["8"]}")'>HDREZKA</span>`;
      if (movie["9"]) tagsHTML += `<span onclick='hapticFeedback("soft", "${movie["9"]}")'>IMDb</span>`;
      if (movie["10"]) tagsHTML += `<span onclick='hapticFeedback("soft", "${movie["10"]}")'>КП</span>`;
      tagsHTML += "</div>";
    }
    card.innerHTML = `
      <div class="movie-number">${index + 1}</div>
      <div class="movie-info">
        <div class="movie-title">${movie["1"]}</div>
        <span class="movie-meta">${movie["2"]}</span>
        <div class="movie-rating-row">
          <div class="movie-score">
            <svg class="score-icon"><use href="#icon-star"/></svg>
            <span>${movie["3"]}</span>
          </div>
          <div class="movie-ratings"><span>IMDb: ${movie["4"]}</span><span>${movie["5"]}</span></div>
          <div class="movie-ratings"><span>КП: ${movie["6"]}</span><span>${movie["7"]}</span></div>
        </div>
        ${tagsHTML}
      </div>
    `;
    container.appendChild(card);
  });



  const children = container.querySelectorAll(':scope > *');

  // Проверка наличия параметра new-load=true
  const hasNewLoad = urlParams.get('new-load') === 'true';

  // Удалить только new-load из URL без перезагрузки
  if (hasNewLoad) {
    urlParams.delete('new-load');
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  // Первые 10
  children.forEach((child, index) => {
    if (index < 10) {
      if (hasNewLoad) {
        setTimeout(() => {
          child.classList.add('visible');
        }, index * 25);
      } else {
        child.classList.add('visible'); // без анимации — сразу
      }
    }
  });

  // Остальные — всегда через IntersectionObserver
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




document.addEventListener("DOMContentLoaded", () => {
  applySortingFromURL();
});










let movieData = null;

async function loadMoviesJson() {
  try {
    const response = await fetch('data.json');
    movieData = await response.json();

    // Добавить имена в сортировку
    const sort1Container = document.getElementById('sort1');
    if (movieData.users && Array.isArray(movieData.users)) {
      movieData.users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'sorting-user';
        div.setAttribute('onclick', `change('sort1', '${user}')`);

        const span = document.createElement('span');
        span.textContent = user;

        div.appendChild(span);
        sort1Container.appendChild(div);
      });
    }

    applySortingFromURL();
  } catch (e) {
    console.error('Ошибка при загрузке JSON:', e);
  }
}














// Нижнее меню сортировки убирается при поиске на телефонах
const input = document.getElementById('input');
const sorting = document.querySelector('.sorting');
input.addEventListener('focus', () => {
  if (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios') {
    sorting?.classList.add('hidden');
  }
});
input.addEventListener('blur', () => {
  if (document.activeElement !== input) {
    if (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios') {
      sorting?.classList.remove('hidden');
    }
  }
});



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







const searchCollaps = document.querySelector('.search-collaps');
const searchCollapsSvg = document.querySelector('.search-collaps-svg');
const search = document.getElementById('search');
const close = document.querySelector('.close');


// При нажатии на свёрнутую иконку поиска открывается клавиатура
searchCollaps.addEventListener('click', () => {
  hapticFeedback('medium');

  searchCollaps.classList.add('expanded');
  searchCollapsSvg.classList.add('faded');

  search.style.display = 'flex';

  const input = search.querySelector('input');
  if (input) input.focus();

  requestAnimationFrame(() => {
    search.classList.add('visible');
  });
});





close.addEventListener('click', () => {
  hapticFeedback('medium');

  // Скрываем строку поиска
  search.classList.remove('visible');

  requestAnimationFrame(() => {
    searchCollaps.classList.remove('expanded');
    searchCollapsSvg.classList.remove('faded');
  });

  setTimeout(() => {
    search.style.display = 'none';
  }, 250);

  // Сброс поиска
  const searchInput = document.querySelector('#input');
  searchInput.value = '';

  document.querySelectorAll('.movie-card').forEach(card => {
    card.classList.remove('hidden');
  });

  // Обновляем safe area
  SafeAreaManager.onChange = ({ top, bottom }) => {
    moviesContainer.style.marginTop = top === 0 ? '2.5vw' : `${top}px`;
  };
  SafeAreaManager.init();
});










// ПОИСК
const searchInput = document.querySelector('#input');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll('.movie-card');

  cards.forEach(card => {
    const title = card.querySelector('.movie-title')?.textContent.toLowerCase() || '';
    const metaRaw = card.querySelector('.movie-meta')?.textContent.toLowerCase() || '';
    const meta = metaRaw.split(' • ')[0]; // Только первая часть до " • "

    if (query && !(title.includes(query) || meta.includes(query))) {
      card.classList.add('hidden');
    } else {
      card.classList.remove('hidden');
    }
  });
});


