import React, { useState } from 'react';
import { apiFetch } from '../../utils/authHelpers';

export const RegenerateCodeModal = ({ isVisible, onClose, onShowMessage, onShowNewCode }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRegenerate = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/profile/regenerate-code', {
                method: 'POST',
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message);

            onShowMessage('Sucesso!', data.message, 'success');
            onShowNewCode(data.recovery_code); // Passa o novo código para o App.js
            onClose(); // Fecha este modal

        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-left">Gerar Novo Código?</h2>
                <p className="text-left" style={{ margin: '0 0 24px'}}>Ao gerar um novo código, seu código de recuperação anterior será <strong>invalidado permanentemente</strong>.</p>
                <p className="text-left">Deseja continuar?</p>
                
                <div className="step-nav-buttons" style={{ marginTop: '24px' }}>
                    <button 
                        type="button" 
                        className="auth-button secondary" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        className="auth-button danger" 
                        onClick={handleRegenerate} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Gerando...' : 'Sim, Gerar Novo'}
                    </button>
                </div>
            </div>
        </div>
    );
};