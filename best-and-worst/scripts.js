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



function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1);
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
  const searchCollaps = document.querySelector('.search-collaps');
  const searchTopCollaps = document.querySelector('.search-top-collaps');
  const moviesContainer = document.getElementById('movies-container');
  const keyboards = document.querySelector('.keyboards');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? 'calc((100 / 428) * 8 * var(--vw))' : `${bottom}px`;
    const topValue = top === 0 ? 'calc(2.5 * var(--vw))' : `${top}px`;
    bottomMenu.style.paddingBottom = bottomValue;
    keyboards.style.paddingBottom = bottom === 0 ? '0.5rem' : `${bottom * 2}px`;

    if (bottom === 0) {
      // searchTopCollaps.style.transform = 'translateY(calc(((100 / 428) * (32 + 32) * var(--vw) + 2.5 * var(--vw)) * 1))';
      searchCollaps.style.marginBottom = `calc((100 / 428) * (125 + 8 + 8) * var(--vw))`;
    } else {
      // searchTopCollaps.style.transform = `translateY(calc((100 / 428) * (32 + 32 + ${top}) * -1 * var(--vw)))`;
      searchCollaps.style.marginBottom = `calc((100 / 428) * (125 + 8 + ${bottom}) * var(--vw))`;
    }

    searchTopCollaps.style.marginTop = topValue;





    moviesContainer.style.marginTop = topValue;
    moviesContainer.style.marginBottom = bottom === 0 ? 'calc(0.5rem + 124.5px + 2.5vw)' : `calc(${bottom}px + 124.5px + 2.5vw)`
  };
  SafeAreaManager.init();
});































document.addEventListener('DOMContentLoaded', () => {
  const betsData = [
    { bet: 100, text: '100' },
    { bet: 200, text: '200' },
    { bet: 300, text: '300' },
    { bet: 400, text: '400' },
    { bet: 500, text: '500' },
    { bet: 1000, text: '1K' },
    { bet: 10000, text: '10K' },
    { bet: 100000, text: '100K' },
    { bet: 1000000, text: '1M' },
    { bet: 100, text: '100' },
    { bet: 200, text: '200' },
    { bet: 300, text: '300' },
    { bet: 400, text: '400' },
    { bet: 500, text: '500' },
    { bet: 1000, text: '1K' },
    { bet: 10000, text: '10K' },
    { bet: 100000, text: '100K' },
    { bet: 1000000, text: '1M' },
  ];

  const choiceBet = document.getElementById('choice-bet-vertical');

  // Блокируем скролл страницы при свайпе по списку
  choiceBet.addEventListener('touchmove', (e) => {
    const atTop = choiceBet.scrollTop === 0;
    const atBottom = choiceBet.scrollTop + choiceBet.clientHeight >= choiceBet.scrollHeight;

    // если не в самом верху и не в самом низу — не даём странице скроллиться
    if (!(atTop && e.touches[0].clientY > 0) && !(atBottom && e.touches[0].clientY < 0)) {
      e.stopPropagation();
    }
  }, { passive: false });


  
  betsData.forEach(item => {
    const betDiv = document.createElement('div');
    betDiv.classList.add('bet');
    betDiv.setAttribute('data-bet', item.bet);

    const img = document.createElement('img');
    img.src = '../../images/coin.png';

    const p = document.createElement('p');
    p.textContent = item.text;

    betDiv.appendChild(img);
    betDiv.appendChild(p);
    choiceBet.appendChild(betDiv);
  });

  const bets = document.querySelectorAll('.bet');

  const highlightBet = (betElement) => {
    bets.forEach(bet => bet.classList.remove('selected'));
    betElement.classList.add('selected');
    localStorage.setItem('current_bet', betElement.dataset.bet);
    currentBetValue = Number(betElement.dataset.bet);
  };

  const getCenterBet = () => {
    const center = choiceBet.scrollTop + choiceBet.clientHeight / 2;
    return Array.from(bets).reduce((closest, bet) => {
      const betCenter = bet.offsetTop + bet.offsetHeight / 2;
      const distance = Math.abs(center - betCenter);
      return distance < closest.distance ? { bet, distance } : closest;
    }, { bet: null, distance: Infinity }).bet;
  };

  let lastBet = null;
  choiceBet.addEventListener('scroll', () => {
    const centerBet = getCenterBet();
    if (centerBet && centerBet !== lastBet) {
      highlightBet(centerBet);
      hapticFeedback('change'); // ← вернул вибрацию
      lastBet = centerBet;
    }
  });

  bets.forEach(bet => {
    bet.addEventListener('click', () => {
      const offset = bet.offsetTop - choiceBet.offsetHeight / 2 + bet.offsetHeight / 2;
      choiceBet.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
      highlightBet(bet);
      hapticFeedback('change'); // ← и тут добавил
    });
  });

  // Инициализация
  if (bets.length > 0) {
    choiceBet.scrollTo({
      top: bets[0].offsetTop - choiceBet.offsetHeight / 2 + bets[0].offsetHeight / 2,
      behavior: 'auto'
    });
    highlightBet(bets[0]);
  }
});