# CheckBill 💸

A web application designed to help you split bills and share expenses with friends quickly and effortlessly. It features an automated receipt scanning system using OCR, and it can generate PromptPay QR codes for instant payments!

## ✨ Features

- 🧑‍🤝‍🧑 **Groups & People Management:** Easily create groups and add friends to track everyone's share of the expenses.
- 🧾 **OCR Receipt Scanner:** Automatically read and process receipt items using `tesseract.js` to simplify data entry.
- 💸 **PromptPay QR Code Generation:** Instantly generate PromptPay QR codes based on the exact split amounts, allowing friends to scan and pay immediately.
- 🔗 **Share Results:** Share a summary link directly via URL or QR Code.
- 📱 **PWA Support (Progressive Web App):** Install the application on your smartphone or tablet for a native app-like experience.

## 🛠️ Tech Stack

- **Frontend:** Vue 3 (Composition API) + Vite
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **OCR:** tesseract.js
- **Utilities:** lz-string, promptpay-qr, qrcode

## 🚀 Project Setup

**1. Install Dependencies**

```sh
npm install
```

**2. Compile and Hot-Reload for Development**

```sh
npm run dev
```

**3. Compile and Minify for Production**

```sh
npm run build
```

## 🌐 Demo

Check out the live demo: [https://satjawat.com/check-bill/](https://satjawat.com/check-bill/)
