import MagicBento from '../components/MagicBento';

const MagicBentoExample = () => {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Magic Bento Grid
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example 1: Full features */}
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
            className="col-span-1 md:col-span-2"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Featured Product
            </h3>
            <p className="text-gray-400">
              Hover over me to see the magic! Click for ripple effect.
            </p>
          </MagicBento>

          {/* Example 2: Different color */}
          <MagicBento
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            spotlightRadius={250}
            particleCount={8}
            glowColor="255, 0, 132"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Special Offer
            </h3>
            <p className="text-gray-400">
              Pink glow variant
            </p>
          </MagicBento>

          {/* Example 3: Blue variant */}
          <MagicBento
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableMagnetism={true}
            spotlightRadius={200}
            particleCount={15}
            glowColor="0, 132, 255"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              New Arrival
            </h3>
            <p className="text-gray-400">
              Blue glow variant
            </p>
          </MagicBento>

          {/* Example 4: Green variant */}
          <MagicBento
            enableStars={true}
            enableSpotlight={true}
            enableTilt={true}
            clickEffect={true}
            spotlightRadius={280}
            particleCount={10}
            glowColor="0, 255, 132"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Best Seller
            </h3>
            <p className="text-gray-400">
              Green glow variant
            </p>
          </MagicBento>

          {/* Example 5: Large card */}
          <MagicBento
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={350}
            particleCount={20}
            glowColor="255, 132, 0"
            className="col-span-1 md:col-span-2"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Premium Collection
            </h3>
            <p className="text-gray-400 mb-4">
              Orange glow with maximum effects
            </p>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              Explore Now
            </button>
          </MagicBento>
        </div>
      </div>
    </div>
  );
};

export default MagicBentoExample;
