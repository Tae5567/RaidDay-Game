# Implementation Plan

- [x] 1. Set up simplified Phaser.js game foundation
  - Initialize Phaser 3.70+ configuration with 800x600 canvas
  - Create scene management: Boot, Splash, Battle, Results, Victory scenes
  - Set up TypeScript project structure focused on core gameplay
  - Configure Vite build system for Devvit integration
  - _Requirements: 1.1, 6.5_

- [x] 2. Implement core entity system with simplified mechanics
  - [x] 2.1 Create BossEntity class with basic animations
    - Load existing boss sprites from src/client/public/assets/sprites/ (boss_*.png files)
    - Implement daily boss rotation using all 7 available boss sprites
    - Add shared HP tracking (50,000 HP pool) and basic idle animations
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 2.2 Create PlayerCharacter class with attack animations
    - Load character sprites: warrior.png, mage.png, rogue.png, healer.png
    - Implement 4 character classes with similar damage output using existing sprites
    - Add attack animation sequence (run forward → attack → run back)
    - _Requirements: 5.1, 5.2, 7.3_

  - [ ]* 2.3 Write unit tests for entity systems
    - Test animation timing and sprite loading
    - Validate boss HP synchronization
    - _Requirements: 2.1, 5.2_

- [x] 3. Build session-based combat system
  - [x] 3.1 Implement SessionSystem for 2-minute gameplay
    - Create 2-minute session timer with attack counter
    - Track session damage and attack count (5-10 attacks per session)
    - Add session end summary and results display
    - _Requirements: 1.1, 1.4, 8.2_

  - [x] 3.2 Create simplified damage calculation system
    - Implement base damage ranges by class (minimal differences)
    - Add simple level scaling and random variance
    - Remove complex energy/cooldown mechanics
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 3.3 Build 0.8-second attack sequence animation
    - Create attack timeline: run forward (0.3s) → attack (0.2s) → run back (0.3s)
    - Add damage number popup and boss hit flash
    - Implement screen shake effects for impact
    - _Requirements: 1.2, 1.3, 7.1, 7.2_

  - [ ]* 3.4 Write unit tests for combat mechanics
    - Test damage calculation consistency
    - Validate session timing and attack limits
    - _Requirements: 1.1, 5.3_

- [x] 4. Build Splash Scene with boss preview
  - [x] 4.1 Create SplashScene with current boss display
    - Use castle_arena.png or background.png as scene background
    - Show current daily boss sprite with shared HP bar
    - Display "347 Fighters Active" community counter
    - Add large "FIGHT NOW!" button to enter battle
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 4.2 Implement boss HP visualization
    - Create HP bar showing current/max HP (e.g., "87,432 / 50,000")
    - Add percentage-based visual fill and color coding
    - Update HP display in real-time from server
    - _Requirements: 2.2, 2.3, 8.1_

  - [ ] 4.3 Write tests for splash scene functionality
    - Test HP bar updates and boss display
    - Validate community counter accuracy
    - _Requirements: 2.1, 3.1_

- [x] 5. Build Battle Scene with core attack loop
  - [x] 5.1 Create BattleScene layout and UI
    - Use castle_arena.png as battle background
    - Display current boss sprite at top with HP bar
    - Show player's selected character sprite at bottom with attack button
    - Create session info display (attacks left, current damage)
    - _Requirements: 1.1, 1.2, 8.2_

  - [x] 5.2 Implement attack button and visual feedback
    - Create large, responsive attack button for mobile
    - Add button press animations and immediate feedback
    - Implement attack cooldown prevention (no spam clicking)
    - _Requirements: 6.1, 6.4, 7.1_

  - [x] 5.3 Build damage number system
    - Create floating damage numbers that pop above boss
    - Add "YOUR damage: +234" styling to distinguish player damage
    - Implement number animation (scale up, fade out, move up)
    - _Requirements: 8.1, 7.2, 7.4_

- [x] 6. Build Results Scene and session summary
  - [x] 6.1 Create ResultsScene for session completion
    - Display "Session Complete!" message with total damage dealt
    - Show current boss HP remaining and percentage defeated
    - Add player rank display (e.g., "Your rank: #23")
    - _Requirements: 1.4, 8.2, 8.3_

  - [x] 6.2 Implement session sharing functionality
    - Add "Share to r/RaidDay" button for Reddit posting
    - Create session summary comment template
    - Add "Fight Again" button to return to splash
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ]* 6.3 Write tests for results and sharing
    - Test session summary calculations
    - Validate Reddit integration functionality
    - _Requirements: 1.4, 4.1_

