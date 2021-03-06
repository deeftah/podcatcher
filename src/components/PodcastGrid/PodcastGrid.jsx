import React, {
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import localForage from 'localforage';
import strings from '../../libs/language';
import './PodcastGrid.css';

function PodcastGrid({ podcasts }) {
  const [offlinePodcasts, setOfflinePodcasts] = useState([]);

  useEffect(() => {
    if (offlinePodcasts.length > 0) return;
    localForage
      .keys()
      .then((keys) => {
        setOfflinePodcasts(
          keys
            .filter(key => /\/api\/podcast\/\d+$/.test(key))
            .map(key => key.split('/').slice(-1)[0]),
        );
      });
  }, [offlinePodcasts]);

  useEffect(() => {
    function onImageLoad(e) {
      const image = e.target;
      image.className += ' podcast-link-item__img--loaded';
    }

    const observerCallback = (entries) => {
      entries
        .forEach(({
          intersectionRatio,
          target,
        }) => {
          const image = target;
          if (image.src || intersectionRatio <= 0) return;
          image.onload = onImageLoad;
          image.setAttribute('src', image.getAttribute('data-src'));
        });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    Array.from(
      document
        .querySelectorAll('.podcast-link-grid .podcast-link-item__img'),
    )
      .forEach($img => observer.observe($img));

    return () => observer.disconnect();
  }, [podcasts]);

  return (
    <div className="podcast-link-grid">
      {
        podcasts
          .map(({
            id,
            name,
            artworkUrl100,
          }) => (
            <Link
              key={id}
              to={`/${id}`}
              className={`podcast-link-item
                ${offlinePodcasts.indexOf(id) > -1 ? 'podcast-link-item--cached' : ''}
              `}
            >
              <img
                className="podcast-link-item__img"
                data-src={artworkUrl100}
                alt={name || strings.loading}
                aria-hidden
              />
              <div className="podcast-link-item__hidden-text">{name}</div>
            </Link>
          ))
      }
    </div>
  );
}

PodcastGrid.propTypes = {
  podcasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      artworkUrl100: PropTypes.string,
    }),
  ).isRequired,
};

export default PodcastGrid;
