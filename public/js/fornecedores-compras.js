// Funções de Fornecedores e Lista de Compras

async function loadFornecedores() {
    const content = document.getElementById('page-content');
    
    try {
        const response = await apiRequest('/fornecedores');
        const fornecedores = await response.json();
        
        let html = `
            <div class="page-header">
                <h1>Fornecedores</h1>
                <button class="btn btn-primary" data-action="novo-fornecedor">+ Novo Fornecedor</button>
            </div>
        `;
        
        if (fornecedores.length === 0) {
            html += `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <h3>Nenhum fornecedor cadastrado</h3>
                    <p>Clique em "Novo Fornecedor" para adicionar o primeiro fornecedor</p>
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
                            <th>Contato</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            fornecedores.forEach(f => {
                html += `<tr>
                    <td>${f.nome}</td>
                    <td>${f.email || '-'}</td>
                    <td>${f.celular || f.telefone || '-'}</td>
                    <td>${f.contato_nome || '-'}</td>
                    <td>
                        <button class="btn btn-success" data-action="editar-fornecedor" data-id="${f.id}" style="margin-right: 8px;">Editar</button>
                        <button class="btn btn-danger" data-action="deletar-fornecedor" data-id="${f.id}">Deletar</button>
                    </td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }
        
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="card"><p>Erro ao carregar fornecedores</p></div>';
    }
}

