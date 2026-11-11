import React, { useState } from 'react';

export const PLACEHOLDER_IMAGE = '/event-placeholder.svg';

interface EventImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
}

export const EventImage: React.FC<EventImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
}) => {
  const [failed, setFailed] = useState(false);

  const resolved = failed || !src ? PLACEHOLDER_IMAGE : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => {
        if (!failed) setFailed(true);
      }}
      className={className}
    />
  );
};
