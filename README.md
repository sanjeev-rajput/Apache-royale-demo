# Apache Royale Demo: Enterprise-Grade Web Application Architecture

🚀 **Live Demo** → [https://sanjeev-rajput.github.io/Apache-royale-demo/](https://sanjeev-rajput.github.io/Apache-royale-demo/)

---

## 🔍 Overview

This is a live demonstration of a modular, component-driven web application built using **Apache Royale**, showcasing how it can be a powerful and maintainable alternative to mainstream frameworks like **Angular** and **React**, especially in large-scale enterprise environments.

---

## 🧱 Why Apache Royale?

Apache Royale is a powerful open-source framework for building cross-platform applications. Originally born from Apache Flex, it compiles ActionScript/MXML to JavaScript, giving developers the ability to:

- ✅ Write in structured, OOP-friendly syntax (like Java or C#)
- ✅ Compile to highly optimized, native JavaScript
- ✅ Maintain a **strong separation of concerns** (MVC/MVP patterns)
- ✅ Reuse code across desktop, mobile, and web targets

---

## 🆚 Royale vs Angular/React

| Feature                        | Apache Royale                     | Angular / React                   |
|-------------------------------|------------------------------------|-----------------------------------|
| **Architecture**              | Built-in separation (MXML/AS3)     | Needs boilerplate / conventions   |
| **Component Reusability**     | High (via MXML/AS)                 | High but JS-heavy                 |
| **Type Safety**               | Yes (AS3)                          | TypeScript (optional)             |
| **Learning Curve**            | Smooth for OOP/Java devs           | Requires mastering ecosystem      |
| **Performance**               | Optimized output via compiler      | Runtime-heavy                     |
| **Enterprise Maintainability**| Exceptional for large codebases    | Becomes complex with scale        |

---

## 🛠️ Tech Highlights in This Demo

- 🔌 Real-time WebSocket collaboration (Node.js backend)
- 💬 AI Chat powered by OpenRouter (LLM integration)
- 📄 Dynamic CSV rendering with pagination
- 🧩 Modular UI components using [Jewel](https://royale.apache.org/jewel) and Spectrum
- 🌐 Fully deployable on GitHub Pages and Render

---

## 📂 Source Structure (Highlights)
src/
├── actionitemviews/
│ ├── collaboration/ # Real-time message components
│ ├── ai/ # AI integrations (LLMs, vision)
│ └── websocket/ # SocketService for live sync
├── model/ # Config, Loaders, Constants
├── util/ # Reusable utility functions



---

## 🧪 Try It Yourself

Open the live app 👉 [https://sanjeev-rajput.github.io/Apache-royale-demo/](https://sanjeev-rajput.github.io/Apache-royale-demo/)

Features to explore:
- basic deawinig utilizing svg
- small game utilizing keyboard and mouse with hittest object
- independent component and syncing with each other
- small shopping cart app
- AI chat with selectable models
- Real-time collaboration with WebSocket
- live streaming with wiki change and pixel video
- read data streaming e.g. live stock with node reandom wak socket 
- Component-driven pagination and dynamic content

---

## 💼 Ideal For

- Enterprises looking for long-term maintainability
- Teams familiar with OOP (Java, C#, Flex background)
- Developers who prefer **code-structured architecture** over configuration-heavy frameworks

---

---

## 📌 Notes & TODOs

This project is a **proof of concept** designed to explore the capabilities, structure, and flexibility of **Apache Royale**. The current implementation prioritizes showcasing features over production-level optimization. The following are known limitations and areas for future improvement:

---

### 🔧 Development & Architecture Notes

- ⚠️ **Code Optimization Pending**  
  The codebase is intentionally written in a more exploratory style. Several modules and services can be **refactored** and **modularized** for better maintainability and performance.

- 🧪 **No Frameworks Used (Vanilla Royale)**  
  This demo avoids using architectural wrappers like [Crux](https://apache.github.io/royale-docs/libraries/crux), opting instead for **pure Apache Royale**, to better understand the raw development model and potential.

- 🧹 **Event Listeners Not Properly Managed**  
  Event listeners in some views are not removed or properly scoped. This can lead to **memory leaks** and **performance degradation** in long-running sessions.

- 🧭 **Router Not Implemented**  
  Although Apache Royale supports routing via `Router`, it is **not used** in this demo. All navigation and view rendering are manually controlled. Adding a router would enhance maintainability and user experience.

- 🎨 **Engineering-Focused UI**  
  The UI is currently **developer-centric**. While functional, it lacks refined UX/UI polish. With the help of a **CSS/UI expert**, visual consistency, spacing, and responsiveness can be significantly improved.

---

### 📈 Planned Enhancements

- [ ] Refactor into **modular, optimized components**
- [ ] Integrate the **Crux framework** for structured application layers
- [ ] Apply **proper event lifecycle management**
- [ ] Introduce **router-based navigation**
- [ ] Add support for **unit testing and CI**
- [ ] Improve **mobile responsiveness** and accessibility (a11y)
- [ ] Externalize API keys using `.env` and secure configs
- [ ] Add **real-time collaborative drawing** and multi-user state sync

---

## 🧠 Author

**Sanjeev Rajput**  
🔗 [LinkedIn](https://www.linkedin.com/in/sanjeev-rajput)  
🧠 [Apache Royale Community Contributor]

---

## 📜 License

This project is open source and free to use - Licence free
🛠 This codebase is a **launchpad for future Royale experiments**, aimed at pushing boundaries and demonstrating how it can rival modern frameworks like Angular and React — especially in enterprise-scale application architecture.

🙌 Contributions, forks, and suggestions are always welcome!

