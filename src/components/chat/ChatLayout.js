import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { Sidebar } from './Sidebar';
import { IconMenu, IconProfile, IconLogout, IconSend } from '../icons';
import { apiFetch } from '../../utils/authHelpers';

const CHATBASE_API_KEY = process.env.REACT_APP_CHATBASE_API_KEY;
const CHATBASE_CHATBOT_ID = process.env.REACT_APP_CHATBASE_CHATBOT_ID;
const CHATBASE_URL = process.env.REACT_APP_CHATBASE_URL;

export const ChatLayout = ({ user, onLogout, onShowProfile }) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const chatDisplayRef = useRef(null);

    const scrollToBottom = () => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    };

    const renderMarkdown = (text) => {
        try {
            return marked.parse(text, { breaks: true });
        } catch (e) {
            return text;
        }
    };

    const startNewChat = useCallback(() => {
        setCurrentConversationId(null);
        setMessages([
            { content: "Olá! Eu sou a LivIA, a assistente virtual do IF Baiano - Campus Itapetinga. Como posso te ajudar hoje?", role: 'assistant' }
        ]);
        setIsMobileMenuOpen(false);
    }, []); 

    const loadConversations = useCallback(async () => {
        try {
            const response = await apiFetch('/history');
            if (!response.ok) throw new Error('Falha ao carregar histórico');
            const data = await response.json();
            setConversations(data);
            
            if (!currentConversationId && data.length === 0) {
                startNewChat();
            }
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        }
    }, [currentConversationId, startNewChat]);

    const loadChatMessages = useCallback(async (convId) => {
        if (!convId) {
            startNewChat();
            return;
        }
        
        try {
            const convo = conversations.find(c => c.id === convId);
            let history = convo?.messages || [];

            if (!history.length) {
                const response = await apiFetch(`/history/${convId}`);
                if (!response.ok) throw new Error('Falha ao carregar chat');
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    history = data[0].messages || data[0].conversation || [];
                } else if (data && data.messages) {
                    history = data.messages;
                }
            }

            const formattedMessages = history.map(m => ({
                role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
                content: m.content || m.text || m.body || ''
            }));
            
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            setMessages([{ role: 'assistant', content: 'Erro ao carregar esta conversa.' }]);
        }
    }, [conversations, startNewChat]);

    useEffect(() => {
        loadConversations();
        startNewChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const saveConversation = async (history) => {
        if (history.length < 2) return; 
        
        let title = history.find(m => m.role === 'user')?.content.substring(0, 30) + '...';

        const body = {
            title: title,
            messages: history 
        };

        try {
            let response;
            let endpoint = '/history';
            let method = 'POST';

            if (currentConversationId) {
                endpoint = `/history/${currentConversationId}`;
                method = 'PUT';
            }

            response = await apiFetch(endpoint, { method, body: JSON.stringify(body) });
            if (!response.ok) throw new Error('Falha ao salvar conversa');
            
            const savedConvo = await response.json();
            
            if (!currentConversationId) {
                const newId = Array.isArray(savedConvo) ? savedConvo[0].id : savedConvo.id;
                setCurrentConversationId(newId);
                loadConversations();
            }
            
        } catch (error) {
            console.error('Erro ao salvar conversa:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || isTyping) return;

        setInput('');
        setIsTyping(true);

        const newUserMessage = { content: question, role: 'user' };
        const newHistory = [...messages, newUserMessage];
        setMessages(newHistory);
        
        try {
            const response = await fetch(CHATBASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CHATBASE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: newHistory,
                    chatbotId: CHATBASE_CHATBOT_ID,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Erro na API: ${response.statusText} - ${errorBody}`);
            }
            
            const data = await response.json();
            const assistantResponse = { content: data.text, role: 'assistant' };
            
            const finalHistory = [...newHistory, assistantResponse];
            setMessages(finalHistory);
            
            await saveConversation(finalHistory);

        } catch (error) {
            console.error('Falha ao comunicar com o Chatbase:', error);
            const errorMsg = { role: 'assistant', content: '**Ops!** Ocorreu um erro ao me comunicar. Por favor, tente novamente mais tarde.' };
            setMessages([...newHistory, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const selectConversation = (id) => {
        if (id === currentConversationId) return;
        setCurrentConversationId(id);
        loadChatMessages(id);
        setIsMobileMenuOpen(false);
    };
    
    const deleteConversation = async (e, convId) => {
        e.stopPropagation(); 
        if (!window.confirm('Tem certeza de que deseja apagar esta conversa?')) return;
        
        try {
            const response = await apiFetch(`/history/${convId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao apagar conversa');

            setConversations(prev => prev.filter(c => c.id !== convId));
            
            if (convId === currentConversationId) {
                startNewChat();
            }
        } catch (error) {
            console.error('Erro ao deletar conversa:', error);
        }
    };

    return (
        <div id="app-layout" className="app-layout" style={{ display: 'flex' }}>
            
            <div 
                id="mobile-menu-overlay" 
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'visible' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            <Sidebar 
                isMobile={true}
                isMobileMenuOpen={isMobileMenuOpen}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onStartNewChat={startNewChat}
                onSelectConversation={selectConversation}
                onDeleteConversation={deleteConversation}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
                onShowProfile={onShowProfile}
                onLogout={onLogout}
            />
            
            <Sidebar 
                isMobile={false}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onStartNewChat={startNewChat}
                onSelectConversation={selectConversation}
                onDeleteConversation={deleteConversation}
            />

            <div id="chat-container" className="chat-container">
                <header className="app-bar">
                    <div className="header-left">
                        <button 
                            id="mobile-menu-btn" 
                            className={`mobile-menu-btn ${isMobileMenuOpen ? 'is-open' : ''}`} 
                            title="Abrir menu" 
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <IconMenu />
                        </button>
                        <img 
                            src="/assets/perfil.png"
                            alt="Avatar LivIA" 
                            className="header-avatar" 
                        />
                        <div className="header-text">
                            <h1><b>LivIA</b></h1>
                            <p className="subtitle">Assistente Virtual do Campus Itapetinga</p>
                        </div>
                    </div>
                    
                    <div className="app-bar-desktop-actions">
                        <button id="btn-profile" className="app-bar-icon-btn" title="Meu Perfil" onClick={onShowProfile}>
                            <IconProfile />
                        </button>
                        <button id="btn-logout" className="app-bar-icon-btn" title="Sair" onClick={onLogout}>
                            <IconLogout />
                        </button>
                    </div>
                </header>

                <main id="chat-display" className="chat-display" ref={chatDisplayRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role === 'user' ? 'user-message' : 'livia-message'}`}>
                            
                            {msg.role === 'assistant' && (
                                <div className="avatar">
                                    <img src="/assets/perfil.png" alt="LivIA" />
                                </div>
                            )}
                            
                            <div className="message-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />

                            {msg.role === 'user' && (
                                <div className="avatar avatar-user">
                                    <img 
                                        src={user.avatar_url || "/assets/perfil.png"} 
                                        alt="Meu Avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div id="typing-indicator" className="chat-message livia-message">
                            <div className="avatar"><img src="/assets/perfil.png" alt="LivIA" /></div>
                            <div className="message-bubble">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="input-row">
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', flexGrow: 1, gap: '10px' }}>
                        <input 
                            type="text" 
                            id="pergunta-input" 
                            placeholder="Faça sua pergunta..." 
                            disabled={isTyping}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button id="btn-perguntar" type="submit" disabled={isTyping || !input.trim()}>
                            <IconSend />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};
