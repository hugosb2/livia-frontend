import React, { useState, useEffect } from 'react';

// Styles
import './styles/theme.css';
import './App.css';

// Auth Components
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal'; // <-- NOVO

// Chat Components
import { ChatLayout } from './components/chat/ChatLayout';

// Profile Components
import { ProfileScreen } from './components/profile/ProfileScreen';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { ChangePasswordModal } from './components/profile/ChangePasswordModal';
import { DeleteAccountModal } from './components/profile/DeleteAccountModal';
import { RegenerateCodeModal } from './components/profile/RegenerateCodeModal'; // <-- NOVO

// UI Components
import { MessageModal } from './components/ui/MessageModal';
import { ShowRecoveryCodeModal } from './components/ui/ShowRecoveryCodeModal'; // <-- NOVO

// Utilities
import {
    storeToken,
    storeUser,
    getStoredUser,
    clearAuthData
} from './utils/authHelpers';

// ===================================================================
// COMPONENTE: App (Principal)
// ===================================================================
function App() {
    const [appState, setAppState] = useState('splash');
    const [user, setUser] = useState(getStoredUser());
    const [activeModal, setActiveModal] = useState('none'); 
    const [messageModal, setMessageModal] = useState({ visible: false });

    // NOVO ESTADO E HANDLERS PARA O CÓDIGO DE RECUPERAÇÃO
    const [recoveryCodeModal, setRecoveryCodeModal] = useState({ visible: false, code: null });

    const handleShowNewCode = (code) => {
        setRecoveryCodeModal({ visible: true, code: code });
    };
    const handleCloseRecoveryCodeModal = () => {
        setRecoveryCodeModal({ visible: false, code: null });
    };
    // FIM DO NOVO ESTADO

    useEffect(() => {
        const checkAuth = () => {
            const storedUser = getStoredUser();
            if (storedUser) {
                setUser(storedUser);
                setAppState('chat');
            } else {
                setAppState('auth');
            }
        };

        const splashTimer = setTimeout(checkAuth, 2000);
        return () => clearTimeout(splashTimer);
    }, []);

    const handleLoginSuccess = (newToken, newUser) => {
        storeToken(newToken);
        storeUser(newUser);
        setUser(newUser);
        setAppState('chat');
    };

    const handleLogout = () => {
        clearAuthData();
        setUser(null);
        setAppState('auth');
        setActiveModal('none');
    };

    const handleShowProfile = () => {
        setAppState('profile');
    };

    const handleBackToChat = () => {
        setAppState('chat');
    };

    const handleOpenModal = (modalName) => {
        setActiveModal(modalName);
    };

    const handleCloseModal = () => {
        setActiveModal('none');
    };

    const handleShowMessage = (title, message, type = 'success') => {
        setMessageModal({ visible: true, title, message, type });
    };

    const handleCloseMessageModal = () => {
        setMessageModal({ visible: false });
    };

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        storeUser(updatedUser);
    };

    const renderAppView = () => {
        switch (appState) {
            case 'splash':
                return <SplashScreen />;
            case 'auth':
                return <AuthScreen 
                    onLoginSuccess={handleLoginSuccess} 
                    onShowMessage={handleShowMessage}
                    onOpenModal={handleOpenModal} // <-- MODIFICADO
                    onShowNewCode={handleShowNewCode} // <-- MODIFICADO
                />;
            case 'chat':
                return <ChatLayout user={user} onLogout={handleLogout} onShowProfile={handleShowProfile} />;
            case 'profile':
                return <ProfileScreen user={user} onBack={handleBackToChat} onLogout={handleLogout} onOpenModal={handleOpenModal} />;
            default:
                return <AuthScreen 
                    onLoginSuccess={handleLoginSuccess} 
                    onShowMessage={handleShowMessage} 
                    onOpenModal={handleOpenModal} // <-- MODIFICADO
                    onShowNewCode={handleShowNewCode} // <-- MODIFICADO
                />;
        }
    };

    return (
        <>
            {renderAppView()}
            
            <MessageModal
                isVisible={messageModal.visible}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={handleCloseMessageModal}
            />
            
            {/* NOVO MODAL PARA EXIBIR O CÓDIGO */}
            <ShowRecoveryCodeModal
                isVisible={recoveryCodeModal.visible}
                code={recoveryCodeModal.code}
                onClose={handleCloseRecoveryCodeModal}
            />

            {/* NOVO MODAL PARA REDEFINIR SENHA */}
            <ForgotPasswordModal
                isVisible={activeModal === 'forgotPassword'}
                onClose={handleCloseModal}
                onShowMessage={handleShowMessage}
            />
            
            {user && (
                <>
                    <EditProfileModal
                        isVisible={activeModal === 'edit'}
                        onClose={handleCloseModal}
                        user={user}
                        onUpdateUser={handleUpdateUser}
                        onShowMessage={handleShowMessage}
                    />
                    <ChangePasswordModal
                        isVisible={activeModal === 'password'}
                        onClose={handleCloseModal}
                        onShowMessage={handleShowMessage}
                    />
                    <DeleteAccountModal
                        isVisible={activeModal === 'delete'}
                        onClose={handleCloseModal}
                        onShowMessage={handleShowMessage}
                        onLogout={handleLogout}
                    />
                    {/* NOVO MODAL PARA REGERAR CÓDIGO */}
                    <RegenerateCodeModal
                        isVisible={activeModal === 'regenerateCode'}
                        onClose={handleCloseModal}
                        onShowMessage={handleShowMessage}
                        onShowNewCode={handleShowNewCode}
                    />
                </>
            )}
        </>
    );
}

export default App;