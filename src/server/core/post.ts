import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Raid Day splash screen customization
      appDisplayName: 'Raid Day',
      backgroundUri: 'castle_arena.png',
      buttonLabel: 'Join Battle',
      description: 'Unite with the community to defeat today\'s boss!',
      heading: 'Raid Day',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'Raid Day - Community Boss Battle',
  });
};
