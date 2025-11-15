import React from 'react';

export const SplashScreen = () => (
    <div id="splash-screen">
        <div className="splash-content">
            <picture>
                <source srcSet="/assets/ifbaiano-light.png" media="(prefers-color-scheme: dark)" />
                <img src="/assets/ifbaiano.png" alt="Logo IF Baiano" className="splash-logo" />
            </picture>
            <div className="splash-text">
                <h1><b>LivIA</b></h1>
                <p>Assistente Virtual do Campus Itapetinga</p>
            </div>
        </div>
    </div>
);
