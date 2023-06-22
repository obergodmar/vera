import { Icon24ArrowUp } from '@vkontakte/icons';
import { IconButton } from '@vkontakte/vkui';

import { FC, memo, useEffect, useState } from 'react';

export const ScrollToTop: FC = memo(() => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(document.documentElement.scrollTop > 0);
    };

    onScroll();
    document.addEventListener('scroll', onScroll);
    return () => {
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        color: 'var(--vkui--color_text_secondary)',
        backgroundColor: 'var(--vkui--color_background_content)',
        borderRadius: '50%',
        boxShadow:
          '0px 0px 2px rgba(0,0,0,0.08), 0px 8px 24px rgba(0,0,0,0.08)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity .2s ease, transform .2s ease',
      }}
    >
      <IconButton
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Icon24ArrowUp />
      </IconButton>
    </div>
  );
});
