document.addEventListener('DOMContentLoaded', () => {
    // --- CÓDIGO DA SPLASH SCREEN ---
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        // Esconde a splash screen após 2.5 segundos
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2500); // 2.5 segundos
    }
    // --- FIM DO CÓDIGO DA SPLASH SCREEN ---

    const chatDisplay = document.getElementById('chat-display');
    const perguntaInput = document.getElementById('pergunta-input');
    const btnPerguntar = document.getElementById('btn-perguntar');
    
    // URL CORRETA: Apenas a base da API
    const apiUrl = 'https://livia-backend.onrender.com';

    const view = {
        addMessage: (text, sender) => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            
            const avatar = document.createElement('div');
            avatar.classList.add('avatar');

            const bubble = document.createElement('div');
            bubble.classList.add('message-bubble');
            bubble.innerHTML = marked.parse(text);

            if (sender === 'user') {
                messageElement.classList.add('user-message');
                messageElement.appendChild(bubble);
            } else {
                messageElement.classList.add('livia-message');
                avatar.innerHTML = `<img src="./assets/perfil.png" alt="LivIA">`;
                messageElement.appendChild(avatar);
                messageElement.appendChild(bubble);
            }
            chatDisplay.appendChild(messageElement);
            view.scrollToBottom();
        },
        showTypingIndicator: () => {
            const typingElement = document.createElement('div');
            typingElement.id = 'typing-indicator';
            typingElement.classList.add('chat-message', 'livia-message');
            typingElement.innerHTML = `
                <div class="avatar"><img src="./assets/perfil.png" alt="LivIA"></div>
                <div class="message-bubble">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            `;
            chatDisplay.appendChild(typingElement);
            view.scrollToBottom();
        },
        removeTypingIndicator: () => {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        },
        setInputState: (enabled) => {
            perguntaInput.disabled = !enabled;
            btnPerguntar.disabled = !enabled;
            if (enabled) perguntaInput.focus();
        },
        scrollToBottom: () => {
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        }
    };

    const chatApiService = {
        start: async () => {
            // Requisição para a URL correta: https://livia-backend.onrender.com/asks/start
            const response = await fetch(`${apiUrl}/start`);
            if (!response.ok) throw new Error('Falha ao iniciar a conversa.');
            return response.json();
        },
        sendMessage: async (question) => {
            // Requisição para a URL correta: https://livia-backend.onrender.com/asks/chat
            const response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            return response.json();
        }
    };

    const controller = {
        handleSendMessage: async () => {
            const question = perguntaInput.value.trim();
            if (!question) return;

            view.addMessage(question, 'user');
            perguntaInput.value = '';
            view.setInputState(false);
            view.showTypingIndicator();

            try {
                const data = await chatApiService.sendMessage(question);
                view.removeTypingIndicator();
                view.addMessage(data.response, 'livia');
            } catch (error) {
                console.error('Falha ao comunicar com o backend:', error);
                view.removeTypingIndicator();
                view.addMessage('**Ops!** Ocorreu um erro. Por favor, tente novamente mais tarde.', 'livia');
            } finally {
                view.setInputState(true);
            }
        },
        init: async () => {
            view.setInputState(false);
            view.showTypingIndicator();
            try {
                const data = await chatApiService.start();
                view.removeTypingIndicator();
                view.addMessage(data.response, 'livia');
                view.setInputState(true);
            } catch (error) {
                console.error('Falha ao iniciar:', error);
                view.removeTypingIndicator();
                view.addMessage('**Erro de Conexão**: Não consegui me conectar. Verifique o backend e recarregue a página.', 'livia');
            }
        }
    };

    btnPerguntar.addEventListener('click', controller.handleSendMessage);
    perguntaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            controller.handleSendMessage();
        }
    });
    
    controller.init();
});