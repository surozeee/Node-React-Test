const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const index = async (req, res) => {
    try {
        const query = req.query;
        query.deleted = false;
        let meetings = await MeetingHistory.find(query).populate({
            path: 'createBy',
            match: { deleted: false }
        }).exec();
        const result = meetings.filter(item => item.createBy !== null);
        res.send(result);
    } catch (err) {
        console.error('Failed to fetch meetings:', err);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
};

const add = async (req, res) => {
    try {
        req.body.createdDate = new Date();
        const meeting = new MeetingHistory(req.body);
        await meeting.save();
        res.status(200).json(meeting);
    } catch (err) {
        console.error('Failed to create meeting:', err);
        res.status(400).json({ error: 'Failed to create meeting' });
    }
};

const view = async (req, res) => {
    try {
        let meeting = await MeetingHistory.findOne({ _id: req.params.id });
        if (!meeting) return res.status(404).json({ message: "No Data Found." });
        res.status(200).json(meeting);
    } catch (err) {
        console.error('Failed to view meeting:', err);
        res.status(500).json({ error: 'Failed to view meeting' });
    }
};

const deleteData = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true });
        res.status(200).json({ message: "Meeting deleted successfully", meeting });
    } catch (err) {
        console.error('Failed to delete meeting:', err);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
};

const deleteMany = async (req, res) => {
    try {
        const meetings = await MeetingHistory.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
        res.status(200).json({ message: "Meetings deleted successfully", meetings });
    } catch (err) {
        console.error('Failed to delete meetings:', err);
        res.status(500).json({ error: 'Failed to delete meetings' });
    }
};

module.exports = { add, index, view, deleteData, deleteMany }