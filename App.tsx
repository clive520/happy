import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-red to-festive-red flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-festive-gold opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-festive-gold opacity-10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-2xl w-full bg-white/10 backdrop-blur-sm border-2 border-festive-gold/30 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-8">
        
        {/* Header Text */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-festive-gold drop-shadow-md tracking-widest">
            大家恭喜
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light tracking-wider mt-4">
            Happy New Year & Welcome Spring
          </p>
        </div>

        {/* Spring Image Container */}
        <div className="relative group w-full max-w-md aspect-square rounded-full overflow-hidden border-4 border-festive-gold shadow-lg transition-transform duration-500 hover:scale-105">
          {/* Using a spring themed seed for the image */}
          <img 
            src="https://picsum.photos/seed/spring/800/800" 
            alt="Spring Scenery" 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with 'Spring' character */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
            <div className="w-24 h-24 bg-festive-red/90 rounded-full flex items-center justify-center border-2 border-festive-gold shadow-lg rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <span className="text-5xl font-serif text-white font-bold">春</span>
            </div>
          </div>
        </div>

        {/* Footer/Decoration */}
        <div className="w-full flex justify-center items-center gap-4 mt-4">
           <div className="h-px bg-gradient-to-r from-transparent via-festive-gold to-transparent w-full opacity-50"></div>
           <div className="text-festive-gold text-2xl">✿</div>
           <div className="h-px bg-gradient-to-r from-transparent via-festive-gold to-transparent w-full opacity-50"></div>
        </div>

      </div>
      
      <footer className="mt-8 text-white/40 text-sm z-10">
        Built with React & Tailwind
      </footer>
    </div>
  );
};

export default App;