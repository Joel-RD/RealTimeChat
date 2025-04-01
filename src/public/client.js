const socket = io();

let nameUser = prompt("Elija su nombre de usuario...");
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("messages-form");
  const input = document.getElementById("message-input");
  const messages = document.getElementById("messages");

  const userNameChat = document.getElementById("name-user");
  userNameChat.textContent = nameUser;

  if (form && input && messages) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = input.value;

      if (message) {
        socket.emit("message", `${nameUser}: ${message}`);
        addMessageToList(`${nameUser}: ${message}`, "sent");
        input.value = "";
      }
    });

    socket.on("message", (message) => {
      addMessageToList(message, "received");
    });

    socket.on("image", (base64Image) => {
      addImageToList(base64Image, "received");
    });

    const addMessageToList = (message, type) => {
      const item = document.createElement("li");
      const span = document.createElement("span");
      span.classList.add("connection");
      item.appendChild(span);
      item.appendChild(document.createTextNode(message));
      item.classList.add(type);
      messages.appendChild(item);
    };
  }
});

const addImageToList = (base64Image, type) => {
  const item = document.createElement("li");
  const img = document.createElement("img");
  img.src = base64Image;
  img.classList.add(type);
  item.appendChild(img);
  messages.appendChild(item);
};

const sendImage = (imageFile) => {
  const reader = new FileReader();
  reader.onload = function (event) {
    const base64Image = event.target.result;
    socket.emit("image", base64Image);
    addImageToList(base64Image, "sent");
  };

  reader.onerror = function (error) {
    console.error("Error al leer el archivo:", error);
  };

  reader.readAsDataURL(imageFile);
};

const imageInput = document.getElementById("imageInput");
if (imageInput) {
  imageInput.addEventListener("change", function (event) {
    const imageFile = event.target.files[0];
    if (imageFile) {
      sendImage(imageFile);
    }
  });

  imageInput.addEventListener("change", function () {
    const fileName =
      this.files.length > 0
        ? this.files[0].name
        : "Ningún archivo seleccionado";
    document.getElementById("file-name").textContent = fileName;
  });
}

let remoteVideo;
let localStream;
let peerConnection;

const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302", // Servidor STUN público
    },
  ],
};

const startCall = async () => {
  try {
    videStreminVisibility("inline");

    socket.on("Hello-Word", (data) => {
      socket.emit("Hello-Word", data);
    });

    // Obtener el stream local
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    document.getElementById("localVideo").srcObject = localStream;

    // Crear la conexión WebRTC
    createPeerConnection();

    // Crear y enviar la oferta
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("webrtc-offer", offer);
  } catch (error) {
    console.error("Error al iniciar la llamada:", error);
  }
}

// Crear conexión WebRTC
const createPeerConnection = () => {
  if (!localStream) {
    startCall();
  }

  peerConnection = new RTCPeerConnection(config);

  // Añadir el stream local a la conexión
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Manejar candidatos ICE
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("webrtc-ice-candidate", event.candidate);
    }
  };

  // Manejar el stream remoto
  peerConnection.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };
}

// Manejar ofertas
let pendingCandidates = [];
socket.on("webrtc-ice-candidate", async (candidate) => {
  try {
    if (peerConnection && peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      // Almacenar candidatos pendientes
      pendingCandidates.push(candidate);
    }
  } catch (error) {
    console.error("Error al añadir candidato ICE:", error);
  }
});

// Añadir candidatos pendientes después de configurar la descripción remota
const handleRemoteDescriptionSet = async () => {
  if (pendingCandidates.length > 0) {
    for (const candidate of pendingCandidates) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidates = [];
  }
}

// Llama a esta función después de `setRemoteDescription`
socket.on("webrtc-offer", async (offer) => {
  createPeerConnection();
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  await handleRemoteDescriptionSet(); // Procesar candidatos pendientes
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("webrtc-answer", answer);
});

socket.on("webrtc-answer", async (answer) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  await handleRemoteDescriptionSet(); // Procesar candidatos pendientes
});

document.getElementById("startCall").addEventListener("click", (e) => {
  e.preventDefault();
  startCall();
});

const endCall = () => {
  // Detener el stream local
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  // Cerrar la conexión WebRTC
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // Ocultar los videos
  videStreminVisibility("none");

  // Notificar al otro usuario
  socket.emit("call-ended");
}

socket.on("call-ended", () => {
  endCall();
});

document.getElementById("endCall").addEventListener("click", (e) => {
  e.preventDefault();
  endCall();
});

socket.on("user-left", (username) => {
  alert(`${username} ha abandonado la sala.`);
  location.reload();
});

const videStreminVisibility = (type) => {
  document.getElementById("localVideo").style.display = type;
  document.getElementById("remoteVideo").style.display = type;
};

