// script.js (Conteúdo completo e final)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Declarações de Elementos DOM ---
    const body = document.body;
    const viewerContainer = document.getElementById('viewer-container');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const toggleViewBtn = document.getElementById('toggle-view');
    const searchInput = document.getElementById('search-input'); 
    const sortSelect = document.getElementById('sort-select'); 

    // Sidebar
    const collectionList = document.getElementById('collection-list'); 
    const manageCollectionsBtn = document.getElementById('manage-collections-btn');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');

    // Modal de Leitura (READ)
    const readerModal = document.getElementById('reader-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalUrl = document.getElementById('modal-url');
    const modalTags = document.getElementById('modal-tags');

    // Modal CRUD (CREATE / UPDATE de Link)
    const addLinkBtn = document.getElementById('add-link-btn');
    const crudModal = document.getElementById('crud-modal');
    const closeCrudModalBtn = document.getElementById('close-crud-modal-btn');
    const crudModalTitle = document.getElementById('crud-modal-title');
    const linkForm = document.getElementById('link-form');
    const linkIdInput = document.getElementById('link-id');
    const linkTitleInput = document.getElementById('link-title');
    const linkUrlInput = document.getElementById('link-url');
    const linkDescriptionInput = document.getElementById('link-description');
    const linkTagsInput = document.getElementById('link-tags');
    const linkCollectionSelect = document.getElementById('link-collection');
    
    // Modal CRUD de Coleções
    const collectionCrudModal = document.getElementById('collection-crud-modal');
    const closeCollectionModalBtn = document.getElementById('close-collection-modal-btn');
    const collectionForm = document.getElementById('collection-form');
    const collectionNameInput = document.getElementById('collection-name');
    const collectionIdInput = document.getElementById('collection-id');
    const collectionManagementList = document.getElementById('collection-management-list');
    const collectionCrudModalTitle = document.getElementById('collection-crud-modal-title');


    // Variáveis de estado
    let dataLinks = []; 
    let dataCollections = [
        { id: 'all', name: 'Todos os Links', count: 0 },
        { id: 'default', name: 'Geral', count: 0, isDeletable: false } 
    ];
    let activeTag = null; 
    let activeCollection = 'all'; 
    let activeSort = 'date-desc'; 
    
    // ===============================================
    // ARMAZENAMENTO E ESTADO (localStorage)
    // ===============================================

    const saveState = () => {
        localStorage.setItem('links', JSON.stringify(dataLinks));
        localStorage.setItem('collections', JSON.stringify(dataCollections));
    };

    const loadState = () => {
        const savedLinks = localStorage.getItem('links');
        const savedCollections = localStorage.getItem('collections');
        const savedTheme = localStorage.getItem('theme');
        const savedView = localStorage.getItem('view');
        const savedSort = localStorage.getItem('sort');
        const savedCollection = localStorage.getItem('activeCollection');

        // Carrega Links
        if (savedLinks) {
            dataLinks = JSON.parse(savedLinks);
        } else {
             // DADOS SIMULADOS INICIAIS
            dataLinks = [
                { id: 1, title: "🚀 Desvendando o CSS Grid Moderno", description: "Um guia detalhado sobre como usar as novas propriedades de layout em 2024.", url: "https://exemplo.com/artigo-tech", tags: ["CSS", "Frontend", "Grid"], collection: "Geral", date: new Date('2024-01-15T10:00:00').getTime() },
                { id: 2, title: "🎨 Ferramenta de Cores para UI", description: "Uma paleta baseada em IA para projetos que visam acessibilidade e contraste.", url: "https://exemplo.com/ferramenta-design", tags: ["Design", "UI"], collection: "Geral", date: new Date('2024-01-10T15:30:00').getTime() },
                { id: 3, title: "⚙️ Setup de Produtividade JS", description: "Configurando o ambiente de desenvolvimento ideal com VSC e Node.", url: "https://exemplo.com/setup-dev", tags: ["Backend", "Tools", "JS"], collection: "Geral", date: new Date('2023-12-25T08:00:00').getTime() },
            ];
            saveState();
        }

        // Carrega Coleções
        if (savedCollections) {
            dataCollections = JSON.parse(savedCollections);
        } else {
            // Se links foram carregados mas coleções não, recalcula
            updateCollectionCounts();
            saveState();
        }

        // Carrega Tema
        if (savedTheme === 'dark-mode') {
            body.classList.add('dark-mode');
        } else {
             body.classList.remove('dark-mode');
        }
        updateThemeButtonText();

        // Carrega Visualização
        if (savedView === 'list-view') {
            viewerContainer.classList.remove('grid-view');
            viewerContainer.classList.add('list-view');
        } else {
            viewerContainer.classList.remove('list-view');
            viewerContainer.classList.add('grid-view');
        }
        updateViewButtonText(savedView || 'grid-view');

        // Carrega Ordenação
        activeSort = savedSort || 'date-desc';
        sortSelect.value = activeSort;

        // Carrega Coleção Ativa
        activeCollection = savedCollection || 'all';
    };

    const saveThemePreference = (theme) => localStorage.setItem('theme', theme);
    const saveViewPreference = (view) => localStorage.setItem('view', view);
    const saveSortPreference = (sort) => localStorage.setItem('sort', sort);
    const saveCollectionPreference = (collectionId) => localStorage.setItem('activeCollection', collectionId);


    // ===============================================
    // FUNÇÕES DE UTILIDADE E RENDERIZAÇÃO
    // ===============================================

    const updateCollectionCounts = () => {
        // Zera a contagem em todas as coleções (exceto 'all')
        dataCollections.forEach(c => {
            if (c.id !== 'all') {
                c.count = 0;
            }
        });

        // Recalcula contagem
        const collectionCounts = dataLinks.reduce((acc, link) => {
            const collectionName = link.collection || 'Geral';
            acc[collectionName] = (acc[collectionName] || 0) + 1;
            return acc;
        }, {});

        // Atualiza a contagem nos objetos de coleção e total
        let totalCount = 0;
        dataCollections.forEach(c => {
            if (c.id !== 'all') {
                c.count = collectionCounts[c.name] || 0;
                totalCount += c.count;
            }
        });

        // Atualiza a contagem da coleção 'Todos os Links'
        const allCollection = dataCollections.find(c => c.id === 'all');
        if (allCollection) {
            allCollection.count = totalCount;
        }
    };
    
    const renderCollections = () => {
        updateCollectionCounts();
        collectionList.innerHTML = '';
        
        dataCollections.filter(c => c.id !== 'default').forEach(collection => {
            const li = document.createElement('li');
            const isActive = activeCollection === collection.id || (activeCollection === collection.name);
            const classList = ['collection-item'];
            if (isActive) classList.push('active-collection');

            // Usa o ID para "all" e o nome para as coleções criadas pelo usuário.
            const collectionIdentifier = collection.id === 'all' ? 'all' : collection.name; 

            li.innerHTML = `
                <a href="#" class="${classList.join(' ')}" data-collection-id="${collectionIdentifier}">
                    ${collection.name} (${collection.count})
                </a>
            `;
            collectionList.appendChild(li);
        });
        
        // Adiciona evento de clique para filtrar
        collectionList.querySelectorAll('.collection-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const newCollectionId = e.target.getAttribute('data-collection-id');
                activeCollection = newCollectionId;
                saveCollectionPreference(activeCollection);
                renderCollections(); // Re-renderiza para atualizar a classe ativa
                filterAndRender(); // Filtra os links
            });
        });
    };

    const renderCollectionManagementList = () => {
        collectionManagementList.innerHTML = '';

        dataCollections.filter(c => c.id !== 'all').forEach(collection => {
            const isDefault = collection.name === 'Geral';
            
            const li = document.createElement('li');
            li.setAttribute('data-collection-id', collection.id);
            li.innerHTML = `
                <span class="collection-name-display">${collection.name}</span>
                <span class="collection-actions">
                    (${collection.count}) 
                    ${isDefault ? '<span class="is-default-collection">(Padrão)</span>' : ''}
                    <button class="edit-collection-btn" data-id="${collection.id}">
                        Editar
                    </button>
                    ${!isDefault ? `
                        <button class="delete-collection-btn" data-id="${collection.id}">
                            Excluir
                        </button>` : ''}
                </span>
            `;
            collectionManagementList.appendChild(li);
        });

        // Adiciona eventos aos botões de gerencimaneto
        collectionManagementList.querySelectorAll('.edit-collection-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const collection = dataCollections.find(c => c.id === id || c.name === id);
                if (collection) {
                    collectionCrudModalTitle.textContent = "Editar Coleção";
                    collectionIdInput.value = id;
                    collectionNameInput.value = collection.name;
                    collectionForm.querySelector('button').textContent = 'Salvar Alterações';
                }
            });
        });

        collectionManagementList.querySelectorAll('.delete-collection-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = e.target.getAttribute('data-id');
                deleteCollection(idToDelete);
            });
        });
    }

    const renderCollectionOptions = (selectedCollectionName) => {
        linkCollectionSelect.innerHTML = '';

        const collectionsToRender = dataCollections.filter(c => c.id !== 'all');
        
        collectionsToRender.forEach(collection => {
            const option = document.createElement('option');
            option.value = collection.name; // Usamos o nome da coleção como valor
            option.textContent = collection.name;
            
            // Pré-seleciona a opção se o nome corresponder
            if (collection.name === (selectedCollectionName || 'Geral')) {
                option.selected = true;
            }
            linkCollectionSelect.appendChild(option);
        });
    }
    
    // Função para abrir modal de leitura (simulação)
    const openModal = (link) => {
        modalTitle.textContent = link.title;
        modalUrl.textContent = link.url;
        modalTags.textContent = link.tags.join(', ');
        
        // Simulação de conteúdo para o modal de leitura
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <p>${link.description}</p>
            <p>O foco principal é garantir que o usuário tenha um ambiente sem distrações, sem anúncios ou barras laterais, para ler o conteúdo salvo.</p>
            <h3>Detalhes Adicionais</h3>
            <ul>
                <li>URL Salva: <a href="${link.url}" target="_blank">${link.url}</a></li>
                <li>Tags: ${link.tags.map(tag => `<span class="tags-simulated">${tag}</span>`).join(' ')}</li>
            </ul>
        `;

        readerModal.classList.remove('hidden');
        body.style.overflow = 'hidden'; // Evita scroll no corpo
    };

    const closeModal = () => {
        readerModal.classList.add('hidden');
        body.style.overflow = 'auto';
    };
    
    const updateThemeButtonText = () => {
        if (body.classList.contains('dark-mode')) {
            toggleThemeBtn.innerHTML = 'Alternar Tema: 🌙 Escuro';
        } else {
            toggleThemeBtn.innerHTML = 'Alternar Tema: ☀️ Claro';
        }
    };
    
    const updateViewButtonText = (view) => {
        if (view === 'grid-view' || viewerContainer.classList.contains('grid-view')) {
            toggleViewBtn.textContent = 'Modo: Grid (Clique para Lista)';
        } else {
            toggleViewBtn.textContent = 'Modo: Lista (Clique para Grid)';
        }
    };

    const applySort = (links) => {
        const sortedLinks = [...links];
        switch (activeSort) {
            case 'title-asc':
                sortedLinks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sortedLinks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'date-asc':
                sortedLinks.sort((a, b) => a.date - b.date);
                break;
            case 'date-desc': // Padrão
            default:
                sortedLinks.sort((a, b) => b.date - a.date);
                break;
        }
        return sortedLinks;
    };
    
    const renderCards = (links) => {
        viewerContainer.innerHTML = '';
        
        if (links.length === 0) {
            viewerContainer.innerHTML = '<p style="text-align: center; margin-top: 50px; color: var(--texto-secundario);">Nenhum link encontrado.</p>';
            return;
        }

        links.forEach(link => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const tagsHtml = link.tags.map(tag => 
                `<span data-tag="${tag}">${tag}</span>`
            ).join('');

            card.innerHTML = `
                <div class="card-actions">
                    <button class="edit-btn" data-id="${link.id}">
                        <i class="fas fa-edit"></i> </button>
                    <button class="delete-btn" data-id="${link.id}">
                        <i class="fas fa-trash"></i> </button>
                </div>
                <h3>${link.title}</h3>
                <p>${link.description}</p>
                <div class="tags">${tagsHtml}</div>
                <button class="reader-mode-btn" data-id="${link.id}">Modo Leitura</button>
            `;
            
            viewerContainer.appendChild(card);
        });

        // Adiciona listeners para tags
        viewerContainer.querySelectorAll('.tags span').forEach(tagEl => {
            tagEl.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que o clique da tag abra o modal
                const tag = e.target.getAttribute('data-tag');
                activeTag = activeTag === tag ? null : tag; // Alterna tag ativa
                filterAndRender();
            });
        });

        // Adiciona listeners para os botões do card
        viewerContainer.querySelectorAll('.reader-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.target.getAttribute('data-id'));
                const link = dataLinks.find(l => l.id === id);
                if (link) {
                    openModal(link);
                }
            });
        });
        
        viewerContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.target.closest('button').getAttribute('data-id'));
                editLink(id);
            });
        });

        viewerContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.target.closest('button').getAttribute('data-id'));
                deleteLink(id);
            });
        });
        
        // Abre o link ao clicar no card (fora dos botões de ação)
        viewerContainer.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = parseInt(card.querySelector('.reader-mode-btn').getAttribute('data-id'));
                const link = dataLinks.find(l => l.id === id);
                if (link) {
                    window.open(link.url, '_blank');
                }
            });
        });
    };
    
    const filterAndRender = () => {
        // 1. Filtra pela barra de pesquisa
        const searchTerm = searchInput.value.toLowerCase();
        let filteredLinks = dataLinks.filter(link => 
            link.title.toLowerCase().includes(searchTerm) ||
            link.description.toLowerCase().includes(searchTerm) ||
            link.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        // 2. Filtra pela Coleção Ativa
        if (activeCollection !== 'all') {
            const collectionName = dataCollections.find(c => c.id === activeCollection)?.name || activeCollection;
            filteredLinks = filteredLinks.filter(link => link.collection === collectionName);
        }

        // 3. Filtra pela Tag Ativa
        if (activeTag) {
            filteredLinks = filteredLinks.filter(link => link.tags.includes(activeTag));
        }
        
        // 4. Aplica Ordenação
        const sortedLinks = applySort(filteredLinks);

        // 5. Renderiza
        renderCards(sortedLinks);
        
        // Atualiza o estado visual das tags na UI
        viewerContainer.querySelectorAll('.tags span').forEach(tagEl => {
            const tag = tagEl.getAttribute('data-tag');
            if (tag === activeTag) {
                tagEl.style.outline = '2px solid var(--cor-acento)';
                tagEl.style.outlineOffset = '2px';
            } else {
                tagEl.style.outline = 'none';
            }
        });
    };


    // ===============================================
    // CRUD DE LINKS
    // ===============================================

    const saveLink = (e) => {
        e.preventDefault();
        
        const id = linkIdInput.value ? parseInt(linkIdInput.value) : null;
        const title = linkTitleInput.value;
        const url = linkUrlInput.value;
        const description = linkDescriptionInput.value;
        const tags = linkTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const collection = linkCollectionSelect.value;
        
        if (!title || !url) {
            alert('Título e URL são obrigatórios.');
            return;
        }

        if (id) {
            // Edição
            const linkIndex = dataLinks.findIndex(l => l.id === id);
            if (linkIndex > -1) {
                dataLinks[linkIndex] = { ...dataLinks[linkIndex], title, url, description, tags, collection };
            }
        } else {
            // Criação
            const newId = dataLinks.length ? Math.max(...dataLinks.map(l => l.id)) + 1 : 1;
            const newLink = { id: newId, title, url, description, tags, collection, date: Date.now() };
            dataLinks.push(newLink);
        }

        document.getElementById('crud-modal').classList.add('hidden');
        body.style.overflow = 'auto';

        saveState();
        renderCollections();
        filterAndRender();
    };

    const editLink = (id) => {
        const link = dataLinks.find(l => l.id === id);
        if (link) {
            crudModalTitle.textContent = "Editar Link Existente";
            linkIdInput.value = link.id;
            linkTitleInput.value = link.title;
            linkUrlInput.value = link.url;
            linkDescriptionInput.value = link.description;
            linkTagsInput.value = link.tags.join(', ');
            
            renderCollectionOptions(link.collection); // Renderiza e pré-seleciona a coleção

            crudModal.classList.remove('hidden');
            body.style.overflow = 'hidden';
        }
    };

    const deleteLink = (id) => {
        if (confirm('Tem certeza que deseja excluir este link?')) {
            dataLinks = dataLinks.filter(l => l.id !== id);
            saveState();
            renderCollections();
            filterAndRender();
        }
    };
    
    linkForm.addEventListener('submit', saveLink);

    // ===============================================
    // CRUD DE COLEÇÕES
    // ===============================================

    const openCollectionCrudModal = () => {
        collectionCrudModalTitle.textContent = "Gerenciar Coleções";
        collectionIdInput.value = '';
        collectionNameInput.value = '';
        collectionForm.querySelector('button').textContent = 'Adicionar Coleção';
        
        renderCollectionManagementList();
        collectionCrudModal.classList.remove('hidden');
        body.style.overflow = 'hidden';
    };

    const closeCollectionCrudModal = () => {
        collectionCrudModal.classList.add('hidden');
        body.style.overflow = 'auto';
    };

    const saveCollection = (e) => {
        e.preventDefault();
        
        const id = collectionIdInput.value;
        const name = collectionNameInput.value.trim();
        
        if (!name) {
            alert('O nome da coleção é obrigatório.');
            return;
        }

        const isDuplicate = dataCollections.some(c => c.name === name && (c.id !== id));
        if (isDuplicate) {
             alert('Já existe uma coleção com este nome.');
             return;
        }

        if (id) {
            // Edição
            const collectionIndex = dataCollections.findIndex(c => c.id === id);
            if (collectionIndex > -1) {
                // Se o nome for alterado, atualiza nos links
                const oldName = dataCollections[collectionIndex].name;
                dataCollections[collectionIndex].name = name;
                dataLinks.forEach(link => {
                    if (link.collection === oldName) {
                        link.collection = name;
                    }
                });
            }
        } else {
            // Criação
            const newId = Date.now().toString(); // ID baseado no timestamp
            const newCollection = { id: newId, name, count: 0, isDeletable: true };
            dataCollections.push(newCollection);
        }

        collectionForm.reset();
        saveState();
        renderCollections(); // Atualiza a sidebar
        renderCollectionOptions(); // Atualiza o select do modal de link
        renderCollectionManagementList(); // Atualiza a lista de gerenciamento
        filterAndRender(); // Re-renderiza links
    };

    const deleteCollection = (id) => {
        const collectionToDelete = dataCollections.find(c => c.id === id);
        if (collectionToDelete.name === 'Geral') {
            alert('A coleção "Geral" não pode ser excluída.');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir a coleção "${collectionToDelete.name}"? Os links nela serão movidos para a coleção "Geral".`)) {
            // 1. Move os links da coleção excluída para a coleção 'Geral'
            dataLinks.forEach(link => {
                if (link.collection === collectionToDelete.name) {
                    link.collection = 'Geral';
                }
            });
            
            // 2. Remove a coleção
            dataCollections = dataCollections.filter(c => c.id !== id);
            
            // 3. Verifica se a coleção ativa foi excluída e move para 'all'
            if (activeCollection === collectionToDelete.name) {
                activeCollection = 'all';
                saveCollectionPreference('all');
            }

            saveState();
            renderCollections();
            renderCollectionOptions();
            renderCollectionManagementList();
            filterAndRender();
        }
    };
    
    collectionForm.addEventListener('submit', saveCollection);


    // ===============================================
    // IMPORTAÇÃO E EXPORTAÇÃO
    // ===============================================
    
    const exportLinks = () => {
        const exportData = {
            links: dataLinks,
            collections: dataCollections.filter(c => c.id !== 'all') // Exporta apenas coleções customizadas
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "web-clipper-data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importLinks = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (confirm("Isto irá substituir seus links e coleções atuais. Continuar?")) {
                    // Importa links
                    if (importedData.links && Array.isArray(importedData.links)) {
                        dataLinks = importedData.links;
                    }

                    // Importa coleções (mantendo a 'all' e a 'default' se não forem fornecidas)
                    if (importedData.collections && Array.isArray(importedData.collections)) {
                        const baseCollections = dataCollections.filter(c => !c.isDeletable || c.name === 'Geral');
                        
                        // Garante que a coleção 'Geral' padrão está presente
                        const defaultCollection = baseCollections.find(c => c.name === 'Geral') || { id: 'default', name: 'Geral', count: 0, isDeletable: false };

                        // Filtra coleções importadas para evitar duplicatas de nome com a padrão
                        const uniqueImportedCollections = importedData.collections.filter(
                            (imported) => imported.name !== 'Geral' && !baseCollections.some(base => base.name === imported.name)
                        ).map(c => ({...c, isDeletable: true})); // Marca como deletável

                        dataCollections = [
                            dataCollections.find(c => c.id === 'all'),
                            defaultCollection,
                            ...uniqueImportedCollections
                        ];
                    }
                    
                    // Converte a data de volta para número (timestamp)
                    dataLinks.forEach(link => {
                        if (typeof link.date === 'string') {
                            link.date = new Date(link.date).getTime();
                        }
                        // Garante que todo link tenha uma coleção (padrão para 'Geral')
                        if (!link.collection) {
                            link.collection = 'Geral';
                        }
                    });

                    saveState();
                    loadState(); // Recarrega estado para atualizar contagens e variáveis
                    renderCollections();
                    renderCollectionOptions();
                    filterAndRender();
                    alert("Dados importados com sucesso!");
                }
            } catch (e) {
                alert("Erro ao importar dados. O arquivo pode estar corrompido ou no formato incorreto.");
                console.error("Erro de Importação:", e);
            }
        };

        reader.readAsText(file);
    };


    // ===============================================
    // EVENT LISTENERS 
    // ===============================================

    // 1. Pesquisa em Tempo Real
    searchInput.addEventListener('input', filterAndRender);

    // 2. Lógica para Alternar Tema (Claro/Escuro)
    toggleThemeBtn.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        const newTheme = isDark ? 'dark-mode' : 'light-mode';
        
        saveThemePreference(newTheme); 
        updateThemeButtonText(); 
    });

    // 3. Lógica para Alternar Visualização (Grid/Lista)
    toggleViewBtn.addEventListener('click', () => {
        const isGridView = viewerContainer.classList.contains('grid-view');
        
        if (isGridView) {
            viewerContainer.classList.remove('grid-view');
            viewerContainer.classList.add('list-view');
        } else {
            viewerContainer.classList.remove('list-view');
            viewerContainer.classList.add('grid-view');
        }
        
        const newView = viewerContainer.classList.contains('grid-view') ? 'grid-view' : 'list-view';
        saveViewPreference(newView); 
        updateViewButtonText(newView);
    });
    
    // 4. Lógica de Ordenação
    sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        saveSortPreference(activeSort); 
        filterAndRender();
    });

    // 5. Fechar Modal de Leitura (Mantida)
    closeModalBtn.addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);

    // 6. Botão de Criação de Link e Fechar Modal CRUD de Link (Mantida)
    addLinkBtn.addEventListener('click', () => {
        // Zera o formulário para Criação
        linkForm.reset();
        crudModalTitle.textContent = "Adicionar Novo Link";
        linkIdInput.value = ''; 
        
        renderCollectionOptions();
        
        crudModal.classList.remove('hidden');
        body.style.overflow = 'hidden';
    });
    closeCrudModalBtn.addEventListener('click', () => {
        crudModal.classList.add('hidden');
        body.style.overflow = 'auto';
    });
    document.getElementById('crud-modal-backdrop').addEventListener('click', () => {
        crudModal.classList.add('hidden');
        body.style.overflow = 'auto';
    });
    
    // 7. Botões do Modal de Coleção
    manageCollectionsBtn.addEventListener('click', openCollectionCrudModal);
    closeCollectionModalBtn.addEventListener('click', closeCollectionCrudModal);
    document.getElementById('collection-modal-backdrop').addEventListener('click', closeCollectionCrudModal);

    
    // 8. Botão de Exportação
    exportBtn.addEventListener('click', exportLinks);
    
    // 9. Lógica de Importação
    importBtn.addEventListener('click', () => {
        importFileInput.click(); // Simula o clique no input file
    });
    
    importFileInput.addEventListener('change', importLinks);


    // --- CHAMADAS INICIAIS ---
    loadState();
    renderCollectionOptions(); 
    renderCollections(); 
    filterAndRender(); 
});