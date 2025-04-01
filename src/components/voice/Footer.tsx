
import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="mt-8 text-center text-sm text-iceland-darkGray">
      <p>Reykjavíkurborg Digital Assistant</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} Reykjavíkurborg - Öll réttindi áskilin</p>
    </div>
  );
};

export default Footer;
