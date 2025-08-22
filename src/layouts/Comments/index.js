import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { format } from "timeago.js";
import authAxios from "authAxios";
import PropTypes from "prop-types";
import socket from "../Socket/Socket";
import { useAuthUser } from "contexts/userContext";
const BG_COLOR = "#f9f9f9";

// Container with fixed height and background
const CommentContainer = styled(Box)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: BG_COLOR,
  padding: 16,
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
});

// Scrollable list of comments
const CommentList = styled(Box)({
  flex: 1,
  overflowY: "auto",
  paddingRight: 8, // prevents scrollbar overlap
  marginBottom: 16,
  maxHeight: "calc(100vh - 250px)",
});

// Single comment block styling
const SingleComment = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 16,
});

const EmojiBox = styled(Box)({
  position: "absolute",
  bottom: 70,
  right: 0,
  zIndex: 10,
});

const CommentBox = ({ module, moduleId }) => {
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comments, setComments] = useState([]);
  const { user } = useAuthUser();
  const messagesEndRef = useRef(null);
  const commentListRef = useRef(null);
  const fetchAllComments = async () => {
    try {
      const response = await authAxios.get(`/comments/${moduleId}`, {
        params: {
          module: module,
        },
      });
      const { data } = response;
      setComments(data.list);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  useEffect(() => {
    fetchAllComments();

    // join the room
    socket.emit("join_room", { module, moduleId });
    // listen for new comments
    socket.on("new_comment", (newComment) => {
      setComments((prev) => [...prev, newComment]);
    });

    return () => {
      socket.off("new_comment"); // cleanup
    };
  }, [module, moduleId]);

  useEffect(() => {
    if (commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [comments]);

  const handleEmojiSelect = (emoji) => {
    setComment(comment + emoji.native);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      const res = await authAxios.post("/comments", { comment }, { params: { module, moduleId } });

      const savedComment = res.data; // assume API returns saved comment object
      // emit to others in room
      // socket.emit("new_comment", { ...savedComment, module, moduleId });

      // update UI immediately
      // setComments((prev) => [...prev, savedComment]);

      setComment("");
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Error posting comment", err);
    }
  };
  return (
    <CommentContainer>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Scrollable Comments */}
      <CommentList ref={commentListRef}>
        {comments.map((cmt, i) => {
          const isSender = cmt.commented_by === user?.id;

          return (
            <Box
              key={i}
              display="flex"
              justifyContent={isSender ? "flex-end" : "flex-start"}
              mb={2}
            >
              {!isSender && (
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {cmt.commented_username ? cmt.commented_username[0] : "U"}
                </Avatar>
              )}

              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: "60%",
                  bgcolor: isSender ? "#DCF8C6" : "#fff",
                  borderRadius: 2,
                  boxShadow: 1,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {cmt.commented_username}
                </Typography>
                <Typography variant="body2">{cmt.comment}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "right", mt: 0.5 }}
                >
                  {format(cmt.created_at)}
                </Typography>
              </Paper>

              {isSender && (
                <Avatar sx={{ width: 32, height: 32, ml: 1 }}>
                  {cmt.commented_username ? cmt.commented_username[0] : "U"}
                </Avatar>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </CommentList>

      {/* Comment Input */}
      <Box position="relative">
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <InsertEmoticonIcon />
          </IconButton>
          <Button variant="gradient" className="add-usr-button" onClick={handleSubmit}>
            Post
          </Button>
        </Box>
        {showEmojiPicker && (
          <EmojiBox>
            <Picker onSelect={handleEmojiSelect} />
          </EmojiBox>
        )}
      </Box>
    </CommentContainer>
  );
};

export default CommentBox;

CommentBox.propTypes = {
  module: PropTypes.string.isRequired,
  moduleId: PropTypes.string.isRequired,
};
