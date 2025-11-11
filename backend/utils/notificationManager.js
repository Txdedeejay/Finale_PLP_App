class NotificationManager {
  constructor(io) {
    this.io = io;
  }

  async sendUserNotification(userId, notification) {
    this.io.of('/notifications').to(`user_${userId}`).emit('newNotification', {
      ...notification,
      timestamp: new Date(),
      read: false
    });
  }

  async sendNGONotification(ngoId, notification) {
    this.io.of('/notifications').to(`ngo_${ngoId}`).emit('ngoNotification', {
      ...notification,
      timestamp: new Date()
    });
  }

  async sendRealTimeUpdate(type, data) {
    switch (type) {
      case 'new_volunteer':
        this.sendNGONotification(data.ngoId, {
          type: 'volunteer',
          title: 'New Volunteer',
          message: `${data.volunteerName} joined your NGO`,
          action: '/volunteers'
        });
        break;

      case 'new_donation':
        this.sendNGONotification(data.ngoId, {
          type: 'donation',
          title: 'New Donation',
          message: `Received $${data.amount} from ${data.donorName}`,
          action: '/donations'
        });
        break;

      case 'project_update':
        this.sendNGONotification(data.ngoId, {
          type: 'project',
          title: 'Project Update',
          message: `Project "${data.projectName}" reached ${data.progress}% completion`,
          action: `/projects/${data.projectId}`
        });
        break;
    }
  }
}

module.exports = NotificationManager;