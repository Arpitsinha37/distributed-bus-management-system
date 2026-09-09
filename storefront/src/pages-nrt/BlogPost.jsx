import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, MessageCircle, Share2 } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import ShareButtons from '../components/nrt/ShareButtons';
import api from '../lib/api';
import { getImageUrl } from '../lib/utils';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';
const getReadTime = (html) => {
    const words = stripHtml(html).split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
};

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getBlogBySlug(slug).then(data => setPost(data))
            .catch(() => setPost(null))
            .finally(() => setLoading(false));
    }, [slug]);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (loading) {
        return <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center text-slate-500">Loading article...</div>;
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h2>
                    <p className="text-slate-600 mb-6">The blog post you're looking for doesn't exist.</p>
                    <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-nepal-red text-white font-semibold rounded-xl hover:bg-red-700 transition-colors no-underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const seoDescription = post.seoDescription || stripHtml(post.content).substring(0, 155) + '...';

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <SEOHead
                title={post.seoTitle || post.title}
                description={seoDescription}
                path={`/blog/${slug}`}
                image={post.image ? getImageUrl(post.image) : undefined}
                type="article"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": post.seoTitle || post.title,
                    "description": seoDescription,
                    "image": post.image ? getImageUrl(post.image) : "https://www.newroadtravels.com/og-default.png",
                    "datePublished": post.createdAt,
                    "dateModified": post.updatedAt || post.createdAt,
                    "author": {
                        "@type": "Organization",
                        "name": post.author?.name || "New Road Travels",
                        "url": "https://www.newroadtravels.com"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "New Road Travels",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.newroadtravels.com/nrt-logo.png"
                        }
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://www.newroadtravels.com/blog/${slug}`
                    }
                }}
            />
            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/" className="hover:text-nepal-red transition-colors no-underline text-slate-500">Home</Link>
                        <span>/</span>
                        <Link to="/blog" className="hover:text-nepal-red transition-colors no-underline text-slate-500">Blog</Link>
                        <span>/</span>
                        <span className="text-slate-900 font-medium truncate">{post.title}</span>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden">
                {post.image ? (
                    <img src={getImageUrl(post.image)} alt={post.altText || post.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
                    <span className="bg-nepal-red text-white px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">{post.category || 'Article'}</span>
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 font-serif">{post.title}</h1>
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {getReadTime(post.content)}</span>
                        {post.author && <span className="flex items-center gap-1 ml-2">By {post.author.name}</span>}
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
                    <article
                        className="prose prose-slate max-w-none prose-img:rounded-xl prose-a:text-nepal-red"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* Share & Actions */}
                <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-xl border border-slate-100">
                    <Link to="/blog" className="flex items-center gap-2 text-slate-600 hover:text-nepal-red transition-colors font-medium no-underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigator.share?.({ title: post.title, url: shareUrl }).catch(() => { })}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 transition-colors">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <a href="https://wa.me/9779856068470" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm text-white transition-colors no-underline">
                            <MessageCircle className="w-4 h-4" /> Book Now
                        </a>
                    </div>
                </div>
            </div>

            <ShareButtons
                url={`https://www.newroadtravels.com/blog/${post?.slug || ''}`}
                title={`${post?.title || 'Blog'} | New Road Travels`}
            />
        </div>
    );
};

export default BlogPost;


