import React, { useState } from 'react';
import { Modal, Paper, Typography, Rating, Button, TextField } from '@mui/material';

const RatingModal = ({ open, handleClose, transactionId, onSubmitRating }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmitRating(transactionId, rating, comment);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4 }}>
        <Typography variant="h6" component="h2">Rate Your Transaction</Typography>
        <Rating
          name="transaction-rating"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Comments (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, mr: 1 }}>
          Submit Rating
        </Button>
        <Button onClick={handleClose} variant="outlined" sx={{ mt: 2 }}>
          Cancel
        </Button>
      </Paper>
    </Modal>
  );
};

export default RatingModal;