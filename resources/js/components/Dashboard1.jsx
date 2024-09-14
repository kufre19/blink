import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Avatar, Modal, TextField, MenuItem, Card, CardContent, CircularProgress } from '@mui/material';
import { Bell, Settings, LogOut } from 'lucide-react';
import TbdService from '../services/TbdService';
import { DidDht } from '@web5/dids';
import { useNavigate } from 'react-router-dom';


const AccountOverview = ({ balance }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6">Account Overview</Typography>
    <Typography variant="h4">${parseFloat(balance).toFixed(2)}</Typography>
  </Paper>
);

const QuickActions = ({ onBuyClick }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6">Quick Actions</Typography>
    <Grid container spacing={1}>
      <Grid item xs={6}><Button variant="contained" fullWidth onClick={onBuyClick}>Buy</Button></Grid>
      <Grid item xs={6}><Button variant="contained" fullWidth>Sell</Button></Grid>
      <Grid item xs={6}><Button variant="outlined" fullWidth>Deposit</Button></Grid>
      <Grid item xs={6}><Button variant="outlined" fullWidth>Withdraw</Button></Grid>
    </Grid>
  </Paper>
);

const RecentTransactions = ({ transactions }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6">Recent Transactions</Typography>
    {transactions.map((transaction, index) => (
      <Typography key={index}>{transaction.type}: ${transaction.amount} - {transaction.date}</Typography>
    ))}
  </Paper>
);



const BuyModal = ({ open, handleClose, handleBuy }) => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BTC');

  const currencies = ['USD',"KES", 'EUR', 'BTC', 'ETH', 'NGN'];
  

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4 }}>
        <Typography variant="h6" component="h2">Buy Cryptocurrency</Typography>
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          select
          fullWidth
          label="From Currency"
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
        <TextField
          select
          fullWidth
          label="To Currency"
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          sx={{ mt: 2 }}
        >
          {currencies.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={() => handleBuy(amount, fromCurrency, toCurrency)} variant="contained" sx={{ mt: 2 }}>
          Get Offerings
        </Button>
      </Paper>
    </Modal>
  );
};

