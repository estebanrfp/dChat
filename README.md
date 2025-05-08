# GraphDB Real-time Chat

A minimalist, real-time chat application built with HTML, CSS, and GraphDB in vanilla JavaScript. It showcases modern P2P communication capabilities with a sleek, responsive design.

## Features

- **Real-time Messaging**: Send and receive messages instantly with other connected users.
- **User Identification**: Set a username that persists across sessions using `localStorage`.
- **Rich Content**:
    - Send text messages.
    - Share images (converted to Base64 and stored in GraphDB).
    - Insert emojis using an integrated emoji picker.
- **Image Previews & Modal**: Images are displayed as fixed-size thumbnails and can be viewed obstáculos en un modal.
- **Modern & Responsive UI**:
    - Clean, minimalist design inspired by modern chat applications.
    - Light and Dark mode, thème-toggleable and persisted.
    - Fully responsive for desktop and mobile devices.
- **Persistent Chat History**: All messages are stored locally using GraphDB, so history is preserved on refresh.
- **P2P Foundation**: Built on `GraphDB`, suggesting potential for direct peer-to-peer data synchronization (details depend on `GraphDB`'s P2P layer implementation).

## Advantages of Using GraphDB (`GraphDB`)

- **Simplicity**: Easy-to-use API (`put`, `get`, `map`) for data manipulation and real-time updates.
- **Real-time Capabilities**: The `map` method with a callback enables effortless real-time data synchronization, perfect for applications like chat.
- **Local-First & Persistence**: Data is stored locally (likely using IndexedDB via `localStorage` or similar by `GraphDB`), ensuring data persistence and offline-first potential.
- **P2P Potential**: The "p2p" naturaleza of the library suggests it can handle direct data synchronization between peers without a centralized server, reducing infrastructure costs and complexity for certain use cases.
- **Schemaless Nature**: Flexible data storage, ideal for evolving applications or varied data types like text and Base64 images in chat messages.
- **No Backend Required (for core P2P)**: For basic P2P functionality, GraphDB can operate without a dedicated server backend, simplifying deployment for demos and small-scale apps.

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- JavaScript (ES6+ Modules)
- **GraphDB (`gdb`)**: For data storage, real-time updates, and P2P communication.
- **`emoji-picker-element`**: For emoji selection.
- `localStorage`: For user preferences (username, theme).

## How to Use

1.  **Get the Code**:
    *   Clone a repository containing this chat (if applicable).
    *   Or, save the provided HTML code as a single `.html` file (e.g., `chat.html`).
2.  **Serve Locally**:
    *   Due to the use of ES6 modules, you need to serve the `chat.html` file through a local web server.
    *   If you have Node.js:
        ```bash
        npx serve .
        ```
        (Run this command in the directory where you saved `chat.html`)
    *   Alternatively, use an extension like "Live Server" in VSCode.
3.  **Open in Browser**:
    *   Open the URL provided by your local server (e.g., `http://localhost:3000` or `http://localhost:5000`).
4.  **Start Chatting**:
    *   Set your username.
    *   Open another browser tab/window (or another device on the same network, if `gdb-p2p` P2P layer supports it) to the same URL to simulate another user.
    *   Messages, images, and emojis should sync in real-time.

## Project Structure

(Assuming a single-file HTML structure for this example)
- `chat.html` (or similar): Contains all HTML structure, CSS styles, and JavaScript logic for the application.

## Demo

*(If you host this example, you can add a link here, e.g., on GitHub Pages)*
<!-- Example: You can view a live demo of the application at: [GitHub Pages Link] -->

## License

This example project is for demonstration purposes. If based on a specific repository, refer to its license. Otherwise, consider it under a permissive license like MIT if you are distributing it.

[dChat Demo](https://estebanrfp.github.io/dChat/) Powered by [GraphDB (GDB)](https://github.com/estebanrfp/gdb)

-------------

#### Credits
* [by estebanrfp](https://github.com/estebanrfp)
