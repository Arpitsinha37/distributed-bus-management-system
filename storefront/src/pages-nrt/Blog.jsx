import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';
import { BackgroundPaths } from '../components/nrt/ui/background-paths';
import { getImageUrl } from '../lib/utils';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';
const getExcerpt = (html, length = 150) => {
    const text = stripHtml(html);
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
};
const getReadTime = (html) => {
    const words = stripHtml(html).split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
};

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.getBlogs().then(data => {
            if (Array.isArray(data)) setPosts(data);
        }).catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const categories = ['all', ...new Set(posts.map(p => p.category).filter(Boolean))];

    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stripHtml(post.content)?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPosts = posts.slice(0, 2);

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <SEOHead
                title="Travel Blog - Nepal Travel Tips & Guides"
                description="Explore Nepal travel guides, tips, route information & stories from the roads. Plan your perfect trip with insights from New Road Travels."
                path="/blog"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "Blog",
                    "name": "New Road Travels Blog",
                    "description": "Nepal travel guides, tips, route information and stories from the roads.",
                    "url": "https://www.newroadtravels.com/blog",
                    "publisher": { "@type": "Organization", "name": "New Road Travels", "url": "https://www.newroadtravels.com" }
                }}
            />
            {/* Hero */}
            <BackgroundPaths title="Travel Blog" subtitle="Our Stories" buttonText="Read Our Stories" />

            {loading ? (
                <div className="py-20 text-center text-slate-500">Loading articles...</div>
            ) : (
                <>
                    {/* Featured Posts */}
                    {selectedCategory === 'all' && !searchQuery && featuredPosts.length > 0 && (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {featuredPosts.map(post => (
                                    <Link key={post.id} to={`/blog/${post.slug}`}
                                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group border border-slate-100 no-underline">
                                        <div className="relative h-56 overflow-hidden">
                                            {post.image ? (
                                                <img src={getImageUrl(post.image)} alt={post.altText || post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200" />
                                            )}
                                            <div className="absolute top-4 left-4 bg-nepal-red text-white px-3 py-1 rounded-full text-xs font-bold">
                                                Featured
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <span className="text-nepal-red text-xs font-bold uppercase tracking-wider">{post.category || 'Article'}</span>
                                            <h2 className="text-xl font-bold text-slate-900 mt-2 mb-3 group-hover:text-nepal-red transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{getExcerpt(post.content)}</p>
                                            <div className="flex items-center text-xs text-slate-400 gap-4">
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {getReadTime(post.content)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Search + Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4 mb-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search articles..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-nepal-red/30 focus:border-nepal-red shadow-sm"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === cat
                                            ? 'bg-nepal-red text-white shadow-md'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                            }`}>
                                        {cat === 'all' ? 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Posts Grid */}
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-20">
                                <Search className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900">No articles found</h3>
                                <p className="text-slate-500">Try a different search or category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Exclude featured if on all/no-search */}
                                {filteredPosts.filter(p => !(!searchQuery && selectedCategory === 'all' && featuredPosts.some(fp => fp.id === p.id))).map(post => (
                                    <Link key={post.id} to={`/blog/${post.slug}`}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-slate-100 flex flex-col no-underline">
                                        <div className="relative h-48 overflow-hidden">
                                            {post.image ? (
                                                <img src={getImageUrl(post.image)} alt={post.altText || post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200" />
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                                                {post.category || 'Article'}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-nepal-red transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{getExcerpt(post.content)}</p>
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}</span>
                                                <span className="flex items-center gap-1 text-nepal-red font-semibold">
                                                    Read More <ArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Newsletter CTA */}
            <div className="bg-white py-12 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Stay Updated</h2>
                    <p className="text-slate-600 mb-6">Get the latest travel tips and route updates delivered to your inbox.</p>
                    <a href="https://wa.me/9779856068470?text=Hello%2C%20I%20want%20to%20stay%20updated%20on%20travel%20deals" target="_blank" rel="noopener noreferrer"
                        className="px-8 py-3 bg-nepal-red text-white font-bold rounded-full hover:bg-red-700 transition-colors inline-block no-underline">
                        Subscribe via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Blog;


