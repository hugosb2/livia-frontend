import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked'; // Importa o 'marked'
import './App.css'; // Importa o CSS unificado

// --- Variáveis de Ambiente ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const CHATBASE_API_KEY = process.env.REACT_APP_CHATBASE_API_KEY;
const CHATBASE_CHATBOT_ID = process.env.REACT_APP_CHATBASE_CHATBOT_ID;
const CHATBASE_URL = process.env.REACT_APP_CHATBASE_URL;

// --- Ícones (copiados do seu HTML) ---
const IconEye = () => <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>;
const IconEyeOff = () => <svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zM11.84 9.02l3.15 3.15c.02-.16.03-.33.03-.5 0-1.66-1.34-3-3-3-.17 0-.34.01-.5.03z"/></svg>;
const IconNewChat = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h400v80H200v560h560v-400h80v400q0 33-23.5 56.5T760-120H200Zm280-360v-170l-55 55-55-55 140-140 140 140-55 55-55-55v170h-80Z"/></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>;
const IconProfile = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q106-50 223-75t233 0q42 19 69 47.5T800-272v112H160Z"/></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>;
const IconBack = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M400-280 240-440l160-160 56 56-64 64h328v80H392l64 64-56 56Z"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>;
const IconPassword = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-120q-33 0-56.5-23.5T160-200v-240h80v240h480v-240h80v240q0 33-23.5 56.5T720-120H240Z"/></svg>;


// --- Helpers de Autenticação e API ---

const storeToken = (token) => localStorage.setItem('livia_token', token);
const getToken = () => localStorage.getItem('livia_token');
const storeUser = (user) => localStorage.setItem('livia_user', JSON.stringify(user));
const getStoredUser = () => {
    const user = localStorage.getItem('livia_user');
    return user ? JSON.parse(user) : null;
};
const clearAuthData = () => {
    localStorage.removeItem('livia_token');
    localStorage.removeItem('livia_user');
};

const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    
    if (!(options.body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    options.headers = headers;

    try {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);
        
        if (response.status === 401 && !endpoint.startsWith('/login')) {
            clearAuthData();
            window.location.reload(); 
            return Promise.reject(new Error('Sessão expirada.'));
        }
        
        return response;
    } catch (error) {
        console.error('Fetch Error:', error);
        return Promise.reject(error);
    }
};

// ===================================================================
// COMPONENTE: SplashScreen
// ===================================================================
const SplashScreen = () => (
    <div id="splash-screen">
        <div className="splash-content">
            <picture>
                <source srcSet="/assets/ifbaiano-light.png" media="(prefers-color-scheme: dark)" />
                <img src="/assets/ifbaiano.png" alt="Logo IF Baiano" className="splash-logo" />
            </picture>
            <div className="splash-text">
                <h1><b>LivIA</b></h1>
                <p>Assistente Virtual do Campus Itapetinga</p>
            </div>
        </div>
    </div>
);

// ===================================================================
// COMPONENTE: PasswordToggle
// ===================================================================
const PasswordToggle = ({ inputId }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = isVisible ? 'password' : 'text';
            setIsVisible(!isVisible);
        }
    };

    const iconStyle = {
        top: 'calc(50% + 10px)', 
        transform: 'translateY(-50%)' 
    };

    return (
        <span onClick={toggleVisibility} className="password-toggle-icon" style={iconStyle}>
            {isVisible ? <IconEyeOff /> : <IconEye />}
        </span>
    );
};


// ===================================================================
// COMPONENTE: LoginForm
// ===================================================================
const LoginForm = ({ onLoginSuccess, onShowRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro desconhecido');
            }
            
            onLoginSuccess(data.access_token, data.user);

        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div id="login-form-container" className="form-container">
            <img src="/assets/perfil.png" alt="Logo LivIA" className="auth-logo" />
            <h1>Login - LivIA</h1>
            <p>Assistente Virtual do Campus Itapetinga</p>
            <form id="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login-username">Matrícula/SIAPE</label>
                    <input 
                        type="text" 
                        id="login-username" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group form-group-password">
                    <label htmlFor="login-password">Senha</label>
                    <input 
                        type="password" 
                        id="login-password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    <PasswordToggle inputId="login-password" />
                </div>
                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <p id="login-error" className="error-message" style={{ display: error ? 'block' : 'none' }}>
                    {error}
                </p>
                <p className="toggle-link">
                    Não tem uma conta? <button type="button" className="link-button" id="show-register" onClick={onShowRegister}>Cadastre-se</button>
                </p>
            </form>
        </div>
    );
};

