import { gdb } from "https://cdn.jsdelivr.net/npm/genosdb@latest/dist/index.min.js";
import 'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js';

// --- Constantes de configuración ---
const DB_NAME = 'chat-minimalist-db-v3';
const USERNAME_STORAGE_KEY = 'chatMinimalistUsernameV3';
const THEME_STORAGE_KEY = 'chatMinimalistThemeV3';
const MESSAGE_TYPE = 'chat-message-v7'; // Asegúrate que esta sea la constante correcta

// --- Global variables ---
let db;
let currentUser = null;
let initialLoadScrollTimer = null;

// --- Elementos del DOM ---
const messagesListElement = document.getElementById('messages-list');
const messageFormElement = document.getElementById('message-form');
const whoInput = document.getElementById('who');
const whatInput = document.getElementById('what');
const changeUserBtn = document.getElementById('change-user-btn');

const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.querySelector('emoji-picker');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imageFileInput = document.getElementById('image-file-input');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIconSun = document.getElementById('theme-icon-sun');
const themeIconMoon = document.getElementById('theme-icon-moon');

const imageModal = document.getElementById('image-modal');
const modalImageContent = document.getElementById('modal-image-content');
const imageModalCloseBtn = document.getElementById('image-modal-close');



const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIconSun.style.display = 'block';
    themeIconMoon.style.display = 'none';
    emojiPicker.setAttribute('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    themeIconSun.style.display = 'none';
    themeIconMoon.style.display = 'block';
    emojiPicker.setAttribute('theme', 'light');
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

const loadUser = () => {
  const storedUser = localStorage.getItem(USERNAME_STORAGE_KEY);
  if (storedUser) {
    currentUser = storedUser;
    whoInput.value = currentUser;
    whoInput.disabled = true;
    changeUserBtn.style.display = 'inline-block';
    whatInput.focus();
  } else {
    whoInput.disabled = false;
    changeUserBtn.style.display = 'none';
    whoInput.focus();
  }
};

const setUser = (username) => {
  currentUser = username.trim();
  if (currentUser) {
    localStorage.setItem(USERNAME_STORAGE_KEY, currentUser);
    whoInput.value = currentUser;
    whoInput.disabled = true;
    changeUserBtn.style.display = 'inline-block';
    whatInput.focus();
  }
};

changeUserBtn.onclick = () => {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
  currentUser = null;
  whoInput.value = '';
  whoInput.disabled = false;
  changeUserBtn.style.display = 'none';
  whoInput.focus();
  if (emojiPicker.style.display !== 'none') emojiPicker.style.display = 'none';
};

const scrollToBottom = (force = false) => {
  if (force || initialLoadScrollTimer || (messagesListElement.scrollHeight - messagesListElement.clientHeight <= messagesListElement.scrollTop + 150)) {
    messagesListElement.scrollTop = messagesListElement.scrollHeight;
  }
};

// Function to render or update a message in the UI
const renderOrUpdateMessage = (id, value, isCurrentUserMessage) => {
  // Ensure value and value.content exist before accessing their properties
  if (!value || !value.content || typeof value.sender === 'undefined') {
    console.warn(`Message with ID ${id} has incomplete data or is not a valid message:`, value);
    return null;
  }

  let messageLi = document.getElementById(id);
  const isNewMessage = !messageLi;

  if (isNewMessage) {
    messageLi = document.createElement("li");
    messageLi.id = id;
    messageLi.className = 'message-item';

    const senderElement = document.createElement('div');
    senderElement.className = 'message-sender';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    messageLi.appendChild(senderElement);
    messageLi.appendChild(contentWrapper);
  }

  const senderEl = messageLi.querySelector('.message-sender');
  const contentWrapperEl = messageLi.querySelector('.message-content-wrapper');

  senderEl.textContent = value.sender;
  contentWrapperEl.innerHTML = ''; // Clear previous content for updates

  if (value.content.type === 'text') {
    const textNode = document.createTextNode(value.content.value);
    contentWrapperEl.appendChild(textNode);
  } else if (value.content.type === 'image') {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'message-image-container';
    const imgElement = document.createElement('img');
    imgElement.src = value.content.value;
    imgElement.alt = value.content.filename || 'Image';
    imgElement.onclick = () => showFullImage(value.content.value);
    imgContainer.appendChild(imgElement);
    contentWrapperEl.appendChild(imgContainer);
  } else {
    const textNode = document.createTextNode(`[Unknown content: ${value.content.type || 'N/A'}]`);
    contentWrapperEl.appendChild(textNode);
  }

  messageLi.classList.toggle('user', isCurrentUserMessage);
  messageLi.classList.toggle('other', !isCurrentUserMessage);

  return { messageElement: messageLi, isNew: isNewMessage };
};

// db.map callback modernized
const setupDbMap = () => {
  db.map({
    query: { type: MESSAGE_TYPE },
    field: 'timestamp', order: 'asc', realtime: true
  }, ({ id, value, action }) => {
    // For debugging, you can leave or remove this once stable
    // console.log(`Action: ${action}, ID: ${id}, Value:`, value);

    // It's crucial that 'currentUser' is defined for this comparison.
    // 'value' may be null or undefined if the action is 'removed' and the library doesn't send the value.
    // However, for 'initial', 'added', 'updated', 'value' should be present.
    const isUserMsg = value && currentUser && value.sender === currentUser;

    if (action === 'initial' || action === 'added') {
      const rendered = renderOrUpdateMessage(id, value, isUserMsg);
      if (rendered && rendered.isNew) {
        messagesListElement.appendChild(rendered.messageElement);
      }
      // If not new, renderOrUpdateMessage already updated it.

      // Scroll logic for new/initial messages
      clearTimeout(initialLoadScrollTimer);
      initialLoadScrollTimer = setTimeout(() => {
        scrollToBottom(true);
        initialLoadScrollTimer = null;
      }, 50); // Small delay to allow DOM update

    } else if (action === 'updated') {
      renderOrUpdateMessage(id, value, isUserMsg);
      // No specific scroll needed for 'updated' unless height changes significantly.

    } else if (action === 'removed') {
      const messageElement = document.getElementById(id);
      if (messageElement) {
        messageElement.remove();
        // console.log(`Message ${id} removed from UI.`);
      } else {
        // console.warn(`Attempt to remove message ${id} not found in UI.`);
      }
    } else {
      console.warn(`Unknown or unhandled action: ${action} for ID: ${id}`);
    }
  });
};

const sendMessage = async (content) => {
  if (!currentUser) { alert("Set your name first."); whoInput.focus(); return; }
  const messageData = { type: MESSAGE_TYPE, sender: currentUser, content: content, timestamp: Date.now() };
  try {
    await db.put(messageData); // gdb-p2p generates the ID if not provided
    whatInput.value = ""; whatInput.focus();
  } catch (error) { console.error("Error sending message:", error); alert("Error sending message."); }
};

messageFormElement.onsubmit = async (event) => {
  event.preventDefault();
  const senderName = whoInput.value.trim(); const messageText = whatInput.value.trim();
  if (!senderName) { alert("Enter your name."); whoInput.focus(); return; }
  if (!messageText) { whatInput.focus(); return; }
  if (!currentUser || currentUser !== senderName) { setUser(senderName); }
  sendMessage({ type: 'text', value: messageText });
};

emojiBtn.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});
emojiPicker.addEventListener('emoji-click', event => {
  whatInput.value += event.detail.unicode;
  emojiPicker.style.display = 'none'; whatInput.focus();
});
document.addEventListener('click', (event) => {
  if (!emojiBtn.contains(event.target) && !emojiPicker.contains(event.target) && emojiPicker.style.display !== 'none') {
    emojiPicker.style.display = 'none';
  }
});
imageUploadBtn.addEventListener('click', () => imageFileInput.click());
imageFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const senderName = whoInput.value.trim();
      if (!senderName) { alert("Enter your name before uploading an image."); whoInput.focus(); imageFileInput.value = ''; return; }
      if (!currentUser || currentUser !== senderName) { setUser(senderName); }
      sendMessage({ type: 'image', value: e.target.result, filename: file.name });
      imageFileInput.value = ''; // Reset file input
    };
    reader.readAsDataURL(file);
  } else if (file) { alert("Invalid image file."); imageFileInput.value = ''; }
});

const showFullImage = (src) => {
  modalImageContent.src = src;
  imageModal.style.display = 'flex';
};
imageModalCloseBtn.onclick = () => {
  imageModal.style.display = 'none';
  modalImageContent.src = '';
};
imageModal.onclick = (event) => {
  if (event.target === imageModal) { // Only close if modal background is clicked
    imageModal.style.display = 'none';
    modalImageContent.src = '';
  }
};

// Initial load and async main logic
const main = async () => {
  db = await gdb(DB_NAME);
  setupDbMap();
  const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  applyTheme(preferredTheme);
  loadUser(); // Loads the user, which defines 'currentUser'
};

main().catch(console.error);

// To clear the database during development if necessary:
// db.clear().then(() => { console.log('DB cleared'); location.reload(); });