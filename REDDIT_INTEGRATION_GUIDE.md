# Reddit User Data Integration Guide

## Overview

I've successfully implemented Reddit user data integration for your Raid Day boss battle game. The system now fetches real Reddit usernames and avatars for the leaderboard and activity feed, providing a more authentic Reddit experience.

## What's Been Implemented

### 1. Reddit User Service (`src/server/core/reddit-user.ts`)

A comprehensive service that handles:
- **User Data Fetching**: Gets Reddit usernames and avatars from Reddit's API
- **Caching**: 5-minute cache to reduce API calls and improve performance
- **Batch Processing**: Efficiently fetches multiple users for leaderboards
- **Fallback Handling**: Graceful degradation when Reddit API is unavailable
- **Current User Detection**: Special handling for the current Devvit user

### 2. Enhanced Community Manager (`src/server/core/community.ts`)

Updated to use real Reddit data:
- **Real Leaderboard**: Integrates actual player data with Reddit usernames/avatars
- **Recent Attackers**: Shows real Reddit users who recently attacked
- **Batch Optimization**: Uses efficient batch fetching for better performance

### 3. Server Integration (`src/server/index.ts`)

Enhanced API endpoints:
- **User Mapping**: Stores userId -> username mappings when users interact
- **Attack Tracking**: Records attacks with Reddit user context
- **Automatic Integration**: Seamlessly integrates Reddit data into all responses

## Key Features

### ✅ Reddit API Integration
- Fetches user data from `https://www.reddit.com/user/{username}/about.json`
- Extracts avatars from multiple Reddit API fields
- Handles API rate limits and failures gracefully

### ✅ Performance Optimized
- 5-minute caching reduces redundant API calls
- Batch processing for leaderboards (processes 5 users at a time)
- Fallback data ensures UI never breaks

### ✅ Type Safe
- Full TypeScript integration with proper type definitions
- Handles optional avatar URLs correctly
- Strict type checking for all Reddit data

### ✅ Error Resilient
- Graceful fallback when Reddit API is unavailable
- Timeout protection (5-second limit per request)
- Comprehensive error logging for debugging

## API Usage Examples

### Leaderboard with Reddit Data
```typescript
// GET /api/live-leaderboard
{
  "status": "success",
  "leaderboard": [
    {
      "userId": "user123",
      "username": "DragonSlayer",
      "redditUsername": "u/DragonSlayer",
      "characterClass": "warrior",
      "level": 15,
      "sessionDamage": 25000,
      "totalDamage": 100000,
      "rank": 1,
      "avatarUrl": "https://www.redditstatic.com/avatars/avatar_default_02.png"
    }
  ],
  "currentUserRank": 5,
  "totalPlayers": 127,
  "lastUpdated": 1698765432000
}
```

### Recent Attackers with Reddit Data
```typescript
// GET /api/recent-attackers
{
  "status": "success",
  "recentAttackers": [
    {
      "userId": "user456",
      "username": "BossHunter99",
      "redditUsername": "u/BossHunter99",
      "characterClass": "mage",
      "level": 12,
      "damage": 1250,
      "timestamp": 1698765430000,
      "avatarUrl": "https://www.redditstatic.com/avatars/default_avatar.png"
    }
  ],
  "lastUpdated": 1698765432000
}
```

## How It Works

### 1. User Mapping Storage
When users interact with the game (attack, select class, etc.), the system stores their userId -> Reddit username mapping:

```typescript
// Automatically called in attack/special-ability/select-class endpoints
if (context.username) {
  await RedditUserService.storeUserMapping(userId, context.username);
}
```

### 2. Reddit Data Fetching
The service fetches user data from Reddit's public API:

```typescript
const userData = await RedditUserService.getUserData(userId);
// Returns: { username, redditUsername, avatarUrl, isCurrentUser }
```

### 3. Batch Processing for Performance
For leaderboards, the system efficiently batches requests:

```typescript
const userIds = ['user1', 'user2', 'user3'];
const userDataMap = await RedditUserService.getBatchUserData(userIds);
```

## Configuration

### Reddit API Endpoints Used
- **User Data**: `https://www.reddit.com/user/{username}/about.json`
- **Avatar Fields**: `snoovatar_img`, `icon_img`, `subreddit.icon_img`

### Caching Strategy
- **Duration**: 5 minutes per user
- **Storage**: In-memory Map (could be moved to Redis for production)
- **Fallback**: Shorter cache (1 minute) for failed requests

### Error Handling
- **Timeout**: 5 seconds per Reddit API request
- **Fallback**: Generated usernames like "User1234" when Reddit API fails
- **Logging**: Comprehensive error logging for debugging

## Testing

The integration has been tested and works correctly:
- ✅ Batch user data fetching
- ✅ Individual user data fetching  
- ✅ Fallback mechanisms when Reddit API is unavailable
- ✅ Type safety and error handling
- ✅ Caching and performance optimization

## Next Steps

### Recommended Enhancements
1. **Redis Caching**: Move user cache to Redis for persistence across server restarts
2. **Avatar Optimization**: Implement image resizing/optimization for faster loading
3. **Rate Limiting**: Add more sophisticated rate limiting for Reddit API calls
4. **User Preferences**: Allow users to opt-out of avatar fetching for privacy

### Production Considerations
1. **Monitoring**: Add metrics for Reddit API success/failure rates
2. **Scaling**: Consider using Redis for user mapping storage
3. **Privacy**: Ensure compliance with Reddit's API terms and user privacy

## Files Modified

- ✅ `src/server/core/reddit-user.ts` - New Reddit user service
- ✅ `src/server/core/community.ts` - Enhanced with Reddit integration
- ✅ `src/server/index.ts` - Updated API endpoints
- ✅ `src/shared/types/api.ts` - Added Reddit user fields

The Reddit integration is now fully functional and ready for testing with `npm run dev`!