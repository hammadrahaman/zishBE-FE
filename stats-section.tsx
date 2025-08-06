import { Coffee, Users, Star } from "lucide-react"

export function StatsSection() {
  return (
    <section className="py-20 px-4 bg-white/30 backdrop-blur-sm relative">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50"></div>
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center animate-fade-in-up group">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <Coffee className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
              500+
            </h3>
            <p className="text-gray-600 font-medium">Items Served Daily</p>
          </div>

          <div className="text-center animate-fade-in-up-delay group">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <Users className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              1000+
            </h3>
            <p className="text-gray-600 font-medium">Happy Customers</p>
          </div>

          <div className="text-center animate-fade-in-up-delay-2 group">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <Star className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
              4.9
            </h3>
            <p className="text-gray-600 font-medium">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}
