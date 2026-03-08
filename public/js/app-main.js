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
            await loadDashboard();
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

async function loadDashboard() {
    const content = document.getElementById('page-content');
    
    try {
        // Buscar dados reais
        const [resClientes, resOrcamentos, resPedidos] = await Promise.all([
            apiRequest('/clientes'),
            apiRequest('/orcamentos'),
            apiRequest('/pedidos')
        ]);
        
        const clientes = await resClientes.json();
        const orcamentos = await resOrcamentos.json();
        const pedidos = await resPedidos.json();
        
        // Calcular estatísticas
        const totalClientes = clientes.length;
        const totalOrcamentos = orcamentos.length;
        const totalPedidos = pedidos.filter(p => p.status !== 'cancelado' && p.status !== 'entregue').length;
        const faturamento = pedidos
            .filter(p => p.status_pagamento === 'pago')
            .reduce((sum, p) => sum + parseFloat(p.valor_total || 0), 0);
        
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
                            <h3 class="stat-value">${totalClientes}</h3>
                            <span class="stat-change positive">Cadastrados</span>
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
                            <h3 class="stat-value">${totalOrcamentos}</h3>
                            <span class="stat-change neutral">Total</span>
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
                            <h3 class="stat-value">R$ ${faturamento.toFixed(2)}</h3>
                            <span class="stat-change positive">Recebido</span>
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
                            <h3 class="stat-value">${totalPedidos}</h3>
                            <span class="stat-change neutral">Em andamento</span>
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
                                    <p class="activity-title">${totalClientes} clientes cadastrados</p>
                                    <p class="activity-time">Total no sistema</p>
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
    } catch (error) {
        content.innerHTML = '<div class="card"><p>Erro ao carregar dashboard</p></div>';
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
        `;
        
        if (clientes.length === 0) {
            html += `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h3>Nenhum cliente cadastrado</h3>
                    <p>Clique em "Novo Cliente" para adicionar o primeiro cliente</p>
                </div>
            `;
        } else {
            html += `
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
                    <td>
                        <button class="btn btn-success" data-action="editar-cliente" data-id="${c.id}" style="margin-right: 8px;">Editar</button>
                        <button class="btn btn-danger" data-action="deletar-cliente" data-id="${c.id}">Deletar</button>
                    </td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }
        
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
                <button class="btn btn-primary" data-action="novo-orcamento">+ Novo Orçamento</button>
            </div>
        `;
        
        if (orcamentos.length === 0) {
            html += `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <h3>Nenhum orçamento cadastrado</h3>
                    <p>Clique em "Novo Orçamento" para criar o primeiro orçamento</p>
                </div>
            `;
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ações</th>
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
                    <td><button class="btn btn-success" data-action="editar-orcamento" data-id="${o.id}">Editar</button></td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }
        
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
                <button class="btn btn-primary" data-action="novo-pedido">+ Novo Pedido</button>
            </div>
        `;
        
        if (pedidos.length === 0) {
            html += `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3>Nenhum pedido cadastrado</h3>
                    <p>Clique em "Novo Pedido" para criar o primeiro pedido</p>
                </div>
            `;
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Pagamento</th>
                            <th>Ações</th>
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
                    <td><button class="btn btn-success" data-action="editar-pedido" data-id="${p.id}">Editar</button></td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }
        
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
            case 'deletar-cliente':
                deletarCliente(id);
                break;
            case 'novo-orcamento':
                novoOrcamento();
                break;
            case 'editar-orcamento':
                editarOrcamento(id);
                break;
            case 'novo-pedido':
                novoPedido();
                break;
            case 'editar-pedido':
                editarPedido(id);
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
    showModal('Novo Cliente', `
        <form id="form-cliente">
            <div class="form-row">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" name="nome" required>
                </div>
                <div class="form-group">
                    <label>Razão Social</label>
                    <input type="text" name="razao_social">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>CPF/CNPJ</label>
                    <input type="text" name="cnpj_cpf">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="text" name="telefone">
                </div>
                <div class="form-group">
                    <label>Celular</label>
                    <input type="text" name="celular">
                </div>
            </div>
            <div class="form-group">
                <label>Endereço</label>
                <input type="text" name="endereco">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Cidade</label>
                    <input type="text" name="cidade">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select name="estado">
                        <option value="">Selecione</option>
                        <option value="AC">AC</option>
                        <option value="AL">AL</option>
                        <option value="AP">AP</option>
                        <option value="AM">AM</option>
                        <option value="BA">BA</option>
                        <option value="CE">CE</option>
                        <option value="DF">DF</option>
                        <option value="ES">ES</option>
                        <option value="GO">GO</option>
                        <option value="MA">MA</option>
                        <option value="MT">MT</option>
                        <option value="MS">MS</option>
                        <option value="MG">MG</option>
                        <option value="PA">PA</option>
                        <option value="PB">PB</option>
                        <option value="PR">PR</option>
                        <option value="PE">PE</option>
                        <option value="PI">PI</option>
                        <option value="RJ">RJ</option>
                        <option value="RN">RN</option>
                        <option value="RS">RS</option>
                        <option value="RO">RO</option>
                        <option value="RR">RR</option>
                        <option value="SC">SC</option>
                        <option value="SP">SP</option>
                        <option value="SE">SE</option>
                        <option value="TO">TO</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>CEP</label>
                <input type="text" name="cep">
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="observacoes"></textarea>
            </div>
        </form>
    `, async () => {
        const form = document.getElementById('form-cliente');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await apiRequest('/clientes', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                closeModal();
                showToast('Cliente cadastrado com sucesso!', 'success');
                loadClientes();
            } else {
                const error = await response.json();
                showToast(error.error || 'Erro ao cadastrar cliente', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor', 'error');
        }
    });
}

async function editarCliente(id) {
    try {
        const response = await apiRequest(`/clientes/${id}`);
        const cliente = await response.json();
        
        showModal('Editar Cliente', `
            <form id="form-cliente">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="nome" value="${cliente.nome || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Razão Social</label>
                        <input type="text" name="razao_social" value="${cliente.razao_social || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>CPF/CNPJ</label>
                        <input type="text" name="cnpj_cpf" value="${cliente.cnpj_cpf || ''}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${cliente.email || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" name="telefone" value="${cliente.telefone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Celular</label>
                        <input type="text" name="celular" value="${cliente.celular || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Endereço</label>
                    <input type="text" name="endereco" value="${cliente.endereco || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Cidade</label>
                        <input type="text" name="cidade" value="${cliente.cidade || ''}">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select name="estado">
                            <option value="">Selecione</option>
                            ${['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => 
                                `<option value="${uf}" ${cliente.estado === uf ? 'selected' : ''}>${uf}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>CEP</label>
                    <input type="text" name="cep" value="${cliente.cep || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes">${cliente.observacoes || ''}</textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('form-cliente');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiRequest(`/clientes/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    closeModal();
                    showToast('Cliente atualizado com sucesso!', 'success');
                    loadClientes();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao atualizar cliente', 'error');
                }
            } catch (error) {
                showToast('Erro ao conectar ao servidor', 'error');
            }
        });
    } catch (error) {
        showToast('Erro ao carregar dados do cliente', 'error');
    }
}

async function deletarCliente(id) {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/clientes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Cliente deletado com sucesso!', 'success');
            loadClientes();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao deletar cliente', 'error');
        }
    } catch (error) {
        showToast('Erro ao conectar ao servidor', 'error');
    }
}

function novaMeta() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    showModal('Definir Meta', `
        <form id="form-meta">
            <div class="form-row">
                <div class="form-group">
                    <label>Mês *</label>
                    <select name="mes" required>
                        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => 
                            `<option value="${m}" ${m === mesAtual ? 'selected' : ''}>${m}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Ano *</label>
                    <input type="number" name="ano" value="${anoAtual}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Valor da Meta (R$) *</label>
                <input type="number" name="valor_meta" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Tipo</label>
                <select name="tipo">
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                </select>
            </div>
        </form>
    `, async () => {
        const form = document.getElementById('form-meta');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        data.usuario_id = currentUser.id;
        
        try {
            const response = await apiRequest('/metas', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                closeModal();
                showToast('Meta definida com sucesso!', 'success');
                loadMetas();
            } else {
                const error = await response.json();
                showToast(error.error || 'Erro ao definir meta', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor', 'error');
        }
    });
}

async function novoOrcamento() {
    // Carregar lista de clientes
    const responseClientes = await apiRequest('/clientes');
    const clientes = await responseClientes.json();
    
    if (clientes.length === 0) {
        showToast('Cadastre um cliente primeiro!', 'error');
        return;
    }
    
    showModal('Novo Orçamento', `
        <form id="form-orcamento">
            <div class="form-row">
                <div class="form-group">
                    <label>Número *</label>
                    <input type="text" name="numero" value="ORC-${Date.now()}" required>
                </div>
                <div class="form-group">
                    <label>Cliente *</label>
                    <select name="cliente_id" required>
                        <option value="">Selecione</option>
                        ${clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Data do Orçamento *</label>
                    <input type="date" name="data_orcamento" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Validade</label>
                    <input type="date" name="validade">
                </div>
            </div>
            <div class="form-group">
                <label>Descrição *</label>
                <textarea name="descricao" required></textarea>
            </div>
            <div class="form-group">
                <label>Valor Total (R$) *</label>
                <input type="number" name="valor_total" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="pendente">Pendente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="expirado">Expirado</option>
                </select>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="observacoes"></textarea>
            </div>
        </form>
    `, async () => {
        const form = document.getElementById('form-orcamento');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        data.vendedor_id = currentUser.id;
        
        try {
            const response = await apiRequest('/orcamentos', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                closeModal();
                showToast('Orçamento criado com sucesso!', 'success');
                loadOrcamentos();
            } else {
                const error = await response.json();
                showToast(error.error || 'Erro ao criar orçamento', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor', 'error');
        }
    });
}

async function editarOrcamento(id) {
    try {
        const [responseOrcamento, responseClientes] = await Promise.all([
            apiRequest(`/orcamentos/${id}`),
            apiRequest('/clientes')
        ]);
        
        const orcamento = await responseOrcamento.json();
        const clientes = await responseClientes.json();
        
        showModal('Editar Orçamento', `
            <form id="form-orcamento">
                <div class="form-row">
                    <div class="form-group">
                        <label>Número *</label>
                        <input type="text" name="numero" value="${orcamento.numero}" required>
                    </div>
                    <div class="form-group">
                        <label>Cliente *</label>
                        <select name="cliente_id" required>
                            ${clientes.map(c => 
                                `<option value="${c.id}" ${c.id === orcamento.cliente_id ? 'selected' : ''}>${c.nome}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data do Orçamento *</label>
                        <input type="date" name="data_orcamento" value="${orcamento.data_orcamento}" required>
                    </div>
                    <div class="form-group">
                        <label>Validade</label>
                        <input type="date" name="validade" value="${orcamento.validade || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição *</label>
                    <textarea name="descricao" required>${orcamento.descricao || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Valor Total (R$) *</label>
                    <input type="number" name="valor_total" step="0.01" value="${orcamento.valor_total}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="pendente" ${orcamento.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="aprovado" ${orcamento.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                        <option value="rejeitado" ${orcamento.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
                        <option value="expirado" ${orcamento.status === 'expirado' ? 'selected' : ''}>Expirado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes">${orcamento.observacoes || ''}</textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('form-orcamento');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiRequest(`/orcamentos/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    closeModal();
                    showToast('Orçamento atualizado com sucesso!', 'success');
                    loadOrcamentos();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao atualizar orçamento', 'error');
                }
            } catch (error) {
                showToast('Erro ao conectar ao servidor', 'error');
            }
        });
    } catch (error) {
        showToast('Erro ao carregar dados do orçamento', 'error');
    }
}

async function novoPedido() {
    // Carregar lista de clientes
    const responseClientes = await apiRequest('/clientes');
    const clientes = await responseClientes.json();
    
    if (clientes.length === 0) {
        showToast('Cadastre um cliente primeiro!', 'error');
        return;
    }
    
    showModal('Novo Pedido', `
        <form id="form-pedido">
            <div class="form-row">
                <div class="form-group">
                    <label>Número *</label>
                    <input type="text" name="numero" value="PED-${Date.now()}" required>
                </div>
                <div class="form-group">
                    <label>Cliente *</label>
                    <select name="cliente_id" required>
                        <option value="">Selecione</option>
                        ${clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Data do Pedido *</label>
                    <input type="date" name="data_pedido" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Data de Entrega</label>
                    <input type="date" name="data_entrega">
                </div>
            </div>
            <div class="form-group">
                <label>Descrição *</label>
                <textarea name="descricao" required></textarea>
            </div>
            <div class="form-group">
                <label>Valor Total (R$) *</label>
                <input type="number" name="valor_total" step="0.01" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="pendente">Pendente</option>
                        <option value="producao">Em Produção</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status Pagamento</label>
                    <select name="status_pagamento">
                        <option value="pendente">Pendente</option>
                        <option value="parcial">Parcial</option>
                        <option value="pago">Pago</option>
                        <option value="atrasado">Atrasado</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Valor Pago (R$)</label>
                <input type="number" name="valor_pago" step="0.01" value="0">
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="observacoes"></textarea>
            </div>
        </form>
    `, async () => {
        const form = document.getElementById('form-pedido');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        data.vendedor_id = currentUser.id;
        
        try {
            const response = await apiRequest('/pedidos', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                closeModal();
                showToast('Pedido criado com sucesso!', 'success');
                loadPedidos();
            } else {
                const error = await response.json();
                showToast(error.error || 'Erro ao criar pedido', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor', 'error');
        }
    });
}

async function editarPedido(id) {
    try {
        const [responsePedido, responseClientes] = await Promise.all([
            apiRequest(`/pedidos/${id}`),
            apiRequest('/clientes')
        ]);
        
        const pedido = await responsePedido.json();
        const clientes = await responseClientes.json();
        
        showModal('Editar Pedido', `
            <form id="form-pedido">
                <div class="form-row">
                    <div class="form-group">
                        <label>Número *</label>
                        <input type="text" name="numero" value="${pedido.numero}" required>
                    </div>
                    <div class="form-group">
                        <label>Cliente *</label>
                        <select name="cliente_id" required>
                            ${clientes.map(c => 
                                `<option value="${c.id}" ${c.id === pedido.cliente_id ? 'selected' : ''}>${c.nome}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data do Pedido *</label>
                        <input type="date" name="data_pedido" value="${pedido.data_pedido}" required>
                    </div>
                    <div class="form-group">
                        <label>Data de Entrega</label>
                        <input type="date" name="data_entrega" value="${pedido.data_entrega || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição *</label>
                    <textarea name="descricao" required>${pedido.descricao || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Valor Total (R$) *</label>
                    <input type="number" name="valor_total" step="0.01" value="${pedido.valor_total}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="producao" ${pedido.status === 'producao' ? 'selected' : ''}>Em Produção</option>
                            <option value="finalizado" ${pedido.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                            <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                            <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status Pagamento</label>
                        <select name="status_pagamento">
                            <option value="pendente" ${pedido.status_pagamento === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="parcial" ${pedido.status_pagamento === 'parcial' ? 'selected' : ''}>Parcial</option>
                            <option value="pago" ${pedido.status_pagamento === 'pago' ? 'selected' : ''}>Pago</option>
                            <option value="atrasado" ${pedido.status_pagamento === 'atrasado' ? 'selected' : ''}>Atrasado</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Valor Pago (R$)</label>
                    <input type="number" name="valor_pago" step="0.01" value="${pedido.valor_pago || 0}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes">${pedido.observacoes || ''}</textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('form-pedido');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiRequest(`/pedidos/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    closeModal();
                    showToast('Pedido atualizado com sucesso!', 'success');
                    loadPedidos();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao atualizar pedido', 'error');
                }
            } catch (error) {
                showToast('Erro ao conectar ao servidor', 'error');
            }
        });
    } catch (error) {
        showToast('Erro ao carregar dados do pedido', 'error');
    }
}

function gerarRelatorio(tipo) {
    switch(tipo) {
        case 'vendas-mensal':
            exportarVendasMensal();
            break;
        case 'orcamentos':
            exportarOrcamentos();
            break;
        case 'inadimplencia':
            exportarInadimplencia();
            break;
        case 'clientes':
            exportarClientes();
            break;
        case 'vendedor':
            exportarPorVendedor();
            break;
        case 'lista-compras':
            exportarListaCompras();
            break;
        default:
            showToast('Relatório não implementado', 'error');
    }
}

async function exportarVendasMensal() {
    try {
        const response = await apiRequest('/pedidos');
        const pedidos = await response.json();
        
        // Filtrar pedidos do mês atual
        const hoje = new Date();
        const mesAtual = hoje.getMonth() + 1;
        const anoAtual = hoje.getFullYear();
        
        const pedidosMes = pedidos.filter(p => {
            const data = new Date(p.data_pedido);
            return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
        });
        
        if (pedidosMes.length === 0) {
            showToast('Nenhuma venda no mês atual', 'error');
            return;
        }
        
        const dados = pedidosMes.map(p => ({
            'Número': p.numero,
            'Cliente': p.cliente_nome,
            'Data': new Date(p.data_pedido).toLocaleDateString('pt-BR'),
            'Valor': parseFloat(p.valor_total).toFixed(2),
            'Status': p.status,
            'Pagamento': p.status_pagamento
        }));
        
        const total = pedidosMes.reduce((sum, p) => sum + parseFloat(p.valor_total), 0);
        dados.push({
            'Número': '',
            'Cliente': '',
            'Data': '',
            'Valor': '',
            'Status': '',
            'Pagamento': ''
        });
        dados.push({
            'Número': 'TOTAL',
            'Cliente': '',
            'Data': '',
            'Valor': total.toFixed(2),
            'Status': '',
            'Pagamento': ''
        });
        
        exportarParaExcel(dados, `Vendas_${mesAtual}_${anoAtual}`);
        showToast('Relatório de vendas exportado!', 'success');
    } catch (error) {
        showToast('Erro ao gerar relatório', 'error');
    }
}

async function exportarOrcamentos() {
    try {
        const response = await apiRequest('/orcamentos');
        const orcamentos = await response.json();
        
        if (orcamentos.length === 0) {
            showToast('Nenhum orçamento cadastrado', 'error');
            return;
        }
        
        const dados = orcamentos.map(o => ({
            'Número': o.numero,
            'Cliente': o.cliente_nome,
            'Data': new Date(o.data_orcamento).toLocaleDateString('pt-BR'),
            'Validade': o.validade ? new Date(o.validade).toLocaleDateString('pt-BR') : '-',
            'Valor': parseFloat(o.valor_total).toFixed(2),
            'Status': o.status
        }));
        
        const total = orcamentos.reduce((sum, o) => sum + parseFloat(o.valor_total), 0);
        dados.push({
            'Número': '',
            'Cliente': '',
            'Data': '',
            'Validade': '',
            'Valor': '',
            'Status': ''
        });
        dados.push({
            'Número': 'TOTAL',
            'Cliente': '',
            'Data': '',
            'Validade': '',
            'Valor': total.toFixed(2),
            'Status': ''
        });
        
        exportarParaExcel(dados, 'Orcamentos');
        showToast('Relatório de orçamentos exportado!', 'success');
    } catch (error) {
        showToast('Erro ao gerar relatório', 'error');
    }
}

async function exportarInadimplencia() {
    try {
        const response = await apiRequest('/pedidos');
        const pedidos = await response.json();
        
        const inadimplentes = pedidos.filter(p => 
            p.status_pagamento === 'atrasado' || p.status_pagamento === 'pendente'
        );
        
        if (inadimplentes.length === 0) {
            showToast('Nenhum pedido inadimplente', 'success');
            return;
        }
        
        const dados = inadimplentes.map(p => ({
            'Número': p.numero,
            'Cliente': p.cliente_nome,
            'Data Pedido': new Date(p.data_pedido).toLocaleDateString('pt-BR'),
            'Valor Total': parseFloat(p.valor_total).toFixed(2),
            'Valor Pago': parseFloat(p.valor_pago || 0).toFixed(2),
            'Valor Pendente': (parseFloat(p.valor_total) - parseFloat(p.valor_pago || 0)).toFixed(2),
            'Status': p.status_pagamento
        }));
        
        const totalPendente = inadimplentes.reduce((sum, p) => 
            sum + (parseFloat(p.valor_total) - parseFloat(p.valor_pago || 0)), 0
        );
        
        dados.push({
            'Número': '',
            'Cliente': '',
            'Data Pedido': '',
            'Valor Total': '',
            'Valor Pago': '',
            'Valor Pendente': '',
            'Status': ''
        });
        dados.push({
            'Número': 'TOTAL PENDENTE',
            'Cliente': '',
            'Data Pedido': '',
            'Valor Total': '',
            'Valor Pago': '',
            'Valor Pendente': totalPendente.toFixed(2),
            'Status': ''
        });
        
        exportarParaExcel(dados, 'Inadimplencia');
        showToast('Relatório de inadimplência exportado!', 'success');
    } catch (error) {
        showToast('Erro ao gerar relatório', 'error');
    }
}

async function exportarClientes() {
    try {
        const response = await apiRequest('/clientes');
        const clientes = await response.json();
        
        if (clientes.length === 0) {
            showToast('Nenhum cliente cadastrado', 'error');
            return;
        }
        
        const dados = clientes.map(c => ({
            'Nome': c.nome,
            'Razão Social': c.razao_social || '-',
            'CPF/CNPJ': c.cnpj_cpf || '-',
            'Email': c.email || '-',
            'Telefone': c.telefone || '-',
            'Celular': c.celular || '-',
            'Cidade': c.cidade || '-',
            'Estado': c.estado || '-',
            'Data Cadastro': new Date(c.criado_em).toLocaleDateString('pt-BR')
        }));
        
        exportarParaExcel(dados, 'Clientes');
        showToast('Relatório de clientes exportado!', 'success');
    } catch (error) {
        showToast('Erro ao gerar relatório', 'error');
    }
}

async function exportarPorVendedor() {
    try {
        const response = await apiRequest('/pedidos');
        const pedidos = await response.json();
        
        if (pedidos.length === 0) {
            showToast('Nenhum pedido cadastrado', 'error');
            return;
        }
        
        // Agrupar por vendedor
        const porVendedor = {};
        pedidos.forEach(p => {
            const vendedor = p.vendedor_nome || 'Sem vendedor';
            if (!porVendedor[vendedor]) {
                porVendedor[vendedor] = {
                    quantidade: 0,
                    total: 0
                };
            }
            porVendedor[vendedor].quantidade++;
            porVendedor[vendedor].total += parseFloat(p.valor_total);
        });
        
        const dados = Object.keys(porVendedor).map(vendedor => ({
            'Vendedor': vendedor,
            'Quantidade de Pedidos': porVendedor[vendedor].quantidade,
            'Valor Total': porVendedor[vendedor].total.toFixed(2),
            'Ticket Médio': (porVendedor[vendedor].total / porVendedor[vendedor].quantidade).toFixed(2)
        }));
        
        exportarParaExcel(dados, 'Vendas_Por_Vendedor');
        showToast('Relatório por vendedor exportado!', 'success');
    } catch (error) {
        showToast('Erro ao gerar relatório', 'error');
    }
}

async function exportarListaCompras() {
    try {
        const response = await apiRequest('/lista-compras');
        const itens = await response.json();
        
        if (itens.length === 0) {
            showToast('Lista de compras vazia', 'error');
            return;
        }
        
        const dados = itens.map(i => ({
            'Item': i.item,
            'Quantidade': i.quantidade || '-',
            'Unidade': i.unidade || '-',
            'Prioridade': i.prioridade,
            'Status': i.status,
            'Observações': i.observacoes || '-'
        }));
        
        exportarParaExcel(dados, 'Lista_Compras');
        showToast('Lista de compras exportada!', 'success');
    } catch (error) {
        showToast('Erro ao gerar relatório', 'error');
    }
}

function exportarParaExcel(dados, nomeArquivo) {
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    
    // Ajustar largura das colunas
    const colWidths = [];
    const headers = Object.keys(dados[0]);
    headers.forEach(header => {
        const maxLength = Math.max(
            header.length,
            ...dados.map(row => String(row[header] || '').length)
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    ws['!cols'] = colWidths;
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    
    // Gerar arquivo e fazer download
    XLSX.writeFile(wb, `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Funções auxiliares
function showModal(title, content, onSave) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" data-action="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="close-modal">Cancelar</button>
                <button class="btn btn-primary" data-action="save-modal">Salvar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('[data-action="close-modal"]').addEventListener('click', closeModal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('[data-action="save-modal"]').addEventListener('click', onSave);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : '✗'}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
