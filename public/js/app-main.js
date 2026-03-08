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
                <div class="dashboard">
                    <div class="dashboard-header">
                        <div>
                            <h1>Overview</h1>
                            <p class="subtitle">Bem-vindo de volta, ${currentUser.nome}!</p>
                        </div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon orange">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <p class="stat-label">Total Clientes</p>
                                <h3 class="stat-value">0</h3>
                                <span class="stat-change positive">+12% desde último mês</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon red">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <p class="stat-label">Orçamentos</p>
                                <h3 class="stat-value">0</h3>
                                <span class="stat-change positive">+8% desde último mês</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <p class="stat-label">Faturamento</p>
                                <h3 class="stat-value">R$ 0,00</h3>
                                <span class="stat-change positive">+23% desde último mês</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <p class="stat-label">Pedidos Ativos</p>
                                <h3 class="stat-value">0</h3>
                                <span class="stat-change neutral">Sem alteração</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>Atividades Recentes</h3>
                            </div>
                            <div class="activity-list">
                                <div class="activity-item">
                                    <div class="activity-icon blue">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div class="activity-content">
                                        <p class="activity-title">Sistema iniciado</p>
                                        <p class="activity-time">Agora mesmo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>Ações Rápidas</h3>
                            </div>
                            <div class="quick-actions">
                                <button class="quick-action-btn" data-action="clientes">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="8.5" cy="7" r="4"></circle>
                                        <line x1="20" y1="8" x2="20" y2="14"></line>
                                        <line x1="23" y1="11" x2="17" y2="11"></line>
                                    </svg>
                                    <span>Novo Cliente</span>
                                </button>
                                <button class="quick-action-btn" data-action="orcamentos">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    <span>Novo Orçamento</span>
                                </button>
                                <button class="quick-action-btn" data-action="pedidos">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                    </svg>
                                    <span>Novo Pedido</span>
                                </button>
                            </div>
                        </div>
                    </div>
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
        case 'metas':
            await loadMetas();
            break;
        case 'relatorios':
            await loadRelatorios();
            break;
        default:
            content.innerHTML = '<div class="card"><h1>Página em desenvolvimento</h1></div>';
    }
}

async function loadMetas() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="page-header">
            <h1>Metas Comerciais</h1>
            <button class="btn btn-primary" data-action="nova-meta">+ Definir Meta</button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon orange">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-label">Meta do Mês</p>
                    <h3 class="stat-value">R$ 50.000,00</h3>
                    <span class="stat-change neutral">Março 2026</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-label">Realizado</p>
                    <h3 class="stat-value">R$ 0,00</h3>
                    <span class="stat-change neutral">0% da meta</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-label">Falta Atingir</p>
                    <h3 class="stat-value">R$ 50.000,00</h3>
                    <span class="stat-change neutral">100% restante</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon red">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-label">Dias Restantes</p>
                    <h3 class="stat-value">25</h3>
                    <span class="stat-change neutral">dias no mês</span>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card" style="margin-top: 24px;">
            <div class="card-header">
                <h3>Histórico de Metas</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Período</th>
                        <th>Meta</th>
                        <th>Realizado</th>
                        <th>%</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Março 2026</td>
                        <td>R$ 50.000,00</td>
                        <td>R$ 0,00</td>
                        <td>0%</td>
                        <td><span class="stat-change neutral">Em andamento</span></td>
                    </tr>
                    <tr>
                        <td>Fevereiro 2026</td>
                        <td>R$ 45.000,00</td>
                        <td>R$ 52.300,00</td>
                        <td>116%</td>
                        <td><span class="stat-change positive">✓ Atingida</span></td>
                    </tr>
                    <tr>
                        <td>Janeiro 2026</td>
                        <td>R$ 40.000,00</td>
                        <td>R$ 38.500,00</td>
                        <td>96%</td>
                        <td><span class="stat-change negative">✗ Não atingida</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

async function loadRelatorios() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="page-header">
            <h1>Relatórios</h1>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Vendas Mensais</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-relatorio="vendas-mensal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Gerar Relatório de Vendas</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Orçamentos</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-relatorio="orcamentos">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Gerar Relatório de Orçamentos</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Inadimplência</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-relatorio="inadimplencia">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Gerar Relatório de Inadimplência</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Novos Clientes</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-relatorio="clientes">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Gerar Relatório de Clientes</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Por Vendedor</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-relatorio="vendedor">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Gerar Relatório por Vendedor</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Lista de Compras</h3>
                </div>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-relatorio="lista-compras">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Gerar Lista de Compras</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function loadClientes() {
    const content = document.getElementById('page-content');
    
    try {
        const response = await apiRequest('/clientes');
        const clientes = await response.json();
        
        let html = `
            <div class="page-header">
                <h1>Clientes</h1>
                <button class="btn btn-primary" data-action="novo-cliente">+ Novo Cliente</button>
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
                <td><button class="btn btn-success" data-action="editar-cliente" data-id="${c.id}">Editar</button></td>
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

// Event delegation para botões dinâmicos
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (target) {
        const action = target.dataset.action;
        const id = target.dataset.id;
        
        switch(action) {
            case 'novo-cliente':
                novoCliente();
                break;
            case 'editar-cliente':
                editarCliente(id);
                break;
            case 'nova-meta':
                novaMeta();
                break;
            case 'clientes':
            case 'orcamentos':
            case 'pedidos':
                loadPage(action);
                break;
        }
    }
    
    // Relatórios
    const relatorio = e.target.closest('[data-relatorio]');
    if (relatorio) {
        gerarRelatorio(relatorio.dataset.relatorio);
    }
});

// Funções globais para botões
function novoCliente() {
    alert('Funcionalidade em desenvolvimento');
}

function editarCliente(id) {
    alert('Editar cliente ID: ' + id);
}

function novaMeta() {
    alert('Funcionalidade em desenvolvimento');
}

function gerarRelatorio(tipo) {
    alert('Gerando relatório de ' + tipo + '...\nFuncionalidade em desenvolvimento');
}
