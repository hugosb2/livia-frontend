import React, { useState, useEffect } from 'react';
import { PasswordToggle } from '../ui/PasswordToggle';
import { apiFetch } from '../../utils/authHelpers';

export const ChangePasswordModal = ({ isVisible, onClose, onShowMessage }) => {
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
            <div className="modal-card" onClick={onCardClick}>
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
