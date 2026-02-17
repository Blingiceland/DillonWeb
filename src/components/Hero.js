import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/0113b709-4229-4ac7-9549-e76da6321020.png';

// using external image for now
const heroImg = "https://images.unsplash.com/photo-1514362545857-3bc16549766b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";

const Hero = () => {
    return (
        <div style={{
            height: '100vh',
            width: '100%',
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Dark overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1
            }} />

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                padding: '20px'
            }}>
                {/* Logo - reduced size */}
                <img 
                    src={logo} 
                    alt="Dillon" 
                    style={{
                        width: '200px',
                        maxWidth: '80vw',
                        height: 'auto',
                        marginBottom: '30px'
                    }}
                />

                {/* Headline */}
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(32px, 6vw, 64px)',
                    color: 'var(--color-gold)',
                    letterSpacing: '3px',
                    marginBottom: '40px',
                    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)'
                }}>
                    THE HEART OF ROCK & ROLL
                </h1>

                {/* Primary CTA */}
                <Link 
                    to="/events" 
                    className="btn btn-primary"
                    style={{
                        fontSize: '20px',
                        padding: '18px 40px',
                        boxShadow: '0 4px 20px rgba(200, 155, 60, 0.4)'
                    }}
                >
                    SJÁ DAGSKRÁ & BÓKA
                </Link>
            </div>
        </div>
    );
};

export default Hero;
