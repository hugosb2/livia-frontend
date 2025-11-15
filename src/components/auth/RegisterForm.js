import React, { useState } from 'react';
import { PasswordToggle } from '../ui/PasswordToggle';
import { IconUpload } from '../icons';
import { apiFetch, formatPhone, REGEX_SIAPE, REGEX_MATRICULA } from '../../utils/authHelpers';

export const RegisterForm = ({ onShowLogin, onRegisterSuccess }) => {
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
    const [avatarFile, setAvatarFile] = useState(null); 
    const [avatarPreview, setAvatarPreview] = useState(null); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleStep1to2 = () => {
        if (!formData.first_name || !formData.last_name) {
            setError('Preencha seu nome e sobrenome.');
            return;
        }
        setStep(2);
        setError('');
    };
    
    const handleStep2to3 = () => {
        if (!formData.email) {
            setError('Preencha o e-mail.');
            return;
        }
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('Telefone é obrigatório e deve ter 10 ou 11 dígitos (com DDD).');
            return;
        }
        setStep(3);
        setError('');
    };

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
            setStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStep4to5 = () => {
        if (!formData.password || !formData.password_confirm) {
            setError('Preencha os campos de senha.');
            return;
        }
        if (formData.password !== formData.password_confirm) {
            setError('As senhas não conferem.');
            return;
        }
        setStep(5);
        setError('');
    };

    const handleStep5Submit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const registerResponse = await apiFetch('/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const registerData = await registerResponse.json();
            if (!registerResponse.ok) throw new Error(registerData.message);

            if (avatarFile) {
                const loginResponse = await apiFetch('/login', {
                    method: 'POST',
                    body: JSON.stringify({ username: formData.username, password: formData.password })
                });
                const loginData = await loginResponse.json();
                if (!loginResponse.ok) throw new Error('Erro ao autenticar para upload da foto.');
                
                const tempToken = loginData.access_token;
                
                const uploadFormData = new FormData();
                uploadFormData.append('avatar', avatarFile);

                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
                await fetch(`${API_BASE_URL}/api/profile/avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tempToken}`
                    },
                    body: uploadFormData,
                });
            }

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
                                required
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
