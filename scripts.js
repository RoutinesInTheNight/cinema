let data;
let table2showFiveDecimals = false;
let table2currentKey = 'total';
let table3showFullNum = false;
let table3currentKey = 'total';
let table5showSeconds = false;


function formatValueTable3(value) {
  if (table3showFullNum) {
    return Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  const kValue = value / 1000;
  if (kValue < 1000) return Math.round(kValue) + 'k';
  const mValue = kValue / 1000;
  return (
    mValue
      .toFixed(3)
      .replace(/\.?0+$/, '')
    + 'm'
  );
}



function formatValueTable4(totalMinutes, dataKey) {
  totalMinutes = Math.floor(totalMinutes);
  if (dataKey === 'hours') {
    const totalHours = Math.floor(totalMinutes / 60);
    return totalHours.toString().padStart(2, '0');
  }
  if (dataKey === 'days') {
    const days = totalMinutes / (24 * 60);
    const rounded = days.toFixed(1);
    return rounded.endsWith('.0') ? rounded.slice(0, -2) : rounded;
  }
  return '';
}



function formatValueTable5(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = n => n.toString().padStart(2, '0');
  if (table5showSeconds) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    let totalMinutes = Math.floor(totalSeconds / 60);
    const secondsRemainder = totalSeconds % 60;
    if (secondsRemainder >= 30) totalMinutes += 1;
    const hoursNoPad = Math.floor(totalMinutes / 60);
    const minutesPad = totalMinutes % 60;
    return `${hoursNoPad}:${pad(minutesPad)}`;
  }
}









function renderT2Table(dataKey) {
  const container = document.getElementById('t-2');
  container.innerHTML = '';
  for (const [name, info] of Object.entries(data["2"][dataKey])) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.innerHTML = `
      <div class="name"><span>${name}</span></div>
      <div class="column">
        <div style="width: ${info.size}%;" onclick="hapticFeedback('soft', 'rating-changes/films?sort1=${name}&sort2=all')">
          <span>${info.rating.toFixed(table2showFiveDecimals ? 5 : 2)}</span>
        </div>
      </div>
    `
    container.appendChild(row);
  }
  table2currentKey = dataKey;
}


function renderT3Table(dataKey) {
  const container = document.getElementById('t-3');
  container.innerHTML = '';
  for (const [name, info] of Object.entries(data["3"][dataKey])) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.innerHTML = `
      <div class="name"><span>${name}</span></div>
      <div class="column">
        <div style="width: ${info.size}%;" onclick="hapticFeedback('soft', 'popularity/films?sort1=${name}&sort2=all&sort3=popular')">
          <span>${formatValueTable3(info.ave_ratings)}</span>
        </div>
      </div>
    `
    container.appendChild(row);
  }
  table3currentKey = dataKey;
}


function renderT4Table(dataKey) {
  const container = document.getElementById('t-4');
  container.innerHTML = '';
  for (const [name, info] of Object.entries(data["4"])) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.innerHTML = `
      <div class="name"><span>${name}</span></div>
      <div class="column">
        <div style="width: ${info.size}%;">
          <span>${formatValueTable4(info.minutes, dataKey)}</span>
        </div>
      </div>
    `
    container.appendChild(row);
  }
}


function renderT5Table() {
  const container = document.getElementById('t-5');
  container.innerHTML = '';
  for (const [name, info] of Object.entries(data["5"])) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.innerHTML = `
      <div class="name"><span>${name}</span></div>
      <div class="column">
        <div style="width: ${info.size}%;" onclick="hapticFeedback('soft', 'runtime/films?sort1=${name}&sort2=long')">
          <span>${formatValueTable5(info.ave_runtime)}</span>
        </div>
      </div>
    `
    container.appendChild(row);
  }
}


