# Nelson Test App
This is a test application for Nelson Cabinetry LLC. The app features two GLB models, each with its own independent gizmos for X, Y, and Z movement. Users can interact with both models in 3D and 2D views, adjusting position and rotation using sliders. All movements and rotations are debounced, and changes are automatically saved to Firebase once the interaction stops.

# How to run locally

## Clone repo
First you have to clone this repo to your PC. 

## Create .env file
Create .env file in root of your project and paste these variables. You will need to generate your own unique values in the Firebase console.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_MEASUREMENT_ID=...
```

## Open terminal
Run
```bash
npm install
```
And then run
```bash
npm run dev
```

Here is the link of my hosted test app [Nelson-Test-App](https://6915128b9c728c73df4d57a6--nelson-test-app.netlify.app/)





