import React from 'react';
import LogoImage from '../../assets/Logo.png';
import { motion } from 'framer-motion';

interface LogoProps {
    size?: 'small' | 'large';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'small', className = '' }) => {
    const sizeClasses = {
        small: 'h-12 w-auto', // ~48px height for standard pages (reduced from 56px)
        large: 'h-24 w-auto', // ~96px height for dashboard (reduced from 128px)
    };

    return (
        <motion.img
            src={LogoImage}
            alt="VocabGrab Logo"
            className={`${sizeClasses[size]} ${className}`}
            style={{
                mixBlendMode: 'screen', // Makes white background transparent on dark themes
                filter: 'brightness(1.1) contrast(1.1)' // Enhances visibility
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        />
    );
};

export default Logo;
