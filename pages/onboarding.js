import React from 'react';
import Head from 'next/head';

const Onboarding = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <title>Collective Partners</title>
        <script async src="https://tally.so/widgets/embed.js"></script>
        <style type="text/css">
          {`
            html { margin: 0; height: 100%; overflow: hidden; }
            iframe { position: absolute; top: 0; right: 0; bottom: 0; left: 0; border: 0; }
          `}
        </style>
      </Head>
      <iframe 
        data-tally-src="https://tally.so/r/mB8Pb1" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        marginheight="0" 
        marginwidth="0" 
        title="Collective Partners">
      </iframe>
      <span className='cache'></span>
    </div>
  );
};

export default Onboarding;