import React from 'react';
import { Paper, Typography, Button, Grid } from '@mui/material';

const QuickActions = ({ onConversionClick, onInvoiceClick }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6">Quick Actions</Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Button variant="contained" fullWidth onClick={onConversionClick}>Quick Conversion</Button>
      </Grid>
      <Grid item xs={6}>
        <Button variant="contained" fullWidth onClick={onInvoiceClick}>Create Invoice</Button>
      </Grid>
    </Grid>
  </Paper>
);

export default QuickActions;