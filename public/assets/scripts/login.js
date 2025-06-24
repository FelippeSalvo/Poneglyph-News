document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const authButtons = document.getElementById('authButtons');
  
  
  if (isLoggedIn() && window.location.pathname.includes('login.html')) {
    window.location.href = 'index.html';
    return;
  }

  
  updateAuthButtons();

  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const login = document.getElementById('login').value;
      const senha = document.getElementById('senha').value;
      
  
      if (!login || !senha) {
        showAuthFeedback('Por favor, preencha todos os campos', 'error');
        return;
      }
      
  
      fetch('http://localhost:3000/usuarios')
        .then(response => response.json())
        .then(usuarios => {
          const usuario = usuarios.find(u => u.login === login);
          
  
          if (!usuario) {
            showAuthFeedback('Conta não encontrada. Verifique seu login ou cadastre-se.', 'error');
            return;
          }
          
  
          if (usuario.senha !== senha) {
            showAuthFeedback('Senha incorreta. Tente novamente.', 'error');
            return;
          }
          
  
          loginUser(login);
          showAuthFeedback('Login realizado com sucesso!', 'success');
          
  
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        })
        .catch(error => {
          console.error('Erro ao verificar usuário:', error);
          showAuthFeedback('Erro ao verificar credenciais. Tente novamente.', 'error');
        });
    });
  }
});



function isLoggedIn() {
  return localStorage.getItem('userLogged') !== null;
}

 function loginUser(username) {

  fetch('http://localhost:3000/usuarios')
    .then(response => response.json())
    .then(usuarios => {
      const usuario = usuarios.find(u => u.login === username);
      if (usuario) {
        localStorage.setItem('userLogged', JSON.stringify({
          username: username,
          tipo: usuario.tipo, 
          loggedAt: new Date().toISOString()
        }));
        updateAuthButtons();
       
        window.location.href = 'index.html';
      }
    });
}

function logoutUser() {
  localStorage.removeItem('userLogged');
  updateAuthButtons();
  window.location.href = 'index.html';
}

function updateAuthButtons() {
  const authButtons = document.getElementById('authButtons');
  if (!authButtons) return;

  if (isLoggedIn()) {
    const userData = JSON.parse(localStorage.getItem('userLogged'));
    authButtons.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-warning dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
          <i class="fas fa-user-circle me-1"></i>
          ${userData.username} ${userData.tipo === 'admin' ? '(Admin)' : ''}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><button class="dropdown-item" id="logoutBtn">
            <i class="fas fa-sign-out-alt me-1"></i> Sair
          </button></li>
        </ul>
      </div>
    `;
    
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
  } else {
    authButtons.innerHTML = `
      <a href="login.html" class="btn btn-outline-custom me-2">
        <i class="fas fa-sign-in-alt"></i> Login
      </a>
      <a href="cadastro_usuario.html" class="btn btn-custom">
        <i class="fas fa-user-plus"></i> Cadastro
      </a>
    `;
  }
}

function showAuthFeedback(message, type) {
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = `auth-feedback ${type}`;
  feedbackDiv.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} me-2"></i>
    ${message}
  `;
  
  
  const oldFeedback = document.querySelector('.auth-feedback');
  if (oldFeedback) oldFeedback.remove();
  
  
  loginForm.parentNode.insertBefore(feedbackDiv, loginForm.nextSibling);
  
  
  setTimeout(() => {
    feedbackDiv.remove();
  }, 3000);
}