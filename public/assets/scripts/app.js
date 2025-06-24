const API_URL = 'http://localhost:3000/noticias';

const FavoritosManager = {
  toggle: function(noticiaId) {
    const usuario = JSON.parse(localStorage.getItem('userLogged'));
    if (!usuario) {
      if (confirm('Você precisa fazer login para favoritar. Deseja ir para a página de login?')) {
        window.location.href = 'login.html';
      }
      return false;
    }

    const key = `favoritos_${usuario.username}`;
    let favoritos = JSON.parse(localStorage.getItem(key)) || [];
    
    const index = favoritos.indexOf(noticiaId.toString());
    if (index === -1) {
      favoritos.push(noticiaId.toString());
    } else {
      favoritos.splice(index, 1);
    }
    
    localStorage.setItem(key, JSON.stringify(favoritos));
    return index === -1; 
  },

 
  get: function() {
    const usuario = JSON.parse(localStorage.getItem('userLogged'));
    if (!usuario) return [];
    
    const key = `favoritos_${usuario.username}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  
  check: function(noticiaId) {
    return this.get().includes(noticiaId.toString());
  }
};

 
async function carregarNoticias() {
  try {
    const response = await fetch(API_URL);
    const noticias = await response.json();

    carregarDestaques(noticias.filter(n => n.destaque).slice(0, 3));
    carregarListaNoticias(noticias);
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    mostrarErro('lista-noticias', 'Erro ao carregar notícias');
  }
}

 
function carregarDestaques(destaques) {
  const carousel = document.getElementById('carousel-inner');
  if (!carousel) return;

  carousel.innerHTML = destaques.map((noticia, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <img src="${noticia.imagem}" class="d-block w-100" style="height:400px; object-fit:cover;">
      <div class="carousel-caption d-none d-md-block">
        <h5>${noticia.titulo}</h5>
        <p>${noticia.descricao}</p>
        <a href="detalhes.html?id=${noticia.id}" class="btn btn-primary btn-sm mt-2">
          <i class="fas fa-book-open me-1"></i> Ler mais
        </a>
      </div>
    </div>
  `).join('');
}

 
function carregarListaNoticias(noticias) {
  const lista = document.getElementById('lista-noticias');
  if (!lista) return;

  lista.innerHTML = noticias.map(noticia => {
    const isFavorita = FavoritosManager.check(noticia.id);
    
    return `
      <div class="col-md-3 d-flex mb-4">
        <div class="card flex-fill d-flex flex-column">
          <img src="${noticia.imagem}" class="card-img-top" alt="${noticia.titulo}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${noticia.titulo}</h5>
            <p class="card-text flex-grow-1">${noticia.descricao}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-favorito ${isFavorita ? 'favorito-ativo' : 'favorito-cinza'}" 
                    data-id="${noticia.id}" 
                    title="${isFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
              <i class="fas fa-heart"></i>
            </button>
            <a href="detalhes.html?id=${noticia.id}" class="btn btn-primary btn-sm">
              <i class="fas fa-book-open me-1"></i> Ler mais
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  configurarBotoesFavorito();
}
 
async function carregarDetalhesNoticia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) return;

  try {
    const resposta = await fetch(`${API_URL}/${id}`);
    const noticia = await resposta.json();

    document.getElementById('noticia-titulo').textContent = noticia.titulo;
    document.getElementById('noticia-autor').textContent = noticia.autor;
    document.getElementById('noticia-data').textContent = noticia.data;
    document.getElementById('noticia-conteudo').textContent = noticia.conteudo;
    document.getElementById('noticia-imagem').src = noticia.imagem;

    const galeria = document.getElementById('fotos-noticia');
    if (galeria && noticia.fotos && noticia.fotos.length > 0) {
      galeria.innerHTML = '';
      noticia.fotos.forEach(foto => {
  const col = document.createElement('div');
  col.className = 'col-md-3';
  col.innerHTML = `
    <div class="card h-100">
      <img src="${foto.src}" class="card-img-top" alt="${foto.desc || ''}">
      <div class="card-body p-2 text-center">
        <p class="card-text small text-light">${foto.desc || ''}</p>
      </div>
    </div>
  `;
  galeria.appendChild(col);
});

    }

    const linkEditar = document.getElementById('btnEditar');
    if (linkEditar) {
      linkEditar.href = `editar.html?id=${noticia.id}`;
    }

  
const btnFavoritoDetalhe = document.getElementById('btnFavoritarDetalhe');
if (btnFavoritoDetalhe) {
  btnFavoritoDetalhe.setAttribute('data-id', noticia.id);
  
  const isFavorita = FavoritosManager.check(noticia.id);
  btnFavoritoDetalhe.classList.toggle('favorito-ativo', isFavorita);
  btnFavoritoDetalhe.classList.toggle('favorito-cinza', !isFavorita);
  btnFavoritoDetalhe.setAttribute('title', isFavorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos');

   
  btnFavoritoDetalhe.addEventListener('click', function() {
    const noticiaId = this.getAttribute('data-id');
    const virouFavorito = FavoritosManager.toggle(noticiaId);
    
    this.classList.toggle('favorito-ativo', virouFavorito);
    this.classList.toggle('favorito-cinza', !virouFavorito);
    this.setAttribute('title', virouFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    
    
    this.innerHTML = `<i class="fas fa-heart ${virouFavorito ? 'fa-beat' : ''}"></i>`;
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-heart"></i>';
    }, 500);
  });
}

  const btnExcluir = document.getElementById('btnExcluir');
    if (btnExcluir) {
      btnExcluir.addEventListener('click', async function() {
        if (confirm('Tem certeza que deseja excluir esta notícia permanentemente?')) {
          try {
            await fetch(`${API_URL}/${id}`, {
              method: 'DELETE'
            });
            alert('Notícia excluída com sucesso!');
            window.location.href = 'index.html';
          } catch (error) {
            console.error('Erro ao excluir notícia:', error);
            alert('Erro ao excluir notícia. Por favor, tente novamente.');
          }
        }
      });
    }

  } catch (erro) {
    console.error('Erro ao carregar detalhes:', erro);
  }
}
 
function filtrarNoticias(noticias, termo) {
  termo = termo.toLowerCase();
  return noticias.filter(noticia => 
    noticia.titulo.toLowerCase().includes(termo) || 
    noticia.descricao.toLowerCase().includes(termo) ||
    noticia.conteudo?.toLowerCase().includes(termo)
  );
}

 
function configurarBusca() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  
  if (!searchInput || !searchButton) return;

  searchButton.addEventListener('click', realizarBusca);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') realizarBusca();
  });
}

 
async function realizarBusca() {
  const termo = document.getElementById('searchInput').value.trim();
  
  try {
    const resposta = await fetch(API_URL);
    const todasNoticias = await resposta.json();
    
    if (termo === '') {
      carregarListaNoticias(todasNoticias);
    } else {
      const noticiasFiltradas = filtrarNoticias(todasNoticias, termo);
      carregarListaNoticias(noticiasFiltradas);
      
  
      if (noticiasFiltradas.length === 0) {
        document.getElementById('lista-noticias').innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-3x mb-3" style="color: var(--rosa-magenta);"></i>
            <h4>Nenhuma notícia encontrada para "${termo}"</h4>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="document.getElementById('searchInput').value = ''; realizarBusca();">
              Limpar busca
            </button>
          </div>
        `;
      }
    }
  } catch (erro) {
    console.error('Erro ao buscar notícias:', erro);
  }
}
 
