import User from "./models/User.js";
import Room_Chat from "./models/Room_Chat.js";
import Message from "./models/Message.js";
import Group from "./models/Group.js";
import Group_Member from "./models/Group_Member.js";
import Group_Chat from "./models/Group_Chat.js";
import Friends from "./models/Friends.js";
import Code from "./models/Code.js";

// User - Message
User.hasMany(Message, {
  foreignKey: "sender_id",
});
Message.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

// User - Message
User.hasMany(Message, {
  foreignKey: "receiver_id",
});
Message.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

// User - Room_Chat
User.hasMany(Room_Chat, {
  foreignKey: "sender_id",
});
Room_Chat.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

// User - Room_Chat
User.hasMany(Room_Chat, {
  foreignKey: "receiver_id",
});
Room_Chat.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

// Message - Room_Chat
Message.hasMany(Room_Chat, {
  foreignKey: "message_id",
});
Room_Chat.belongsTo(Message, {
  foreignKey: "message_id",
});

// User - Group
User.hasMany(Group, {
  foreignKey: "admin_id",
});
Group.belongsTo(User, {
  foreignKey: "admin_id",
});

// User - Group_Member
User.hasMany(Group_Member, {
  foreignKey: "member_id",
});
Group_Member.belongsTo(User, {
  foreignKey: "member_id",
  as: "member",
});

// Group - Group_Member
Group.hasMany(Group_Member, {
  foreignKey: "group_id",
});
Group_Member.belongsTo(Group, {
  foreignKey: "group_id",
});

// Group - Group_Member
User.hasMany(Group_Member, {
  foreignKey: "accepted_by",
});
Group_Member.belongsTo(User, {
  foreignKey: "accepted_by",
  as: "accepted",
});

// User - Group_Chat
User.hasMany(Group_Chat, {
  foreignKey: "sender_id",
});
Group_Chat.belongsTo(User, {
  foreignKey: "sender_id",
});

// Group - Group_Chat
Group.hasMany(Group_Chat, {
  foreignKey: "group_id",
});
Group_Chat.belongsTo(Group, {
  foreignKey: "group_id",
});

// Message - Group_Chat
Message.hasMany(Group_Chat, {
  foreignKey: "message_id",
});
Group_Chat.belongsTo(Message, {
  foreignKey: "message_id",
});

// User - Friends
User.hasMany(Friends, {
  foreignKey: "sender_id",
});
Friends.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

// User - Friends
User.hasMany(Friends, {
  foreignKey: "receiver_id",
});
Friends.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

// User - Code
User.hasOne(Code, {
  foreignKey: "user_id",
});
Code.belongsTo(User, {
  foreignKey: "user_id",
});
