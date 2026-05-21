/* Login page — multi-user authentication.
 * Supports email + password login and registration.
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('login-form');
  var emailInput = document.getElementById('email');
  var pwInput = document.getElementById('pw');

  if (!form || !emailInput || !pwInput) return;

  var invalidPw = form.getAttribute('data-invalid-pw') || 'Credenciales inválidas';
  var connFailed = form.getAttribute('data-conn-failed') || 'Error de conexión';

  // Toggle between login and register modes
  var isRegisterMode = false;
  var toggleLink = document.getElementById('toggle-mode');
  var usernameField = document.getElementById('username-field');
  var submitBtn = document.getElementById('submit-btn');
  var titleEl = document.querySelector('.card h1');
  var subtitleEl = document.querySelector('.card .sub');

  function showErr(msg) {
    var err = document.getElementById('err');
    if (err) { err.textContent = msg; err.style.display = 'block'; }
  }

  function hideErr() {
    var err = document.getElementById('err');
    if (err) { err.style.display = 'none'; }
  }

  function _safeNextPath() {
    try {
      var raw = new URL(window.location.href).searchParams.get('next');
      if (!raw) return './';
      if (raw.charAt(0) !== '/') return './';
      if (raw.charAt(1) === '/' || raw.charAt(1) === '\\') return './';
      if (/[\x00-\x1f\x7f\s]/.test(raw)) return './';
      return raw;
    } catch (_) { return './'; }
  }

  async function doLogin(e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    var pw = pwInput.value;
    hideErr();

    if (!email || !pw) {
      showErr('Correo y contraseña son requeridos');
      return;
    }

    try {
      var res = await fetch('api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pw }),
        credentials: 'include',
      });
      var data = {};
      try { data = await res.json(); } catch (_) {}
      if (res.ok && data.ok) {
        window.location.href = _safeNextPath();
      } else {
        showErr(data.error || invalidPw);
      }
    } catch (ex) {
      showErr(connFailed);
    }
  }

  async function doRegister(e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    var pw = pwInput.value;
    var username = document.getElementById('username') ? document.getElementById('username').value.trim() : '';
    hideErr();

    if (!email || !pw || !username) {
      showErr('Todos los campos son requeridos');
      return;
    }

    try {
      var res = await fetch('api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, username: username, password: pw }),
        credentials: 'include',
      });
      var data = {};
      try { data = await res.json(); } catch (_) {}
      if (res.ok && data.ok) {
        // Auto-login after registration
        showErr('');
        var loginRes = await fetch('api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: pw }),
          credentials: 'include',
        });
        if (loginRes.ok) {
          window.location.href = _safeNextPath();
        }
      } else {
        showErr(data.error || 'Error al registrarse');
      }
    } catch (ex) {
      showErr(connFailed);
    }
  }

  function toggleMode(e) {
    if (e) e.preventDefault();
    isRegisterMode = !isRegisterMode;

    if (isRegisterMode) {
      // Show register mode
      if (usernameField) usernameField.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Crear cuenta';
      if (toggleLink) toggleLink.textContent = 'Ya tengo cuenta';
      if (titleEl) titleEl.textContent = 'Crear cuenta';
      if (subtitleEl) subtitleEl.textContent = 'Hermes Agent';
    } else {
      // Show login mode
      if (usernameField) usernameField.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Continuar';
      if (toggleLink) toggleLink.textContent = 'Crear cuenta';
      if (titleEl) titleEl.textContent = 'Bienvenido';
      if (subtitleEl) subtitleEl.textContent = 'Hermes Agent';
    }
    hideErr();
  }

  if (toggleLink) {
    toggleLink.addEventListener('click', toggleMode);
  }

  form.addEventListener('submit', function (e) {
    if (isRegisterMode) {
      doRegister(e);
    } else {
      doLogin(e);
    }
  });

  // Connectivity check
  (function checkConnectivity() {
    var retryTimer = null;

    function setFormDisabled(disabled) {
      if (emailInput) emailInput.disabled = disabled;
      if (pwInput) pwInput.disabled = disabled;
      var btn = form.querySelector('button');
      if (btn) btn.disabled = disabled;
    }

    function probe() {
      fetch('health', { method: 'GET', credentials: 'same-origin' })
        .then(function (r) {
          if (r.ok) {
            if (retryTimer !== null) {
              clearTimeout(retryTimer);
              retryTimer = null;
              window.location.reload();
            }
          } else {
            showErr(connFailed + ' (server error ' + r.status + ')');
          }
        })
        .catch(function () {
          showErr('Cannot reach server — check your connection.');
          setFormDisabled(true);
          if (retryTimer === null) {
            retryTimer = setInterval(probe, 3000);
          }
        });
    }

    probe();
  })();
});
