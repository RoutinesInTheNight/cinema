fetch('data/films.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('t-1');
    if (!container) return;

    const users = data["1"];

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
      innerDiv.style.width = '0%'; // стартовая ширина
      innerDiv.dataset.targetWidth = info.size; // целевая ширина

      const countSpan = document.createElement('span');
      countSpan.textContent = '0'; // стартовое значение
      countSpan.dataset.targetCount = info.count; // сохраняем целевое число
      innerDiv.appendChild(countSpan);
      columnDiv.appendChild(innerDiv);

      row.appendChild(nameDiv);
      row.appendChild(columnDiv);
      container.appendChild(row);
    }

    // Intersection Observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          container.querySelectorAll('.column div').forEach(div => {
            const span = div.querySelector('span');
            const target = parseInt(span.dataset.targetCount, 10);
            const startTime = performance.now();
            const duration = 1300; // 0.5 сек

            // Анимация ширины
            div.style.width = div.dataset.targetWidth + '%';

            // Анимация числа
            function animateNumber(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              span.textContent = Math.floor(progress * target);
              if (progress < 1) requestAnimationFrame(animateNumber);
              else span.textContent = target; // на всякий случай
            }
            requestAnimationFrame(animateNumber);
          });
          observer.unobserve(container);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);
  })
  .catch(error => console.error('Ошибка при загрузке JSON:', error));
