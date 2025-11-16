import React, { useState } from 'react';
import { apiFetch } from '../../utils/authHelpers';
import { PasswordToggle } from '../ui/PasswordToggle';

export const ForgotPasswordModal = ({ isVisible, onClose, onShowMessage }) => {
    const [formData, setFormData] = useState({
        username: '',
        contact: '',
        recovery_code: '',
        new_password: '',
        confirm_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Limpa o formulário ao fechar
    const handleClose = () => {
        setFormData({ username: '', contact: '', recovery_code: '', new_password: '', confirm_password: '' });
        setIsLoading(false);
        onClose();
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.new_password !== formData.confirm_password) {
            onShowMessage('Erro', 'As novas senhas não conferem.', 'error');
            setIsLoading(false);
            return;
        }

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
            handleClose();

        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
            <div className="modal-card profile-modal-card" onClick={(e) => e.stopPropagation()}>
                <h2>Redefinir Senha</h2>
                
                <form id="forgot-password-form" onSubmit={handleSubmit}>
                    <div className="profile-modal-body-scrollable">
                        <p style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.9rem', marginTop: 0, lineHeight: '1.5' }}>
                            Preencha os dados para verificar sua identidade e criar uma nova senha.
                        </p>
                        <div className="form-group">
                            <label htmlFor="username">Matrícula/SIAPE</label>
                            <input type="text" id="username" required value={formData.username} onChange={handleChange} disabled={isLoading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact">E-mail ou Telefone (cadastrado)</label>
                            <input type="text" id="contact" required value={formData.contact} onChange={handleChange} disabled={isLoading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="recovery_code">Código de Recuperação (8 dígitos)</label>
                            <input type="text" id="recovery_code" required value={formData.recovery_code} onChange={handleChange} disabled={isLoading} maxLength="8" />
                        </div>
                        
                        <hr style={{ border: 'none', borderTop: '1px solid var(--cor-input-borda)', margin: '20px 0' }} />

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
                    
                    <div className="profile-modal-footer">
                        <div className="step-nav-buttons">
                            <button type="button" className="auth-button secondary" onClick={handleClose} disabled={isLoading}>Cancelar</button>
                            <button type="submit" className="auth-button" disabled={isLoading}>
                                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};