// ===================================================================
// COMPONENTE: RegisterForm (MODIFICADO para 5 Etapas)
// ===================================================================
const RegisterForm = ({ onShowLogin, onRegisterSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '', 
        user_type: '',
        username: '',
        password: '',
        password_confirm: '',
    });
    // Estados para o upload da foto
    const [avatarFile, setAvatarFile] = useState(null); 
    const [avatarPreview, setAvatarPreview] = useState(null); 
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const REGEX_SIAPE = /^\d{7}$/; 
    const REGEX_MATRICULA = /^\d{4}1[A-Z]{3}\d{2}[A-Z]{2}\d{4}$/;

    const formatPhone = (value) => {
      if (!value) return '';
      let v = value.replace(/\D/g, '');
      v = v.substring(0, 11); 
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2}).*/, '($1');
      }
      return v;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const keyMap = {
            'reg-first-name': 'first_name',
            'reg-last-name': 'last_name',
            'reg-email': 'email',
            'reg-phone': 'phone', 
            'reg-user-type': 'user_type',
            'reg-username': 'username',
            'reg-password': 'password',
            'reg-password-confirm': 'password_confirm',
        };
        const key = keyMap[id];

        if (key === 'phone') {
          setFormData(prev => ({ ...prev, phone: formatPhone(value) }));
        } else {
          setFormData(prev => ({ ...prev, [key]: value }));
        }
        setError('');
    };

    // Handle para seleção de FICHEIRO (Avatar)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file); // Guarda o ficheiro
            setAvatarPreview(URL.createObjectURL(file)); // Cria um preview local
            setError('');
        }
    };

    // Etapa 1 -> 2: Valida Nome
    const handleStep1to2 = () => {
        if (!formData.first_name || !formData.last_name) {
            setError('Preencha seu nome e sobrenome.');
            return;
        }
        setStep(2);
        setError('');
    };
    
    // Etapa 2 -> 3: Valida Contato (Telefone agora é OBRIGATÓRIO)
    const handleStep2to3 = () => {
        if (!formData.email) {
            setError('Preencha o e-mail.');
            return;
        }
        // Validação de telefone obrigatório
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) { // Deve ter 10 (fixo) ou 11 (móvel) dígitos
           setError('Telefone é obrigatório e deve ter 10 ou 11 dígitos (com DDD).');
           return;
        }
        setStep(3);
        setError('');
    };

    // Etapa 3 -> 4: Valida Vínculo (Matrícula/SIAPE)
    const handleStep3to4 = async () => {
        if (!formData.user_type || !formData.username) {
            setError('Preencha o vínculo e a matrícula/SIAPE.');
            return;
        }
        
        if (formData.user_type === 'aluno' && !REGEX_MATRICULA.test(formData.username)) {
            setError('Formato de matrícula inválido. Ex: 20241ITA01GB0014');
            return;
        }
        if (formData.user_type === 'servidor' && !REGEX_SIAPE.test(formData.username)) {
            setError('SIAPE deve ter 7 números. Ex: 2887499');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            const response = await apiFetch('/validate-user', {
                method: 'POST',
                body: JSON.stringify({ username: formData.username, user_type: formData.user_type })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setStep(4); // Avança para a etapa 4 (Senha)
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Etapa 4 -> 5: Valida Senha
    const handleStep4to5 = () => {
        if (!formData.password || !formData.password_confirm) {
            setError('Preencha os campos de senha.');
            return;
        }
        if (formData.password !== formData.password_confirm) {
            setError('As senhas não conferem.');
            return;
        }
        setStep(5); // Avança para a etapa 5 (Foto)
        setError('');
    };

    // Etapa 5 -> Final: Submete TUDO
    const handleStep5Submit = async (e) => {
        e.preventDefault();
        
        // Validação da foto (opcional, mas se o utilizador quiser, pode tornar obrigatório)
        // if (!avatarFile) {
        //     setError('Por favor, adicione uma foto de perfil.');
        //     return;
        // }
        
        setIsLoading(true);
        setError('');

        try {
            // 1. Regista o utilizador com os dados de TEXTO
            const registerResponse = await apiFetch('/register', {
                method: 'POST',
                body: JSON.stringify(formData) // Envia todos os dados de texto
            });
            const registerData = await registerResponse.json();
            if (!registerResponse.ok) throw new Error(registerData.message);

            // 2. Se o registo de texto deu certo E o utilizador selecionou uma foto...
            if (avatarFile) {
                // 3. Faz login "silencioso" para obter um token de autenticação
                const loginResponse = await apiFetch('/login', {
                    method: 'POST',
                    body: JSON.stringify({ username: formData.username, password: formData.password })
                });
                const loginData = await loginResponse.json();
                if (!loginResponse.ok) throw new Error('Erro ao autenticar para upload da foto.');
                
                const tempToken = loginData.access_token;
                
                // 4. Faz o upload da foto usando o token temporário
                const uploadFormData = new FormData();
                uploadFormData.append('avatar', avatarFile);

                // Criamos um fetch temporário com o novo token
                await fetch(`${API_BASE_URL}/api/profile/avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tempToken}`
                        // Não defina Content-Type, o browser faz isso
                    },
                    body: uploadFormData,
                });
                // Não precisamos de tratar o erro aqui, pois o registo principal já deu certo
            }

            // 5. Sucesso!
            onRegisterSuccess(registerData.message);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="register-form-container" className="form-container">
            <img src="/assets/perfil.png" alt="Logo LivIA" className="auth-logo" />
            <h1>Cadastro - LivIA</h1>
            <p>Crie sua conta de acesso</p>
            
            <form id="register-form" onSubmit={handleStep5Submit}>
                
                {step === 1 && (
                    <div className="register-step active" id="register-step-1">
                        <p className="step-indicator">Etapa 1 de 5: Dados Pessoais</p>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="reg-first-name">Nome</label>
                                <input type="text" id="reg-first-name" required value={formData.first_name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reg-last-name">Sobrenome</label>
                                <input type="text" id="reg-last-name" required value={formData.last_name} onChange={handleChange} />
                            </div>
                        </div>
                        <button type="button" id="btn-next-1" className="auth-button" onClick={handleStep1to2}>Próximo</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="register-step active" id="register-step-2">
                        <p className="step-indicator">Etapa 2 de 5: Contato</p>
                        <div className="form-group">
                            <label htmlFor="reg-email">E-mail</label>
                            <input type="email" id="reg-email" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-phone">Telefone</label>
                            <input 
                                type="tel" 
                                id="reg-phone" 
                                required // Agora é obrigatório
                                value={formData.phone} 
                                onChange={handleChange}
                                placeholder="(XX) XXXXX-XXXX"
                                maxLength="15"
                            />
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" id="btn-prev-2" className="auth-button secondary" onClick={() => setStep(1)}>Voltar</button>
                            <button type="button" id="btn-next-2" className="auth-button" onClick={handleStep2to3}>Próximo</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="register-step active" id="register-step-3">
                        <p className="step-indicator">Etapa 3 de 5: Vínculo</p>
                        <div className="form-group">
                            <label htmlFor="reg-user-type">Eu sou</label>
                            <select id="reg-user-type" required value={formData.user_type} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="aluno">Aluno</option>
                                <option value="servidor">Servidor</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-username">Matrícula (Aluno) ou SIAPE (Servidor)</label>
                            <input type="text" id="reg-username" required value={formData.username} onChange={handleChange} />
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" id="btn-prev-3" className="auth-button secondary" onClick={() => setStep(2)}>Voltar</button>
                            <button type="button" id="btn-next-3" className="auth-button" onClick={handleStep3to4} disabled={isLoading}>
                                {isLoading ? 'Verificando...' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                )}
                
                {step === 4 && (
                    <div className="register-step active" id="register-step-4">
                        <p className="step-indicator">Etapa 4 de 5: Segurança</p>
                        <div className="form-group form-group-password">
                            <label htmlFor="reg-password">Senha</label>
                            <input type="password" id="reg-password" required value={formData.password} onChange={handleChange} />
                            <PasswordToggle inputId="reg-password" />
                        </div>
                        <div className="form-group form-group-password">
                            <label htmlFor="reg-password-confirm">Confirmar Senha</label>
                            <input type="password" id="reg-password-confirm" required value={formData.password_confirm} onChange={handleChange} />
                            <PasswordToggle inputId="reg-password-confirm" />
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" id="btn-prev-4" className="auth-button secondary" onClick={() => setStep(3)}>Voltar</button>
                            <button type="button" id="btn-next-4" className="auth-button" onClick={handleStep4to5}>Próximo</button>
                        </div>
                    </div>
                )}
                
                {step === 5 && (
                     <div className="register-step active" id="register-step-5">
                        <p className="step-indicator">Etapa 5 de 5: Foto de Perfil</p>
                        
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <img 
                                src={avatarPreview || "/assets/perfil.png"} 
                                alt="Preview" 
                                className="profile-avatar-large"
                                style={{ margin: '10px auto', cursor: 'pointer' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()}
                                onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                            />
                            <input 
                                type="file" 
                                id="avatar-upload-input" 
                                accept="image/png, image/jpeg"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                            <button 
                                type="button" 
                                className="auth-button secondary" 
                                style={{ maxWidth: '200px', margin: '10px auto' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()}
                            >
                                <IconUpload /> {avatarFile ? "Mudar Foto" : "Adicionar Foto"}
                            </button>
                            <small style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.8rem', display: 'block' }}>
                                {avatarFile ? avatarFile.name : "Foto opcional."}
                            </small>
                        </div>

                        <div className="step-nav-buttons">
                            <button type="button" id="btn-prev-5" className="auth-button secondary" onClick={() => setStep(4)}>Voltar</button>
                            <button type="submit" className="auth-button" disabled={isLoading}>
                                {isLoading ? 'Finalizando...' : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
            
            {error && (
                <p className="error-message" style={{ display: 'block' }}>{error}</p>
            )}

            <p className="toggle-link">
                Já tem uma conta? <button type="button" className="link-button" id="show-login" onClick={onShowLogin}>Faça login</button>
            </p>
        </div>
    );
};


// ===================================================================
// COMPONENTE: AuthScreen
// ===================================================================
const AuthScreen = ({ onLoginSuccess, onShowMessage }) => {
    const [isLogin, setIsLogin] = useState(true);

    const handleShowRegister = (e) => {
        e.preventDefault();
        setIsLogin(false);
    };

    const handleShowLogin = (e) => {
        e.preventDefault();
        setIsLogin(true);
    };

    const handleRegisterSuccess = (message) => {
        onShowMessage('Cadastro Realizado!', message || 'Usuário cadastrado com sucesso! Você já pode fazer login.', 'success');
        setIsLogin(true);
    };

    return (
        <div id="auth-container" className="auth-container" style={{ display: 'flex' }}>
            <div className="auth-container-content">
                {isLogin ? (
                    <LoginForm onLoginSuccess={onLoginSuccess} onShowRegister={handleShowRegister} />
                ) : (
                    <RegisterForm onShowLogin={handleShowLogin} onRegisterSuccess={handleRegisterSuccess} />
                )}
            </div>
        </div>
    );
};


// ===================================================================
// COMPONENTE: ChatLayout (MODIFICADO)
// ===================================================================
const ChatLayout = ({ user, onLogout, onShowProfile }) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const chatDisplayRef = useRef(null);

    const scrollToBottom = () => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    };

    const renderMarkdown = (text) => {
        try {
            return marked.parse(text, { breaks: true });
        } catch (e) {
            return text;
        }
    };

    const startNewChat = useCallback(() => {
        setCurrentConversationId(null);
        setMessages([
            { content: "Olá! Eu sou a LivIA, a assistente virtual do IF Baiano - Campus Itapetinga. Como posso te ajudar hoje?", role: 'assistant' }
        ]);
        setIsMobileMenuOpen(false);
    }, []); 

    const loadConversations = useCallback(async () => {
        try {
            const response = await apiFetch('/history');
            if (!response.ok) throw new Error('Falha ao carregar histórico');
            const data = await response.json();
            setConversations(data);
            
            if (!currentConversationId && data.length === 0) {
                startNewChat();
            }
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        }
    }, [currentConversationId, startNewChat]);

    const loadChatMessages = useCallback(async (convId) => {
        if (!convId) {
            startNewChat();
            return;
        }
        
        try {
            const convo = conversations.find(c => c.id === convId);
            let history = convo?.messages || [];

            if (!history.length) {
                const response = await apiFetch(`/history/${convId}`);
                if (!response.ok) throw new Error('Falha ao carregar chat');
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    history = data[0].messages || data[0].conversation || [];
                } else if (data && data.messages) {
                    history = data.messages;
                }
            }

            const formattedMessages = history.map(m => ({
                role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
                content: m.content || m.text || m.body || ''
            }));
            
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            setMessages([{ role: 'assistant', content: 'Erro ao carregar esta conversa.' }]);
        }
    }, [conversations, startNewChat]);

    useEffect(() => {
        loadConversations();
        startNewChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const saveConversation = async (history) => {
        if (history.length < 2) return; 
        
        let title = history.find(m => m.role === 'user')?.content.substring(0, 30) + '...';

        const body = {
            title: title,
            messages: history 
        };

        try {
            let response;
            let endpoint = '/history';
            let method = 'POST';

            if (currentConversationId) {
                endpoint = `/history/${currentConversationId}`;
                method = 'PUT';
            }

            response = await apiFetch(endpoint, { method, body: JSON.stringify(body) });
            if (!response.ok) throw new Error('Falha ao salvar conversa');
            
            const savedConvo = await response.json();
            
            if (!currentConversationId) {
                const newId = Array.isArray(savedConvo) ? savedConvo[0].id : savedConvo.id;
                setCurrentConversationId(newId);
                loadConversations();
            }
            
        } catch (error) {
            console.error('Erro ao salvar conversa:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || isTyping) return;

        setInput('');
        setIsTyping(true);

        const newUserMessage = { content: question, role: 'user' };
        const newHistory = [...messages, newUserMessage];
        setMessages(newHistory);
        
        try {
            const response = await fetch(CHATBASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CHATBASE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: newHistory,
                    chatbotId: CHATBASE_CHATBOT_ID,
                }),
            });

            if (!response.ok) {
                 const errorBody = await response.text();
                 throw new Error(`Erro na API: ${response.statusText} - ${errorBody}`);
            }
            
            const data = await response.json();
            const assistantResponse = { content: data.text, role: 'assistant' };
            
            const finalHistory = [...newHistory, assistantResponse];
            setMessages(finalHistory);
            
            await saveConversation(finalHistory);

        } catch (error) {
            console.error('Falha ao comunicar com o Chatbase:', error);
            const errorMsg = { role: 'assistant', content: '**Ops!** Ocorreu um erro ao me comunicar. Por favor, tente novamente mais tarde.' };
            setMessages([...newHistory, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const selectConversation = (id) => {
        if (id === currentConversationId) return;
        setCurrentConversationId(id);
        loadChatMessages(id);
        setIsMobileMenuOpen(false);
    };
    
    const deleteConversation = async (e, convId) => {
        e.stopPropagation(); 
        if (!window.confirm('Tem certeza de que deseja apagar esta conversa?')) return;
        
        try {
            const response = await apiFetch(`/history/${convId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao apagar conversa');

            setConversations(prev => prev.filter(c => c.id !== convId));
            
            if (convId === currentConversationId) {
                startNewChat();
            }
        } catch (error) {
             console.error('Erro ao deletar conversa:', error);
        }
    };

    // --- MODIFICADO: Sidebar agora recebe onShowProfile e onLogout ---
    const Sidebar = ({ isMobile = false, onShowProfile, onLogout }) => (
        <aside id={isMobile ? "mobile-sidebar" : "history-sidebar"} className={isMobile ? `mobile-sidebar ${isMobileMenuOpen ? 'visible' : ''}` : "history-sidebar"}>
            <header className={isMobile ? "mobile-sidebar-header" : "history-header"}>
                <div className="logo-container">
                    <picture>
                        <source srcSet="/assets/ifbaiano-light.png" media="(prefers-color-scheme: dark)" />
                        <img src="/assets/ifbaiano.png" alt="Logo IF Baiano" className="logo" />
                    </picture>
                </div>
                {isMobile && (
                    <button id="mobile-sidebar-close" className="mobile-sidebar-close" title="Fechar menu" onClick={() => setIsMobileMenuOpen(false)}>
                        <IconClose />
                    </button>
                )}
            </header>
            
            <button 
                id={isMobile ? "mobile-new-chat" : "btn-new-chat"} 
                className={isMobile ? "mobile-new-chat-btn" : "history-new-chat-btn"} 
                title="Nova Conversa"
                onClick={startNewChat}
            >
                <IconNewChat />
                <span>Nova Conversa</span>
            </button>
            
            <nav id={isMobile ? "mobile-history-list" : "history-list"} className={isMobile ? "mobile-history-list" : "history-list"}>
                {conversations.length === 0 ? (
                    <p className="history-empty">Nenhuma conversa iniciada.</p>
                ) : (
                    conversations.map(convo => (
                        <button
                            type="button"
                            key={convo.id} 
                            className={`history-item ${convo.id === currentConversationId ? 'active' : ''}`}
                            onClick={() => selectConversation(convo.id)}
                        >
                            <span className="history-item-title">{convo.title}</span>
                            <span className="history-item-actions">
                                <button className="history-item-btn delete" title="Apagar conversa" onClick={(e) => deleteConversation(e, convo.id)}>
                                    <IconDelete />
                                </button>
                            </span>
                        </button>
                    ))
                )}
            </nav>

            {/* --- NOVO: Rodapé com ações de perfil (Apenas Mobile) --- */}
            {isMobile && (
                <footer className="mobile-sidebar-footer">
                    <button className="mobile-sidebar-action-btn" onClick={onShowProfile}>
                        <IconProfile />
                        <span>Meu Perfil</span>
                    </button>
                    <button className="mobile-sidebar-action-btn danger" onClick={onLogout}>
                        <IconLogout />
                        <span>Sair</span>
                    </button>
                </footer>
            )}
        </aside>
    );

    return (
        <div id="app-layout" className="app-layout" style={{ display: 'flex' }}>
            
            {isMobileMenuOpen && (
                <div id="mobile-menu-overlay" className="mobile-menu-overlay visible" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}
            
            {/* --- MODIFICADO: Passa props para o Sidebar mobile --- */}
            <Sidebar 
                isMobile={true} 
                onShowProfile={onShowProfile} 
                onLogout={onLogout} 
            />
            <Sidebar isMobile={false} />

            <div id="chat-container" className="chat-container">
                <header className="app-bar">
                    <div className="header-left">
                        {/* --- MODIFICADO: Adiciona classe 'is-open' dinâmica para animação --- */}
                        <button 
                            id="mobile-menu-btn" 
                            className={`mobile-menu-btn ${isMobileMenuOpen ? 'is-open' : ''}`} 
                            title="Abrir menu" 
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <IconMenu />
                        </button>
                        <img 
                            src="/assets/perfil.png" // Foto da LivIA
                            alt="Avatar LivIA" 
                            className="header-avatar" 
                        />
                        <div className="header-text">
                            <h1><b>LivIA</b></h1>
                            <p className="subtitle">Assistente Virtual do Campus Itapetinga</p>
                        </div>
                    </div>
                    
                    {/* --- MODIFICADO: Botões agora estão em um wrapper para desktop --- */}
                    <div className="app-bar-desktop-actions">
                        <button id="btn-profile" className="app-bar-icon-btn" title="Meu Perfil" onClick={onShowProfile}>
                            <IconProfile />
                        </button>
                        <button id="btn-logout" className="app-bar-icon-btn" title="Sair" onClick={onLogout}>
                            <IconLogout />
                        </button>
                    </div>
                </header>
                {/* --- Fim da Modificação do Cabeçalho --- */}

                <main id="chat-display" className="chat-display" ref={chatDisplayRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role === 'user' ? 'user-message' : 'livia-message'}`}>
                            
                            {/* Avatar da LivIA (Esquerda) */}
                            {msg.role === 'assistant' && (
                                <div className="avatar">
                                    <img src="/assets/perfil.png" alt="LivIA" />
                                </div>
                            )}
                            
                            {/* Bolha da Mensagem */}
                            <div className="message-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />

                            {/* --- NOVO: Avatar do Utilizador (Direita) --- */}
                            {msg.role === 'user' && (
                                <div className="avatar avatar-user">
                                    <img 
                                        src={user.avatar_url || "/assets/perfil.png"} 
                                        alt="Meu Avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div id="typing-indicator" className="chat-message livia-message">
                            <div className="avatar"><img src="/assets/perfil.png" alt="LivIA" /></div>
                            <div className="message-bubble">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="input-row">
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', flexGrow: 1, gap: '10px' }}>
                        <input 
                            type="text" 
                            id="pergunta-input" 
                            placeholder="Faça sua pergunta..." 
                            disabled={isTyping}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button id="btn-perguntar" type="submit" disabled={isTyping || !input.trim()}>
                            <IconSend />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};


// ===================================================================
// COMPONENTE: ProfileScreen
// ===================================================================
const ProfileScreen = ({ user, onBack, onLogout, onOpenModal }) => {
    const formatPhoneForDisplay = (phone) => {
        if (!phone) return 'Não informado';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
        }
        if (digits.length === 10) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
        }
        return phone; 
    };

    return (
        <div id="profile-screen" className="profile-screen" style={{ display: 'flex' }}>
            <header className="profile-header">
                <button id="profile-back-btn" className="profile-back-btn" title="Voltar ao Chat" onClick={onBack}>
                    <IconBack />
                </button>
                <div className="header-text">
                    <h1>Meu Perfil</h1>
                    <p className="subtitle">Gerencie sua conta</p>
                </div>
            </header>
            
            <main className="profile-content">
                <div className="profile-section">
                    <h2>Informações Pessoais</h2>
                    <div className="profile-info-card">
                        <img 
                            src={user.avatar_url || "/assets/perfil.png"} 
                            alt="Avatar" 
                            className="profile-avatar-large" 
                            onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                        />
                        <h3 id="profile-display-name">{user.first_name} {user.last_name}</h3>
                        <p id="profile-display-email">{user.email}</p>
                        <p id="profile-display-phone">Telefone: {formatPhoneForDisplay(user.phone)}</p>
                        <p id="profile-display-username">Matrícula/SIAPE: {user.username}</p>
                    </div>
                    <div className="profile-actions-grid">
                        <button id="profile-edit-btn" className="profile-action-btn" onClick={() => onOpenModal('edit')}>
                            <IconEdit />
                            Editar Dados (Foto, Nome, Contato)
                        </button>
                        <button id="profile-password-btn" className="profile-action-btn" onClick={() => onOpenModal('password')}>
                            <IconPassword />
                            Alterar Senha
                        </button>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Ações da Conta</h2>
                    <div className="profile-actions-grid">
                        <button id="profile-logout-btn" className="profile-action-btn" onClick={onLogout}>
                            <IconLogout />
                            Sair da Conta
                        </button>
                        <button id="profile-delete-btn" className="profile-action-btn danger" onClick={() => onOpenModal('delete')}>
                            <IconDelete />
                            Excluir Conta
                        </button>
                    </div>
                </div>
                <div className="profile-section">
                    <h2>Sobre</h2>
                    <p>Este sistema foi desenvolvido no Curso de Sistemas de Informação - Campus Itapetinga. Desenvolvido por Hugo Barros (aluno) sob orientação do Prof. Hudson Barros.</p>
                </div>
            </main>
        </div>
    );
};

// ===================================================================
// COMPONENTE: MessageModal
// ===================================================================
const MessageModal = ({ isVisible, title, message, type = 'success', onClose }) => {
    return (
        <div id="modal-overlay" className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div id="modal-card" className={`modal-card ${type}`} onClick={(e) => e.stopPropagation()}>
                <h2 id="modal-title">{title}</h2>
                <p id="modal-message">{message}</p>
                <button id="modal-close-btn" className="auth-button" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

// ===================================================================
// COMPONENTE: EditProfileModal (MODIFICADO COM SCROLL INTERNO)
// ===================================================================
const EditProfileModal = ({ isVisible, onClose, user, onUpdateUser, onShowMessage }) => {
    // ... (toda a lógica de 'useState', 'useEffect', 'handleChange', etc. continua igual)
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [avatarFile, setAvatarFile] = useState(null); 
    const [avatarPreview, setAvatarPreview] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value) => {
      if (!value) return '';
      let v = value.replace(/\D/g, '');
      v = v.substring(0, 11); 
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2}).*/, '($1');
      }
      return v;
    };

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: formatPhone(user.phone || ''),
            });
            setAvatarPreview(user.avatar_url || null);
            setAvatarFile(null);
        }
    }, [user, isVisible]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'phone') {
            setFormData({ ...formData, phone: formatPhone(value) });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file); 
            setAvatarPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
           onShowMessage('Erro', 'Telefone é obrigatório e deve ter 10 ou 11 dígitos (com DDD).', 'error');
           return;
        }

        setIsLoading(true);
        let newAvatarUrl = null;

        try {
            if (avatarFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('avatar', avatarFile);

                const uploadResponse = await apiFetch('/profile/avatar', {
                    method: 'POST',
                    body: uploadFormData,
                });

                const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) throw new Error(uploadData.message || 'Erro no upload do avatar');
                
                newAvatarUrl = uploadData.avatar_url; 
            }

            const textUpdateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
            };

            if (newAvatarUrl) {
                textUpdateData.avatar_url = newAvatarUrl;
            }

            const profileResponse = await apiFetch('/profile', {
                method: 'PUT',
                body: JSON.stringify(textUpdateData)
            });
            const profileData = await profileResponse.json();
            if (!profileResponse.ok) throw new Error(profileData.message || 'Erro ao atualizar perfil');

            onUpdateUser(profileData.user); 
            onShowMessage('Perfil Atualizado!', 'Seus dados foram atualizados com sucesso.', 'success');
            onClose();

        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const onCardClick = (e) => e.stopPropagation();

    return (
        <div id="edit-profile-modal" className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div className="modal-card profile-modal-card" onClick={onCardClick}>
                
                {/* 1. HEADER (Fixo) */}
                <h2>Editar Perfil</h2>
                
                <form id="edit-profile-form" onSubmit={handleSubmit}>
                    
                    {/* 2. BODY (Rolável) */}
                    <div className="profile-modal-body-scrollable">
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <label>Foto de Perfil</label>
                            <img 
                                src={avatarPreview || "/assets/perfil.png"} 
                                alt="Preview" 
                                className="profile-avatar-large"
                                style={{ margin: '10px auto', cursor: 'pointer' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()} 
                                onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                            />
                            <input 
                                type="file" 
                                id="avatar-upload-input" 
                                accept="image/png, image/jpeg"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                            <button 
                                type="button" 
                                className="auth-button secondary" 
                                style={{ maxWidth: '200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()}
                            >
                                <IconUpload /> <span>Mudar Foto</span>
                            </button>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="first_name">Nome</label>
                                <input type="text" id="first_name" required value={formData.first_name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Sobrenome</label>
                                <input type="text" id="last_name" required value={formData.last_name} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="email">E-mail</label>
                                <input type="email" id="email" required value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Telefone</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    required // Obrigatório
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    placeholder="(XX) XXXXX-XXXX"
                                    maxLength="15"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-username">Matrícula/SIAPE</label>
                            <input type="text" id="edit-username" disabled value={user.username || ''} style={{ backgroundColor: 'var(--cor-input-fundo)' }} />
                            <small style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.8rem', paddingTop: '5px', display: 'block' }}>Matrícula/SIAPE não pode ser alterada</small>
                        </div>
                    </div> {/* Fim do .profile-modal-body-scrollable */}


                    {/* 3. FOOTER (Fixo) */}
                    <div className="profile-modal-footer">
                        <div className="step-nav-buttons">
                            <button type="button" id="edit-profile-cancel" className="auth-button secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                            <button type="submit" className="auth-button" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div> {/* Fim do .profile-modal-footer */}
                </form>

            </div>
        </div>
    );
};

// ===================================================================
// COMPONENTE: ChangePasswordModal
// ===================================================================
const ChangePasswordModal = ({ isVisible, onClose, onShowMessage }) => {
    const [formData, setFormData] = useState({ current_password: '', new_password: '', confirm_new_password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    useEffect(() => {
        if (!isVisible) {
            setFormData({ current_password: '', new_password: '', confirm_new_password: '' });
        }
    }, [isVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_new_password) {
            onShowMessage('Erro', 'As novas senhas não conferem.', 'error');
            return;
        }
        if (formData.new_password.length < 6) {
            onShowMessage('Senha Fraca', 'A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiFetch('/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: formData.current_password,
                    new_password: formData.new_password
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao alterar senha');

            onShowMessage('Senha Alterada!', 'Sua senha foi alterada com sucesso.', 'success');
            onClose();
        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const onCardClick = (e) => e.stopPropagation();

    return (
        <div id="change-password-modal" className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div className="modal-card profile-modal-card" onClick={onCardClick}>
                <h2>Alterar Senha</h2>
                <form id="change-password-form" onSubmit={handleSubmit}>
                    <div className="form-group form-group-password">
                        <label htmlFor="current_password">Senha Atual</label>
                        <input type="password" id="current_password" required value={formData.current_password} onChange={handleChange} />
                        <PasswordToggle inputId="current_password" />
                    </div>
                    <div className="form-group form-group-password">
                        <label htmlFor="new_password">Nova Senha</label>
                        <input type="password" id="new_password" required value={formData.new_password} onChange={handleChange} />
                        <PasswordToggle inputId="new_password" />
                    </div>
                    <div className="form-group form-group-password">
                        <label htmlFor="confirm_new_password">Confirmar Nova Senha</label>
                        <input type="password" id="confirm_new_password" required value={formData.confirm_new_password} onChange={handleChange} />
                        <PasswordToggle inputId="confirm_new_password" />
                    </div>
                    <div className="step-nav-buttons">
                        <button type="button" id="change-password-cancel" className="auth-button secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================
// COMPONENTE: DeleteAccountModal
// ===================================================================
const DeleteAccountModal = ({ isVisible, onClose, onShowMessage, onLogout }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setPassword('');
        }
    }, [isVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm('Tem certeza absoluta que deseja excluir sua conta? Esta ação NÃO pode ser desfeita!')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiFetch('/account', {
                method: 'DELETE',
                body: JSON.stringify({ password: password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao excluir conta');

            onShowMessage('Conta Excluída', 'Sua conta foi excluída com sucesso.', 'success');
            onClose();
            setTimeout(onLogout, 1500); 
        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
            setIsLoading(false);
        }
    };
    
    const onCardClick = (e) => e.stopPropagation();

    return (
        <div id="delete-account-modal" className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div className="modal-card profile-modal-card" onClick={onCardClick}>
                <h2 style={{ color: 'var(--cor-erro)' }}>Excluir Conta</h2>
                <p style={{ textAlign: 'left', margin: '10px 0 20px', color: 'var(--cor-texto-secundario)'}}>
                    <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados, incluindo histórico de conversas, serão permanentemente excluídos.
                </p>
                <form id="delete-account-form" onSubmit={handleSubmit}>
                    <div className="form-group form-group-password">
                        <label htmlFor="delete-password">Digite sua senha para confirmar</label>
                        <input type="password" id="delete-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <PasswordToggle inputId="delete-password" />
                    </div>
                    <div className="step-nav-buttons">
                        <button type="button" id="delete-account-cancel" className="auth-button secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="auth-button danger" disabled={isLoading}>
                            {isLoading ? 'Excluindo...' : 'Excluir Minha Conta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ===================================================================
// COMPONENTE: App (Principal)
// ===================================================================
function App() {
    const [appState, setAppState] = useState('splash');
    const [user, setUser] = useState(getStoredUser());
    const [activeModal, setActiveModal] = useState('none'); 
    const [messageModal, setMessageModal] = useState({ visible: false });

    useEffect(() => {
        const checkAuth = () => {
            const storedUser = getStoredUser();
            if (storedUser) {
                setUser(storedUser);
                setAppState('chat');
            } else {
                setAppState('auth');
            }
        };

        const splashTimer = setTimeout(checkAuth, 2000);
        return () => clearTimeout(splashTimer);
    }, []);

    const handleLoginSuccess = (newToken, newUser) => {
        storeToken(newToken);
        storeUser(newUser);
        setUser(newUser);
        setAppState('chat');
    };

    const handleLogout = () => {
        clearAuthData();
        setUser(null);
        setAppState('auth');
        setActiveModal('none');
    };

    const handleShowProfile = () => {
        setAppState('profile');
    };

    const handleBackToChat = () => {
        setAppState('chat');
    };

    const handleOpenModal = (modalName) => {
        setActiveModal(modalName);
    };

    const handleCloseModal = () => {
        setActiveModal('none');
    };

    const handleShowMessage = (title, message, type = 'success') => {
        setMessageModal({ visible: true, title, message, type });
    };

    const handleCloseMessageModal = () => {
        setMessageModal({ visible: false });
    };

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        storeUser(updatedUser);
    };

    const renderAppView = () => {
        switch (appState) {
            case 'splash':
                return <SplashScreen />;
            case 'auth':
                return <AuthScreen onLoginSuccess={handleLoginSuccess} onShowMessage={handleShowMessage} />;
            case 'chat':
                return <ChatLayout user={user} onLogout={handleLogout} onShowProfile={handleShowProfile} />;
            case 'profile':
                return <ProfileScreen user={user} onBack={handleBackToChat} onLogout={handleLogout} onOpenModal={handleOpenModal} />;
            default:
                return <AuthScreen onLoginSuccess={handleLoginSuccess} onShowMessage={handleShowMessage} />;
        }
    };

    return (
        <>
            {renderAppView()}
            
            <MessageModal
                isVisible={messageModal.visible}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={handleCloseMessageModal}
            />
            
            {user && (
                <>
                    <EditProfileModal
                        isVisible={activeModal === 'edit'}
                        onClose={handleCloseModal}
                        user={user}
                        onUpdateUser={handleUpdateUser}
                        onShowMessage={handleShowMessage}
                    />
                    <ChangePasswordModal
                        isVisible={activeModal === 'password'}
                        onClose={handleCloseModal}
                        onShowMessage={handleShowMessage}
                    />
                    <DeleteAccountModal
                        isVisible={activeModal === 'delete'}
                        onClose={handleCloseModal}
                        onShowMessage={handleShowMessage}
                        onLogout={handleLogout}
                    />
                </>
            )}
        </>
    );
}

export default App;