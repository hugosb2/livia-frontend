import React from 'react';

export const MessageModal = ({ isVisible, title, message, type = 'success', onClose }) => {
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