async function loadListaCompras() {
    const content = document.getElementById('page-content');
    
    try {
        const response = await apiRequest('/lista-compras');
        const itens = await response.json();
        
        let html = `
            <div class="page-header">
                <h1>Lista de Compras</h1>
                <button class="btn btn-primary" data-action="novo-item-compra">+ Novo Item</button>
            </div>
        `;
        
        if (itens.length === 0) {
            html += `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3>Lista de compras vazia</h3>
                    <p>Clique em "Novo Item" para adicionar itens à lista</p>
                </div>
            `;
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantidade</th>
                            <th>Unidade</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            itens.forEach(i => {
                const prioridadeClass = i.prioridade === 'alta' ? 'negative' : i.prioridade === 'media' ? 'neutral' : 'positive';
                const statusClass = i.status === 'comprado' ? 'positive' : 'neutral';
                
                html += `<tr>
                    <td>${i.item}</td>
                    <td>${i.quantidade || '-'}</td>
                    <td>${i.unidade || '-'}</td>
                    <td><span class="stat-change ${prioridadeClass}">${i.prioridade}</span></td>
                    <td><span class="stat-change ${statusClass}">${i.status}</span></td>
                    <td>
                        <button class="btn btn-success" data-action="editar-item-compra" data-id="${i.id}" style="margin-right: 8px;">Editar</button>
                        <button class="btn btn-danger" data-action="deletar-item-compra" data-id="${i.id}">Deletar</button>
                    </td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }
        
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="card"><p>Erro ao carregar lista de compras</p></div>';
    }
}

function novoFornecedor() {
    showModal('Novo Fornecedor', `
        <form id="form-fornecedor">
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
                    <label>CNPJ</label>
                    <input type="text" name="cnpj">
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
                <label>Nome do Contato</label>
                <input type="text" name="contato_nome">
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
                        ${['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => 
                            `<option value="${uf}">${uf}</option>`
                        ).join('')}
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
        const form = document.getElementById('form-fornecedor');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await apiRequest('/fornecedores', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                closeModal();
                showToast('Fornecedor cadastrado com sucesso!', 'success');
                loadFornecedores();
            } else {
                const error = await response.json();
                showToast(error.error || 'Erro ao cadastrar fornecedor', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor', 'error');
        }
    });
}

async function editarFornecedor(id) {
    try {
        const response = await apiRequest(`/fornecedores/${id}`);
        const fornecedor = await response.json();
        
        showModal('Editar Fornecedor', `
            <form id="form-fornecedor">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="nome" value="${fornecedor.nome || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Razão Social</label>
                        <input type="text" name="razao_social" value="${fornecedor.razao_social || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>CNPJ</label>
                        <input type="text" name="cnpj" value="${fornecedor.cnpj || ''}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${fornecedor.email || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" name="telefone" value="${fornecedor.telefone || ''}">
                    </div>
                    <div class="form-group">
                        <label>Celular</label>
                        <input type="text" name="celular" value="${fornecedor.celular || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Nome do Contato</label>
                    <input type="text" name="contato_nome" value="${fornecedor.contato_nome || ''}">
                </div>
                <div class="form-group">
                    <label>Endereço</label>
                    <input type="text" name="endereco" value="${fornecedor.endereco || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Cidade</label>
                        <input type="text" name="cidade" value="${fornecedor.cidade || ''}">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select name="estado">
                            <option value="">Selecione</option>
                            ${['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => 
                                `<option value="${uf}" ${fornecedor.estado === uf ? 'selected' : ''}>${uf}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>CEP</label>
                    <input type="text" name="cep" value="${fornecedor.cep || ''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes">${fornecedor.observacoes || ''}</textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('form-fornecedor');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiRequest(`/fornecedores/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    closeModal();
                    showToast('Fornecedor atualizado com sucesso!', 'success');
                    loadFornecedores();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao atualizar fornecedor', 'error');
                }
            } catch (error) {
                showToast('Erro ao conectar ao servidor', 'error');
            }
        });
    } catch (error) {
        showToast('Erro ao carregar dados do fornecedor', 'error');
    }
}

async function deletarFornecedor(id) {
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/fornecedores/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Fornecedor deletado com sucesso!', 'success');
            loadFornecedores();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao deletar fornecedor', 'error');
        }
    } catch (error) {
        showToast('Erro ao conectar ao servidor', 'error');
    }
}

function novoItemCompra() {
    showModal('Novo Item', `
        <form id="form-item-compra">
            <div class="form-group">
                <label>Item *</label>
                <input type="text" name="item" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Quantidade</label>
                    <input type="text" name="quantidade">
                </div>
                <div class="form-group">
                    <label>Unidade</label>
                    <input type="text" name="unidade" placeholder="Ex: kg, un, cx">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Prioridade</label>
                    <select name="prioridade">
                        <option value="baixa">Baixa</option>
                        <option value="media" selected>Média</option>
                        <option value="alta">Alta</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="pendente" selected>Pendente</option>
                        <option value="comprado">Comprado</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="observacoes"></textarea>
            </div>
        </form>
    `, async () => {
        const form = document.getElementById('form-item-compra');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await apiRequest('/lista-compras', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                closeModal();
                showToast('Item adicionado com sucesso!', 'success');
                loadListaCompras();
            } else {
                const error = await response.json();
                showToast(error.error || 'Erro ao adicionar item', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor', 'error');
        }
    });
}

async function editarItemCompra(id) {
    try {
        const response = await apiRequest(`/lista-compras/${id}`);
        const item = await response.json();
        
        showModal('Editar Item', `
            <form id="form-item-compra">
                <div class="form-group">
                    <label>Item *</label>
                    <input type="text" name="item" value="${item.item || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Quantidade</label>
                        <input type="text" name="quantidade" value="${item.quantidade || ''}">
                    </div>
                    <div class="form-group">
                        <label>Unidade</label>
                        <input type="text" name="unidade" value="${item.unidade || ''}" placeholder="Ex: kg, un, cx">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Prioridade</label>
                        <select name="prioridade">
                            <option value="baixa" ${item.prioridade === 'baixa' ? 'selected' : ''}>Baixa</option>
                            <option value="media" ${item.prioridade === 'media' ? 'selected' : ''}>Média</option>
                            <option value="alta" ${item.prioridade === 'alta' ? 'selected' : ''}>Alta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="pendente" ${item.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="comprado" ${item.status === 'comprado' ? 'selected' : ''}>Comprado</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes">${item.observacoes || ''}</textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('form-item-compra');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await apiRequest(`/lista-compras/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    closeModal();
                    showToast('Item atualizado com sucesso!', 'success');
                    loadListaCompras();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Erro ao atualizar item', 'error');
                }
            } catch (error) {
                showToast('Erro ao conectar ao servidor', 'error');
            }
        });
    } catch (error) {
        showToast('Erro ao carregar dados do item', 'error');
    }
}

async function deletarItemCompra(id) {
    if (!confirm('Tem certeza que deseja deletar este item?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/lista-compras/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Item deletado com sucesso!', 'success');
            loadListaCompras();
        } else {
            const error = await response.json();
            showToast(error.error || 'Erro ao deletar item', 'error');
        }
    } catch (error) {
        showToast('Erro ao conectar ao servidor', 'error');
    }
}
