let data;
let showFiveDecimals = false;
let currentT2Key = 'total'; // что сейчас показано во второй таблице

// Функция для мгновенной отрисовки таблицы без анимации
function renderT2Table(dataKey) {
  const container = document.getElementById('t-2');
  if (!container || !data) return;

  container.innerHTML = '';

  const users = data["2"][dataKey];

  for (const [name, info] of Object.entries(users)) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.setAttribute('onclick', `hapticFeedback('soft', 'best-worst/films?sort1=${encodeURIComponent(name)}&sort2=all&sort3=best')`);

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameDiv.appendChild(nameSpan);

    const columnDiv = document.createElement('div');
    columnDiv.classList.add('column');
    const innerDiv = document.createElement('div');
    innerDiv.style.width = (info.size) + '%';

    const valueSpan = document.createElement('span');
    currentT2Key = dataKey;
    const decimals = showFiveDecimals ? 5 : 2;
    if (dataKey === 'total') {
      valueSpan.textContent = info.rating.toFixed(decimals);
    } else {
      valueSpan.textContent = info.rating?.toFixed(decimals) || info.count || 0;
    }

    innerDiv.appendChild(valueSpan);
    columnDiv.appendChild(innerDiv);

    row.appendChild(nameDiv);
    row.appendChild(columnDiv);

    container.appendChild(row);
  }
}

// Загрузка JSON один раз
fetch('data/main_page_films.json')
  .then(response => response.json())
  .then(json => {
    data = json;

    // === Первая таблица (#t-1) с анимацией ===
    const container1 = document.getElementById('t-1');
    if (container1) {
      const users1 = data["1"];
      for (const [name, info] of Object.entries(users1)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.setAttribute('onclick', `hapticFeedback('soft', 'best-worst/films?sort1=${encodeURIComponent(name)}&sort2=all&sort3=best')`);

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('name');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        nameDiv.appendChild(nameSpan);

        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
        const innerDiv = document.createElement('div');
        innerDiv.style.width = '0%';
        innerDiv.dataset.targetWidth = info.size;
        const countSpan = document.createElement('span');
        countSpan.textContent = '0';
        countSpan.dataset.targetCount = info.count;
        innerDiv.appendChild(countSpan);
        columnDiv.appendChild(innerDiv);

        row.appendChild(nameDiv);
        row.appendChild(columnDiv);
        container1.appendChild(row);
      }

      const observer1 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container1.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseInt(span.dataset.targetCount, 10);
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
      }, { threshold: 0.1 });

      observer1.observe(container1);
    }

    // === Вторая таблица (#t-2) с анимацией для total ===
    const container2 = document.getElementById('t-2');
    if (container2) {
      const users2 = data["2"]["total"];
      for (const [name, info] of Object.entries(users2)) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.setAttribute('onclick', `hapticFeedback('soft', 'best-worst/films?sort1=${encodeURIComponent(name)}&sort2=all&sort3=best')`);

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('name');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        nameDiv.appendChild(nameSpan);

        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
        const innerDiv = document.createElement('div');
        innerDiv.style.width = '0%';
        innerDiv.dataset.targetWidth = info.size;

        const ratingSpan = document.createElement('span');
        ratingSpan.textContent = '0';
        ratingSpan.dataset.targetRating = info.rating;
        innerDiv.appendChild(ratingSpan);
        columnDiv.appendChild(innerDiv);

        row.appendChild(nameDiv);
        row.appendChild(columnDiv);
        container2.appendChild(row);
      }

      const observer2 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            container2.querySelectorAll('.column div').forEach(div => {
              const span = div.querySelector('span');
              const target = parseFloat(span.dataset.targetRating);
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
      }, { threshold: 0.1 });

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




      const toggleSwitch = document.getElementById('t-2-switch');

      if (toggleSwitch) {
        toggleSwitch.addEventListener('click', () => {
          showFiveDecimals = !showFiveDecimals;
          toggleSwitch.classList.toggle('active', showFiveDecimals);
          renderT2Table(currentT2Key);
        });
      }


    }
  })
  .catch(err => console.error(err));




