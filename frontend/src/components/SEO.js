import { useEffect } from 'react';

const SEO = ({
  title = 'UrbanBazaar',
  description = '',
  keywords = '',
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      let descTag = document.querySelector('meta[name="description"]');

      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }

      descTag.setAttribute('content', description);
    }

    if (keywords) {
      let keywordsTag = document.querySelector('meta[name="keywords"]');

      if (!keywordsTag) {
        keywordsTag = document.createElement('meta');
        keywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsTag);
      }

      keywordsTag.setAttribute('content', keywords);
    }
  }, [title, description, keywords]);

  return null; 
};

export default SEO;
