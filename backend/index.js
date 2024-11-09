require("dotenv").config();

const config=require("./config.json");
const mongoose=require("mongoose");

mongoose.connect(config.connectionString);

const User=require("./models/user.model");
const Note=require ("./models/note.model");

const express=require("express");
const cors=require("cors");
const app=express();


const jwt=require("jsonwebtoken");
const {authenticateToken}=require("./utilities");



app.use(express.json());

app.use(
    cors({
        origin:"*"
    })
);

app.get("/", (req,res)=>{

res.json({data:"hello"});
});

//api account
app.post("/create-account", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname) {
        return res.status(401).json({
            error: true,
            message: "Full Name is required"
        });
    }

    if (!email) {
        return res.status(401).json({ error: true, message: "Email is required" });
    }

    if (!password) {
        return res.status(401).json({ error: true, message: "Password is required" });
    }

    // Check if the user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(401).json({
            error: true,
            message: "User already exists",
        });
    }

    // Create and save the new user
    const user = new User({ fullname, email, password });
    await user.save();

    // Generate JWT token
    const accessToken = jwt.sign(
        { _id: user._id },  // Sign the token with the user ID
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "36000m" }  // Token expiration time
    );

    return res.json({
        error: false,
        user: {
            fullname: user.fullname,
            email: user.email,
            _id: user._id,
        },
        accessToken,
        message: "Registration Successful",
    });
});


// API for user login
app.post("/login", async (req, res) => {
    const { fullname, email, password } = req.body;

    

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        // Find user by email
        const userInfo = await User.findOne({ email });

        // Check if user exists and passwords match
        if (!userInfo || userInfo.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update fullname if provided and different from the existing one
        if (fullname && fullname !== userInfo.fullname) {
            userInfo.fullname = fullname;
            await userInfo.save();
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            { _id: userInfo._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "36000m" }
        );

        // Return user info and token
        return res.json({
            error: false,
            message: "Login successful",
           user:{
                fullname: userInfo.fullname,
                email: userInfo.email,
                _id: userInfo._id,
           },
            accessToken
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});


// API to get user info
app.get("/get-user", authenticateToken, async (req, res) => {
    const { _id } = req.user;

    try {
        // Retrieve user by ID
        const isUser = await User.findById(_id);

        if (!isUser) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        return res.json({
            user:{
                fullname: isUser.fullname,
                email: isUser.email,
                _id: isUser._id,
                creationOn: isUser.creationOn,
            },
            message: "User retrieved successfully"
        });
    } catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

    
//add-note api 

app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { _id } = req.user; // Access _id directly from req.user

    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }

    if (!content) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: _id, // Use the correct user ID
        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        console.error("Error adding note:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

 //edit-note api
 app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { _id } = req.user; // Correctly access _id from req.user

    // Check if at least one field to update is provided
    if (!title && !content && !tags && isPinned === undefined) {
        return res.status(400).json({ error: true, message: "No changes provided" });
    }

    try {
        // Find the note by its ID and the user's ID
        const note = await Note.findOne({ _id: noteId, userId: _id });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        // Update the note fields if they are provided
        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned !== undefined) note.isPinned = isPinned;

        await note.save();

        return res.json({ 
            error: false, 
            message: "Note updated successfully", 
            note 
        });
    } catch (error) {
        console.error("Error updating note:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});


    //get all notes api 
    app.get("/get-all-notes", authenticateToken, async (req, res) => {
        const { _id } = req.user; // Access user ID directly from req.user
    
        try {
            // Find all notes for the authenticated user and sort by isPinned status
            const notes = await Note.find({ userId: _id }).sort({ isPinned: -1 });
            return res.json({ error: false, notes, message: "All notes retrieved successfully" });
        } catch (error) {
            console.error("Error retrieving notes:", error); // Log error for debugging
            return res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    });
    
    //delete notes api 
    
    app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
        const noteId = req.params.noteId;
        const { _id: userId } = req.user || {}; 
    
        if (!userId) {
            return res.status(401).json({ error: true, message: "User not authenticated" });
        }
    
        try {
            const note = await Note.findOne({ _id: noteId, userId });
            if (!note) {
                return res.status(404).json({ error: true, message: "Note not found" });
            }
    
            const result = await Note.deleteOne({ _id: noteId, userId });
    
            if (result.deletedCount === 0) {
                return res.status(500).json({ error: true, message: "Failed to delete note" });
            }
    
            return res.json({ error: false, message: "Note deleted successfully" });
        } catch (error) {
            console.error("Error deleting note:", error);
            return res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    });
    
    //update ispinned api 

    app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
        const noteId = req.params.noteId;
        const { isPinned } = req.body;
        const { _id } = req.user; // Correctly access _id from req.user
    
        try {
            // Find the note by noteId and ensure it belongs to the authenticated user
            const note = await Note.findOne({ _id: noteId, userId: _id });
            if (!note) {
                return res.status(400).json({ error: true, message: "Note not found" });
            }
    
            // Update the isPinned status
            note.isPinned = isPinned;
    
            // Save the updated note
            await note.save();
            return res.json({ error: false, message: "Note updated successfully", note });
        } catch (error) {
            console.error("Error updating note:", error); // Log the error for debugging
            return res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    });
    
    
    
    
    //search api
    app.get("/search-notes/", authenticateToken, async (req, res) => {
        const { _id } = req.user; // Destructure _id from req.user
        const { query } = req.query;
    
        if (!_id) {
            return res.status(401).json({ error: true, message: "User not authenticated" });
        }
    
        if (!query) {
            return res.status(400).json({ error: true, message: "Search query is required" });
        }
    
        try {
            const matchingNotes = await Note.find({
                userId: _id, // Use userId to find notes
                $or: [
                    { title: { $regex: new RegExp(query, "i") } },
                    { content: { $regex: new RegExp(query, "i") } }
                ]
            });
    
            return res.json({
                error: false,
                notes: matchingNotes,
                message: "Notes matching the search query retrieved successfully",
            });
    
        } catch (error) {
            console.error("Search Notes Error: ", error.message);
            return res.status(500).json({
                error: true,
                message: "Internal Server Error - " + error.message
            });
        }
    });

  



    
    
app.listen(8000);
module.exports=app;
