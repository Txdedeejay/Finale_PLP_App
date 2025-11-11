module.exports = (io) => {
  const chatNamespace = io.of('/chat');
  
  chatNamespace.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    // Join group room
    socket.on('joinGroup', (groupId) => {
      socket.join(groupId);
      console.log(`User ${socket.id} joined group ${groupId}`);
    });

    // Leave group room
    socket.on('leaveGroup', (groupId) => {
      socket.leave(groupId);
      console.log(`User ${socket.id} left group ${groupId}`);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.groupId).emit('userTyping', {
        userId: socket.userId,
        name: data.name
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(data.groupId).emit('userStoppedTyping', {
        userId: socket.userId
      });
    });

    // Handle message reactions
    socket.on('messageReaction', async (data) => {
      try {
        const { Message } = require('../models/Chat');
        await Message.findByIdAndUpdate(data.messageId, {
          $push: {
            reactions: {
              user: data.userId,
              emoji: data.emoji
            }
          }
        });

        socket.to(data.groupId).emit('messageReactionAdded', data);
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chat:', socket.id);
    });
  });
};