import React, { useState } from 'react';
import { IconEye, IconEyeOff } from '../icons';

export const PasswordToggle = ({ inputId }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = isVisible ? 'password' : 'text';
            setIsVisible(!isVisible);
        }
    };

    const iconStyle = {
        top: 'calc(50% + 10px)', 
        transform: 'translateY(-50%)' 
    };

    return (
        <span onClick={toggleVisibility} className="password-toggle-icon" style={iconStyle}>
            {isVisible ? <IconEyeOff /> : <IconEye />}
        </span>
    );
};
