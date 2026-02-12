// Random animation for the background
(function() {
    const box = document.querySelector('.animated-projects-box::after');
    
    function getRandomDegree() {
        return (Math.random() * 16 - 8).toFixed(2); // Random between -8 and 8
    }
    
    function getRandomPosition() {
        return Math.floor(Math.random() * 100); // Random 0-100%
    }
    
    function updateAnimation() {
        const box = document.querySelector('.animated-projects-box');
        if (!box) return;
        
        const rotate1 = getRandomDegree();
        const rotate2 = getRandomDegree();
        const pos1X = getRandomPosition();
        const pos1Y = getRandomPosition();
        const pos2X = getRandomPosition();
        const pos2Y = getRandomPosition();
        
        // Create dynamic keyframes
        const keyframes1 = `
            @keyframes earthboundWavyLines1Dynamic {
                from {
                    background-position: 0% 0%, 0% 0%;
                    transform: rotate(0deg);
                }
                to {
                    background-position: ${pos1X}% ${pos1Y}%, 0% 0%;
                    transform: rotate(${rotate1}deg);
                }
            }
        `;
        
        const keyframes2 = `
            @keyframes earthboundWavyLines2Dynamic {
                from {
                    background-position: 0% 0%, 0% 0%;
                    transform: rotate(0deg);
                }
                to {
                    background-position: 0% 0%, ${pos2X}% ${pos2Y}%;
                    transform: rotate(${rotate2}deg);
                }
            }
        `;
        
        // Remove old style if exists
        let styleEl = document.getElementById('dynamic-animation-styles');
        if (styleEl) {
            styleEl.remove();
        }
        
        // Add new styles
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-animation-styles';
        styleEl.textContent = keyframes1 + keyframes2;
        document.head.appendChild(styleEl);
        
        // Apply the animation
        const afterPseudo = window.getComputedStyle(box, '::after');
        box.style.setProperty('--animation1', 'earthboundWavyLines1Dynamic 24s ease-in-out forwards');
        box.style.setProperty('--animation2', 'earthboundWavyLines2Dynamic 32s ease-in-out forwards');
    }
    
    // Initial update
    setTimeout(updateAnimation, 100);
    
    // Update every 24 seconds (matching the animation duration)
    setInterval(updateAnimation, 24000);
})();
