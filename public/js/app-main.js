const API_URL = '/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || '{}');

// Verificar se está logado
if (!token) {
    window.location.href = '/login.html';
}

// Logout
document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
});

// Navigation
document.querySelectorAll('.menu a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover active de todos
        document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
        // Adicionar active no clicado
        e.target.classList.add('active');
        
        loadPage(e.target.dataset.page);
    });
});

async function loadPage(page) {
    const content = document.getElementById('page-content');
    
    switch(page) {
        case 'dashboard':
            content.innerHTML = `
                <div class="page-header">
                    <h1>Dashboard</h1>
                </div>
                <div class="card">
                    <h2>Bem-vindo, ${currentUser.nome}!</h2>
                    <p>Sistema de Gestão Comercial para Gráfica</p>
                </div>
            `;
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
            content.innerHTML = '<div class="card"><h1>Página em desenvolvimento</h1></div>';
    }
}

async function loadClientes() {
    const content = document.getElementById('page-content');
    
    try {
        const response = await apiRequest('/clientes');
        const clientes = await response.json();
        
        let html = `
            <div class="page-header">
                <h1>Clientes</h1>
                <button class="btn btn-primary" onclick="novoCliente()">+ Novo Cliente</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        clientes.forEach(c => {
            html += `<tr>
                <td>${c.nome}</td>
                <td>${c.email || '-'}</td>
                <td>${c.celular || c.telefone || '-'}</td>
                <td><button class="btn btn-success" onclick="editarCliente(${c.id})">Editar</button></td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="card"><p>Erro ao carregar clientes</p></div>';
    }
}

async function loadOrcamentos() {
    const content = document.getElementById('page-content');
    
    try {
        const response = await apiRequest('/orcamentos');
        const orcamentos = await response.json();
        
        let html = `
            <div class="page-header">
                <h1>Orçamentos</h1>
                <button class="btn btn-primary">+ Novo Orçamento</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        orcamentos.forEach(o => {
            html += `<tr>
                <td>${o.numero}</td>
                <td>${o.cliente_nome}</td>
                <td>R$ ${parseFloat(o.valor_total).toFixed(2)}</td>
                <td>${o.status}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="card"><p>Erro ao carregar orçamentos</p></div>';
    }
}

async function loadPedidos() {
    const content = document.getElementById('page-content');
    
    try {
        const response = await apiRequest('/pedidos');
        const pedidos = await response.json();
        
        let html = `
            <div class="page-header">
                <h1>Pedidos</h1>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Pagamento</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
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
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="card"><p>Erro ao carregar pedidos</p></div>';
    }
}

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    
    // Se não autorizado, redirecionar para login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
    
    return response;
}

// Carregar dashboard ao iniciar
loadPage('dashboard');

// Funções globais para botões
window.novoCliente = function() {
    alert('Funcionalidade em desenvolvimento');
};

window.editarCliente = function(id) {
    alert('Editar cliente ID: ' + id);
};
