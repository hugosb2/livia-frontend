import React from 'react';
import { IconBack, IconEdit, IconPassword, IconLogout, IconDelete } from '../icons';
import { formatPhoneForDisplay } from '../../utils/authHelpers';

export const ProfileScreen = ({ user, onBack, onLogout, onOpenModal }) => {
    return (
        <div id="profile-screen" className="profile-screen" style={{ display: 'flex' }}>
            <header className="profile-header">
                <button id="profile-back-btn" className="profile-back-btn" title="Voltar ao Chat" onClick={onBack}>
                    <IconBack />
                </button>
                <div className="header-text">
                    <h1>Meu Perfil</h1>
                    <p className="subtitle">Gerencie sua conta</p>
                </div>
            </header>
            
            <main className="profile-content">
                <div className="profile-section">
                    <h2>Informações Pessoais</h2>
                    <div className="profile-info-card">
                        <img 
                            src={user.avatar_url || "/assets/perfil.png"} 
                            alt="Avatar" 
                            className="profile-avatar-large" 
                            onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                        />
                        <h3 id="profile-display-name">{user.first_name} {user.last_name}</h3>
                        <p id="profile-display-email">{user.email}</p>
                        <p id="profile-display-phone">Telefone: {formatPhoneForDisplay(user.phone)}</p>
                        <p id="profile-display-username">Matrícula/SIAPE: {user.username}</p>
                    </div>
                    <div className="profile-actions-grid">
                        <button id="profile-edit-btn" className="profile-action-btn" onClick={() => onOpenModal('edit')}>
                            <IconEdit />
                            Editar Dados (Foto, Nome, Contato)
                        </button>
                        <button id="profile-password-btn" className="profile-action-btn" onClick={() => onOpenModal('password')}>
                            <IconPassword />
                            Alterar Senha
                        </button>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Ações da Conta</h2>
                    <div className="profile-actions-grid">
                        <button id="profile-logout-btn" className="profile-action-btn" onClick={onLogout}>
                            <IconLogout />
                            Sair da Conta
                        </button>
                        <button id="profile-delete-btn" className="profile-action-btn danger" onClick={() => onOpenModal('delete')}>
                            <IconDelete />
                            Excluir Conta
                        </button>
                    </div>
                </div>
                <div className="profile-section">
                    <h2>Sobre</h2>
                    <p>Este sistema foi desenvolvido no Curso de Sistemas de Informação - Campus Itapetinga. Desenvolvido por Hugo Barros (aluno) sob orientação do Prof. Hudson Barros.</p>
                </div>
            </main>
        </div>
    );
};
