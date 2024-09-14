import React, { useState } from 'react';
import { Modal, Paper, Typography, TextField, Button, MenuItem } from '@mui/material';

const InvoiceModal = ({ open, handleClose, user }) => {
  const [invoiceData, setInvoiceData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'USD',
  });

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'KES', 'NGN', 'BTC', 'ETH'];

  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  const handleCreateInvoice = async () => {
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
        <Button onClick={handleCreateInvoice} variant="contained" sx={{ mt: 2 }}>
          Create Invoice
        </Button>
      </Paper>
    </Modal>
  );
};

export default InvoiceModal;