# ReelsApp

A React Native CLI application that provides an Instagram-style Reels experience with offline support.

## Features

* Full-screen vertical reels
* Auto play and pause videos
* Infinite scrolling
* Pagination using `nextCursor`
* Like & Unlike reels
* Offline support
* Offline Like/Unlike sync
* Pull to refresh
* Loading, Empty and Error screens

## Requirements

* Java JDK 17
* Android Studio
* Android SDK
* React Native CLI

## Installation

```bash
npm install
```

## Run the App

Start Metro:

```bash
npm start
```

Run Android:

```bash
npm run android
```

Run iOS:

```bash
npm run ios
```

## Build Release APK

```bash
cd android
.\gradlew assembleRelease
```

APK Location:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Tech Stack

* React Native CLI
* JavaScript
* Redux Toolkit
* Redux Persist
* React Navigation
* Axios
* AsyncStorage
* React Native Video
* FlashList

## Author

Vakada Manikanta
