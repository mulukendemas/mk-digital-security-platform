
import { SolutionsSlideshow } from "./SolutionsSlideshow";

export function Features() {
  return (
    <section className="py-12 md:py-16 pb-6 md:pb-8 bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 -z-10">
        {/* Large gradient circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full"></div>

        {/* Additional decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-3xl"></div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, black 2%, transparent 0%), radial-gradient(circle at 75px 75px, black 2%, transparent 0%)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Section header with gradient text */}
      <div className="container-lg">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-block mb-2">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-purple-700 inline-block text-transparent bg-clip-text">
            Our Core Solutions & Products
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital security solutions for government, banking, telecom, and enterprise sectors.
          </p>
        </div>
      </div>

      {/* Full-width Solutions Slideshow */}
      <div className="w-full overflow-hidden">
        <SolutionsSlideshow />
      </div>


    </section>
  );
}
