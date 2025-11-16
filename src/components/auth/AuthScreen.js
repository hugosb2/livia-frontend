import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthScreen = ({ onLoginSuccess, onShowMessage, onOpenModal, onShowNewCode }) => {
    const [isLogin, setIsLogin] = useState(true);

    const handleShowRegister = (e) => {
        e.preventDefault();
        setIsLogin(false);
    };

    const handleShowLogin = (e) => {
        e.preventDefault();
        setIsLogin(true);
    };

    const handleRegisterSuccess = (message, code) => {
        onShowMessage('Cadastro Realizado!', message || 'Usuário cadastrado com sucesso! Você já pode fazer login.', 'success');
        setIsLogin(true);
        if (code) {
            onShowNewCode(code); // Mostra o modal do código
        }
    };

    return (
        <div id="auth-container" className="auth-container" style={{ display: 'flex' }}>
            <div className="auth-container-content">
                {isLogin ? (
                    <LoginForm 
                        onLoginSuccess={onLoginSuccess} 
                        onShowRegister={handleShowRegister} 
                        onShowForgotPassword={() => onOpenModal('forgotPassword')} // <-- MODIFICADO
                    />
                ) : (
                    <RegisterForm 
                        onShowLogin={handleShowLogin} 
                        onRegisterSuccess={handleRegisterSuccess} // <-- MODIFICADO
                    />
                )}
            </div>
        </div>
    );
};