const API_URL = '/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || '{}');

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showScreen('main-screen');
            loadPage('dashboard');
        } else {
            document.getElementById('login-error').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('login-error').textContent = 'Erro ao conectar ao servidor';
    }
});

// Logout
document.getElementById('logout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    currentUser = {};
    showScreen('login-screen');
});

// Navigation
document.querySelectorAll('.menu a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        loadPage(e.target.dataset.page);
    });
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

async function loadPage(page) {
    const content = document.getElementById('page-content');
    
    switch(page) {
        case 'dashboard':
            content.innerHTML = '<h1>Dashboard</h1><p>Bem-vindo ao sistema!</p>';
            break;
        case 'clientes':
            await loadClientes();
            break;
        case 'orcamentos':
            await loadOrcamentos();
            break;
        case 'pedidos':
            await loadPedidos();
            break;
        default:
            content.innerHTML = '<h1>Página em desenvolvimento</h1>';
    }
}

async function loadClientes() {
    const response = await apiRequest('/clientes');
    const clientes = await response.json();
    
    let html = '<h1>Clientes</h1>';
    html += '<button class="btn btn-primary" onclick="novoCliente()">Novo Cliente</button>';
    html += '<table><thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>';
    
    clientes.forEach(c => {
        html += `<tr>
            <td>${c.nome}</td>
            <td>${c.email || '-'}</td>
            <td>${c.celular || c.telefone || '-'}</td>
            <td><button class="btn btn-success" onclick="editarCliente(${c.id})">Editar</button></td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    document.getElementById('page-content').innerHTML = html;
}

async function loadOrcamentos() {
    const response = await apiRequest('/orcamentos');
    const orcamentos = await response.json();
    
    let html = '<h1>Orçamentos</h1>';
    html += '<button class="btn btn-primary">Novo Orçamento</button>';
    html += '<table><thead><tr><th>Número</th><th>Cliente</th><th>Valor</th><th>Status</th></tr></thead><tbody>';
    
    orcamentos.forEach(o => {
        html += `<tr>
            <td>${o.numero}</td>
            <td>${o.cliente_nome}</td>
            <td>R$ ${parseFloat(o.valor_total).toFixed(2)}</td>
            <td>${o.status}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    document.getElementById('page-content').innerHTML = html;
}

async function loadPedidos() {
    const response = await apiRequest('/pedidos');
    const pedidos = await response.json();
    
    let html = '<h1>Pedidos</h1>';
    html += '<table><thead><tr><th>Número</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Pagamento</th></tr></thead><tbody>';
    
    pedidos.forEach(p => {
        html += `<tr>
            <td>${p.numero}</td>
            <td>${p.cliente_nome}</td>
            <td>R$ ${parseFloat(p.valor_total).toFixed(2)}</td>
            <td>${p.status}</td>
            <td>${p.status_pagamento}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    document.getElementById('page-content').innerHTML = html;
}

async function apiRequest(endpoint, options = {}) {
    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}

// Check if logged in and validate token
if (token) {
    // Validar token fazendo uma requisição
    fetch(`${API_URL}/clientes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (response.ok) {
            showScreen('main-screen');
            loadPage('dashboard');
        } else {
            // Token inválido, limpar e mostrar login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            token = null;
            currentUser = {};
            showScreen('login-screen');
        }
    }).catch(() => {
        // Erro de conexão, limpar e mostrar login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        token = null;
        currentUser = {};
        showScreen('login-screen');
    });
} else {
    showScreen('login-screen');
}
