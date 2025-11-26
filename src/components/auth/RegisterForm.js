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
        verification_code: ''
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
            'reg-verification-code': 'verification_code'
        };
        const key = keyMap[id] || id;

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

    // --- Navegação ---

    // 1 -> 2
    const handleStep1to2 = () => {
        if (!formData.first_name || !formData.last_name) {
            setError('Preencha seu nome e sobrenome.'); return;
        }
        setStep(2); setError('');
    };
    
    // 2 -> 3 (Dispara Envio de Código)
    const handleStep2to3 = async () => {
        if (!formData.email) {
            setError('Preencha o e-mail.'); return;
        }
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('Telefone inválido (mínimo 10 dígitos).'); return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Envia código para o e-mail
            const response = await apiFetch('/send-verification-code', {
                method: 'POST',
                body: JSON.stringify({ 
                    email: formData.email,
                    first_name: formData.first_name 
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // Sucesso: vai para a tela de digitar o código
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 3 -> 4 (Valida Código Imediatamente)
    const handleStep3to4 = async () => {
        if (!formData.verification_code || formData.verification_code.length < 6) {
            setError('Digite o código de 6 dígitos enviado para seu e-mail.'); return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Verifica se o código está certo antes de deixar avançar
            const response = await apiFetch('/check-verification-code', {
                method: 'POST',
                body: JSON.stringify({ 
                    email: formData.email,
                    code: formData.verification_code 
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // Código correto: avança
            setStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 4 -> 5 (Validação de Vínculo)
    const handleStep4to5 = async () => {
        if (!formData.user_type || !formData.username) {
            setError('Preencha o vínculo e a matrícula/SIAPE.'); return;
        }
        if (formData.user_type === 'aluno' && !REGEX_MATRICULA.test(formData.username)) {
            setError('Formato de matrícula inválido.'); return;
        }
        if (formData.user_type === 'servidor' && !REGEX_SIAPE.test(formData.username)) {
            setError('SIAPE inválido (7 dígitos).'); return;
        }
        
        setIsLoading(true);
        try {
            const response = await apiFetch('/validate-user', {
                method: 'POST',
                body: JSON.stringify({ username: formData.username, user_type: formData.user_type })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setStep(5); setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 5 -> 6 (Senhas)
    const handleStep5to6 = () => {
        if (!formData.password || !formData.password_confirm) {
            setError('Preencha as senhas.'); return;
        }
        if (formData.password !== formData.password_confirm) {
            setError('As senhas não conferem.'); return;
        }
        setStep(6); setError('');
    };

    // 6 -> FIM (Cadastro Real)
    const handleFinalSubmit = async (e) => {
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
                
                if (loginResponse.ok) {
                    const tempToken = loginData.access_token;
                    const uploadFormData = new FormData();
                    uploadFormData.append('avatar', avatarFile);
                    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
                    
                    await fetch(`${API_BASE_URL}/api/profile/avatar`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${tempToken}` },
                        body: uploadFormData,
                    });
                }
            }

            // === ALTERAÇÃO AQUI ===
            // Não passamos mais o 'registerData.recovery_code' no segundo parâmetro.
            // Isso evita que o modal "ShowRecoveryCodeModal" seja aberto.
            // O usuário verá apenas a mensagem de sucesso do backend (que diz que foi pro email).
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
            
            <form id="register-form" onSubmit={handleFinalSubmit}>
                
                {/* ETAPA 1: Nome */}
                {step === 1 && (
                    <div className="register-step active">
                        <p className="step-indicator">Etapa 1 de 6: Dados Pessoais</p>
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
                        <button type="button" className="auth-button" onClick={handleStep1to2}>Próximo</button>
                    </div>
                )}

                {/* ETAPA 2: Contato -> Dispara E-mail ao sair */}
                {step === 2 && (
                    <div className="register-step active">
                        <p className="step-indicator">Etapa 2 de 6: Contato</p>
                        <div className="form-group">
                            <label htmlFor="reg-email">E-mail</label>
                            <input type="email" id="reg-email" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-phone">Telefone</label>
                            <input type="tel" id="reg-phone" required value={formData.phone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" maxLength="15" />
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" className="auth-button secondary" onClick={() => setStep(1)}>Voltar</button>
                            <button type="button" className="auth-button" onClick={handleStep2to3} disabled={isLoading}>
                                {isLoading ? 'Enviando Código...' : 'Enviar Código'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ETAPA 3: Validação do Código */}
                {step === 3 && (
                    <div className="register-step active">
                        <p className="step-indicator">Etapa 3 de 6: Verificação</p>
                        <p style={{textAlign: 'left', marginBottom: '15px', color: 'var(--cor-texto-secundario)', fontSize: '0.9rem'}}>
                            Enviamos um código para <strong>{formData.email}</strong>.<br/>
                            Digite-o abaixo para continuar o cadastro.
                        </p>
                        <div className="form-group">
                            <label htmlFor="reg-verification-code">Código de Verificação (6 dígitos)</label>
                            <input 
                                type="text" 
                                id="reg-verification-code" 
                                required 
                                value={formData.verification_code} 
                                onChange={handleChange}
                                placeholder="Ex: 123456"
                                maxLength="6"
                                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" className="auth-button secondary" onClick={() => setStep(2)}>Corrigir E-mail</button>
                            <button type="button" className="auth-button" onClick={handleStep3to4} disabled={isLoading}>
                                {isLoading ? 'Verificando...' : 'Verificar Código'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ETAPA 4: Vínculo */}
                {step === 4 && (
                    <div className="register-step active">
                        <p className="step-indicator">Etapa 4 de 6: Vínculo</p>
                        <div className="form-group">
                            <label htmlFor="reg-user-type">Eu sou</label>
                            <select id="reg-user-type" required value={formData.user_type} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="aluno">Aluno</option>
                                <option value="servidor">Servidor</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-username">Matrícula ou SIAPE</label>
                            <input type="text" id="reg-username" required value={formData.username} onChange={handleChange} />
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" className="auth-button secondary" onClick={() => setStep(3)}>Voltar</button>
                            <button type="button" className="auth-button" onClick={handleStep4to5} disabled={isLoading}>
                                {isLoading ? 'Validando...' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                )}
                
                {/* ETAPA 5: Senha */}
                {step === 5 && (
                    <div className="register-step active">
                        <p className="step-indicator">Etapa 5 de 6: Senha</p>
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
                            <button type="button" className="auth-button secondary" onClick={() => setStep(4)}>Voltar</button>
                            <button type="button" className="auth-button" onClick={handleStep5to6}>Próximo</button>
                        </div>
                    </div>
                )}
                
                {/* ETAPA 6: Foto e Fim */}
                {step === 6 && (
                    <div className="register-step active">
                        <p className="step-indicator">Etapa 6 de 6: Foto de Perfil</p>
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <img 
                                src={avatarPreview || "/assets/perfil.png"} 
                                alt="Preview" 
                                className="profile-avatar-large"
                                style={{ margin: '10px auto', cursor: 'pointer' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()}
                            />
                            <input type="file" id="avatar-upload-input" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleAvatarChange} />
                            <button type="button" className="auth-button secondary" style={{ maxWidth: '200px', margin: '10px auto' }} onClick={() => document.getElementById('avatar-upload-input')?.click()}>
                                <IconUpload /> {avatarFile ? "Mudar Foto" : "Adicionar Foto"}
                            </button>
                            <small style={{display:'block', color: 'var(--cor-texto-secundario)'}}>Opcional</small>
                        </div>
                        <div className="step-nav-buttons">
                            <button type="button" className="auth-button secondary" onClick={() => setStep(5)}>Voltar</button>
                            <button type="submit" className="auth-button" disabled={isLoading}>
                                {isLoading ? 'Criando Conta...' : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </div>
                )}

            </form>
            
            {error && <p className="error-message" style={{ display: 'block' }}>{error}</p>}

            <p className="toggle-link">
                Já tem uma conta? <button type="button" className="link-button" id="show-login" onClick={onShowLogin}>Faça login</button>
            </p>
        </div>
    );
};