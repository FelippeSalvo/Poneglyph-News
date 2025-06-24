const calendarEl = document.getElementById('calendario');
  if (calendarEl) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'pt-br',
      events: function(fetchInfo, successCallback, failureCallback) {
        fetch(API_URL)
          .then(response => response.json())
          .then(data => {
            const events = data.map(noticia => {
              let dataFormatada = noticia.data;
              if (dataFormatada.includes('/')) {
                const partes = dataFormatada.split('/');
                dataFormatada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
              }
              return {
                title: noticia.titulo,
                start: dataFormatada,
                url: `detalhes.html?id=${noticia.id}` 
              };
            });
            successCallback(events);
          })
          .catch(error => {
            console.error('Erro ao carregar eventos:', error);
            failureCallback(error);
          });
      }
    });
    calendar.render();
  }