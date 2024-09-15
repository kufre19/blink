import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button, Tabs, Tab, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const InvoiceListingComponent = ({ invoices, onPayClick, user }) => {
  const [tabValue, setTabValue] = React.useState(0);

//   const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const createdInvoices = invoices.filter(invoice => invoice.user_id === user.id);
  const receivedInvoices = invoices.filter(invoice => invoice.recipient_id === user.id);

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Created Invoices" />
        <Tab label="Invoices to Pay" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6">Your Created Invoices</Typography>
        <InvoiceList invoices={createdInvoices} onPayClick={onPayClick} user={user} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6">Invoices to Pay</Typography>
        <InvoiceList invoices={receivedInvoices} onPayClick={onPayClick} user={user} showCreator={true} />
      </TabPanel>
    </Paper>
  );
};

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };
  

const InvoiceList = ({ invoices, onPayClick, user, showCreator }) => (
    <List>
      {invoices.map((invoice) => (
        <ListItem key={invoice.id} divider>
          <ListItemText
            primary={invoice.name}
            secondary={
              <>
                {`${invoice.amount} ${invoice.currency} - ${invoice.status}`}
                {showCreator && invoice.user && ` - From: ${invoice.user.name}`}
              </>
            }
          />
          <Link to={`/invoice/${invoice.id}`} style={{ textDecoration: 'none', marginRight: 10 }}>
            <Button variant="outlined">View</Button>
          </Link>
          {invoice.status === 'pending' && user.id === invoice.recipient_id && (
            <Button variant="contained" onClick={() => onPayClick(invoice)}>Pay</Button>
          )}
        </ListItem>
      ))}
    </List>
  );

export default InvoiceListingComponent;