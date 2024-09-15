import React, { useState } from 'react';
import { Modal, Paper, Typography, TextField, Button, MenuItem, CircularProgress } from '@mui/material';

const InvoiceModal = ({ open, handleClose, user }) => {
  const [invoiceData, setInvoiceData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'USD',
    recipient_email: '',
  });
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'KES', 'NGN', 'BTC', 'ETH'];

  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
    if (e.target.name === 'recipient_email') {
      setEmailError('');
    }
  };
  
  const validateEmail = async () => {
    if (!invoiceData.recipient_email) return; // Allow empty email

    setIsLoading(true);
    try {
      const response = await fetch(`/api/validate-email?email=${invoiceData.recipient_email}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!data.valid) {
        setEmailError('Invalid email or user not found');
      }
    } catch (error) {
      console.error('Error validating email:', error);
      setEmailError('Error validating email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (emailError) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        handleClose();
        // You might want to refresh the invoice list here
      } else {
        console.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4 }}>
        <Typography variant="h6" component="h2">Create Invoice</Typography>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={invoiceData.name}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={invoiceData.description}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Amount"
          name="amount"
          type="number"
          value={invoiceData.amount}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          select
          fullWidth
          label="Currency"
          name="currency"
          value={invoiceData.currency}
          onChange={handleChange}
          sx={{ mt: 2 }}
        >
          {currencies.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Recipient Email (optional)"
          name="recipient_email"
          value={invoiceData.recipient_email}
          onChange={handleChange}
          onBlur={validateEmail}
          error={!!emailError}
          helperText={emailError}
          sx={{ mt: 2 }}
        />
        <Button onClick={handleCreateInvoice} variant="contained" sx={{ mt: 2 }} disabled={isLoading || !!emailError}>
          {isLoading ? <CircularProgress size={24} /> : 'Create Invoice'}
        </Button>
      </Paper>
    </Modal>
  );
};

export default InvoiceModal;