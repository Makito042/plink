import { Award, Heart, Shield, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#004d00] text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About PharmaLink</h1>
          <p className="text-xl max-w-2xl">
            Your trusted partner in health and wellness, delivering quality pharmaceutical products
            right to your doorstep.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600">
                To make quality healthcare accessible to everyone by providing a reliable,
                convenient, and secure platform for purchasing pharmaceutical products online.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600">
                To become Nigeria's leading online pharmacy, recognized for our commitment to
                quality, accessibility, and customer care in healthcare delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-[#004d00]" />
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">Only verified and certified products</p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-[#004d00]" />
              <h3 className="text-xl font-semibold mb-2">Customer Care</h3>
              <p className="text-gray-600">Putting your health first</p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-[#004d00]" />
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">Maintaining highest standards</p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#004d00]" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Building healthier communities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'Chief Executive Officer',
                image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80',
              },
              {
                name: 'Dr. Michael Adebayo',
                role: 'Chief Medical Officer',
                image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80',
              },
              {
                name: 'Mrs. Aisha Okonkwo',
                role: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80',
              },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}