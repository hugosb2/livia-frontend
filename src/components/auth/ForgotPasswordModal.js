import React, { useState } from 'react';
import { apiFetch } from '../../utils/authHelpers';
import { PasswordToggle } from '../ui/PasswordToggle';

export const ForgotPasswordModal = ({ isVisible, onClose, onShowMessage }) => {
    // 1. Controle de estado para a etapa atual
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({
        username: '',
        contact: '',
        recovery_code: '',
        new_password: '',
        confirm_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingSMS, setIsSendingSMS] = useState(false);

    // Limpa o formulário e reseta as etapas ao fechar
    const handleClose = () => {
        setFormData({ username: '', contact: '', recovery_code: '', new_password: '', confirm_password: '' });
        setIsLoading(false);
        setStep(1); // Reseta para a etapa 1
        onClose();
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    // 2. Funções de navegação entre etapas
    const handleStep1to2 = () => {
        if (!formData.username.trim()) {
            onShowMessage('Campo Obrigatório', 'Por favor, preencha sua Matrícula/SIAPE.', 'error');
            return;
        }
        setStep(2);
    };

    const handleStep2to3 = () => {
        if (!formData.contact.trim()) {
            onShowMessage('Campo Obrigatório', 'Por favor, preencha seu e-mail ou telefone.', 'error');
            return;
        }
        setStep(3);
    };

    const handleStep3to4 = () => {
        if (!formData.recovery_code.trim()) {
            onShowMessage('Campo Obrigatório', 'Por favor, preencha seu código de recuperação.', 'error');
            return;
        }
        setStep(4);
    };

    // Função para solicitar envio do código via SMS
    const handleSendSMS = async () => {
        if (!formData.username.trim()) {
            onShowMessage('Campo Obrigatório', 'Por favor, preencha sua Matrícula/SIAPE primeiro.', 'error');
            return;
        }
        
        if (!formData.contact.trim()) {
            onShowMessage('Campo Obrigatório', 'Por favor, preencha seu telefone primeiro.', 'error');
            return;
        }

        setIsSendingSMS(true);

        try {
            const response = await apiFetch('/send-recovery-code-sms', {
                method: 'POST',
                body: JSON.stringify({
                    username: formData.username,
                    contact: formData.contact
                })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            onShowMessage('SMS Enviado!', data.message, 'success');

        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsSendingSMS(false);
        }
    };

    // 3. Função de envio (agora na etapa final)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.new_password || !formData.confirm_password) {
            onShowMessage('Campos Obrigatórios', 'Por favor, preencha a nova senha e a confirmação.', 'error');
            return;
        }
        
        if (formData.new_password !== formData.confirm_password) {
            onShowMessage('Erro', 'As novas senhas não conferem.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiFetch('/recover-password', {
                method: 'POST',
                body: JSON.stringify({
                    username: formData.username,
                    contact: formData.contact,
                    recovery_code: formData.recovery_code,
                    new_password: formData.new_password
                })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            onShowMessage('Sucesso!', data.message, 'success');
            handleClose(); // Fecha e reseta o modal

        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
            {/* O onSubmit agora está no <form> e será acionado pelo botão type="submit" na etapa 4 */}
            <form id="forgot-password-form" onSubmit={handleSubmit} style={{ margin: 0, padding: 0, width: '100%', display: 'contents' }}>
                <div className="modal-card profile-modal-card" onClick={(e) => e.stopPropagation()}>
                    
                    <h2>Redefinir Senha</h2>
                    
                    <div className="profile-modal-body-scrollable">

                        {/* Etapa 1: Matrícula/SIAPE */}
                        <div className={`register-step ${step === 1 ? 'active' : ''}`}>
                            <p className="step-indicator">Etapa 1 de 4: Identificação</p>
                            <div className="form-group">
                                <label htmlFor="username">Matrícula/SIAPE</label>
                                <input type="text" id="username" required value={formData.username} onChange={handleChange} disabled={isLoading} />
                            </div>
                        </div>
                        
                        {/* Etapa 2: Contato */}
                        <div className={`register-step ${step === 2 ? 'active' : ''}`}>
                            <p className="step-indicator">Etapa 2 de 4: Contato</p>
                            <div className="form-group">
                                <label htmlFor="contact">E-mail ou Telefone (cadastrado)</label>
                                <input type="text" id="contact" required value={formData.contact} onChange={handleChange} disabled={isLoading} />
                            </div>
                        </div>

                        {/* Etapa 3: Código de Recuperação */}
                        <div className={`register-step ${step === 3 ? 'active' : ''}`}>
                            <p className="step-indicator">Etapa 3 de 4: Verificação</p>
                            <div className="form-group">
                                <label htmlFor="recovery_code">Código de Recuperação (8 dígitos)</label>
                                <input type="text" id="recovery_code" required value={formData.recovery_code} onChange={handleChange} disabled={isLoading} maxLength="8" />
                            </div>
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <button 
                                    type="button" 
                                    className="auth-button secondary" 
                                    onClick={handleSendSMS} 
                                    disabled={isLoading || isSendingSMS}
                                    style={{ fontSize: '0.9em', padding: '8px 16px' }}
                                >
                                    {isSendingSMS ? 'Enviando...' : '📱 Enviar código por SMS'}
                                </button>
                            </div>
                        </div>

                        {/* Etapa 4: Nova Senha */}
                        <div className={`register-step ${step === 4 ? 'active' : ''}`}>
                            <p className="step-indicator">Etapa 4 de 4: Nova Senha</p>
                            <div className="form-group form-group-password">
                                <label htmlFor="new_password">Nova Senha</label>
                                <input type="password" id="new_password" required value={formData.new_password} onChange={handleChange} disabled={isLoading} />
                                <PasswordToggle inputId="new_password" />
                            </div>
                            <div className="form-group form-group-password">
                                <label htmlFor="confirm_password">Confirmar Nova Senha</label>
                                <input type="password" id="confirm_password" required value={formData.confirm_password} onChange={handleChange} disabled={isLoading} />
                                <PasswordToggle inputId="confirm_password" />
                            </div>
                        </div>

                    </div>
                    
                    {/* 4. Footer com botões dinâmicos */}
                    <div className="profile-modal-footer">
                        {step === 1 && (
                            <div className="step-nav-buttons">
                                <button type="button" className="auth-button secondary" onClick={handleClose} disabled={isLoading}>Cancelar</button>
                                <button type="button" className="auth-button" onClick={handleStep1to2} disabled={isLoading}>Próximo</button>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="step-nav-buttons">
                                <button type="button" className="auth-button secondary" onClick={() => setStep(1)} disabled={isLoading}>Voltar</button>
                                <button type="button" className="auth-button" onClick={handleStep2to3} disabled={isLoading}>Próximo</button>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="step-nav-buttons">
                                <button type="button" className="auth-button secondary" onClick={() => setStep(2)} disabled={isLoading}>Voltar</button>
                                <button type="button" className="auth-button" onClick={handleStep3to4} disabled={isLoading}>Próximo</button>
                            </div>
                        )}
                        {step === 4 && (
                            <div className="step-nav-buttons">
                                <button type="button" className="auth-button secondary" onClick={() => setStep(3)} disabled={isLoading}>Voltar</button>
                                {/* Este é o único botão que envia o formulário */}
                                <button type="submit" className="auth-button" disabled={isLoading}>
                                    {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
};