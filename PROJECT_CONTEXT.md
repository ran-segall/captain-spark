# Captain Spark - Project Context

## 🚀 What is Captain Spark?

Captain Spark is an educational app designed for children, featuring interactive video content, personalized onboarding experiences, and engaging learning activities. The app prioritizes mobile performance, smooth video playback, and child-friendly user experiences.

## 🎯 Core Mission

To create an engaging, educational platform that makes learning fun and accessible for children through:
- High-quality video content with seamless playback
- Personalized onboarding experiences
- Interactive learning activities
- Mobile-optimized performance
- Child-safe content and privacy

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19+** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router** for navigation and routing
- **CSS Modules** for component styling
- **Service Workers** for video caching and offline support

### Backend & Services
- **Supabase** for database and authentication
- **ElevenLabs** for text-to-speech audio generation
- **Vercel** for hosting and deployment

### Key Libraries
- `@supabase/supabase-js` - Backend data management
- `react-router-dom` - Client-side routing
- `uuid` - Unique identifier generation

**Current Dependencies:**
- `@supabase/supabase-js` - Backend data management and authentication
- `react` - UI library for building user interfaces
- `react-dom` - React rendering for web
- `react-router-dom` - Client-side routing for React
- `uuid` - Unique identifier generation

## 🎮 Core Features

### 1. Video Preloading System
- **Purpose**: Ensures smooth video playback on mobile devices
- **Implementation**: Custom React hooks and service worker caching
- **Key Benefits**: 
  - 50-80% faster video start times on mobile
  - Reduced buffering through aggressive preloading
  - Better caching with service worker
  - Smoother transitions between video screens

### 2. Onboarding Flow
- **Purpose**: Collect user information and personalize the experience
- **Steps**: Intro → Video Intro → Parent Name → Kid Name → Kid Age → Email → Personal Welcome → Ready → Confirm
- **Features**:
  - Progress tracking
  - Form validation
  - Data persistence
  - Personalized content generation

### 3. Audio Integration
- **Purpose**: Provide text-to-speech functionality for accessibility
- **Implementation**: ElevenLabs API integration
- **Features**: Dynamic audio generation, error handling, mobile optimization

## 📁 Project Structure

```
captain-spark/
  - src/
    - components/
      - Button.tsx
      - OnboardingProgressBar.tsx
      - ProgressBar.tsx
      - ScreenLayout.tsx
      - VideoPlayer.tsx
      - ... (1 more files)
    - pages/
      - Confirm.tsx
      - Email.tsx
      - Intro.tsx
      - KidAge.tsx
      - KidName.tsx
      - ... (4 more files)
    - hooks/
      - useVideoPreloader.ts
    - utils/
      - elevenlabsClient.ts
      - saveUser.ts
      - supabaseClient.ts
      - videoPaths.ts
      - videoPreloader.ts
  - public/
    - videos/
      - Onbaording-Welcome-No-names.mp4
      - Onboarding-1-HB.mp4
    - images/
      - back-icon-blue.svg
      - back-icon-video.svg
      - captain-intro.jpg
      - ... (1 more files)
    - audio/
      - Buddy-audio.mp3
      - Your-child.mp3

```

## 🎨 Design System

### Visual Identity
- **Target Audience**: Children and their parents
- **Design Style**: Playful, engaging, and child-friendly
- **Color Palette**: Bright, vibrant colors that appeal to children
- **Typography**: Clear, readable fonts suitable for all ages

### UI Components
- **Buttons**: Large touch targets, clear visual feedback
- **Forms**: Simple, step-by-step progression
- **Progress Indicators**: Visual feedback for loading states
- **Video Player**: Optimized for mobile viewing

## 🚀 Performance Requirements

### Mobile Optimization
- **Video Start Time**: < 2 seconds on mobile devices
- **App Load Time**: < 3 seconds initial load
- **Animation Performance**: 60fps smooth animations
- **Touch Response**: Immediate feedback on interactions

### Video Performance
- **Preloading**: Critical videos loaded on app start
- **Caching**: Service worker for persistent video storage
- **Progressive Loading**: Large videos loaded in chunks
- **Error Handling**: Graceful fallbacks for network issues

## 🔒 Privacy & Security

### Data Collection
- **Minimal Data**: Only collect necessary information
- **Child Privacy**: Follow COPPA guidelines
- **Parental Consent**: Clear consent mechanisms
- **Data Security**: Secure API endpoints and data storage

### Content Safety
- **Child-Appropriate**: All content reviewed for age-appropriateness
- **Content Filtering**: Automated and manual content review
- **Parental Controls**: Options for content restrictions
- **Reporting**: Mechanisms for inappropriate content

## 🛠️ Development Workflow

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit validation

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Onboarding flow testing
- **Performance Tests**: Video loading and playback testing
- **Mobile Testing**: Real device testing on various platforms

### Deployment
- **Environment**: Vercel for hosting
- **CI/CD**: Automated testing and deployment
- **Monitoring**: Performance and error tracking
- **Backup**: Regular data backups

## 📊 Success Metrics

### User Engagement
- **Onboarding Completion Rate**: Target > 80%
- **Video Playback Success Rate**: Target > 95%
- **Session Duration**: Average session length
- **Return User Rate**: Daily/weekly active users

### Technical Performance
- **Video Load Time**: Average time to start playback
- **App Performance Score**: Lighthouse metrics
- **Error Rate**: Percentage of failed operations
- **Cache Hit Rate**: Service worker effectiveness

### Business Metrics
- **User Acquisition**: New user signups
- **Retention**: User return rates
- **Satisfaction**: User feedback and ratings
- **Growth**: Month-over-month user growth

## 🔮 Future Roadmap

### Phase 1: Core Platform (Current)
- ✅ Video preloading system
- ✅ Onboarding flow
- ✅ Basic user management
- ✅ Mobile optimization

### Phase 2: Content & Features
- 📋 Expanded video library
- 📋 Interactive learning activities
- 📋 Progress tracking
- 📋 Parent dashboard

### Phase 3: Advanced Features
- 📋 AI-powered personalization
- 📋 Social features (parent communities)
- 📋 Advanced analytics
- 📋 Multi-language support

### Phase 4: Scale & Monetization
- 📋 Subscription model
- 📋 Premium content
- 📋 Enterprise features
- 📋 International expansion

## 🤝 Team & Collaboration

### Development Team
- **Frontend Developers**: React/TypeScript expertise
- **Backend Developers**: Supabase and API development
- **Designers**: UI/UX for children's applications
- **QA Engineers**: Mobile testing and performance validation

### Key Stakeholders
- **Product Manager**: Feature prioritization and roadmap
- **Content Team**: Educational content creation
- **Marketing**: User acquisition and growth
- **Legal**: Privacy and compliance

## 📚 Resources & Documentation

### Technical Documentation
- `docs/VIDEO_PRELOADING.md` - Video system implementation
- `README.md` - Project setup and development
- `.cursorrules` - AI assistant guidelines
- API documentation for external services

### Design Resources
- Design system documentation
- Component library
- Brand guidelines
- Accessibility standards

### Development Resources
- Development environment setup
- Testing guidelines
- Deployment procedures
- Performance monitoring

---

*This document serves as the single source of truth for understanding the Captain Spark project, its goals, architecture, and development guidelines.* 

*Last updated: 2025-07-09*