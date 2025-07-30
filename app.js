import { GDB } from "https://cdn.jsdelivr.net/npm/gdb-p2p/+esm";
import 'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js';

const DB_NAME = 'chat-minimalist-db-v3';
const USERNAME_STORAGE_KEY = 'chatMinimalistUsernameV3';
const THEME_STORAGE_KEY = 'chatMinimalistThemeV3';
const MESSAGE_TYPE = 'chat-message-v7'; // Asegúrate que esta sea la constante correcta

let db = new GDB(DB_NAME);
let currentUser = null;
let initialLoadScrollTimer = null;

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

function applyTheme(theme) {
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
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

function loadUser() {
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
}

function setUser(username) {
  currentUser = username.trim();
  if (currentUser) {
    localStorage.setItem(USERNAME_STORAGE_KEY, currentUser);
    whoInput.value = currentUser;
    whoInput.disabled = true;
    changeUserBtn.style.display = 'inline-block';
    whatInput.focus();
  }
}

changeUserBtn.onclick = () => {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
  currentUser = null;
  whoInput.value = '';
  whoInput.disabled = false;
  changeUserBtn.style.display = 'none';
  whoInput.focus();
  if (emojiPicker.style.display !== 'none') emojiPicker.style.display = 'none';
};

function scrollToBottom(force = false) {
  if (force || initialLoadScrollTimer || (messagesListElement.scrollHeight - messagesListElement.clientHeight <= messagesListElement.scrollTop + 150)) {
    messagesListElement.scrollTop = messagesListElement.scrollHeight;
  }
}

// Función para renderizar o actualizar un mensaje en la UI
function renderOrUpdateMessage(id, value, isCurrentUserMessage) {
  // Asegurarse de que value y value.content existen antes de acceder a sus propiedades
  if (!value || !value.content || typeof value.sender === 'undefined') {
    console.warn(`Mensaje con ID ${id} tiene datos incompletos o no es un mensaje válido:`, value);
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
  contentWrapperEl.innerHTML = ''; // Limpiar contenido anterior para actualizaciones

  if (value.content.type === 'text') {
    const textNode = document.createTextNode(value.content.value);
    contentWrapperEl.appendChild(textNode);
  } else if (value.content.type === 'image') {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'message-image-container';
    const imgElement = document.createElement('img');
    imgElement.src = value.content.value;
    imgElement.alt = value.content.filename || 'Imagen';
    imgElement.onclick = () => showFullImage(value.content.value);
    imgContainer.appendChild(imgElement);
    contentWrapperEl.appendChild(imgContainer);
  } else {
    const textNode = document.createTextNode(`[Contenido desconocido: ${value.content.type || 'N/A'}]`);
    contentWrapperEl.appendChild(textNode);
  }

  messageLi.classList.toggle('user', isCurrentUserMessage);
  messageLi.classList.toggle('other', !isCurrentUserMessage);

  return { messageElement: messageLi, isNew: isNewMessage };
}

// Callback de db.map modificado
db.map({
  query: { type: MESSAGE_TYPE },
  field: 'timestamp', order: 'asc', realtime: true
}, ({ id, value, action }) => {
  // Para depuración, puedes dejarlo o quitarlo una vez que funcione bien
  // console.log(`Action: ${action}, ID: ${id}, Value:`, value);

  // Es crucial que 'currentUser' esté definido para esta comparación.
  // 'value' puede ser null o undefined si la acción es 'removed' y la librería no envía el valor.
  // Sin embargo, para 'initial', 'added', 'updated', 'value' debería estar presente.
  const isUserMsg = value && currentUser && value.sender === currentUser;

  if (action === 'initial' || action === 'added') {
    const rendered = renderOrUpdateMessage(id, value, isUserMsg);
    if (rendered && rendered.isNew) {
      messagesListElement.appendChild(rendered.messageElement);
    }
    // Si no es nuevo, renderOrUpdateMessage ya lo actualizó.

    // Lógica de scroll para mensajes nuevos/iniciales
    clearTimeout(initialLoadScrollTimer);
    initialLoadScrollTimer = setTimeout(() => {
      scrollToBottom(true);
      initialLoadScrollTimer = null;
    }, 50); // Un pequeño delay para permitir que el DOM se actualice

    // Este if puede ser redundante si el timeout siempre hace el scroll
    // if (!initialLoadScrollTimer) { 
    //     scrollToBottom(false); 
    // }

  } else if (action === 'updated') {
    renderOrUpdateMessage(id, value, isUserMsg);
    // No se necesita scroll específico para 'updated' a menos que cambie la altura significativamente.

  } else if (action === 'removed') {
    const messageElement = document.getElementById(id);
    if (messageElement) {
      messageElement.remove();
      // console.log(`Mensaje ${id} eliminado de la UI.`);
    } else {
      // console.warn(`Intento de eliminar mensaje ${id} no encontrado en la UI.`);
    }
  } else {
    console.warn(`Acción desconocida o no manejada: ${action} para ID: ${id}`);
  }
});

async function sendMessage(content) {
  if (!currentUser) { alert("Establece tu nombre primero."); whoInput.focus(); return; }
  const messageData = { type: MESSAGE_TYPE, sender: currentUser, content: content, timestamp: Date.now() };
  try {
    await db.put(messageData); // gdb-p2p se encarga de generar el ID si no se provee
    whatInput.value = ""; whatInput.focus();
  } catch (error) { console.error("Error enviando mensaje:", error); alert("Error al enviar el mensaje."); }
}

messageFormElement.onsubmit = async (event) => {
  event.preventDefault();
  const senderName = whoInput.value.trim(); const messageText = whatInput.value.trim();
  if (!senderName) { alert("Ingresa tu nombre."); whoInput.focus(); return; }
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
      if (!senderName) { alert("Ingresa tu nombre antes de subir imagen."); whoInput.focus(); imageFileInput.value = ''; return; }
      if (!currentUser || currentUser !== senderName) { setUser(senderName); }
      sendMessage({ type: 'image', value: e.target.result, filename: file.name });
      imageFileInput.value = ''; // Resetear el input de archivo
    };
    reader.readAsDataURL(file);
  } else if (file) { alert("Archivo de imagen no válido."); imageFileInput.value = ''; }
});

function showFullImage(src) {
  modalImageContent.src = src;
  imageModal.style.display = 'flex';
}
imageModalCloseBtn.onclick = () => {
  imageModal.style.display = 'none';
  modalImageContent.src = '';
}
imageModal.onclick = (event) => {
  if (event.target === imageModal) { // Cerrar solo si se hace clic en el fondo del modal
    imageModal.style.display = 'none';
    modalImageContent.src = '';
  }
}

// Carga inicial
const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
applyTheme(preferredTheme);
loadUser(); // Carga el usuario, lo que define 'currentUser'

// Para limpiar la base de datos durante el desarrollo si es necesario:
// db.clear().then(() => { console.log('DB cleared'); location.reload(); });