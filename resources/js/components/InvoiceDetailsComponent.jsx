import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Button } from '@mui/material';
import PayInvoiceModal from './PayInvoiceModal';

const InvoiceDetailsComponent = () => {
  const [invoice, setInvoice] = useState(null);
  const [user, setUser] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    fetchInvoiceDetails();
    fetchUserData();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (!invoice) return <div>Loading...</div>;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>Invoice Details</Typography>
      <Typography>Name: {invoice.name}</Typography>
      <Typography>Description: {invoice.description}</Typography>
      <Typography>Amount: {invoice.amount} {invoice.currency}</Typography>
      <Typography>Status: {invoice.status}</Typography>
      {invoice.status === 'pending' && (
        <Button variant="contained" color="primary" onClick={() => setPayModalOpen(true)} sx={{ mt: 2 }}>
          Pay Invoice
        </Button>
      )}
      {payModalOpen && (
        <PayInvoiceModal
          open={payModalOpen}
          handleClose={() => setPayModalOpen(false)}
          user={user}
          invoice={invoice}
        />
      )}
    </Paper>
  );
};

export default InvoiceDetailsComponent;