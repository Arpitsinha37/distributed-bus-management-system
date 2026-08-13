import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | SpeedX',
  description: 'Learn more about our company.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto prose prose-red lg:prose-xl">
        <h1>About Us</h1>
        <p>Welcome to our platform. We are dedicated to providing the best intercity travel experience.</p>
        <h2>Our Mission</h2>
        <p>To connect people and places with safe, reliable, and comfortable transportation.</p>
        <h2>Our Vision</h2>
        <p>To become the leading digital platform for bus travel across the country.</p>
      </div>
    </main>
  );
}
