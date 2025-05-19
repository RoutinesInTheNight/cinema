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






// Нижний паддинг в нижнем меню с учётом безопасной зоны
document.addEventListener('DOMContentLoaded', () => {
  const bottomMenu = document.querySelector('.sorting');
  const topSearch = document.querySelector('#search-wrapper');
  let safeAreaBottom = 0;
  let safeAreaTop = 0;
  let contentSafeAreaBottom = 0;
  let contentSafeAreaTop = 0;
  bottomMenu.style.paddingBottom = '0px';
  topSearch.style.paddingTop = '0px';
  function updatePadding() {
    const totalPaddingBottom = safeAreaBottom + contentSafeAreaBottom;
    const totalPaddingTop = safeAreaTop + contentSafeAreaTop;
    if (totalPaddingBottom === 0) {
      bottomMenu.style.paddingBottom = `2.5vw`;
    } else {
      bottomMenu.style.paddingBottom = `${totalPaddingBottom}px`;
    }
    if (totalPaddingTop === 0) {
      topSearch.style.marginTop = `2.5vw`;
    } else {
      topSearch.style.marginTop = `${totalPaddingTop}px`;
    }
  }
  function onContentSafeAreaChanged() {
    const contentSafeArea = telegram.contentSafeAreaInset || {};
    contentSafeAreaBottom = contentSafeArea.bottom || 0;
    contentSafeAreaTop = contentSafeArea.top || 0;
    updatePadding();
  }
  function onSafeAreaChanged() {
    const safeArea = telegram.safeAreaInset || {};
    safeAreaBottom = safeArea.bottom || 0;
    safeAreaTop = safeArea.top || 0;
    updatePadding();
  }
  telegram.onEvent('contentSafeAreaChanged', onContentSafeAreaChanged);
  telegram.onEvent('safeAreaChanged', onSafeAreaChanged);
  onContentSafeAreaChanged();
  onSafeAreaChanged();
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
    const response = await fetch('data.json'); // укажи правильный путь
    movieData = await response.json();
    applySortingFromURL(); // отрисовать после загрузки данных
  } catch (e) {
    console.error('Ошибка при загрузке JSON:', e);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  updateSelectionsFromURL();
  loadMoviesJson(); // загружаем и применяем
});













// Нижнее меню сортироки убирается при активном input
const input = document.getElementById('movie-search');


const sorting = document.querySelector('.sorting');
input.addEventListener('focus', () => {
  sorting?.classList.add('hidden');
});
input.addEventListener('blur', () => {
  if (document.activeElement !== input) {
    sorting?.classList.remove('hidden');
  }
});





// Фокус с input пропадает при клике вне его области

const overlay = document.getElementById('overlay');

// Показываем оверлей при фокусе на инпут
input.addEventListener('focus', () => {
  overlay.style.display = 'block';
});

// Клик по оверлею снимает фокус
overlay.addEventListener('click', () => {
  input.blur();
  overlay.style.display = 'none';
});

// Если фокус теряется другим способом, тоже скрываем оверлей
input.addEventListener('blur', () => {
  overlay.style.display = 'none';
});
