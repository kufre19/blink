import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const RecentTransactions = ({ transactions }) => (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
      <List>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={`${transaction.from_amount} ${transaction.from_currency} → ${transaction.to_amount} ${transaction.to_currency}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Status: {transaction.status}
                    </Typography>
                    {` — ${new Date(transaction.created_at).toLocaleString()}`}
                  </>
                }
              />
            </ListItem>
            {index < transactions.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
);

export default RecentTransactions;