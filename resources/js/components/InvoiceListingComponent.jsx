import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const InvoiceListingComponent = ({ invoices, onPayClick }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Your Invoices</Typography>
      <List>
        {invoices.map((invoice) => (
          <ListItem key={invoice.id} divider>
            <ListItemText
              primary={invoice.name}
              secondary={`${invoice.amount} ${invoice.currency} - ${invoice.status}`}
            />
            <Link to={`/invoice/${invoice.id}`} style={{ textDecoration: 'none', marginRight: 10 }}>
              <Button variant="outlined">View</Button>
            </Link>
            {invoice.status === 'pending' && (
              <Button variant="contained" onClick={() => onPayClick(invoice)}>Pay</Button>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default InvoiceListingComponent;