import React, { useState, useEffect } from 'react';
import { PasswordToggle } from '../ui/PasswordToggle';
import { IconUpload } from '../icons';
import { apiFetch, formatPhone } from '../../utils/authHelpers';

export const EditProfileModal = ({ isVisible, onClose, user, onUpdateUser, onShowMessage }) => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [avatarFile, setAvatarFile] = useState(null); 
    const [avatarPreview, setAvatarPreview] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: formatPhone(user.phone || ''),
            });
            setAvatarPreview(user.avatar_url || null);
            setAvatarFile(null);
        }
    }, [user, isVisible]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'phone') {
            setFormData({ ...formData, phone: formatPhone(value) });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file); 
            setAvatarPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            onShowMessage('Erro', 'Telefone é obrigatório e deve ter 10 ou 11 dígitos (com DDD).', 'error');
            return;
        }

        setIsLoading(true);
        let newAvatarUrl = null;

        try {
            if (avatarFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('avatar', avatarFile);

                const uploadResponse = await apiFetch('/profile/avatar', {
                    method: 'POST',
                    body: uploadFormData,
                });

                const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) throw new Error(uploadData.message || 'Erro no upload do avatar');
                
                newAvatarUrl = uploadData.avatar_url; 
            }

            const textUpdateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
            };

            if (newAvatarUrl) {
                textUpdateData.avatar_url = newAvatarUrl;
            }

            const profileResponse = await apiFetch('/profile', {
                method: 'PUT',
                body: JSON.stringify(textUpdateData)
            });
            const profileData = await profileResponse.json();
            if (!profileResponse.ok) throw new Error(profileData.message || 'Erro ao atualizar perfil');

            onUpdateUser(profileData.user); 
            onShowMessage('Perfil Atualizado!', 'Seus dados foram atualizados com sucesso.', 'success');
            onClose();

        } catch (error) {
            onShowMessage('Erro', error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const onCardClick = (e) => e.stopPropagation();

    return (
        <div id="edit-profile-modal" className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
            <div className="modal-card profile-modal-card" onClick={onCardClick}>
                
                <h2>Editar Perfil</h2>
                
                <form id="edit-profile-form" onSubmit={handleSubmit}>
                    
                    <div className="profile-modal-body-scrollable">
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <label>Foto de Perfil</label>
                            <img 
                                src={avatarPreview || "/assets/perfil.png"} 
                                alt="Preview" 
                                className="profile-avatar-large"
                                style={{ margin: '10px auto', cursor: 'pointer' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()} 
                                onError={(e) => { e.target.onerror = null; e.target.src='/assets/perfil.png' }}
                            />
                            <input 
                                type="file" 
                                id="avatar-upload-input" 
                                accept="image/png, image/jpeg"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                            <button 
                                type="button" 
                                className="auth-button secondary" 
                                style={{ maxWidth: '200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={() => document.getElementById('avatar-upload-input')?.click()}
                            >
                                <IconUpload /> <span>Mudar Foto</span>
                            </button>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="first_name">Nome</label>
                                <input type="text" id="first_name" required value={formData.first_name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Sobrenome</label>
                                <input type="text" id="last_name" required value={formData.last_name} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="email">E-mail</label>
                                <input type="email" id="email" required value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Telefone</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    required
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    placeholder="(XX) XXXXX-XXXX"
                                    maxLength="15"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-username">Matrícula/SIAPE</label>
                            <input type="text" id="edit-username" disabled value={user.username || ''} style={{ backgroundColor: 'var(--cor-input-fundo)' }} />
                            <small style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.8rem', paddingTop: '5px', display: 'block' }}>Matrícula/SIAPE não pode ser alterada</small>
                        </div>
                    </div>

                    <div className="profile-modal-footer">
                        <div className="step-nav-buttons">
                            <button type="button" id="edit-profile-cancel" className="auth-button secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                            <button type="submit" className="auth-button" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
};
