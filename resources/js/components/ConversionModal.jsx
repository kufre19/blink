import React, { useState } from 'react';
import { Modal, Paper, Typography, TextField, Button, MenuItem, CircularProgress } from '@mui/material';
import TbdService from '../services/TbdService';
import RatingModal from './RatingModal';


const ConversionModal = ({ open, handleClose, user, fetchTransactions }) => {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('BTC');
    const [offerings, setOfferings] = useState([]);
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [payinDetails, setPayinDetails] = useState({});
    const [payoutDetails, setPayoutDetails] = useState({});
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quote, setQuote] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [completedTransactionId, setCompletedTransactionId] = useState(null);

    const currencies = ['USD', 'KES', 'EUR', 'BTC', 'ETH', 'NGN'];

    const handleConversion = async () => {
        setIsLoading(true);
        try {
            const matchedOfferings = await TbdService.getMatchingOfferings(fromCurrency, toCurrency);

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
        setPayinDetails({});
        setPayoutDetails({});
    };

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
                amount: amount,
                paymentDetails: payinDetails
            };

            const rfq = await TbdService.createAndSendRfq(selectedOffering, user.encrypted_portable_did, enteredPassword, payinDetailsWithAmount, payoutDetails, user.name);

            const { quote, close } = await TbdService.pollForQuote(selectedOffering.metadata.from, user.encrypted_portable_did, rfq.exchangeId, enteredPassword);

            if (quote) {
                setQuote(quote);
                const userConfirmed = window.confirm(`Do you want to place an order for ${quote.data.payin.amount} ${quote.data.payin.currencyCode} to receive ${quote.data.payout.amount} ${quote.data.payout.currencyCode}?`);

                if (userConfirmed) {
                    const order = await TbdService.createAndSendOrder(quote, user.encrypted_portable_did, enteredPassword);
                    const { statusUpdates, close } = await TbdService.pollForOrderStatus(quote.metadata.from, user.encrypted_portable_did, order.exchangeId, enteredPassword);

                    setOrderStatus(statusUpdates[statusUpdates.length - 1]);

                    if (close.data.success) {
                        alert('Order completed successfully!');
                        handleClose();

                        const transactionData = {
                            from_currency: quote.data.payin.currencyCode,
                            to_currency: quote.data.payout.currencyCode,
                            from_amount: quote.data.payin.amount,
                            to_amount: quote.data.payout.amount,
                            status: 'completed',
                            pfi_did: quote.metadata.from,
                            exchange_id: quote.exchangeId
                        };

                        try {
                            const response = await fetch('/api/transactions', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify(transactionData)
                            });

                            if (!response.ok) {
                                throw new Error('Failed to store transaction');
                            }

                            const savedTransaction = await response.json();
                            setCompletedTransactionId(savedTransaction.id);
                            setShowRatingModal(true);

                            fetchTransactions();
                        } catch (error) {
                            console.error('Error storing transaction:', error);
                        }

                    } else {
                        setError(`Order failed. Reason: ${close.data.reason}`);
                    }
                }
            } else if (close) {
                setError(`Exchange closed. Reason: ${close.data.reason}`);
            }
        } catch (error) {
            console.error('Error in offer selection process:', error);
            setError(error.message || 'An error occurred during the offer selection process. Please try again.');
        } finally {
            setIsLoading(false);
            setShowPaymentDetails(false);
        }
    };

    const handleSubmitRating = async (transactionId, rating, comment) => {
        try {
            const response = await fetch(`/api/transactions/${transactionId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ rating, comment })
            });

            if (!response.ok) {
                throw new Error('Failed to submit rating');
            }

            alert('Thank you for your feedback!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again later.');
        }
    };


    return (
        <>
            <RatingModal
                open={showRatingModal}
                handleClose={() => setShowRatingModal(false)}
                transactionId={completedTransactionId}
                onSubmitRating={handleSubmitRating}
            />

            <Modal open={open} onClose={handleClose}>
                <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
                    <Typography variant="h6" component="h2">Quick Conversion</Typography>
                    {!showPaymentDetails && (
                        <>
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
                            <Button onClick={handleConversion} variant="contained" sx={{ mt: 2 }}>
                                Get Offerings
                            </Button>
                        </>
                    )}

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
                        </>
                    )}

                    {isLoading && <CircularProgress sx={{ mt: 2 }} />}

                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
                    )}

                    {quote && (
                        <Paper sx={{ mt: 2, p: 2 }}>
                            <Typography variant="h6">Quote Received</Typography>
                            <Typography>Pay In: {quote.data.payin.amount} {quote.data.payin.currencyCode}</Typography>
                            <Typography>Receive: {quote.data.payout.amount} {quote.data.payout.currencyCode}</Typography>
                            <Typography>Expires At: {new Date(quote.data.expiresAt).toLocaleString()}</Typography>
                        </Paper>
                    )}

                    {orderStatus && (
                        <Paper sx={{ mt: 2, p: 2 }}>
                            <Typography variant="h6">Order Status</Typography>
                            <Typography>{orderStatus}</Typography>
                        </Paper>
                    )}
                </Paper>
            </Modal>
        </>



    );
};

export default ConversionModal;