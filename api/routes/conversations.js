const router = require("express").Router();
const Conversation = require("../models/Conversation");

//new conversation
router.post('/', async (req, res) => {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId]
    });

    try{
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation)
    }catch(err){
        res.status(500).json(err);
    }
});

//get conversation
router.get('/:userId', async (req, res) => {
    try{
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId]}
        });

        return res.status(200).json(conversations);
    }catch(error){
        return res.status(500).json(error);
    }
});

//get conversation that includes two user ids
router.get('/find/:firstUserId/:secondUserId', async (req, res) => {
    try{
        const conversation = await Conversation.findOne({
            members: {$all : [req.params.firstUserId, req.params.secondUserId]}
        });
        return res.status(200).json(conversation);
    }catch(error){
        res.status(500).json(error);
    }
});

module.exports = router;