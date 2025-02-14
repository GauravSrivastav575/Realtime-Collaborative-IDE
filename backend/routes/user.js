import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";
import File from "../models/file.js";

const userRouter = express.Router();

userRouter.get("/:userId/files", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)){
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        const files = await File.find({ accessTo: userId }, "fileName _id");
        const response = files.map((file) => ({
          name: file.fileName,
          fileId: file._id,
        }));
    
        res.status(200).json(response);
    } catch (error) {
        // console.error("Error fetching files:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default userRouter;