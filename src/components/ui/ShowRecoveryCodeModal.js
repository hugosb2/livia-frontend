import React from 'react';

export const ShowRecoveryCodeModal = ({ isVisible, code, onClose }) => {
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        // Você pode adicionar um feedback visual de "copiado" aqui se desejar
    };
    
    return (
        <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ color: 'var(--cor-primaria)' }}>Guarde seu Código!</h2>
                <p>Este é seu código de recuperação. <strong>Anote-o e guarde em um lugar seguro.</strong></p>
                <p>Você precisará dele se esquecer sua senha. Este código <strong>não será mostrado novamente</strong>.</p>
                
                <div style={{ 
                    backgroundColor: 'var(--cor-input-fundo)', 
                    padding: '20px', 
                    borderRadius: 'var(--radius-medium)', 
                    margin: '20px 0',
                    border: '1px solid var(--cor-input-borda)',
                    cursor: 'pointer'
                }} title="Clique para copiar" onClick={handleCopyCode}>
                    <h1 style={{ 
                        textAlign: 'center', 
                        margin: 0, 
                        color: 'var(--cor-texto-principal)', 
                        letterSpacing: '0.1em',
                        fontWeight: '700'
                    }}>
                        {code}
                    </h1>
                </div>
                
                <button id="modal-close-btn" className="auth-button" onClick={onClose}>OK, eu anotei</button>
            </div>
        </div>
    );
};