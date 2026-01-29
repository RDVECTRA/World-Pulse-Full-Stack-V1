fetch('http://localhost:3000/api/events')
  .then(response => response.json())
  .then(events => {
    const grid = document.getElementById('grid');

    events.forEach(e => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <h3>${e.title}</h3>
        <p>${e.summary}</p>
        <small>${e.source} • ${e.category}</small><br><br>
        <a href="${e.link}" target="_blank">Ver fonte</a>
      `;

      grid.appendChild(card);
    });
  })
  .catch(() => {
    document.getElementById('grid').innerHTML =
      '<p>Erro ao conectar com o backend.</p>';
  });