- [x] 7. Implement real-time community features
  - [x] 7.1 Create Live Activity Feed
    - Show scrolling ticker of recent attacks: "u/Player1 dealt 234 damage (5s ago)"
    - Update feed every 5 seconds with last 10 attacks
    - Display real Reddit usernames and damage amounts
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 7.2 Build Live Leaderboard system
    - Create top 10 leaderboard updated every 10 seconds
    - Highlight current player's rank with special styling
    - Show username, total damage, and current rank
    - _Requirements: 3.1, 3.4, 3.5_

  - [x] 7.3 Implement server synchronization
    - Create API endpoints for real-time data (boss HP, leaderboard, recent attacks)
    - Sync boss HP every 10 seconds to maintain accuracy
    - Add community stats tracking (active fighters count)
    - _Requirements: 2.3, 3.1, 3.2_

  - [ ]* 7.4 Write integration tests for community features
    - Test real-time data synchronization
    - Validate leaderboard accuracy and updates
    - _Requirements: 3.1, 3.2_

- [x] 8. Build server-side game logic and Redis data
  - [x] 8.1 Implement boss management system
    - Create daily boss rotation with 7 themed bosses
    - Set up Redis schema for shared boss HP (50,000)
    - Add boss state persistence and daily reset at 8 AM
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 8.2 Create player data management
    - Implement player stats tracking (class, level, total damage)
    - Add session damage tracking and leaderboard updates
    - Create Redis sorted sets for daily leaderboards
    - _Requirements: 3.1, 3.4, 8.3_

  - [x] 8.3 Build core API endpoints
    - Create POST /api/attack endpoint for damage processing
    - Implement GET /api/gameState for boss HP and player stats
    - Add GET /api/recentAttacks for activity feed
    - Add GET /api/leaderboard for top 10 rankings
    - _Requirements: 1.1, 2.3, 3.2_

  - [ ]* 8.4 Write API validation tests
    - Test attack processing and HP updates
    - Validate leaderboard accuracy and Redis operations
    - _Requirements: 2.2, 3.1_

- [x] 9. Build victory sequence and Reddit integration
  - [x] 9.1 Create VictoryScene with boss defeat celebration
    - Implement boss death animation and victory screen
    - Add "VICTORY!" message and celebration effects
    - Display final leaderboard with top contributors
    - _Requirements: 1.5, 8.4_

  - [x] 9.2 Implement automatic Reddit post creation
    - Create victory post when boss HP reaches 0: "🎉 r/RaidDay defeated [Boss Name]!"
    - Tag top 3 contributors in the victory post
    - Add full leaderboard as comment on victory post
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 9.3 Add next boss preview system
    - Show tomorrow's boss preview after victory
    - Display countdown timer to next boss (8 AM daily reset)
    - Create anticipation for next day's battle
    - _Requirements: 2.5, 8.4_

  - [ ]* 9.4 Write tests for victory and Reddit integration
    - Test victory conditions and post creation
    - Validate leaderboard accuracy in victory posts
    - _Requirements: 4.3, 4.4_

- [x] 10. Add mobile optimization and visual polish
  - [x] 10.1 Implement mobile-responsive design
    - Optimize layout for mobile portrait mode (primary Reddit usage)
    - Create large, touch-friendly attack buttons (60x60 minimum)
    - Scale game canvas to fit mobile screens while maintaining aspect ratio
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 10.2 Add visual effects and screen juice
    - Implement screen shake effects proportional to damage dealt
    - Add particle effects for attacks (limited to 10 particles on mobile)
    - Create smooth entrance animations for boss and player
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 10.3 Optimize performance for mobile devices
    - Add frame rate monitoring and automatic quality adjustment
    - Implement object pooling for damage numbers and particles
    - Create fallback systems for low-performance devices
    - _Requirements: 6.3, 6.4_

  - [ ]* 10.4 Write performance and mobile tests
    - Test mobile responsiveness across different screen sizes
    - Validate frame rate performance on low-end devices
    - _Requirements: 6.1, 6.3_

- [ ] 11. Final integration and error handling
  - [ ] 11.1 Implement comprehensive error handling
    - Add network failure recovery with retry mechanisms
    - Create sprite loading fallbacks (colored shapes if assets fail)
    - Implement graceful degradation for API timeouts
    - _Requirements: All requirements (error resilience)_

  - [x] 11.2 Add final polish and smooth transitions
    - Ensure no black loading screens between scenes
    - Fine-tune all animation timings for satisfying feel
    - Add loading indicators and smooth scene transitions
    - _Requirements: 7.3, 7.4, 7.5_

- [ ]* 12. Create comprehensive test suite
  - Write end-to-end tests for complete 2-minute battle sessions
  - Test Reddit integration and post creation functionality
  - Validate shared HP synchronization across multiple players
  - _Requirements: All requirements (quality assurance)_