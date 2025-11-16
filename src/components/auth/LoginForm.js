import React, { useState } from 'react';
import { PasswordToggle } from '../ui/PasswordToggle';
import { apiFetch } from '../../utils/authHelpers';

export const LoginForm = ({ onLoginSuccess, onShowRegister, onShowForgotPassword }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro desconhecido');
            }
            
            onLoginSuccess(data.access_token, data.user);

        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div id="login-form-container" className="form-container">
            <img src="/assets/perfil.png" alt="Logo LivIA" className="auth-logo" />
            <h1>Login - LivIA</h1>
            <p>Assistente Virtual do Campus Itapetinga</p>
            <form id="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login-username">Matrícula/SIAPE</label>
                    <input 
                        type="text" 
                        id="login-username" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group form-group-password">
                    <label htmlFor="login-password">Senha</label>
                    <input 
                        type="password" 
                        id="login-password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                    <PasswordToggle inputId="login-password" />
                </div>
                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <p id="login-error" className="error-message" style={{ display: error ? 'block' : 'none' }}>
                    {error}
                </p>
                
                {/* === ÁREA MODIFICADA === */}
                <p className="toggle-link" style={{ marginBottom: '8px', marginTop: '24px' }}>
                    Não tem uma conta? <button type="button" className="link-button" id="show-register" onClick={onShowRegister}>Cadastre-se</button>
                </p>
                <p className="toggle-link" style={{ marginTop: '0' }}>
                    <button type="button" className="link-button" id="show-forgot-password" onClick={onShowForgotPassword}>
                        Esqueceu sua senha?
                    </button>
                </p>
                {/* === FIM DA ÁREA MODIFICADA === */}

            </form>
        </div>
    );
};