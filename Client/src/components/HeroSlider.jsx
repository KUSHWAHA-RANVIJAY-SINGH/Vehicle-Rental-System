import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

const HeroSlider = () => {
         const settings = {
                  dots: true,
                  infinite: true,
                  speed: 500,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 3000,
                  fade: true,
                  cssEase: 'linear',
                  appendDots: dots => (
                           <div
                                    style={{
                                             bottom: "25px"
                                    }}
                           >
                                    <ul className="m-0 p-0"> {dots} </ul>
                           </div>
                  ),
                  customPaging: i => (
                           <div className="w-3 h-3 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity duration-300"></div>
                  )
         };

         const slides = [
                  {
                           image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80",
                           title: "Find Your Freedom on the Open Road",
                           subtitle: "Premium cars and bikes for every journey. Affordable rates, wide selection, and 24/7 support."
                  },
                  {
                           image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80",
                           title: "Adventure Awaits You",
                           subtitle: "Explore the world with our reliable and comfortable fleet."
                  },
                  {
                           image: "https://images.unsplash.com/photo-1503376763036-066120622c74?w=1920&q=80",
                           title: "Drive Your Dreams Today",
                           subtitle: "Experience luxury and performance at an unbeatable price."
                  },
                  {
                           image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1920&q=80",
                           title: "Two Wheels, Endless Thrills",
                           subtitle: "Join the biker community and ride with style."
                  }
         ];

         return (
                  <section className="relative h-screen min-h-[600px] bg-gray-900 text-white overflow-hidden">
                           <style>{`
                .slick-dots li { margin: 0 4px; }
                .slick-dots li.slick-active div { background-color: #2563eb; opacity: 1; transform: scale(1.2); }
            `}</style>
                           <Slider {...settings} className="h-full">
                                    {slides.map((slide, index) => (
                                             <div key={index} className="relative h-screen min-h-[600px] outline-none">
                                                      <div className="absolute inset-0">
                                                               <img
                                                                        src={slide.image}
                                                                        alt={slide.title}
                                                                        className="w-full h-full object-cover"
                                                               />
                                                               <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
                                                      </div>

                                                      <div className="relative z-10 h-full flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
                                                               <div className="max-w-7xl mx-auto space-y-8">
                                                                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight animate-fade-in-up">
                                                                                 {slide.title.includes("Freedom") ? (
                                                                                          <>Find Your <span className="text-blue-500">Freedom</span> <br /> on the Open Road</>
                                                                                 ) : (
                                                                                          slide.title
                                                                                 )}
                                                                        </h1>
                                                                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
                                                                                 {slide.subtitle}
                                                                        </p>

                                                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up delay-200">
                                                                                 <Link
                                                                                          to="/vehicles"
                                                                                          className="px-8 py-4 bg-blue-600 rounded-full font-bold text-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-lg flex items-center"
                                                                                 >
                                                                                          <FaCar className="mr-2" /> Browse Vehicles
                                                                                 </Link>
                                                                                 <Link
                                                                                          to="/about"
                                                                                          className="px-8 py-4 bg-transparent border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition transform hover:scale-105"
                                                                                 >
                                                                                          Learn More
                                                                                 </Link>
                                                                        </div>
                                                               </div>
                                                      </div>
                                             </div>
                                    ))}
                           </Slider>
                  </section>
         );
};

export default HeroSlider;