const OfferingsModal = ({ open, handleClose, offerings, handleOfferingSelect }) => (
  <Modal open={open} onClose={handleClose}>
    <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6" component="h2">Available Offerings</Typography>
      {offerings.map((offering, index) => (
        <Card key={index} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">Offering ID: {offering.metadata.id}</Typography>
            <Typography>Description: {offering.data.description}</Typography>
            <Typography>From: {offering.metadata.from}</Typography>
            <Typography>Payin Currency: {offering.data.payin.currencyCode}</Typography>
            <Typography>Payout Currency: {offering.data.payout.currencyCode}</Typography>
            <Typography>Exchange Rate: {offering.data.payoutUnitsPerPayinUnit}</Typography>
            <Typography>Payin Method: {offering.data.payin.methods[0].kind}</Typography>
            <Typography>Payout Method: {offering.data.payout.methods[0].kind}</Typography>
            <Typography>Estimated Settlement Time: {offering.data.payout.methods[0].estimatedSettlementTime} seconds</Typography>
            <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleOfferingSelect(offering)}>Select</Button>
          </CardContent>
        </Card>
      ))}
    </Paper>
  </Modal>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [offeringsModalOpen, setOfferingsModalOpen] = useState(false);
  const [offerings, setOfferings] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [payinDetails, setPayinDetails] = useState({});
  const [payoutDetails, setPayoutDetails] = useState({});

  const [buyAmount, setBuyAmount] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);


  const [selectedOffering, setSelectedOffering] = useState(null);
  const [quote, setQuote] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch user data and transactions
    fetchUserData();
    fetchTransactions();
  }, []);

  const handlePaymentDetailsChange = (event, isPayin) => {
    if (isPayin) {
      setPayinDetails({
        ...payinDetails,
        [event.target.name]: event.target.value
      });
    } else {
      setPayoutDetails({
        ...payoutDetails,
        [event.target.name]: event.target.value
      });
    }
  };

  const handleOfferingSelect = (offering) => {
    setSelectedOffering(offering);
    setOfferingsModalOpen(false);
    setShowPaymentDetails(true);
    // Reset payment details
    setPaymentDetails({});
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
        amount: buyAmount,
        paymentDetails: payinDetails
      };

      // const payoutDetails = selectedOffering.data.payout.methods[0].requiredPaymentDetails.properties;
      // const payoutDetailsValues = {};
      // for (const key in payoutDetails) {
      //   payoutDetailsValues[key] = paymentDetails[key];
      // }

      // console.log(selectedOffering);
      // return;
      const rfq = await TbdService.createAndSendRfq(selectedOffering, user.encrypted_portable_did, enteredPassword, payinDetailsWithAmount, payoutDetails, user.name);

    
      const { quote, close } = await TbdService.pollForQuote(selectedOffering.metadata.from, user.encrypted_portable_did, rfq.exchangeId,enteredPassword);

      if (quote) {
        setQuote(quote);
        const userConfirmed = window.confirm(`Do you want to place an order for ${quote.data.payin.amount} ${quote.data.payin.currencyCode} to receive ${quote.data.payout.amount} ${quote.data.payout.currencyCode}?`);

        if (userConfirmed) {
          const order = await TbdService.createAndSendOrder(quote, user.encrypted_portable_did,enteredPassword);
          const { statusUpdates, close } = await TbdService.pollForOrderStatus(quote.metadata.from, user.encrypted_portable_did, order.exchangeId,enteredPassword);

          setOrderStatus(statusUpdates[statusUpdates.length - 1]);

          if (close.data.success) {
            alert('Order completed successfully!');
          } else {
            alert(`Order failed. Reason: ${close.data.reason}`);
          }
        }
      } else if (close) {
        alert(`Exchange closed. Reason: ${close.data.reason}`);
      }
    } catch (error) {
      console.error('Error in offer selection process:', error);
      setError(error.message || 'An error occurred during the offer selection process. Please try again.');
    } finally {
      setIsLoading(false);
      setShowPaymentDetails(false);
    }
  };


  // const handleOfferingSelect = async (offering) => {
  //   // console.log(offering);
  //   // return;
  //   setSelectedOffering(offering);
  //   setOfferingsModalOpen(false);

  //   setIsLoading(true);
  //   try {
  //     if (!user.did) {
  //       throw new Error("User DID not found. Please ensure you're logged in.");
  //     }

  //     // Prompt for password
  //     const enteredPassword = prompt("Please enter your password to sign the transaction:");
  //     if (!enteredPassword) {
  //       throw new Error("Password is required to sign the transaction.");
  //     }


  //     const payinDetails = {
  //       amount: offering.data.payin.amount || '500', // Use offering amount if available, otherwise default
  //       paymentDetails: {
  //         accountNumber: paymentDetails.accountNumber,
  //         routingNumber: paymentDetails.routingNumber
  //       }
  //     };

  //     const payoutDetails = {
  //       address: paymentDetails.btcAddress
  //     };

    
  
    

  //     const rfq = await TbdService.createAndSendRfq(offering, user.encrypted_portable_did, enteredPassword, payinDetails, payoutDetails, user.name);

  //     const { quote, close } = await TbdService.pollForQuote(offering.metadata.from, user.encrypted_portable_did, rfq.exchangeId,enteredPassword);

  //     if (quote) {
  //       setQuote(quote);
  //       const userConfirmed = window.confirm(`Do you want to place an order for ${quote.data.payin.amount} ${quote.data.payin.currencyCode} to receive ${quote.data.payout.amount} ${quote.data.payout.currencyCode}?`);

  //       if (userConfirmed) {
  //         const order = await TbdService.createAndSendOrder(quote, user.encrypted_portable_did,enteredPassword);
  //         const { statusUpdates, close } = await TbdService.pollForOrderStatus(quote.metadata.from, user.encrypted_portable_did, order.exchangeId,enteredPassword);

  //         setOrderStatus(statusUpdates[statusUpdates.length - 1]);

  //         if (close.data.success) {
  //           alert('Order completed successfully!');
  //         } else {
  //           alert(`Order failed. Reason: ${close.data.reason}`);
  //         }
  //       }
  //     } else if (close) {
  //       alert(`Exchange closed. Reason: ${close.data.reason}`);
  //     }
  //   } catch (error) {
  //     console.error('Error in offer selection process:', error);
  //     setError(error.message || 'An error occurred during the offer selection process. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchUserData = async () => {
    // TbdService.testEncryptionDecryption();

    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        // console.log(userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const transactionsData = await response.json();
        // console.log(transactionsData)
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleBuyClick = () => {
    setBuyModalOpen(true);
  };

  const handleBuy = async (amount, fromCurrency, toCurrency) => {
    setBuyAmount(amount);
    setBuyModalOpen(false);
    try {
      const matchedOfferings = await TbdService.getMatchingOfferings(fromCurrency, toCurrency);

      if (matchedOfferings.length > 0) {
        setOfferings(matchedOfferings);
        setOfferingsModalOpen(true);
      } else {
        alert('No valid offerings found for the selected currency pair.');
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
      alert('An error occurred while fetching offerings. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
  
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('encryptedPrivateKey');
        localStorage.removeItem('encryptedPortableDid');
        navigate('/signin');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };




  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Dashboard</Typography>
            <div>
              <Bell size={24} style={{ marginRight: 16 }} />
              <LogOut size={24} style={{ marginRight: 16 }} onClick={handleLogout} />
              <Avatar>{user.name[0]}</Avatar>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <AccountOverview balance={user.balance} />
        </Grid>
        <Grid item xs={12} md={6}>
          <QuickActions onBuyClick={handleBuyClick} />
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentTransactions transactions={transactions} />
        </Grid>
      </Grid>
      {isLoading && (
        <CircularProgress />
      )}
   {showPaymentDetails && selectedOffering && (
        <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Payment Details</Typography>
          {selectedOffering.data.payin.methods[0].requiredPaymentDetails &&
           selectedOffering.data.payin.methods[0].requiredPaymentDetails.properties &&
           Object.entries(selectedOffering.data.payin.methods[0].requiredPaymentDetails.properties).map(([key, value]) => (
            <TextField
              key={key}
              name={key}
              label={value.title || key}
              value={payinDetails[key] || ''}
              onChange={(e) => handlePaymentDetailsChange(e, true)}
              fullWidth
              margin="normal"
              required={selectedOffering.data.payin.methods[0].requiredPaymentDetails.required.includes(key)}
            />
          ))}
          {selectedOffering.data.payout.methods[0].requiredPaymentDetails &&
           selectedOffering.data.payout.methods[0].requiredPaymentDetails.properties &&
           Object.entries(selectedOffering.data.payout.methods[0].requiredPaymentDetails.properties).map(([key, value]) => (
            <TextField
              key={key}
              name={key}
              label={value.title || key}
              value={payoutDetails[key] || ''}
              onChange={(e) => handlePaymentDetailsChange(e, false)}
              fullWidth
              margin="normal"
              required={selectedOffering.data.payout.methods[0].requiredPaymentDetails.required.includes(key)}
            />
          ))}
          <Button onClick={handleCreateAndSendRfq} variant="contained" sx={{ mt: 2 }}>
            Create and Send RFQ
          </Button>
        </Paper>
      )}
      {error && (
        <Paper elevation={3} sx={{ mt: 2, p: 2, backgroundColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      {quote && (
        <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Quote Received</Typography>
          <Typography>Pay In: {quote.data.payin.amount} {quote.data.payin.currencyCode}</Typography>
          <Typography>Receive: {quote.data.payout.amount} {quote.data.payout.currencyCode}</Typography>
          <Typography>Expires At: {new Date(quote.data.expiresAt).toLocaleString()}</Typography>
        </Paper>
      )}
      {orderStatus && (
        <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Order Status</Typography>
          <Typography>{orderStatus}</Typography>
        </Paper>
      )}
      <BuyModal open={buyModalOpen} handleClose={() => setBuyModalOpen(false)} handleBuy={handleBuy} />
      <OfferingsModal open={offeringsModalOpen} handleClose={() => setOfferingsModalOpen(false)} offerings={offerings} handleOfferingSelect={handleOfferingSelect} />
    </Container>
  );
};

export default Dashboard;