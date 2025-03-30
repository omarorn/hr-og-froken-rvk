
// Configuration for OpenAI edge functions
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Choose regions that are closest to your users
  unstable_allowDynamic: [
    // This option allows us to provide unrestricted dynamic imports
    // in the edge runtime.
    '*',
  ],
};
