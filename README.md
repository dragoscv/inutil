# [Next.js Example](https://www.nextjs.org/)

<p>
  <!-- Web -->
  <img alt="Supports Expo Web" longdesc="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
</p>

Using Next.js with Expo will enable you to [server side render](https://nextjs.org/features/server-side-rendering) the web part of your Expo app. This demo shows you how to setup your universal application to use use advanced universal modules from the Expo SDK like Camera, Gestures, Permissions, etc... with the Next.js tool-chain!

> 🚨 SSR is an experimental feature with Expo so modules might not be fully optimized for Next.js. If you find bugs please report them on the [Expo repo](https://github.com/expo/expo/issues) or [expo-cli repo](https://github.com/expo/expo-cli/issues) with the `[nextjs]` tag in the title.

### ⚽️ Running in the browser

For the most updated guide you should refer to the Expo docs: [Using Next.js](https://docs.expo.dev/versions/latest/guides/using-nextjs/). Here are the [latest docs on master](https://github.com/expo/expo/blob/master/docs/pages/guides/using-nextjs.md).

In this approach you would be using SSR for web in your universal project. This is the recommended path because it gives you full access to the features of Expo and Next.js.


- Edit file `firebase.config.js` with your Firebase Config
- Download Expo Go on your Phone

- **Starting Android or iOS with Expo Go**
  - ✅ `yarn next dev` and scan the QR Code from Expo Go (for iOS you would need to sign in into your expo account)

- **Starting web**
  - 🚫 `expo start:web`
  - ✅ `yarn next dev`

### 👀 More Info

- [Next Adapter repo](https://github.com/expo/expo-cli/tree/master/packages/next-adapter)
