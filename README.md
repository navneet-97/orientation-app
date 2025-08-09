# Orientation-Based Mobile App

A mobile-friendly web application that detects how a user is holding their mobile device and displays different features based on orientation.

## Features

### Orientation-Based Features:
- **Portrait Mode (Upright)** – Alarm Clock
- **Landscape Mode (Right-Side Up)** – Stopwatch  
- **Portrait Mode (Upside Down)** – Timer
- **Landscape Mode (Right-Side Up)** – Weather of the Day

## Key Requirements Met

✅ **Mobile-first design** - Responsive, touch-friendly interface  
✅ **Seamless orientation transitions** - Smooth animations between orientations  
✅ **Browser-based** - Runs entirely in the browser, no native app required  
✅ **Cross-platform compatibility** - Works on Android and iOS devices  
✅ **Weather API integration** - Uses OpenWeatherMap free tier API  

## Technologies Used

- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **OpenWeatherMap API** - Free weather data
- **PWA Support** - Progressive Web App capabilities

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Yarn or npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm build
```

## How to Use

1. **Open the app on your mobile device** (or use browser dev tools mobile view)
2. **Rotate your device** to see different features:
   - **Hold upright** → Alarm Clock
   - **Rotate to landscape** → Stopwatch
   - **Flip upside down** → Timer
   - **Rotate to landscape (other side)** → Weather

## Features Breakdown

### Alarm Clock (Portrait Primary)
- Real-time clock display
- Set custom alarm times
- Visual and audio alerts
- Easy-to-use touch interface

### Stopwatch (Landscape Primary)
- High-precision stopwatch
- Lap time recording
- Start/pause/reset controls
- Lap history display

### Timer (Portrait Secondary)
- Custom countdown timer
- Visual progress bar
- Minutes and seconds input
- Completion alerts

### Weather (Landscape Secondary)
- Current weather conditions
- Location-based weather data
- Detailed weather metrics
- Sunrise/sunset times

## Mobile Optimizations

- **Touch-friendly buttons**
- **Prevented zoom on input focus**
- **Full-screen experience**
- **Orientation lock support**
- **PWA installation capability**
- **Offline-ready design**

## Browser Compatibility

- ✅ Chrome (Android)
- ✅ Safari (iOS)
- ✅ Firefox (Android)
- ✅ Samsung Internet
- ✅ Edge (Windows)

## API Keys

The weather feature uses OpenWeatherMap API. The current API key is included for demonstration, but for production use, you should:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add your API key in .env file

## License

This project is open source and available under the MIT License.
