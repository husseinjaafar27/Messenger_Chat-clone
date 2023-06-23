import Group from "../models/Group.js";
import Group_Member from "../models/Group_Member.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
  const { id } = req.user;
  const { name, description } = req.body;
  try {
    const group = await Group.create({
      admin_id: id,
      name,
      description,
      members_number: 1,
    });

    await Group_Member.create({
      group_id: group.id,
      member_id: id,
      admin: true,
      status: "Main Admin",
      accepted_by: id,
    });

    return res
      .status(200)
      .json({ message: "Group created successfully.", group });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group_Member.findAll({
      where: { group_id: groupId },
      include: { model: User, as: "member" },
    });
    if (group.length < 1)
      return res.status(404).json({ message: "Group not found" });

    return res.status(200).json({ message: "Member List: ", group });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const numberOfMember = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    return res.status(200).json({ members: group.members_number });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  const { id } = req.user;
  const { groupId } = req.params;
  try {
    const group = await Group.findOne({ where: { id: groupId, admin_id: id } });
    if (!group)
      return res
        .status(401)
        .json({ message: "Unauthorized to do this operation" });

    await Group.destroy({ where: { id: groupId } });
    return res.status(200).json({ message: "group is deleted" });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const removeMemberByadmin = async (req, res) => {
  const { id } = req.user;
  const { memberId, groupId } = req.params;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "group not found" });

    const checkAdmin = await Group_Member.findOne({
      where: {
        group_id: groupId,
        member_id: id,
        admin: true,
      },
    });
    if (!checkAdmin)
      return res
        .status(401)
        .json({ message: "Unauthorized to do this operation" });

    const member = await Group_Member.findOne({
      where: { member_id: memberId, status: "accepted" },
    });
    if (!member) return res.status(404).json({ message: "Member not found" });

    group.members_number -= 1;
    await group.save();
    await Group_Member.destroy({ where: { id: member.id } });
    return res.status(200).json({ message: "member is removed from group" });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const sendGroupRequest = async (req, res) => {
  const { id } = req.user;
  const { groupId } = req.params;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "group not found" });

    const request = await Group_Member.create({
      group_id: groupId,
      member_id: id,
    });

    return res
      .status(200)
      .json({ message: "request sent successfully", request });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const acceptRejectRequest = async (req, res) => {
  const { id } = req.user;
  const { groupId, member } = req.params;
  const { status } = req.body;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "group not found" });

    const request = await Group_Member.findOne({
      where: { group_id: groupId, member_id: member },
    });
    if (!request) return res.status(404).json({ message: "request not found" });

    const checkAdmin = await Group_Member.findOne({
      where: { group_id: groupId, member_id: id, admin: true },
    });
    if (!checkAdmin)
      return res
        .status(401)
        .json({ message: "Unauthorized to do this operation" });

    if (status == "accept") {
      request.status = "accepted";
      request.accepted_by = id;
      group.members_number += 1;
      await request.save();
      await group.save();
      return res.status(200).json({ message: "request accepted", request });
    }
    if (status == "reject") {
      request.status = "rejected";
      request.accepted_by = id;
      group.members_number -= 1;
      await request.save();
      await group.save();
      return res.status(200).json({ message: "request rejected", request });
    }
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const editGroupMember = async (req, res) => {
  const { id } = req.user;
  const { groupId, groupMemberId } = req.params;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "group not found" });

    const checkAdmin = await Group_Member.findOne({
      where: {
        group_id: groupId,
        member_id: id,
        admin: true,
        status: "Main Admin",
      },
    });
    if (!checkAdmin)
      return res
        .status(401)
        .json({ message: "Unauthorized to do this operation" });

    const groupMember = await Group.findByPk(groupMemberId);
    if (!groupMember)
      return res.status(404).json({ message: "Group member not found" });

    groupMember.admin = true;
    await groupMember.save();

    return res
      .status(200)
      .json({ message: "request sent successfully", request });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const editGroup = async (req, res) => {
  const { id } = req.user;
  const { groupId } = req.params;
  const { name, description } = req.body;
  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "group not found" });

    const checkAdmin = await Group_Member.findOne({
      where: { group_id: groupId, member_id: id, admin: true },
    });
    if (!checkAdmin)
      return res
        .status(401)
        .json({ message: "Unauthorized to do this operation" });

    await Group.update(
      {
        name: name ? name : group.name,
        description: description ? description : group.description,
      },
      { where: { id: groupId } }
    );

    return res.status(200).json({ message: "group updated successfully" });
  } catch (err) {
    return res.json({ message: err.message });
  }
};
