// ./server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { type } = require("os");

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socketio",
    cors: {
      origin: "https://event-project-rncp.vercel.app/",
      methods: ["GET", "POST"],
    },
  });

  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("test", (data) => {
      console.log("Received test message:", data);
      socket.emit("test_response", "Hello from server");
    });

    socket.on("register", (userId) => {
      console.log("User registered:", userId);
      // Supprimez l'ancienne connexion si elle existe
      for (const [id, s] of userSockets.entries()) {
        if (id === userId && s !== socket) {
          s.disconnect();
          userSockets.delete(id);
        }
      }
      userSockets.set(userId, socket);
    });
    socket.on("message", async (message) => {
      console.log("Public message received:", message);

      try {
        const savedMessage = await prisma.message.create({
          data: {
            content: message.content,
            type: message.type || "public",
            userId: message.senderId,
          },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
              },
            },
          },
        });

        const emittedMessage = {
          ...savedMessage,
          senderId: savedMessage.userId,
          sender: savedMessage.user,
          type: savedMessage.type || "public",
        };

        io.emit("message", emittedMessage);

        // Gérer les mentions
        const mentions = message.content.match(/@(\w+)/g);
        if (mentions) {
          const mentionedUsers = await prisma.user.findMany({
            where: {
              first_name: {
                in: mentions.map((m) => m.slice(1)),
              },
            },
          });

          mentionedUsers.forEach((user) => {
            if (user.id !== message.senderId) {
              const userSocket = userSockets.get(user.id);
              if (userSocket) {
                console.log(`Sending mention notification to user ${user.id}`);
                userSocket.emit("notification", {
                  type: "mention",
                  message: `You were mentioned in a message by ${savedMessage.user.first_name}`,
                });
              } else {
                console.log(`User socket not found for user ${user.id}`);
              }
            }
          });
        }
      } catch (error) {
        console.error("Error saving public message:", error);
      }
    });
    socket.on("privateMessage", async (message) => {
      console.log("Private message received:", message);

      try {
        const savedMessage = await prisma.privateMessage.create({
          data: {
            content: message.content,
            type: message.type,
            senderId: message.senderId,
            receiverId: message.receiverId,
          },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
              },
            },
            receiver: {
              select: {
                id: true,
                first_name: true,
              },
            },
          },
        });

        const receiverSocket = userSockets.get(message.receiverId);
        if (receiverSocket) {
          receiverSocket.emit("privateMessage", savedMessage);
          console.log(
            `Sending private message notification to user ${message.receiverId}`
          );
          receiverSocket.emit("notification", {
            type: "privateMessage",
            message: `You received a private message from ${savedMessage.sender.first_name}`,
          });
        } else {
          console.log(
            `Receiver socket not found for user ${message.receiverId}`
          );
        }
        socket.emit("privateMessage", savedMessage);
      } catch (error) {
        console.error("Error saving private message:", error);
      }
    });

    socket.on("deleteMessage", async (messageId) => {
      console.log("Delete message request:", messageId);
      try {
        await prisma.message.delete({
          where: { id: messageId },
        });
        io.emit("deleteMessage", messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    socket.on("editMessage", async (editedMessage) => {
      console.log("Edit message request:", editedMessage);
      try {
        const updatedMessage = await prisma.message.update({
          where: { id: editedMessage.id },
          data: { content: editedMessage.content },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
              },
            },
          },
        });

        const emittedMessage = {
          ...updatedMessage,
          senderId: updatedMessage.userId,
          sender: updatedMessage.user,
        };

        io.emit("editMessage", emittedMessage);
      } catch (error) {
        console.error("Error editing message:", error);
      }
    });

    socket.on("deletePrivateMessage", async ({ messageId, receiverId }) => {
      console.log("Delete private message request:", messageId);
      try {
        await prisma.privateMessage.delete({
          where: { id: messageId },
        });
        socket.emit("deletePrivateMessage", messageId);
        const receiverSocket = userSockets.get(receiverId);
        if (receiverSocket) {
          receiverSocket.emit("deletePrivateMessage", messageId);
        }
      } catch (error) {
        console.error("Error deleting private message:", error);
      }
    });

    socket.on("editPrivateMessage", async (editedMessage) => {
      console.log("Edit private message request:", editedMessage);
      try {
        const updatedMessage = await prisma.privateMessage.update({
          where: { id: editedMessage.id },
          data: { content: editedMessage.content },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
              },
            },
          },
        });
        socket.emit("editPrivateMessage", updatedMessage);
        const receiverSocket = userSockets.get(editedMessage.receiverId);
        if (receiverSocket) {
          receiverSocket.emit("editPrivateMessage", updatedMessage);
        }
      } catch (error) {
        console.error("Error editing private message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      for (const [userId, s] of userSockets.entries()) {
        if (s === socket) {
          userSockets.delete(userId);
          break;
        }
      }
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
