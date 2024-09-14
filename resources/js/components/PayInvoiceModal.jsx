import React, { useState, useEffect } from 'react';
import { Modal, Paper, Typography, TextField, Button, MenuItem, CircularProgress } from '@mui/material';
import TbdService from '../services/TbdService';

const PayInvoiceModal = ({ open, handleClose, user, invoice }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [payinDetails, setPayinDetails] = useState({});
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  const currencies = ['USD', 'KES', 'BTC'];

  useEffect(() => {
    if (user && user.payment_details) {
      setPayinDetails({
        btc_address: user.payment_details.btc_address,
        usd_account_number: user.payment_details.usd_account_number,
        usd_routing_number: user.payment_details.usd_routing_number,
        kes_account_number: user.payment_details.kes_account_number,
      });
    }
  }, [user]);

  const handleGetOfferings = async () => {
    setIsLoading(true);
    try {
      const matchedOfferings = await TbdService.getMatchingOfferings(fromCurrency, invoice.currency);

      if (matchedOfferings.length > 0) {
        setOfferings(matchedOfferings);
        setShowPaymentDetails(false);
      } else {
        setError('No valid offerings found for the selected currency pair.');
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
      setError('An error occurred while fetching offerings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferingSelect = (offering) => {
    setSelectedOffering(offering);
    setShowPaymentDetails(true);
  };

  const handleCreateAndSendRfq = async () => {
    setIsLoading(true);
    try {
      if (!user.did) {
        throw new Error("User DID not found. Please ensure you're logged in.");
      }

      const enteredPassword = prompt("Please enter your password to sign the transaction:");
      if (!enteredPassword) {
        throw new Error("Password is required to sign the transaction.");
      }

      const payinDetailsWithAmount = {
        amount: invoice.amount,
        paymentDetails: payinDetails
      };

      const payoutDetails = {
        [invoice.currency.toLowerCase() + '_account_number']: user.payment_details[invoice.currency.toLowerCase() + '_account_number']
      };

      const rfq = await TbdService.createAndSendRfq(selectedOffering, user.encrypted_portable_did, enteredPassword, payinDetailsWithAmount, payoutDetails, user.name);

      const { quote, close } = await TbdService.pollForQuote(selectedOffering.metadata.from, user.encrypted_portable_did, rfq.exchangeId, enteredPassword);

      if (quote) {
        setQuote(quote);
        const userConfirmed = window.confirm(`Do you want to place an order for ${quote.data.payin.amount} ${quote.data.payin.currencyCode} to pay ${invoice.amount} ${invoice.currency}?`);

        if (userConfirmed) {
          const order = await TbdService.createAndSendOrder(quote, user.encrypted_portable_did, enteredPassword);
          const { statusUpdates, close } = await TbdService.pollForOrderStatus(quote.metadata.from, user.encrypted_portable_did, order.exchangeId, enteredPassword);

          setOrderStatus(statusUpdates[statusUpdates.length - 1]);

          if (close.data.success) {
            alert('Payment completed successfully!');
            // Update invoice status to 'paid' here
            handleClose();
          } else {
            setError(`Payment failed. Reason: ${close.data.reason}`);
          }
        }
      } else if (close) {
        setError(`Exchange closed. Reason: ${close.data.reason}`);
      }
    } catch (error) {
      console.error('Error in payment process:', error);
      setError(error.message || 'An error occurred during the payment process. Please try again.');
    } finally {
      setIsLoading(false);
      setShowPaymentDetails(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
        <Typography variant="h6" component="h2">Pay Invoice</Typography>
        <Typography>Amount to Pay: {invoice.amount} {invoice.currency}</Typography>
        <TextField
          select
          fullWidth
          label="Pay With Currency"
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          sx={{ mt: 2 }}
        >
          {currencies.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={handleGetOfferings} variant="contained" sx={{ mt: 2 }}>
          Get Offerings
        </Button>

        {offerings.length > 0 && !showPaymentDetails && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>Available Offerings</Typography>
            {offerings.map((offering, index) => (
              <Paper key={index} sx={{ mt: 2, p: 2 }}>
                <Typography>Exchange Rate: {offering.data.payoutUnitsPerPayinUnit}</Typography>
                <Typography>Estimated Settlement Time: {offering.data.payout.methods[0].estimatedSettlementTime} seconds</Typography>
                <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleOfferingSelect(offering)}>Select</Button>
              </Paper>
            ))}
          </>
        )}

        {showPaymentDetails && selectedOffering && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>Payment Details</Typography>
            {fromCurrency === 'USD' && (
              <>
                <TextField
                  fullWidth
                  label="USD Account Number"
                  value={payinDetails.usd_account_number || ''}
                  disabled
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="USD Routing Number"
                  value={payinDetails.usd_routing_number || ''}
                  disabled
                  margin="normal"
                />
              </>
            )}
            {fromCurrency === 'KES' && (
              <TextField
                fullWidth
                label="KES Account Number"
                value={payinDetails.kes_account_number || ''}
                disabled
                margin="normal"
              />
            )}
            {fromCurrency === 'BTC' && (
              <TextField
                fullWidth
                label="BTC Address"
                value={payinDetails.btc_address || ''}
                disabled
                margin="normal"
              />
            )}
            <Button onClick={handleCreateAndSendRfq} variant="contained" sx={{ mt: 2 }}>
              Pay Invoice
            </Button>
          </>
        )}

        {isLoading && <CircularProgress sx={{ mt: 2 }} />}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
        )}

        {quote && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6">Quote Received</Typography>
            <Typography>Pay: {quote.data.payin.amount} {quote.data.payin.currencyCode}</Typography>
            <Typography>To Pay Invoice: {invoice.amount} {invoice.currency}</Typography>
            <Typography>Expires At: {new Date(quote.data.expiresAt).toLocaleString()}</Typography>
          </Paper>
        )}

        {orderStatus && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6">Payment Status</Typography>
            <Typography>{orderStatus}</Typography>
          </Paper>
        )}
      </Paper>
    </Modal>
  );
};

export default PayInvoiceModal;