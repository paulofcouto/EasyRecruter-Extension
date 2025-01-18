document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login');
    const sendButton = document.getElementById('send');
    const loginSection = document.getElementById('login-section');
    const sendSection = document.getElementById('send-section');
    const successMessage = document.getElementById('success-message');
    const loadingMessage = document.getElementById('loading-message');

    // Verifica se o token já está armazenado ao carregar o popup
    chrome.storage.local.get(['authToken'], (result) => {
        const token = result.authToken;
        if (token) {
            console.log('Token encontrado no armazenamento:', token);
            loginSection.style.display = 'none';
            sendSection.style.display = 'block';
            sendButton.disabled = false;
        } else {
            console.log('Token não encontrado no armazenamento.');
        }
    });

    loginButton.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        autenticarUsuario(email, senha)
            .then((token) => {
                if (token) {
                    console.log('Login realizado com sucesso! Token:', token);
                    loginSection.style.display = 'none';
                    sendSection.style.display = 'block';
                    sendButton.disabled = false;
                    alert('Login realizado com sucesso! Você pode enviar os dados agora.');
                } else {
                    console.error('Falha ao obter token. Verifique as credenciais.');
                    alert('Falha na autenticação. Verifique suas credenciais.');
                }
            })
            .catch(err => console.error('Erro durante a autenticação:', err));
    });

    sendButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'sendToAPI' }, (response) => {
            console.log('Resposta do background:', response);

            if (response.status === 'carregando') {
                loadingMessage.style.display = 'block';
                sendButton.style.display = 'none';
            }
            else if (response.status === 'sucesso') {
                successMessage.style.display = 'block';
                sendButton.style.display = 'none';
            } else {
                console.error('Erro ao enviar os dados:', response.mensagem);
                alert(`Erro ao enviar os dados: ${response.mensagem}`);
            }
        });
    });

    const toggleVisibilityButton = document.getElementById('toggle-visibility');
    const senhaInput = document.getElementById('senha');
    const toggleIcon = document.getElementById('toggle-icon');

    toggleVisibilityButton.addEventListener('click', () => {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            toggleIcon.src = '../images/eye-off.svg';
            toggleIcon.alt = 'Ocultar senha';
        } else {
            senhaInput.type = 'password';
            toggleIcon.src = '../images/eye.svg';
            toggleIcon.alt = 'Exibir senha';
        }
    });
});

function autenticarUsuario(email, senha) {
    return fetch('https://api.easyrecruter.com.br/v1/autenticar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Falha na autenticação: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.token) {
                chrome.storage.local.set({ authToken: data.token });
                return data.token;
            } else {
                throw new Error('Resposta inválida da API: token não recebido');
            }
        })
        .catch(err => {
            console.error('Erro na autenticação:', err);
            return null;
        });
}