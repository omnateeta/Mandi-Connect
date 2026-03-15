import { useEffect } from 'react';

const PageBackground = () => {
  useEffect(() => {
    // Preload the background image for better performance
    const img = new Image();
    img.src = '/loginbg.avif';
    img.onload = () => {
      console.log('Background image loaded successfully');
    };
  }, []);

  return (
    <>
      {/* Background Image with Blur */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/loginbg.avif')`,
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Dark Overlay for Better Readability */}
      <div className="fixed inset-0 bg-black/40 z-0" />
      
      {/* Content Container - Renders above background */}
      <div className="relative z-10">
        {/* Children content will be rendered here */}
      </div>
    </>
  );
};

export default PageBackground;
