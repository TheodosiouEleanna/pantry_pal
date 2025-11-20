import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <Image
        src="/assets/hero-ingredients.jpg" 
        alt=""
        fill
        priority
        className="object-cover opacity-90 -z-10"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/55 -z-10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="min-h-[52vh] sm:min-h-[60vh] flex flex-col items-center justify-center text-center py-16">

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
            Transform Your Ingredients
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            List what you have or snap a photo—we'll suggest delicious recipes
          </p>
        </div>
      </div>
    </section>
  );
}
