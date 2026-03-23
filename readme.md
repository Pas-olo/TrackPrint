# 📊 TrackPrint

A personal travel diary to track the countries you visit, the distances you travel, and the carbon footprint of your journeys.

Data is stored **locally on your device** and never sent to any server.

<div align="center">

[![Download](https://img.shields.io/github/v/release/Pas-olo/TravelPrint?label=⬇️%20Download%20APK&style=for-the-badge&color=2ea44f)](https://github.com/Pas-olo/TravelPrint/releases/latest)
&nbsp;
[![Try the web demo](https://img.shields.io/badge/🌐%20Web%20demo-live-blue?style=for-the-badge)](https://pasolo.pythonanywhere.com/)
&nbsp;
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

## 📱 Get TravelPrint

1. **Android:** Download and install the APK from the [Releases](https://github.com/Pas-olo/TravelPrint/releases) page. Open it and follow the instructions.  
2. **iOS / Web:** Open [TravelPrint Web](https://pasolo.pythonanywhere.com/) in Safari → tap **Share** → select **Add to Home Screen**. It works like a normal app!  

> ⚠️ Note: On iOS, data is stored in the browser cache and **may be cleared by the system**. Make sure to back up your data regularly using the "Export Data" feature.

## Screenshots
<div align="center">
<img src="assets/home.png" width="180"> <img src="assets/stats.png" width="180"> <img src="assets/table.png" width="180"> <img src="assets/add.png" width="180">
</div>

## Features

- **📅 Travel diary** — log stays by country with start/end dates
- **🚗 Transport tracking** — record trips by plane, train, car, bus, boat, bike and more
- **☁️ Carbon footprint** — CO2e emissions calculated per trip using DEFRA 2025 factors
- **🗺️ World map** — visualize all the countries you've visited
- **📊 Stats & charts** — yearly overview: days on the road, total km, emissions, country streaks
- **📋 Log view** — browse all your entries month by month
- **💾 Export / Import** — back up and restore your data as a `.json` file
- **📱 Works offline** — no account, no server, all data stays on your device

## CO2 methodology

All emission factors are in **kgCO2e/km** and include upstream emissions. 
Full methodology is available in the app under **Data → Methodology**.

## Install

**Android** — download the latest APK from [GitHub Releases](https://github.com/Pas-olo/TravelPrint/releases/latest) and install it on your device.
> You may need to allow installation from unknown sources in your Android settings.

**Web** — try the live demo at [pasolo.pythonanywhere.com](https://pasolo.pythonanywhere.com/) (no install needed).

## Build from source

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Capacitor CLI](https://capacitorjs.com/docs/getting-started)
- Android Studio (for Android builds)

### Steps

```bash
git clone https://github.com/Pas-olo/TrackPrint.git
cd TravelPrint

npm install

# Sync web assets to the native project
npx cap sync android

# Open in Android Studio and build the APK
npx cap open android
```

The raw web app (no Capacitor) can also be run directly by opening `src/index.html` in a browser.

## License

MIT — see [LICENSE](LICENSE)

*Borders, flags, and map data are based on available source files and libraries, and do not reflect any political stance or militant viewpoint.*

Paolo Sévègnes · MIT License