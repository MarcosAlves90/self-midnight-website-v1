import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'HighNoon';
const DEFAULT_TITLE = 'HighNoon - Ficha Online';
const DEFAULT_DESCRIPTION = 'Ficha online para criar, gerenciar e evoluir personagens com skills, inventario, status e anotacoes.';
const DEFAULT_IMAGE = '/images/tmwLogo.png';

function upsertMetaTag(name, content, isProperty = false) {
    if (!content) return;
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let tag = document.querySelector(selector);
    if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) tag.setAttribute('property', name);
        else tag.setAttribute('name', name);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
    if (!href) return;
    let tag = document.querySelector(`link[rel="${rel}"]`);
    if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
}

export default function Seo({ title, description, image, noIndex = false }) {
    const location = useLocation();

    useEffect(() => {
        const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
        const pageDescription = description || DEFAULT_DESCRIPTION;
        const pageImage = image || DEFAULT_IMAGE;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const pageUrl = origin ? `${origin}${location.pathname}` : location.pathname;

        document.title = pageTitle;
        upsertMetaTag('description', pageDescription);
        upsertMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
        upsertLink('canonical', pageUrl);

        upsertMetaTag('og:type', 'website', true);
        upsertMetaTag('og:site_name', SITE_NAME, true);
        upsertMetaTag('og:title', pageTitle, true);
        upsertMetaTag('og:description', pageDescription, true);
        upsertMetaTag('og:url', pageUrl, true);
        upsertMetaTag('og:image', `${origin}${pageImage}`, true);

        upsertMetaTag('twitter:card', 'summary_large_image');
        upsertMetaTag('twitter:title', pageTitle);
        upsertMetaTag('twitter:description', pageDescription);
        upsertMetaTag('twitter:image', `${origin}${pageImage}`);
    }, [title, description, image, noIndex, location.pathname]);

    return null;
}
