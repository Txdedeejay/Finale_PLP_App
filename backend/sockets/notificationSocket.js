module.exports = (io) => {
  const notificationNamespace = io.of('/notifications');
  
  notificationNamespace.on('connection', (socket) => {
    console.log('User connected to notifications:', socket.id);

    // Join user's personal notification room
    socket.on('joinUser', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined notification room`);
    });

    // Handle real-time updates
    socket.on('subscribeToNGO', (ngoId) => {
      socket.join(`ngo_${ngoId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from notifications:', socket.id);
    });
  });

  // Function to send notifications
  const sendNotification = (userId, notification) => {
    notificationNamespace.to(`user_${userId}`).emit('newNotification', notification);
  };

  // Function to broadcast to NGO
  const broadcastToNGO = (ngoId, data) => {
    notificationNamespace.to(`ngo_${ngoId}`).emit('ngoUpdate', data);
  };

  return {
    sendNotification,
    broadcastToNGO
  };
};