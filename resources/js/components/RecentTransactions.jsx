import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const RecentTransactions = ({ transactions }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
    <List>
      {transactions.map((transaction, index) => (
        <React.Fragment key={transaction.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={`${transaction.type}: $${parseFloat(transaction.amount).toFixed(2)}`}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    {new Date(transaction.date).toLocaleDateString()}
                  </Typography>
                  {` — ${transaction.description}`}
                </>
              }
            />
          </ListItem>
          {index < transactions.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
    {transactions.length === 0 && (
      <Typography variant="body2" color="textSecondary">
        No recent transactions.
      </Typography>
    )}
  </Paper>
);

export default RecentTransactions;