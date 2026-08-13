import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | SpeedX',
  description: 'Get in touch with us.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea rows={5} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200"></textarea>
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl">
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}
