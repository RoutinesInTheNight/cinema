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



const children = document.querySelectorAll('body > *');
children.forEach((child, index) => {
  setTimeout(() => {
    child.classList.add('visible');
  }, index * 25);
});



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
    const children = document.querySelectorAll('body > *');
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
    onChange: null
  };
})();





// Выставление пддингов и маргинов в зависимости от безопасной зоны
document.addEventListener('DOMContentLoaded', () => {
  const bottomMenu = document.querySelector('.sorting');
  const ratingsContainer = document.querySelector('#ratings-container');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? '0.5rem' : `${bottom}px`;
    bottomMenu.style.paddingBottom = bottomValue;
    if (top === 0) {
      document.body.style.height = '100vh';
    } else {
      ratingsContainer.style.marginTop = `${top}px`;
    }
    
  };
  SafeAreaManager.init();
});








// Добавление кнопок с именами из json
function populateUserSorting(userList) {
  const container = document.getElementById("sort1");
  container.innerHTML = ''; // на всякий случай очищаем
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
  if (!ratingsData || !ratingsData.sort) return;

  const urlParams = new URLSearchParams(window.location.search);
  const sort1 = urlParams.get("sort1");
  const sort2 = urlParams.get("sort2");

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

  const key = `${sort1}/${sort2}`;
  const movieIds = ratingsData.sort[key];

  const ratingsContainer = document.getElementById("ratings-container");
  const titlesContainer = document.getElementById("titles-container");
  ratingsContainer.innerHTML = '';
  titlesContainer.innerHTML = '';

  if (!movieIds || movieIds.length === 0) return;

  movieIds.forEach((id) => {
    const movie = ratingsData.sort[key][id];
    if (!movie) return;
    const column = document.createElement("tr");
    const title = document.createElement("div");
    column.innerHTML = `<td style="--start: ${movie["start_size"]}; --end: ${movie["end_size"]}; --color: ${movie["color"]};">${movie["end"]}</td>`
    title.innerHTML = `
      <span>${movie["title"]}</span>
      <div class="movie-rating">
        <svg class="score-icon">
          <use href="#icon-star"/>
        </svg>
        <span>${movie["rating"]}</span>
      </div>
    `
    ratingsContainer.appendChild(column);
    titlesContainer.appendChild(title);
  });

  // const hasNewLoad = urlParams.get('new-load') === 'true';
  // if (hasNewLoad) {
  //   urlParams.delete('new-load');
  //   const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  //   window.history.replaceState({}, '', newUrl);
  // }
}


// Выделение кнопки 2-й сортировки
function updateSortButtonsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const sort2 = params.get("sort2");
  if (sort2) {
    const sort2Container = document.getElementById("sort2");
    if (sort2Container) {
      sort2Container.querySelectorAll("div").forEach((div) => {
        div.classList.toggle("selected", div.id === sort2);
      });
    }
  }
}


// Загрузка json
let ratingsData = null;
async function loadMoviesJson() {
  try {
    const response = await fetch('data.json');
    ratingsData = await response.json();
    populateUserSorting(ratingsData.users);
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
}


window.addEventListener("DOMContentLoaded", () => {
  loadMoviesJson();
  updateSortButtonsFromURL();
});