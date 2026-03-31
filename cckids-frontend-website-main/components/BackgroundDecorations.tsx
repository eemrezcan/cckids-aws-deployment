const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Stars */}
      <div className="absolute top-[10%] left-[10%] text-cc-pink text-2xl animate-twinkle">⭐</div>
      <div className="absolute top-[20%] right-[15%] text-cc-cyan text-2xl animate-twinkle delay-500">✨</div>
      <div className="absolute top-[60%] left-[8%] text-cc-yellow text-2xl animate-twinkle delay-1000">⭐</div>
      <div className="absolute bottom-[15%] right-[20%] text-cc-purple text-2xl animate-twinkle delay-[1500ms]">✨</div>
      <div className="absolute top-[40%] right-[8%] text-cc-orange text-2xl animate-twinkle delay-700">⭐</div>
      <div className="absolute bottom-[30%] left-[15%] text-cc-lime text-2xl animate-twinkle delay-[1200ms]">✨</div>

      {/* Floating Shapes */}
      <div className="absolute top-[15%] left-[5%] w-24 h-24 bg-cc-pink/10 rounded-full animate-float"></div>
      <div className="absolute bottom-[20%] right-[10%] w-36 h-36 bg-cc-cyan/10 rounded-full animate-float delay-1000"></div>
      <div className="absolute top-[50%] left-[80%] w-20 h-20 bg-cc-yellow/10 rounded-full animate-float delay-[2000ms]"></div>
    </div>
  );
};

export default BackgroundDecorations;
