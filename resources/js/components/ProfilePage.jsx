import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Container } from '@mui/material';

const ProfilePage = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    btc_address: '',
    usd_account_number: '',
    usd_routing_number: '',
    kes_account_number: '',
    iban: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data.payment_details || {});
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile/payment-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentDetails),
      });
      if (response.ok) {
        alert('Payment details updated successfully');
      }
    } catch (error) {
      console.error('Error updating payment details:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Update Payment Details</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="BTC Address"
            name="btc_address"
            value={paymentDetails.btc_address || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="USD Account Number"
            name="usd_account_number"
            value={paymentDetails.usd_account_number || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="USD Routing Number"
            name="usd_routing_number"
            value={paymentDetails.usd_routing_number || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="KES Account Number"
            name="kes_account_number"
            value={paymentDetails.kes_account_number || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="IBAN"
            name="iban"
            value={paymentDetails.iban || ''}
            onChange={handleChange}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Update Payment Details
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage;