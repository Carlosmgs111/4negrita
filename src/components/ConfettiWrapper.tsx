// src/components/ConfettiWrapper.jsx
import { useEffect, useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

export  const ConfettiWrapper = () => {
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    setIsExploding(true);
  }, []);

  return (
    <>
      {isExploding && (
        <ConfettiExplosion
          width={4000}
          height={'100vh'}
          particleCount={300}
          duration={5000}
          force={1}
        />
      )}
    </>
  );
}