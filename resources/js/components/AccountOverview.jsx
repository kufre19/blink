import React from 'react';
import { Paper, Typography } from '@mui/material';

const AccountOverview = ({ balance }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6">Account Overview</Typography>
    <Typography variant="h4">${parseFloat(balance).toFixed(2)}</Typography>
    <Typography variant="body2" color="textSecondary">Available Balance</Typography>
  </Paper>
);

export default AccountOverview;