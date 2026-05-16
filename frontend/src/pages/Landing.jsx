import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChefHat,
  Sparkles,
  Calendar,
  ShoppingCart,
  ArrowRight,
  Utensils,
  Star,
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";

const Landing = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      title: "AI Recipe Generation",
      description:
        "Turn your random pantry ingredients into delicious, chef-curated recipes instantly using advanced AI.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      title: "Smart Meal Planning",
      description:
        "Plan your week in minutes. Our AI helps balance macros and suggests meals you'll actually want to eat.",
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-orange-500" />,
      title: "Auto Shopping Lists",
      description:
        "Automatically generate organized grocery lists based on your meal plans and current pantry inventory.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fffcf8] text-gray-800 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#fffcf8]/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <BrandLogo className="scale-[1.35] origin-left" />
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-500-dark hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 font-semibold mb-6"
              >
                <ChefHat className="w-5 h-5" />
                <span>Your AI Sous-Chef is Here</span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight"
              >
                Stop guessing. <br className="hidden md:block" />
                <span className="text-orange-500 italic">Start cooking.</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto"
              >
                Generate personalized recipes from the ingredients you already
                have. Plan meals, track your pantry, and reduce food waste
                effortlessly.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row justify-center items-center gap-4"
              >
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-500-dark hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  Start creating for free <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-bold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  See how it works
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-10 -left-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-green-100 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Everything You Need to Eat Better
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Our intelligent platform learns your preferences to make cooking
              enjoyable and grocery shopping a breeze.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-[#fffcf8] rounded-3xl p-8 border border-gray-100 hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-2 transition-all duration-300 ease-out"
              >
                <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works UI Showcase */}
      <section className="py-24 bg-[#fffcf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Turn leftovers into culinary masterpieces.
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Just tell us what's in your fridge. Our AI will instantly craft
                a recipe complete with step-by-step instructions, prep times,
                and nutritional info.
              </p>
              <ul className="space-y-6">
                {[
                  {
                    title: "Input your ingredients",
                    desc: "Type in what you have or select from your virtual pantry.",
                  },
                  {
                    title: "Choose your preferences",
                    desc: "Filter by dietary needs, meal type, or prep time.",
                  },
                  {
                    title: "Cook & Enjoy",
                    desc: "Follow simple, clear instructions tailored to your skill level.",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {step.title}
                      </h4>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2 w-full"
            >
              {/* Fake App Mockup */}
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-400 mx-auto">
                    Recipe Generator
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex gap-2 flex-wrap mb-6">
                    {["Chicken Breast", "Broccoli", "Garlic", "Soy Sauce"].map(
                      (ing, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-orange-500/10 text-orange-500 font-medium rounded-lg text-sm"
                        >
                          {ing}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>

                  <div className="bg-[#fffcf8] rounded-xl p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl text-gray-900">
                        Garlic Soy Chicken & Broccoli
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mb-6">
                      <span className="flex items-center gap-1">
                        <Utensils className="w-4 h-4" /> 25 mins
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="w-4 h-4" /> Easy
                      </span>
                    </div>
                    <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500-dark transition-colors">
                      Start Cooking
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-500/5 -skew-y-3 origin-bottom-left transform -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Ready to transform your kitchen?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of home cooks who are saving time, money, and
              eating better with AI-powered meal planning.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-orange-500 hover:bg-orange-500-dark text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Create Your Free Account
            </button>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <BrandLogo className="w-40 mb-6 opacity-70 grayscale" />
          <p className="text-gray-500 mb-6 max-w-md">
            The intelligent meal planner and recipe generator designed to make
            home cooking delightful.
          </p>
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AI Recipe Generator. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
