import React from 'react';
import { IconNewChat, IconDelete, IconClose, IconProfile, IconLogout } from '../icons';

export const Sidebar = ({ 
    isMobile = false, 
    isMobileMenuOpen = false,
    conversations = [],
    currentConversationId = null,
    onStartNewChat,
    onSelectConversation,
    onDeleteConversation,
    onCloseMobileMenu,
    onShowProfile,
    onLogout
}) => (
    <aside id={isMobile ? "mobile-sidebar" : "history-sidebar"} className={isMobile ? `mobile-sidebar ${isMobileMenuOpen ? 'visible' : ''}` : "history-sidebar"}>
        <header className={isMobile ? "mobile-sidebar-header" : "history-header"}>
            <div className="logo-container">
                <picture>
                    <source srcSet="/assets/ifbaiano-light.png" media="(prefers-color-scheme: dark)" />
                    <img src="/assets/ifbaiano.png" alt="Logo IF Baiano" className="logo" />
                </picture>
            </div>
            {isMobile && (
                <button id="mobile-sidebar-close" className="mobile-sidebar-close" title="Fechar menu" onClick={onCloseMobileMenu}>
                    <IconClose />
                </button>
            )}
        </header>
        
        <button 
            id={isMobile ? "mobile-new-chat" : "btn-new-chat"} 
            className={isMobile ? "mobile-new-chat-btn" : "history-new-chat-btn"} 
            title="Nova Conversa"
            onClick={onStartNewChat}
        >
            <IconNewChat />
            <span>Nova Conversa</span>
        </button>
        
        <nav id={isMobile ? "mobile-history-list" : "history-list"} className={isMobile ? "mobile-history-list" : "history-list"}>
            {conversations.length === 0 ? (
                <p className="history-empty">Nenhuma conversa iniciada.</p>
            ) : (
                conversations.map(convo => (
                    <button
                        type="button"
                        key={convo.id} 
                        className={`history-item ${convo.id === currentConversationId ? 'active' : ''}`}
                        onClick={() => onSelectConversation(convo.id)}
                    >
                        <span className="history-item-title">{convo.title}</span>
                        <span className="history-item-actions">
                            <button className="history-item-btn delete" title="Apagar conversa" onClick={(e) => onDeleteConversation(e, convo.id)}>
                                <IconDelete />
                            </button>
                        </span>
                    </button>
                ))
            )}
        </nav>

        {isMobile && (
            <footer className="mobile-sidebar-footer">
                <button className="mobile-sidebar-action-btn" onClick={onShowProfile}>
                    <IconProfile />
                    <span>Meu Perfil</span>
                </button>
                <button className="mobile-sidebar-action-btn danger" onClick={onLogout}>
                    <IconLogout />
                    <span>Sair</span>
                </button>
            </footer>
        )}
    </aside>
);
