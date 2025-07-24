import React, { useEffect, useState } from "react";
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
  }, []);

  const handleEmojiSelect = (emoji) => {
    setComment(comment + emoji.native);
  };

  const handleSubmit = async () => {
    if (comment.trim() !== "") {
      try {
        await authAxios.post(
          "/comments",
          {
            comment: comment,
          },
          {
            params: {
              module: module,
              moduleId: moduleId,
            },
          }
        );
        fetchAllComments();
        setComment("");
        setShowEmojiPicker(false);
      } catch (error) {
        console.error("Error posting comments", error);
      }
    }
  };

  return (
    <CommentContainer>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Scrollable Comments */}
      <CommentList>
        {comments.map((cmt, i) => (
          <SingleComment key={i}>
            <Avatar sx={{ width: 32, height: 32 }}>{cmt.commented_username[0]}</Avatar>
            <Box width="100%">
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle2">{cmt.commented_username}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(cmt.created_at)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {cmt.comment}
              </Typography>
            </Box>
          </SingleComment>
        ))}
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
          <Button variant="contained" onClick={handleSubmit}>
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
