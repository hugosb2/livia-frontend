document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Iniciando aplicação...');

    // ===================================================================
    // 1. CONSTANTES E SELEÇÃO DE ELEMENTOS
    // ===================================================================

    // Variáveis de ambiente — obter de env-config.js (window.__ENV__)
    const API_BASE_URL = (window.__ENV__ && window.__ENV__.API_BASE_URL) || '';
    const CHATBASE_API_KEY = (window.__ENV__ && window.__ENV__.CHATBASE_API_KEY) || '';
    const CHATBASE_CHATBOT_ID = (window.__ENV__ && window.__ENV__.CHATBASE_CHATBOT_ID) || '';
    const CHATBASE_URL = (window.__ENV__ && window.__ENV__.CHATBASE_URL) || '';

    // Avisos quando variáveis essenciais não estiverem definidas
    if (!API_BASE_URL) console.warn('ATENÇÃO: API_BASE_URL não definida. Gere `env-config.js` ou preencha `window.__ENV__`.');
    if (!CHATBASE_API_KEY) console.warn('ATENÇÃO: CHATBASE_API_KEY não definida.');
    if (!CHATBASE_CHATBOT_ID) console.warn('ATENÇÃO: CHATBASE_CHATBOT_ID não definida.');
    if (!CHATBASE_URL) console.warn('ATENÇÃO: CHATBASE_URL não definida.');

    const REGEX_SIAPE = /^\d{7}$/; 
    const REGEX_MATRICULA = /^\d{4}1[A-Z]{3}\d{2}[A-Z]{2}\d{4}$/; 

    // Elementos principais
    const splashScreen = document.getElementById('splash-screen');
    const authContainer = document.getElementById('auth-container');
    const appLayout = document.getElementById('app-layout'); 

    // Elementos de autenticação
    const loginFormContainer = document.getElementById('login-form-container');
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    
    const registerFormContainer = document.getElementById('register-form-container');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    const registerSteps = document.querySelectorAll('.register-step');
    const btnNext1 = document.getElementById('btn-next-1');
    const btnPrev2 = document.getElementById('btn-prev-2');
    const btnNext2 = document.getElementById('btn-next-2');
    const btnPrev3 = document.getElementById('btn-prev-3');

    // Elementos do modal
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCard = document.getElementById('modal-card');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Elementos do chat
    const chatDisplay = document.getElementById('chat-display');
    const perguntaInput = document.getElementById('pergunta-input');
    const btnPerguntar = document.getElementById('btn-perguntar');
    const btnLogout = document.getElementById('btn-logout');
    const btnProfile = document.getElementById('btn-profile');

    const historyList = document.getElementById('history-list');
    const btnNewChat = document.getElementById('btn-new-chat');

    // Elementos da tela de perfil integrada
    const profileScreen = document.getElementById('profile-screen');
    const profileBackBtn = document.getElementById('profile-back-btn');
    const profileEditBtn = document.getElementById('profile-edit-btn');
    const profilePasswordBtn = document.getElementById('profile-password-btn');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    const profileDeleteBtn = document.getElementById('profile-delete-btn');
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayEmail = document.getElementById('profile-display-email');
    const profileDisplayUsername = document.getElementById('profile-display-username');

    // Elementos do menu móvel
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileSidebarClose = document.getElementById('mobile-sidebar-close');
    const mobileNewChat = document.getElementById('mobile-new-chat');
    const mobileHistoryList = document.getElementById('mobile-history-list');

    const toggleLoginPass = document.getElementById('toggle-login-pass');
    const toggleRegPass = document.getElementById('toggle-reg-pass');
    const toggleRegConfirm = document.getElementById('toggle-reg-confirm');
    const regPassInput = document.getElementById('reg-password');
    const regConfirmInput = document.getElementById('reg-password-confirm');
    
    const eyeIconPath = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";
    const eyeOffIconPath = "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zM11.84 9.02l3.15 3.15c.02-.16.03-.33.03-.5 0-1.66-1.34-3-3-3-.17 0-.34.01-.5.03z";

    let conversationHistory = []; 
    let currentConversationId = null; 
    let conversations = []; 
    let currentRegisterStep = 1;
    let isSuccessModal = false;

    // Elementos do modal de edição
    let editProfileModal, editProfileForm, editProfileCloseBtn;
    let changePasswordModal, changePasswordForm, changePasswordCloseBtn;
    let deleteAccountModal, deleteAccountForm, deleteAccountCloseBtn;

    // ===================================================================
    // 2. VERIFICAÇÃO DE ELEMENTOS CRÍTICOS
    // ===================================================================

    function checkCriticalElements() {
        const criticalElements = {
            splashScreen,
            authContainer,
            appLayout,
            loginFormContainer,
            registerFormContainer,
            btnProfile
        };

        for (const [name, element] of Object.entries(criticalElements)) {
            if (!element) {
                console.error(`Elemento crítico não encontrado: ${name}`);
                return false;
            }
        }
        return true;
    }

    // ===================================================================
    // 3. LÓGICA DO MODAL (Mensagem)
    // ===================================================================

    function showModal(title, message, isSuccess = true) {
        if (!modalOverlay || !modalTitle || !modalMessage) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        isSuccessModal = isSuccess; 

        if (isSuccess) {
            modalCard.classList.add('success');
            modalCard.classList.remove('error');
        } else {
            modalCard.classList.add('error');
            modalCard.classList.remove('success');
        }
        
        modalOverlay.classList.add('visible');
    }

    function hideModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('visible');
        }
        if (isSuccessModal && showLoginLink) {
            showLoginLink.click();
            isSuccessModal = false; 
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) hideModal();
        });
    }

    // ===================================================================
    // 4. LÓGICA DE AUTENTICAÇÃO (Backend)
    // ===================================================================

    // --- Helpers de Armazenamento Local ---
    function storeToken(token) {
        localStorage.setItem('livia_token', token);
    }
    function getToken() {
        return localStorage.getItem('livia_token');
    }
    function storeUser(user) {
        localStorage.setItem('livia_user', JSON.stringify(user));
    }
    function getStoredUser() {
        const user = localStorage.getItem('livia_user');
        return user ? JSON.parse(user) : null;
    }
    function clearAuthData() {
        localStorage.removeItem('livia_token');
        localStorage.removeItem('livia_user');
    }

    // --- Função Central de API Fetch ---
    async function apiFetch(endpoint, options = {}) {
        const token = getToken();
        
        const headers = new Headers(options.headers || {});
        headers.append('Content-Type', 'application/json');
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }

        options.headers = headers;

        try {
            console.log(`DEBUG: Fazendo requisição para ${endpoint}`);
            const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);

            console.log(`DEBUG: Resposta recebida - Status: ${response.status} para ${endpoint}`);
            
            const isAuthRoute = (endpoint === '/login' || endpoint === '/register' || endpoint === '/validate-user');
            
            if (response.status === 401) {
                if (isAuthRoute) {
                    console.log('DEBUG: 401 em rota de auth - credenciais inválidas');
                    return response;
                } else if (getToken()) {
                    console.log('DEBUG: 401 em rota protegida - sessão expirada');
                    handleLogout();
                    showModal('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.', false);
                    return Promise.reject(new Error('Sessão expirada.'));
                }
            }
            
            return response;
        } catch (error) {
            console.error('Fetch Error:', error);
            if (error.message !== 'Sessão expirada.') {
                showModal('Erro de Rede', 'Não foi possível conectar ao servidor. Verifique sua internet.', false);
            }
            return Promise.reject(error);
        }
    }

    // --- Lógica do "Olhinho" de Senha ---
    function togglePasswordVisibility(input, icon) {
        if (!input || !icon) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const pathElement = icon.querySelector('path');
        if (pathElement) {
            pathElement.setAttribute('d', isPassword ? eyeOffIconPath : eyeIconPath);
        }
    }
    
    if (toggleLoginPass && loginPasswordInput) {
        toggleLoginPass.addEventListener('click', () => togglePasswordVisibility(loginPasswordInput, toggleLoginPass));
    }
    if (toggleRegPass && regPassInput) {
        toggleRegPass.addEventListener('click', () => togglePasswordVisibility(regPassInput, toggleRegPass));
    }
    if (toggleRegConfirm && regConfirmInput) {
        toggleRegConfirm.addEventListener('click', () => togglePasswordVisibility(regConfirmInput, toggleRegConfirm));
    }

    // --- Alternar entre formulários ---
    if (showRegisterLink && loginFormContainer && registerFormContainer) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
            currentRegisterStep = 1; 
            showRegisterStep(currentRegisterStep);
        });
    }

    if (showLoginLink && loginFormContainer && registerFormContainer) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
        });
    }

    // --- Lógica de Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) {
                loginError.style.display = 'none';
            }
            const email = loginEmailInput ? loginEmailInput.value : '';
            const password = loginPasswordInput ? loginPasswordInput.value : '';

            try {
                const response = await apiFetch('/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Erro desconhecido');
                }
                
                storeToken(data.access_token);
                storeUser(data.user);

                // Ensure splash is hidden and UI is shown immediately after login to avoid a blank screen
                try {
                    if (splashScreen && !splashScreen.classList.contains('hidden')) {
                        splashScreen.classList.add('hidden');
                    }
                    if (appLayout) appLayout.style.display = 'flex';
                    if (authContainer) authContainer.style.display = 'none';
                    // force a reflow/paint on next frame to avoid layout not updating in some mobile browsers
                    requestAnimationFrame(() => { document.body.offsetHeight; });
                } catch (e) {
                    console.warn('Could not force UI reveal after login', e);
                }

                initApp();
            } catch (error) {
                if (error.message !== 'Erro de Rede' && error.message !== 'Sessão expirada.' && loginError) {
                    loginError.textContent = `Erro: ${error.message}`;
                    loginError.style.display = 'block';
                }
            }
        });
    }

    // --- Lógica de Navegação das Etapas ---
    function showRegisterStep(stepNum) {
        registerSteps.forEach((step, index) => {
            step.classList.toggle('active', (index + 1) === stepNum);
        });
    }

    function validateFields(fieldIds) {
        for (const id of fieldIds) {
            const field = document.getElementById(id);
            if (!field || !field.value.trim()) {
                const fieldName = field ? field.labels[0]?.textContent : id;
                showModal('Campo Obrigatório', `Por favor, preencha o campo "${fieldName}".`, false);
                return false;
            }
        }
        return true;
    }

    if (btnNext1) {
        btnNext1.addEventListener('click', () => {
            if (validateFields(['reg-first-name', 'reg-last-name', 'reg-email'])) {
                currentRegisterStep = 2;
                showRegisterStep(currentRegisterStep);
            }
        });
    }

    if (btnPrev2) {
        btnPrev2.addEventListener('click', () => {
            currentRegisterStep = 1;
            showRegisterStep(currentRegisterStep);
        });
    }

    if (btnNext2) {
        btnNext2.addEventListener('click', async () => {
            if (!validateFields(['reg-user-type', 'reg-username'])) return;

            const userType = document.getElementById('reg-user-type')?.value;
            const username = document.getElementById('reg-username')?.value.trim();
            
            if (userType === 'aluno' && !REGEX_MATRICULA.test(username)) {
                showModal('Formato Inválido', 'A matrícula de aluno parece estar em um formato incorreto. Ex: 20241ITA01GB0014', false);
                return;
            }
            if (userType === 'servidor' && !REGEX_SIAPE.test(username)) {
                showModal('Formato Inválido', 'O SIAPE deve conter 7 números. Ex: 2887499', false);
                return;
            }

            btnNext2.disabled = true;
            btnNext2.textContent = 'Verificando...';

            try {
                const response = await apiFetch('/validate-user', {
                    method: 'POST',
                    body: JSON.stringify({ username: username, user_type: userType })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message);
                }

                currentRegisterStep = 3;
                showRegisterStep(currentRegisterStep);

            } catch (error) {
                if (error.message !== 'Erro de Rede' && error.message !== 'Sessão expirada.') {
                    showModal('Validação Falhou', error.message, false);
                }
            } finally {
                btnNext2.disabled = false;
                btnNext2.textContent = 'Próximo';
            }
        });
    }

    if (btnPrev3) {
        btnPrev3.addEventListener('click', () => {
            currentRegisterStep = 2;
            showRegisterStep(currentRegisterStep);
        });
    }

    // --- Lógica de Cadastro ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateFields(['reg-password', 'reg-password-confirm'])) return;

            const password = regPassInput ? regPassInput.value : '';
            const passwordConfirm = regConfirmInput ? regConfirmInput.value : '';

            if (password !== passwordConfirm) {
                showModal('Erro na Senha', 'As senhas não conferem. Por favor, tente novamente.', false);
                return;
            }

            const userData = {
                first_name: document.getElementById('reg-first-name')?.value || '',
                last_name: document.getElementById('reg-last-name')?.value || '',
                email: document.getElementById('reg-email')?.value || '',
                user_type: document.getElementById('reg-user-type')?.value || '',
                username: document.getElementById('reg-username')?.value || '',
                password: password,
            };

            try {
                const response = await apiFetch('/register', {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Erro desconhecido');
                
                showModal('Cadastro Realizado!', data.message + ' Você já pode fazer login.', true);
                if (registerForm) registerForm.reset(); 
                
            } catch (error) {
                if (error.message !== 'Erro de Rede' && error.message !== 'Sessão expirada.') {
                    showModal('Erro no Cadastro', error.message, false);
                }
            }
        });
    }

    // --- Lógica de Logout ---
    const handleLogout = () => {
        clearAuthData();
        if (chatDisplay) chatDisplay.innerHTML = '';
        conversationHistory = [];
        conversations = [];
        currentConversationId = null;
        initApp();
    };

    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }

    // ===================================================================
    // 5. LÓGICA DE HISTÓRICO DE CONVERSAS - CORRIGIDA
    // ===================================================================

    async function loadConversations() {
        try {
            const response = await apiFetch('/history');
            if (!response.ok) throw new Error('Falha ao carregar histórico');
            conversations = await response.json();
            renderHistoryList();
            renderMobileHistoryList();
            
            if (!currentConversationId && conversations.length > 0) {
                selectConversation(conversations[0].id);
            } else if (!currentConversationId && conversations.length === 0) {
                startNewChat();
            }
        } catch (error) {
            if (error.message !== 'Erro de Rede' && error.message !== 'Sessão expirada.') {
                console.error('Erro ao carregar conversas:', error);
            }
        }
    }

    function renderHistoryList() {
        if (!historyList) return;
        
        historyList.innerHTML = '';
        if (conversations.length === 0) {
            historyList.innerHTML = '<p class="history-empty">Nenhuma conversa iniciada.</p>';
            return;
        }

        conversations.forEach(convo => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = `history-item ${convo.id === currentConversationId ? 'active' : ''}`;
            item.dataset.id = convo.id;
            
            item.innerHTML = `
                <span class="history-item-title">${convo.title}</span>
                <span class="history-item-actions">
                    <button class="history-item-btn delete" title="Apagar conversa">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </button>
                </span>
            `;
            
            const titleElement = item.querySelector('.history-item-title');
            if (titleElement) {
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    selectConversation(convo.id);
                });
            }

            const deleteBtn = item.querySelector('.history-item-btn.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await deleteConversation(convo.id);
                });
            }

            historyList.appendChild(item);
        });
    }

    function renderMobileHistoryList() {
        if (!mobileHistoryList) return;
        
        mobileHistoryList.innerHTML = '';
        if (conversations.length === 0) {
            mobileHistoryList.innerHTML = '<p class="history-empty">Nenhuma conversa iniciada.</p>';
            return;
        }

        conversations.forEach(convo => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = `history-item ${convo.id === currentConversationId ? 'active' : ''}`;
            item.dataset.id = convo.id;
            
            item.innerHTML = `
                <span class="history-item-title">${convo.title}</span>
                <span class="history-item-actions">
                    <button class="history-item-btn delete" title="Apagar conversa">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </button>
                </span>
            `;
            
            const titleElement = item.querySelector('.history-item-title');
            if (titleElement) {
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    selectConversation(convo.id);
                    hideMobileMenu();
                });
            }

            const deleteBtn = item.querySelector('.history-item-btn.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await deleteConversation(convo.id);
                });
            }

            mobileHistoryList.appendChild(item);
        });
    }

    async function startNewChat() {
        currentConversationId = null; 
        conversationHistory = []; 
        
        renderChatMessages(); 
        chatController.initChat(); 
        renderHistoryList(); 
        renderMobileHistoryList();
        hideMobileMenu();
    }

    // FUNÇÃO CORRIGIDA - CARREGAR CHATS ANTIGOS
    function selectConversation(convId) {
        if (convId === currentConversationId) return; 

        const convo = conversations.find(c => c.id === convId);
        if (!convo) return;

        currentConversationId = convId;

        async function loadAndRender() {
            try {
                let messages = convo.messages || [];
                
                // Se não há mensagens ou o formato parece incorreto, tenta carregar do servidor
                if ((!messages || messages.length === 0 || !Array.isArray(messages)) && convId) {
                    try {
                        const resp = await apiFetch(`/history/${convId}`);
                        if (resp && resp.ok) {
                            const data = await resp.json();
                            console.log('DEBUG: Dados carregados do servidor:', data);
                            
                            // Diferentes formatos de resposta do backend
                            if (Array.isArray(data) && data.length > 0) {
                                const serverConvo = data[0];
                                messages = serverConvo.messages || serverConvo.conversation || serverConvo.history || [];
                            } else if (data && typeof data === 'object') {
                                messages = data.messages || data.conversation || data.history || [];
                            }
                        }
                    } catch (err) {
                        console.warn('Não foi possível carregar detalhes da conversa:', err);
                    }
                }

                // Normalização robusta das mensagens
                conversationHistory = (messages || []).map(m => {
                    // Log para debug
                    console.log('DEBUG: Mensagem original:', m);
                    
                    // Diferentes formatos possíveis
                    let content = '';
                    let role = 'assistant';
                    
                    if (typeof m === 'string') {
                        content = m;
                        role = 'assistant'; // Assume que é da assistente se for string simples
                    } else if (typeof m === 'object') {
                        content = m.content ?? m.text ?? m.body ?? m.message ?? '';
                        
                        // Determinar o papel (role) corretamente
                        if (m.role) {
                            role = m.role;
                        } else if (m.sender === 'user' || m.from === 'user' || m.author === 'user') {
                            role = 'user';
                        } else if (m.sender === 'assistant' || m.from === 'assistant' || m.author === 'assistant') {
                            role = 'assistant';
                        } else {
                            // Tentar inferir pelo conteúdo ou padrão
                            role = content.toLowerCase().includes('olá') || 
                                   content.toLowerCase().includes('oi, eu sou') || 
                                   content.toLowerCase().includes('assistente') ? 'assistant' : 'user';
                        }
                    }
                    
                    return {
                        content: content,
                        role: role
                    };
                });

                console.log('DEBUG: Mensagens normalizadas:', conversationHistory);
                
                renderChatMessages();
                chatView.setInputState(true);
                renderHistoryList();
                renderMobileHistoryList();
                
            } catch (err) {
                console.error('Erro ao carregar conversa específica:', err);
                showModal('Erro', 'Não foi possível carregar a conversa selecionada.', false);
            }
        }

        loadAndRender();
    }

    async function deleteConversation(convId) {
        if (!confirm('Tem certeza de que deseja apagar esta conversa?')) return;
        
        try {
            const response = await apiFetch(`/history/${convId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao apagar conversa');

            conversations = conversations.filter(c => c.id !== convId);
            
            if (convId === currentConversationId) {
                startNewChat();
            } else {
                renderHistoryList();
                renderMobileHistoryList();
            }
        } catch (error) {
            if (error.message !== 'Erro de Rede' && error.message !== 'Sessão expirada.') {
                console.error('Erro ao deletar conversa:', error);
                showModal('Erro', 'Não foi possível apagar a conversa.', false);
            }
        }
    }

    async function saveConversation() {
        if (conversationHistory.length < 2) return; 
        
        let title = conversationHistory.find(m => m.role === 'user')?.content.substring(0, 30) + '...';

        const body = {
            title: title,
            messages: conversationHistory 
        };

        try {
            let response;
            if (currentConversationId) {
                response = await apiFetch(`/history/${currentConversationId}`, {
                    method: 'PUT',
                    body: JSON.stringify(body)
                });
            } else {
                response = await apiFetch('/history', {
                    method: 'POST',
                    body: JSON.stringify(body)
                });
            }
            
            if (!response.ok) throw new Error('Falha ao salvar conversa');
            
            const savedConvo = await response.json();
            
            if (!currentConversationId) {
                currentConversationId = savedConvo[0].id;
            }
            
            await loadConversations();
            
        } catch (error) {
            if (error.message !== 'Erro de Rede' && error.message !== 'Sessão expirada.') {
                console.error('Erro ao salvar conversa:', error);
            }
        }
    }

    function renderChatMessages() {
        if (!chatDisplay) return;
        
        chatDisplay.innerHTML = '';
        conversationHistory.forEach(message => {
            chatView.addMessage(message.content, message.role, false); 
        });
        chatView.scrollToBottom();
    }

    if (btnNewChat) {
        btnNewChat.addEventListener('click', startNewChat);
    }

    // ===================================================================
    // 6. LÓGICA DO MENU MÓVEL
    // ===================================================================

    function showMobileMenu() {
        if (mobileSidebar && mobileMenuOverlay) {
            mobileSidebar.classList.add('visible');
            mobileMenuOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideMobileMenu() {
        if (mobileSidebar && mobileMenuOverlay) {
            mobileSidebar.classList.remove('visible');
            mobileMenuOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    // Event listeners para o menu móvel
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', showMobileMenu);
    }

    if (mobileSidebarClose) {
        mobileSidebarClose.addEventListener('click', hideMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', hideMobileMenu);
    }

    if (mobileNewChat) {
        mobileNewChat.addEventListener('click', startNewChat);
    }

    // ===================================================================
    // 7. LÓGICA DO CHATBOT (Chatbase)
    // ===================================================================

    const chatView = {
        addMessage: (text, sender, animate = true) => {
            if (!chatDisplay) return;
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            
            // CORREÇÃO: Se a animação estiver desativada,
            // force a opacidade e transforme para o estado final.
            if (!animate) {
                messageElement.style.animation = 'none';
                messageElement.style.opacity = 1;
                messageElement.style.transform = 'none';
            } 

            const avatar = document.createElement('div');
            avatar.classList.add('avatar');
            const bubble = document.createElement('div');
            bubble.classList.add('message-bubble');
            
            // Usar marked.parse se disponível, caso contrário usar texto simples
            try {
                bubble.innerHTML = window.marked ? window.marked.parse(text) : text;
            } catch (error) {
                bubble.innerHTML = text;
            }
            
            if (sender === 'user') {
                messageElement.classList.add('user-message');
                messageElement.appendChild(bubble);
            } else {
                messageElement.classList.add('livia-message');
                avatar.innerHTML = `<img src="./assets/perfil.png" alt="LivIA">`;
                messageElement.appendChild(avatar);
                messageElement.appendChild(bubble);
            }
            chatDisplay.appendChild(messageElement);
            chatView.scrollToBottom();
        },
        showTypingIndicator: () => {
            if (!chatDisplay) return;
            
            const typingElement = document.createElement('div');
            typingElement.id = 'typing-indicator';
            typingElement.classList.add('chat-message', 'livia-message');
            typingElement.innerHTML = `<div class="avatar"><img src="./assets/perfil.png" alt="LivIA"></div><div class="message-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
            chatDisplay.appendChild(typingElement);
            chatView.scrollToBottom();
        },
        removeTypingIndicator: () => {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
        },
        setInputState: (enabled) => {
            if (perguntaInput) perguntaInput.disabled = !enabled;
            if (btnPerguntar) btnPerguntar.disabled = !enabled;
            if (enabled && perguntaInput) {
                perguntaInput.focus();
            }
        },
        scrollToBottom: () => {
            if (chatDisplay) {
                setTimeout(() => {
                    chatDisplay.scrollTop = chatDisplay.scrollHeight;
                }, 100);
            }
        }
    };

    const chatApiService = {
        sendMessage: async (messages) => {
            const response = await fetch(CHATBASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CHATBASE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    chatbotId: CHATBASE_CHATBOT_ID,
                }),
            });
            if (!response.ok) {
                 const errorBody = await response.text();
                 throw new Error(`Erro na API: ${response.statusText} - ${errorBody}`);
            }
            const data = await response.json();
            return { response: data.text };
        }
    };

    const chatController = {
        handleSendMessage: async () => {
            const question = perguntaInput ? perguntaInput.value.trim() : '';
            if (!question) return;

            chatView.addMessage(question, 'user');
            if (perguntaInput) perguntaInput.value = '';
            chatView.setInputState(false);
            chatView.showTypingIndicator();
            
            conversationHistory.push({ content: question, role: 'user' });
            
            try {
                const data = await chatApiService.sendMessage(conversationHistory);
                conversationHistory.push({ content: data.response, role: 'assistant' });
                chatView.removeTypingIndicator();
                chatView.addMessage(data.response, 'livia');

                await saveConversation(); 

            } catch (error) {
                console.error('Falha ao comunicar com o Chatbase:', error);
                chatView.removeTypingIndicator();
                const errorMsg = '**Ops!** Ocorreu um erro ao me comunicar. Por favor, tente novamente mais tarde.';
                chatView.addMessage(errorMsg, 'livia');
            } finally {
                chatView.setInputState(true);
            }
        },
        initChat: () => {
            if (conversationHistory.length === 0) { 
                const welcomeMessage = "Olá! Eu sou a LivIA, a assistente virtual do IF Baiano - Campus Itapetinga. Como posso te ajudar hoje?";
                chatView.addMessage(welcomeMessage, 'livia', false);
                conversationHistory.push({ content: welcomeMessage, role: 'assistant' });
                chatView.setInputState(true);
            }
        }
    };

    if (btnPerguntar) {
        btnPerguntar.addEventListener('click', chatController.handleSendMessage);
    }
    if (perguntaInput) {
        perguntaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatController.handleSendMessage();
            }
        });
    }

    // Ajustes para teclado virtual em mobile: garantir input visível acima do teclado
    (function setupMobileKeyboardHandlers() {
        if (!perguntaInput) return;
        const inputRow = document.querySelector('.input-row');
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (!isMobile) return;

    const chatDisplayEl = document.getElementById('chat-display');
    const appBar = document.querySelector('.app-bar');
    if (!inputRow || !chatDisplayEl) return;

    // ensure appBar exists; if present we'll adjust its top to avoid being overlapped by browser chrome
    const hasAppBar = !!appBar;

        // small debounce helper
        const debounce = (fn, wait = 80) => {
            let t;
            return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
        };

        let lastKeyboardHeight = 0;
        // use transform fallback on mobile to avoid some browser repaint/overlay quirks
        const useTransform = true;

        function applyPosition(keyboardHeight) {
            inputRow.style.position = 'fixed';
            inputRow.style.left = '0';
            inputRow.style.right = '0';
            inputRow.style.zIndex = '1400';

            if (useTransform && keyboardHeight > 0) {
                // keep inputRow anchored to bottom and translate it up - more stable on some browsers
                inputRow.style.bottom = '0';
                inputRow.style.transform = `translateY(-${keyboardHeight}px)`;
                inputRow.style.transition = 'transform 160ms ease-out';
            } else {
                inputRow.style.transform = 'none';
                inputRow.style.transition = '';
                inputRow.style.bottom = keyboardHeight > 0 ? keyboardHeight + 'px' : 'calc(env(safe-area-inset-bottom))';
            }

            // reserve space at bottom of chat so messages are not hidden
            chatDisplayEl.style.paddingBottom = `calc(var(--app-bar-height) + ${keyboardHeight}px + 24px)`;
            // scroll to bottom to keep input context
            setTimeout(() => { chatDisplayEl.scrollTop = chatDisplayEl.scrollHeight; }, 90);
            lastKeyboardHeight = keyboardHeight;
        }

        function resetPosition() {
            inputRow.style.transform = 'none';
            inputRow.style.transition = '';
            inputRow.style.bottom = 'calc(env(safe-area-inset-bottom))';
            inputRow.style.zIndex = '1200';
            chatDisplayEl.style.paddingBottom = `calc(var(--app-bar-height) + env(safe-area-inset-bottom) + 24px)`;
        }

        function estimateKeyboardHeight() {
            const vv = window.visualViewport;
            let keyboardHeight = 0;
            if (vv) {
                keyboardHeight = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
            } else {
                keyboardHeight = Math.max(0, window.innerHeight - document.documentElement.clientHeight);
            }
            return keyboardHeight;
        }

        const updateForViewport = debounce(() => {
            try {
                const keyboardHeight = estimateKeyboardHeight();
                // only apply if changed meaningfully
                if (Math.abs(keyboardHeight - lastKeyboardHeight) > 2) {
                    applyPosition(keyboardHeight);
                }
                // also adjust header position to account for address bar / visual viewport offset
                try {
                    if (hasAppBar) updateHeaderPosition();
                } catch (err) {
                    // ignore header adjustment errors
                }
            } catch (err) {
                console.error('Erro ao ajustar visualViewport:', err);
            }
        }, 60);

        // Bind events
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateForViewport);
            window.visualViewport.addEventListener('scroll', updateForViewport);
        }
        window.addEventListener('resize', updateForViewport);

        // Many mobile browsers change their UI on pointer/touch release; re-run update after release
        function onPointerRelease() {
            // run a couple times to cover browser UI animation windows
            setTimeout(updateForViewport, 50);
            setTimeout(updateForViewport, 220);
        }

        document.addEventListener('touchend', onPointerRelease, { passive: true });
        document.addEventListener('pointerup', onPointerRelease);

        // Header adjustment: keep app-bar visible when browser chrome (address bar) is present
        function updateHeaderPosition() {
            if (!hasAppBar) return;
            const vv = window.visualViewport;
            const offset = vv ? (vv.offsetTop || 0) : 0;

            // set header to fixed on mobile and push it down by the visualViewport offset plus safe-area
            appBar.style.position = 'fixed';
            appBar.style.left = '0';
            appBar.style.right = '0';
            appBar.style.zIndex = '1500';

            // prefer calc with safe-area; fallback to numeric offset
            try {
                appBar.style.top = `calc(env(safe-area-inset-top) + ${offset}px)`;
            } catch (e) {
                appBar.style.top = `${offset}px`;
            }

            // ensure compositing for smoother transitions
            appBar.style.willChange = 'transform, top';
            appBar.style.transform = 'translateZ(0)';

            // If the appBar is still visually overlapped by browser chrome, nudge it down using translateY
            // Measure after paint using requestAnimationFrame
            requestAnimationFrame(() => {
                try {
                    const rect = appBar.getBoundingClientRect();
                    const visualTop = vv ? (vv.offsetTop || 0) : 0;
                    // If the top of the appBar is above the visual viewport top (overlapped), compute needed shift
                    if (rect.top < visualTop + 1) {
                        const needed = (visualTop + 4) - rect.top; // small padding
                        // combine with any existing transform used for keyboard handling
                        const currentTransform = inputRow.style.transform || '';
                        // apply translateY to appBar to push it down
                        appBar.style.transition = 'transform 160ms ease-out, top 160ms ease-out';
                        appBar.style.transform = `translateY(${needed}px) translateZ(0)`;
                    } else {
                        // reset any nudging
                        appBar.style.transition = '';
                        appBar.style.transform = 'translateZ(0)';
                    }
                } catch (err) {
                    // ignore measurement errors
                }
            });
        }

        // run header update after pointer release as well
        document.addEventListener('touchend', () => setTimeout(updateHeaderPosition, 120), { passive: true });
        document.addEventListener('pointerup', () => setTimeout(updateHeaderPosition, 120));

        // update header on visualViewport events
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', debounce(updateHeaderPosition, 40));
            window.visualViewport.addEventListener('scroll', debounce(updateHeaderPosition, 40));
        }

        // also run once when focusing the input
        perguntaInput.addEventListener('focus', () => setTimeout(updateHeaderPosition, 60));

        perguntaInput.addEventListener('focus', () => {
            // run immediately and after short delays to catch keyboard animation
            updateForViewport();
            setTimeout(updateForViewport, 180);
            setTimeout(updateForViewport, 400);
        });

        perguntaInput.addEventListener('blur', () => {
            // restore layout after keyboard hides
            resetPosition();
            setTimeout(() => { chatDisplayEl.scrollTop = chatDisplayEl.scrollHeight; }, 80);
        });

        // initial call to ensure correct layout
        setTimeout(updateForViewport, 50);
    })();

    // ===================================================================
    // 8. GERENCIAMENTO DA TELA DE PERFIL INTEGRADA - CORRIGIDO
    // ===================================================================

    function showProfileScreen() {
        console.log('Abrindo tela de perfil...');
        
        const user = getStoredUser();
        if (user) {
            if (profileDisplayName) {
                profileDisplayName.textContent = `${user.first_name} ${user.last_name}`;
            }
            if (profileDisplayEmail) {
                profileDisplayEmail.textContent = user.email;
            }
            if (profileDisplayUsername) {
                profileDisplayUsername.textContent = `Matrícula/SIAPE: ${user.username}`;
            }
        } else {
            console.warn('Usuário não encontrado no localStorage');
        }
        
        // Esconder o chat e mostrar o perfil
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        
        if (profileScreen) {
            profileScreen.style.display = 'flex';
            // Garantir que o perfil ocupe toda a tela
            profileScreen.style.position = 'fixed';
            profileScreen.style.top = '0';
            profileScreen.style.left = '0';
            profileScreen.style.width = '100vw';
            profileScreen.style.height = '100vh';
            profileScreen.style.zIndex = '1000';
        } else {
            console.error('Elemento profile-screen não encontrado');
        }
        
        // Esconder o app-layout completamente
        if (appLayout) {
            appLayout.style.display = 'none';
        }
    }

    function hideProfileScreen() {
        console.log('Fechando tela de perfil...');
        
        if (profileScreen) {
            profileScreen.style.display = 'none';
        }
        
        // Mostrar o chat novamente
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'flex';
        }
        
        // Mostrar o app-layout novamente
        if (appLayout) {
            appLayout.style.display = 'flex';
        }
    }

    // Event Listeners para a tela de perfil - COM VERIFICAÇÕES
    if (btnProfile) {
        btnProfile.addEventListener('click', showProfileScreen);
        console.log('Event listener do btnProfile adicionado');
    } else {
        console.error('btnProfile não encontrado no DOM');
    }

    if (profileBackBtn) {
        profileBackBtn.addEventListener('click', hideProfileScreen);
        console.log('Event listener do profileBackBtn adicionado');
    } else {
        console.error('profileBackBtn não encontrado no DOM');
    }

    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', handleLogout);
        console.log('Event listener do profileLogoutBtn adicionado');
    } else {
        console.error('profileLogoutBtn não encontrado no DOM');
    }

    // Conectar os botões existentes - COM VERIFICAÇÕES
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', () => {
            console.log('Botão editar perfil clicado');
            hideProfileScreen();
            setTimeout(() => {
                loadProfileForEdit();
            }, 300);
        });
    } else {
        console.error('profileEditBtn não encontrado no DOM');
    }
    
    if (profilePasswordBtn) {
        profilePasswordBtn.addEventListener('click', () => {
            console.log('Botão alterar senha clicado');
            hideProfileScreen();
            setTimeout(() => {
                if (changePasswordModal) {
                    showCustomModal(changePasswordModal);
                } else {
                    console.error('changePasswordModal não encontrado');
                }
            }, 300);
        });
    } else {
        console.error('profilePasswordBtn não encontrado no DOM');
    }
    
    if (profileDeleteBtn) {
        profileDeleteBtn.addEventListener('click', () => {
            console.log('Botão excluir conta clicado');
            hideProfileScreen();
            setTimeout(() => {
                if (deleteAccountModal) {
                    showCustomModal(deleteAccountModal);
                } else {
                    console.error('deleteAccountModal não encontrado');
                }
            }, 300);
        });
    } else {
        console.error('profileDeleteBtn não encontrado no DOM');
    }

    // ===================================================================
    // 9. NOVAS FUNÇÕES PARA GERENCIAMENTO DE CONTA
    // ===================================================================

    // Inicializar modais de gerenciamento de conta
    function initAccountModals() {
        // Criar modais dinamicamente
        createEditProfileModal();
        createChangePasswordModal();
        createDeleteAccountModal();
    }

    function createEditProfileModal() {
        editProfileModal = document.createElement('div');
        editProfileModal.id = 'edit-profile-modal';
        editProfileModal.className = 'modal-overlay';
        editProfileModal.innerHTML = `
            <div class="modal-card profile-modal-card">
                <h2>Editar Perfil</h2>
                <form id="edit-profile-form">
                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="edit-first-name">Nome</label>
                            <input type="text" id="edit-first-name" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-last-name">Sobrenome</label>
                            <input type="text" id="edit-last-name" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">E-mail</label>
                        <input type="email" id="edit-email" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-username">Matrícula/SIAPE</label>
                        <input type="text" id="edit-username" disabled style="background-color: var(--cor-input-fundo);">
                        <small style="color: var(--cor-texto-secundario); font-size: 0.8rem;">Matrícula/SIAPE não pode ser alterada</small>
                    </div>
                    <div class="step-nav-buttons">
                        <button type="button" id="edit-profile-cancel" class="auth-button secondary">Cancelar</button>
                        <button type="submit" class="auth-button">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(editProfileModal);

        editProfileForm = document.getElementById('edit-profile-form');
        editProfileCloseBtn = document.getElementById('edit-profile-cancel');

        editProfileForm.addEventListener('submit', handleEditProfile);
        editProfileCloseBtn.addEventListener('click', () => hideCustomModal(editProfileModal));
        editProfileModal.addEventListener('click', (e) => {
            if (e.target === editProfileModal) hideCustomModal(editProfileModal);
        });
    }

    function createChangePasswordModal() {
        changePasswordModal = document.createElement('div');
        changePasswordModal.id = 'change-password-modal';
        changePasswordModal.className = 'modal-overlay';
        changePasswordModal.innerHTML = `
            <div class="modal-card profile-modal-card">
                <h2>Alterar Senha</h2>
                <form id="change-password-form">
                    <div class="form-group form-group-password">
                        <label for="current-password">Senha Atual</label>
                        <input type="password" id="current-password" required>
                        <svg class="password-toggle-icon" viewBox="0 0 24 24"><path d="${eyeIconPath}"/></svg>
                    </div>
                    <div class="form-group form-group-password">
                        <label for="new-password">Nova Senha</label>
                        <input type="password" id="new-password" required>
                        <svg class="password-toggle-icon" viewBox="0 0 24 24"><path d="${eyeIconPath}"/></svg>
                    </div>
                    <div class="form-group form-group-password">
                        <label for="confirm-new-password">Confirmar Nova Senha</label>
                        <input type="password" id="confirm-new-password" required>
                        <svg class="password-toggle-icon" viewBox="0 0 24 24"><path d="${eyeIconPath}"/></svg>
                    </div>
                    <div class="step-nav-buttons">
                        <button type="button" id="change-password-cancel" class="auth-button secondary">Cancelar</button>
                        <button type="submit" class="auth-button">Alterar Senha</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(changePasswordModal);

        changePasswordForm = document.getElementById('change-password-form');
        changePasswordCloseBtn = document.getElementById('change-password-cancel');

        // Adicionar event listeners para os ícones de senha
        const changePasswordIcons = changePasswordModal.querySelectorAll('.password-toggle-icon');
        changePasswordIcons[0].addEventListener('click', () => togglePasswordVisibility(document.getElementById('current-password'), changePasswordIcons[0]));
        changePasswordIcons[1].addEventListener('click', () => togglePasswordVisibility(document.getElementById('new-password'), changePasswordIcons[1]));
        changePasswordIcons[2].addEventListener('click', () => togglePasswordVisibility(document.getElementById('confirm-new-password'), changePasswordIcons[2]));

        changePasswordForm.addEventListener('submit', handleChangePassword);
        changePasswordCloseBtn.addEventListener('click', () => hideCustomModal(changePasswordModal));
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) hideCustomModal(changePasswordModal);
        });
    }

    function createDeleteAccountModal() {
        deleteAccountModal = document.createElement('div');
        deleteAccountModal.id = 'delete-account-modal';
        deleteAccountModal.className = 'modal-overlay';
        deleteAccountModal.innerHTML = `
            <div class="modal-card profile-modal-card">
                <h2 style="color: var(--cor-erro);">Excluir Conta</h2>
                <p style="text-align: left; margin-bottom: 20px;">
                    <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados, incluindo histórico de conversas, serão permanentemente excluídos.
                </p>
                <form id="delete-account-form">
                    <div class="form-group form-group-password">
                        <label for="delete-password">Digite sua senha para confirmar</label>
                        <input type="password" id="delete-password" required>
                        <svg class="password-toggle-icon" viewBox="0 0 24 24"><path d="${eyeIconPath}"/></svg>
                    </div>
                    <div class="step-nav-buttons">
                        <button type="button" id="delete-account-cancel" class="auth-button secondary">Cancelar</button>
                        <button type="submit" class="auth-button danger">Excluir Minha Conta</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(deleteAccountModal);

        deleteAccountForm = document.getElementById('delete-account-form');
        deleteAccountCloseBtn = document.getElementById('delete-account-cancel');

        // Adicionar event listener para o ícone de senha
        const deletePasswordIcon = deleteAccountModal.querySelector('.password-toggle-icon');
        deletePasswordIcon.addEventListener('click', () => togglePasswordVisibility(document.getElementById('delete-password'), deletePasswordIcon));

        deleteAccountForm.addEventListener('submit', handleDeleteAccount);
        deleteAccountCloseBtn.addEventListener('click', () => hideCustomModal(deleteAccountModal));
        deleteAccountModal.addEventListener('click', (e) => {
            if (e.target === deleteAccountModal) hideCustomModal(deleteAccountModal);
        });
    }

    function showCustomModal(modalElement) {
        if (modalElement) {
            modalElement.classList.add('visible');
        }
    }

    function hideCustomModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('visible');
            // Limpar formulários
            if (modalElement === changePasswordModal) {
                changePasswordForm.reset();
            } else if (modalElement === deleteAccountModal) {
                deleteAccountForm.reset();
            }
        }
    }

    // Carregar dados do perfil para edição
    async function loadProfileForEdit() {
        try {
            const response = await apiFetch('/profile');
            if (!response.ok) throw new Error('Falha ao carregar perfil');
            
            const profile = await response.json();
            
            document.getElementById('edit-first-name').value = profile.first_name || '';
            document.getElementById('edit-last-name').value = profile.last_name || '';
            document.getElementById('edit-email').value = profile.email || '';
            document.getElementById('edit-username').value = profile.username || '';
            
            showCustomModal(editProfileModal);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            showModal('Erro', 'Não foi possível carregar os dados do perfil.', false);
        }
    }

    // Handler para editar perfil
    async function handleEditProfile(e) {
        e.preventDefault();
        
        const formData = {
            first_name: document.getElementById('edit-first-name').value.trim(),
            last_name: document.getElementById('edit-last-name').value.trim(),
            email: document.getElementById('edit-email').value.trim()
        };

        if (!formData.first_name || !formData.last_name || !formData.email) {
            showModal('Campos Obrigatórios', 'Por favor, preencha todos os campos.', false);
            return;
        }

        try {
            const response = await apiFetch('/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao atualizar perfil');
            }

            const data = await response.json();
            
            // Atualizar dados no localStorage
            const currentUser = getStoredUser();
            if (currentUser) {
                currentUser.first_name = formData.first_name;
                currentUser.last_name = formData.last_name;
                currentUser.email = formData.email;
                storeUser(currentUser);
            }
            
            hideCustomModal(editProfileModal);
            showModal('Perfil Atualizado!', 'Seus dados foram atualizados com sucesso.', true);
            
            // Atualizar tela de perfil se estiver aberta
            if (profileScreen.style.display === 'flex') {
                showProfileScreen();
            }
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showModal('Erro', error.message, false);
        }
    }

    // Handler para alterar senha
    async function handleChangePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showModal('Campos Obrigatórios', 'Por favor, preencha todos os campos.', false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showModal('Erro na Senha', 'As novas senhas não conferem.', false);
            return;
        }

        if (newPassword.length < 6) {
            showModal('Senha Fraca', 'A nova senha deve ter pelo menos 6 caracteres.', false);
            return;
        }

        try {
            const response = await apiFetch('/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao alterar senha');
            }

            hideCustomModal(changePasswordModal);
            showModal('Senha Alterada!', 'Sua senha foi alterada com sucesso.', true);
            changePasswordForm.reset();
            
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            showModal('Erro', error.message, false);
        }
    }

    // Handler para excluir conta
    async function handleDeleteAccount(e) {
        e.preventDefault();
        
        const password = document.getElementById('delete-password').value;

        if (!password) {
            showModal('Senha Obrigatória', 'Por favor, digite sua senha para confirmar a exclusão.', false);
            return;
        }

        if (!confirm('Tem certeza absoluta que deseja excluir sua conta? Esta ação NÃO pode ser desfeita!')) {
            return;
        }

        try {
            const response = await apiFetch('/account', {
                method: 'DELETE',
                body: JSON.stringify({ password: password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao excluir conta');
            }

            hideCustomModal(deleteAccountModal);
            showModal('Conta Excluída', 'Sua conta foi excluída com sucesso.', true);
            
            // Fazer logout após exclusão
            setTimeout(() => {
                handleLogout();
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            showModal('Erro', error.message, false);
        }
    }

    // ===================================================================
    // 10. FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
    // ===================================================================

    function initApp() {
        console.log('Inicializando aplicação...');
        
        // Verificar elementos críticos
        if (!checkCriticalElements()) {
            console.error('Elementos críticos não encontrados. A aplicação pode não funcionar corretamente.');
        }

        const token = getToken();

        // Sempre esconder a tela de splash após um tempo
        setTimeout(() => {
            if (splashScreen && !splashScreen.classList.contains('hidden')) {
                splashScreen.classList.add('hidden');
                console.log('Splash screen escondida');
            }
        }, 2000);

        if (!token) {
            console.log('Usuário não logado - mostrando tela de autenticação');
            if (appLayout) appLayout.style.display = 'none'; 
            if (profileScreen) profileScreen.style.display = 'none';
            if (authContainer) authContainer.style.display = 'flex'; 
            if (loginFormContainer) loginFormContainer.style.display = 'block';
            if (registerFormContainer) registerFormContainer.style.display = 'none';
        } else {
            console.log('Usuário logado - mostrando aplicação');
            if (authContainer) authContainer.style.display = 'none'; 
            if (profileScreen) profileScreen.style.display = 'none';
            if (appLayout) appLayout.style.display = 'flex'; 
            
            initAccountModals();
            
            // Carregar conversas
            loadConversations().catch(error => {
                console.error('Erro ao carregar conversas:', error);
            });
        }
    }

    // ===================================================================
    // 11. INICIALIZAÇÃO DA APLICAÇÃO
    // ===================================================================

    console.log('Iniciando aplicação LivIA...');
    initApp();
});