function renderT7Table(name) {
  const container7 = document.getElementById('t-7');
  container7.innerHTML = '';
  const years = data["7"][name];
  for (const [year, info] of Object.entries(years)) {
    const row = document.createElement('div');
    row.classList.add('row');
    if (info.count === 0) {
      row.innerHTML = `
        <div class="column">
          <div style="height: ${info.size}%;">
            <span>${info.count}</span>
          </div>
        </div>
        <div class="name"><span>${year}</span></div>
      `
    } else {
      row.innerHTML = `
        <div class="column">
          <div style="height: ${info.size}%;" onclick="hapticFeedback('soft', 'years/films?sort1=Все&sort2=${year}')">
            <span>${info.count}</span>
          </div>
        </div>
        <div class="name"><span>${year}</span></div>
      `
    }
    container7.appendChild(row);
  }
  const horizontalScrollT7 = document.getElementById('hor-scr-t-7');
  horizontalScrollT7.scrollLeft = horizontalScrollT7.scrollWidth;
}







fetch('data/main_page_films.json')
  .then(response => response.json())
  .then(json => {
    data = json;

    // === Таблица 1 - Просмотренно фильмов/сериалов ===
    const container1 = document.getElementById('t-1');
    if (container1) {
      const users = data["1"];
      for (const [name, info] of Object.entries(users)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
          <div class="name"><span>${name}</span></div>
          <div class="column">
            <div data-target-width="${info.size}" style="width: 0%;" onclick="hapticFeedback('soft', 'best-worst/films?sort1=${name}&sort2=all&sort3=best')">
              <span data-target-value="${info.count}">0</span>
            </div>
          </div>
        `
        container1.appendChild(row);
      }

      const observer1 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container1.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseInt(span.dataset.targetValue, 10);
              const startTime = performance.now();
              const duration = 1300;
              div.style.width = div.dataset.targetWidth + '%';

              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = Math.floor(progress * target);
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = target;
              }
              requestAnimationFrame(animateNumber);
            });
            observer1.unobserve(container1);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

      observer1.observe(container1);
    }



    // === Таблица 2 - Средний рейтинг ===
    const container2 = document.getElementById('t-2');
    if (container2) {
      const users = data["2"]["total"];
      for (const [name, info] of Object.entries(users)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
          <div class="name"><span>${name}</span></div>
          <div class="column">
            <div data-target-width="${info.size}" style="width: 0%;" onclick="hapticFeedback('soft', 'rating-changes/films?sort1=${name}&sort2=all')">
              <span data-target-value="${info.rating}">0</span>
            </div>
          </div>
        `
        container2.appendChild(row);
      }

      const observer2 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container2.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseFloat(span.dataset.targetValue);
              const startTime = performance.now();
              const duration = 1300;
              div.style.width = div.dataset.targetWidth + '%';

              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = (progress * target).toFixed(2);
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = target.toFixed(2);
              }
              requestAnimationFrame(animateNumber);
            });
            observer2.unobserve(container2);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

      observer2.observe(container2);




      // Кнопки переключения для таблицы 2
      const t2Buttons = [
        { id: 't-2-total', key: 'total' },
        { id: 't-2-imdb', key: 'imdb' },
        { id: 't-2-letterboxd', key: 'letterboxd' },
        { id: 't-2-kp', key: 'kp' }
      ];

      t2Buttons.forEach(btnData => {
        const btn = document.getElementById(btnData.id);
        if (!btn) return;

        btn.addEventListener('click', () => {
          hapticFeedback('change');
          // Снимаем current со всех кнопок
          t2Buttons.forEach(b => {
            const otherBtn = document.getElementById(b.id);
            if (otherBtn) otherBtn.classList.remove('current');
          });

          // Добавляем current на нажатую кнопку
          btn.classList.add('current');

          // Мгновенно обновляем таблицу
          renderT2Table(btnData.key);
        });
      });

      const table2toggleSwitch = document.getElementById('t-2-switch');
      table2toggleSwitch.addEventListener('click', () => {
        hapticFeedback('change');
        table2showFiveDecimals = !table2showFiveDecimals;
        table2toggleSwitch.classList.toggle('active', table2showFiveDecimals);
        renderT2Table(table2currentKey);
      });



    }



    // === Таблица 3 - Среднее кол-во оценок у фильма/сериала ===
    const container3 = document.getElementById('t-3');
    if (container3) {
      const users = data["3"]["total"];
      for (const [name, info] of Object.entries(users)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
          <div class="name"><span>${name}</span></div>
          <div class="column">
            <div data-target-width="${info.size}" style="width: 0%;" onclick="hapticFeedback('soft', 'popularity/films?sort1=${name}&sort2=all&sort3=popular')">
              <span data-target-value="${info.ave_ratings}">0</span>
            </div>
          </div>
        `
        container3.appendChild(row);
      }

      const observer3 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container3.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseFloat(span.dataset.targetValue);
              const startTime = performance.now();
              const duration = 1300;
              div.style.width = div.dataset.targetWidth + '%';
              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = formatValueTable3(progress * target);
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = formatValueTable3(target);
              }
              requestAnimationFrame(animateNumber);
            });
            observer3.unobserve(container3);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      observer3.observe(container3);

      const t3Buttons = [
        { id: 't-3-total', key: 'total' },
        { id: 't-3-imdb', key: 'imdb' },
        { id: 't-3-letterboxd', key: 'letterboxd' },
        { id: 't-3-kp', key: 'kp' }
      ];
      t3Buttons.forEach(btnData => {
        const btn = document.getElementById(btnData.id);
        if (!btn) return;

        btn.addEventListener('click', () => {
          hapticFeedback('change');
          t3Buttons.forEach(b => {
            const otherBtn = document.getElementById(b.id);
            if (otherBtn) otherBtn.classList.remove('current');
          });
          btn.classList.add('current');
          renderT3Table(btnData.key);
        });
      });

      const table3toggleSwitch = document.getElementById('t-3-switch');
      table3toggleSwitch.addEventListener('click', () => {
        hapticFeedback('change');
        table3showFullNum = !table3showFullNum;
        table3toggleSwitch.classList.toggle('active', table3showFullNum);
        renderT3Table(table3currentKey);
      });



    }



    // === Таблица 4 - Потрачено времени на фильмы/сериалы ===
    const container4 = document.getElementById('t-4');
    if (container4) {
      const users = data["4"];
      for (const [name, info] of Object.entries(users)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
          <div class="name"><span>${name}</span></div>
          <div class="column">
            <div data-target-width="${info.size}" style="width: 0%;">
              <span data-target-value="${info.minutes}">0</span>
            </div>
          </div>
        `
        container4.appendChild(row);
      }

      const observer4 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container4.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseFloat(span.dataset.targetValue);
              const startTime = performance.now();
              const duration = 1300;
              div.style.width = div.dataset.targetWidth + '%';
              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = formatValueTable4(progress * target, 'hours');
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = formatValueTable4(target, 'hours');
              }
              requestAnimationFrame(animateNumber);
            });
            observer4.unobserve(container4);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      observer4.observe(container4);

      const t4Buttons = [
        { id: 't-4-hours', key: 'hours' },
        { id: 't-4-days', key: 'days' }
      ];
      t4Buttons.forEach(btnData => {
        const btn = document.getElementById(btnData.id);
        if (!btn) return;
        btn.addEventListener('click', () => {
          hapticFeedback('change');
          t4Buttons.forEach(b => {
            const otherBtn = document.getElementById(b.id);
            if (otherBtn) otherBtn.classList.remove('current');
          });
          btn.classList.add('current');
          renderT4Table(btnData.key);
        });
      });
    }



    // === Таблица 5 - Средняя длина фильма ===
    const container5 = document.getElementById('t-5');
    if (container5) {
      const users = data["5"];
      for (const [name, info] of Object.entries(users)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
          <div class="name"><span>${name}</span></div>
          <div class="column">
            <div data-target-width="${info.size}" style="width: 0%;" onclick="hapticFeedback('soft', 'runtime/films?sort1=${name}&sort2=long')">
              <span data-target-value="${info.ave_runtime}">0</span>
            </div>
          </div>
        `
        container5.appendChild(row);
      }

      const observer5 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container5.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseFloat(span.dataset.targetValue);
              const startTime = performance.now();
              const duration = 1300;
              div.style.width = div.dataset.targetWidth + '%';
              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = formatValueTable5(progress * target);
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = formatValueTable5(target);
              }
              requestAnimationFrame(animateNumber);
            });
            observer5.unobserve(container5);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      observer5.observe(container5);

      const table5toggleSwitch = document.getElementById('t-5-switch');
      table5toggleSwitch.addEventListener('click', () => {
        hapticFeedback('change');
        table5showSeconds = !table5showSeconds;
        table5toggleSwitch.classList.toggle('active', table5showSeconds);
        renderT5Table();
      });
    }




    // === Таблица 6 - Общие просмотрнные фильмы/сериалы ===
    const container6 = document.getElementById('t-6');
    if (container6) {
      const users = data["6"];
      for (const [name, info] of Object.entries(users)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
          <div class="name"><span>${name}</span></div>
          <div class="column">
            <div data-target-width="${info.size}" style="width: 0%;" onclick="hapticFeedback('soft', 'general-views/films?sort1=${info.name_1}&sort2=${info.name_2}')">
              <span data-target-value="${info.count}">0</span>
            </div>
          </div>
        `
        container6.appendChild(row);
      }

      const observer6 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container6.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseInt(span.dataset.targetValue, 10);
              const startTime = performance.now();
              const duration = 1300;
              div.style.width = div.dataset.targetWidth + '%';
              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = Math.floor(progress * target);
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = target;
              }
              requestAnimationFrame(animateNumber);
            });
            observer6.unobserve(container6);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      observer6.observe(container6);
    }



    // === Таблица 7 - Распределение фильмов/сериалов по годам ===
    const container7 = document.getElementById('t-7');
    if (container7) {
      const years = data["7"]["Все"];
      for (const [year, info] of Object.entries(years)) {
        const row = document.createElement('div');
        row.classList.add('row');
        if (info.count === 0) {
          row.innerHTML = `
            <div class="column">
              <div data-target-height="${info.size}" style="height: 0%;">
                <span data-target-value="${info.count}">0</span>
              </div>
            </div>
            <div class="name"><span>${year}</span></div>
          `
        } else {
          row.innerHTML = `
            <div class="column">
              <div data-target-height="${info.size}" style="height: 0%;" onclick="hapticFeedback('soft', 'years/films?sort1=Все&sort2=${year}')">
                <span data-target-value="${info.count}">0</span>
              </div>
            </div>
            <div class="name"><span>${year}</span></div>
          `
        }
        container7.appendChild(row);
      }

      const toggleButtonsT7 = document.getElementById('tog-btb-t-7');
      const names = data["7"];
      for (const [name, info] of Object.entries(names)) {
        const toggleButton = document.createElement('div');
        if (name === 'Все') toggleButton.classList.add('current');
        toggleButton.innerHTML = `<span>${name}</span>`;
        toggleButtonsT7.appendChild(toggleButton);
      }

      const observer7 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container7.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseInt(span.dataset.targetValue, 10);
              const startTime = performance.now();
              const duration = 1300;
              div.style.height = div.dataset.targetHeight + '%';
              function animateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                span.textContent = Math.floor(progress * target);
                if (progress < 1) requestAnimationFrame(animateNumber);
                else span.textContent = target;
              }
              requestAnimationFrame(animateNumber);

            });
            const horizontalScrollT7 = document.getElementById('hor-scr-t-7');
            requestAnimationFrame(() => {
              horizontalScrollT7.scrollLeft = horizontalScrollT7.scrollWidth;
            });
            observer7.unobserve(container7);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      observer7.observe(container7);

      const buttons = toggleButtonsT7.querySelectorAll(':scope > div');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          hapticFeedback('change');
          const name = btn.querySelector('span')?.textContent.trim();
          if (!name) return;
          buttons.forEach(b => b.classList.remove('current'));
          btn.classList.add('current');
          renderT7Table(name);
        });
      });
    }







  })
  .catch(err => console.error(err));




