import React, { useState, useEffect } from 'react';
import { PasswordToggle } from '../ui/PasswordToggle';
import { apiFetch } from '../../utils/authHelpers';

export const DeleteAccountModal = ({ isVisible, onClose, onShowMessage, onLogout }) => {
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
            <div className="modal-card" onClick={onCardClick}>
                <h2 style={{ color: 'var(--cor-erro)' }}>Excluir Conta</h2>
                <p style={{ textAlign: 'left', margin: '10px 0 20px', color: 'var(--cor-texto-secundario)'}}>
                    <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados, including histórico de conversas, serão permanentemente excluídos.
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
