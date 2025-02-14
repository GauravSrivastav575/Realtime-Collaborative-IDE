import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";
import File from "../models/file.js";

const fileRouter = express.Router();


// Create new file
fileRouter.post("/new", async (req, res) => {
  try{
  const { userId, fileName, codeBase } = req.body;
    if (!userId || !fileName) {
      return res.status(400).json({ error: "userId and fileName are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newFile = new File({
      createdBy: userId,
      fileName: fileName,
      codeBase: codeBase || "#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\t// Write your code here\n\treturn 0;\n}",
      accessTo: userId ,
    });
    await newFile.save();
    await User.findByIdAndUpdate(userId,{
      $push: { fileCreated: newFile._id },
    });
    res.status(201).json({
      message: "File created successfully",
      file: {
        fileId: newFile._id,
        fileName: newFile.fileName,
        codeBase: newFile.codeBase,
        createdAt: newFile.createdAt,
        createdBy: newFile.createdBy,
      },
    });
  } catch (error) {
    // console.error("Error creating file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Update codebase of a file
fileRouter.put("/:fileId", async (req, res) => {
  // console.log("update function hitted");
    try {
        const { fileId } = req.params;
        const { codeBase } = req.body;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
          return res.status(400).json({ error: "Invalid fileId" });
        }
        const file = await File.findById(fileId);
        if (!file) {
          return res.status(404).json({ error: "File not found" });
        }
        file.codeBase = codeBase;
        file.lastModified = Date.now();
        await file.save();
        res.status(200).json({
          message: "File updated successfully",
          file: {
            fileId: file._id,
            fileName: file.fileName,
            codeBase: file.codeBase,
            lastModified: file.lastModified,
          },
        });
      } catch (error) {
        // console.error("Error updating file:", error);
        res.status(500).json({ error: "Internal server error" });
      }
});

fileRouter.get("/:fileId/code", async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
          return res.status(400).json({ error: "Invalid fileId" });
        }
        const file = await File.findById(fileId);
        if (!file) {
          return res.status(404).json({ error: "File not found" });
        }
        res.status(200).json({
          fileId: file._id,
          fileName: file.fileName,
          codeBase: file.codeBase,
          createdBy: file.createdBy,
          lastModified: file.lastModified,
        });
      } catch (error) {
        // console.error("Error fetching file code:", error);
        res.status(500).json({ error: "Internal server error" });
      }
});

fileRouter.post("/share", async (req, res) => {
  try {
    const { fileId, email } = req.body;
    
    const file = await File.findOne({ _id: fileId});
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await File.findByIdAndUpdate(fileId, {
      $push: { accessTo: user._id }
    });

    res.status(200).json({ message: "File shared successfully" });
  } catch (error) {
    // console.error("Error sharing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

fileRouter.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Validate fileId format
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid fileId" });
    }

    // Find and delete the file
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Remove file reference from user's fileCreated array
    await User.findByIdAndUpdate(file.createdBy, {
      $pull: { fileCreated: fileId }
    });

    // Delete the file document
    await File.findByIdAndDelete(fileId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    // console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default fileRouter;