async function carregarFavoritos() {
  const container = document.getElementById('lista-favoritos');
  if (!container) return;

  const favoritosIds = FavoritosManager.get();
  
  if (favoritosIds.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-heart-broken fa-3x mb-3"></i>
        <h4>Você ainda não tem favoritos</h4>
        <a href="index.html" class="btn btn-primary mt-3">
          <i class="fas fa-newspaper me-1"></i> Ver Notícias
        </a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(API_URL);
    const todasNoticias = await response.json();
    
    const noticiasFavoritas = todasNoticias.filter(noticia => 
      favoritosIds.includes(noticia.id.toString())
    );

    if (noticiasFavoritas.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
          <h4>Seus favoritos não foram encontrados</h4>
        </div>
      `;
      return;
    }

    container.innerHTML = noticiasFavoritas.map(noticia => `
      <div class="col-md-4 d-flex mb-4">
        <div class="card flex-fill d-flex flex-column">
          <img src="${noticia.imagem}" class="card-img-top" alt="${noticia.titulo}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${noticia.titulo}</h5>
            <p class="card-text flex-grow-1">${noticia.descricao}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-favorito favorito-ativo" 
                    data-id="${noticia.id}" 
                    title="Remover dos favoritos">
              <i class="fas fa-heart"></i>
            </button>
            <a href="detalhes.html?id=${noticia.id}" class="btn btn-primary btn-sm">
              <i class="fas fa-book-open me-1"></i> Ler mais
            </a>
          </div>
        </div>
      </div>
    `).join('');

    configurarBotoesFavorito();

  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    mostrarErro('lista-favoritos', 'Erro ao carregar favoritos');
  }
}

 
function configurarBotoesFavorito() {
  document.querySelectorAll('.btn-favorito').forEach(btn => {
  
    const noticiaId = btn.getAttribute('data-id');
    const isFavorita = FavoritosManager.check(noticiaId);
    btn.classList.toggle('favorito-ativo', isFavorita);
    
   
    btn.onclick = function(e) {
      e.preventDefault();
      
      const virouFavorito = FavoritosManager.toggle(noticiaId);
      
    
      this.classList.toggle('favorito-ativo', virouFavorito);
      
     
      this.innerHTML = '<i class="fas fa-heart fa-beat"></i>';
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-heart"></i>';
        
      
        if (window.location.pathname.includes('favoritos.html')){
          if (!virouFavorito) {
            this.closest('.col-md-4').remove();
          }
        }
      }, 500);
    };
  });
}

 
function mostrarErro(containerId, mensagem) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
        <h4>${mensagem}</h4>
      </div>
    `;
  }
}
 
function isAdmin() {
  const usuario = JSON.parse(localStorage.getItem('userLogged'));
  return usuario && usuario.tipo === 'admin';
}
 

document.addEventListener('DOMContentLoaded', function() {
  
  const adminControls = document.querySelectorAll('.admin-only');
  adminControls.forEach(control => {
    control.style.display = isAdmin() ? 'block' : 'none';
  });
  if (document.getElementById('carousel-inner')) {
    carregarNoticias();
  }
  
  if (document.getElementById('lista-favoritos')) {
    carregarFavoritos();
  }
   if (document.getElementById('detalhes-noticia')) {
    carregarDetalhesNoticia();
   }
    configurarBusca();

});