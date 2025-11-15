const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// --- Storage Helpers ---
export const storeToken = (token) => localStorage.setItem('livia_token', token);
export const getToken = () => localStorage.getItem('livia_token');
export const storeUser = (user) => localStorage.setItem('livia_user', JSON.stringify(user));
export const getStoredUser = () => {
    const user = localStorage.getItem('livia_user');
    return user ? JSON.parse(user) : null;
};
export const clearAuthData = () => {
    localStorage.removeItem('livia_token');
    localStorage.removeItem('livia_user');
};

// --- API Fetch Helper ---
export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    
    if (!(options.body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    options.headers = headers;

    try {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);
        
        if (response.status === 401 && !endpoint.startsWith('/login')) {
            clearAuthData();
            window.location.reload(); 
            return Promise.reject(new Error('Sessão expirada.'));
        }
        
        return response;
    } catch (error) {
        console.error('Fetch Error:', error);
        return Promise.reject(error);
    }
};

// --- Validation Helpers ---
export const REGEX_SIAPE = /^\d{7}$/; 
export const REGEX_MATRICULA = /^\d{4}1[A-Z]{3}\d{2}[A-Z]{2}\d{4}$/;

export const formatPhone = (value) => {
    if (!value) return '';
    let v = value.replace(/\D/g, '');
    v = v.substring(0, 11); 
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2}).*/, '($1');
    }
    return v;
};

export const formatPhoneForDisplay = (phone) => {
    if (!phone) return 'Não informado';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    }
    return phone; 
};
