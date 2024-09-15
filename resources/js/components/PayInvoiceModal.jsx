import React, { useState, useEffect } from 'react';
import { Modal, Paper, Typography, TextField, Button, MenuItem, CircularProgress } from '@mui/material';
import TbdService from '../services/TbdService';
import RatingModal from './RatingModal';


const PayInvoiceModal = ({ open, handleClose, user, invoice }) => {
    const [fromCurrency, setFromCurrency] = useState('');
    const [offerings, setOfferings] = useState([]);
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [payinDetails, setPayinDetails] = useState({});
    const [payoutDetails, setPayoutDetails] = useState({});
    const [invoiceCreatorPaymentDetails, setInvoiceCreatorPaymentDetails] = useState({});
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quote, setQuote] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [completedTransactionId, setCompletedTransactionId] = useState(null);

    const currencies = ['USD', 'NGN', 'KES', 'BTC'];

    useEffect(() => {
        if (user && user.payment_details) {
            setPayoutDetails({
                btc_address: user.payment_details.btc_address,
                kes_account_number: user.payment_details.kes_account_number,
            });
        }
    }, [user]);

    useEffect(() => {
        fetchInvoiceCreatorPaymentDetails();
    }, [invoice]);

    const fetchInvoiceCreatorPaymentDetails = async () => {
        try {
            const response = await fetch(`/api/users/${invoice.user_id}/payment-details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setInvoiceCreatorPaymentDetails(data);
            } else {
                throw new Error('Failed to fetch invoice creator payment details');
            }
        } catch (error) {
            console.error('Error fetching invoice creator payment details:', error);
            setError('Failed to fetch payment details. Please try again.');
        }
    };


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

        // Reset payin details
        setPayinDetails({});

        // Set up required fields based on the currency pair
        if (fromCurrency === 'USD' && invoice.currency === 'BTC') {
            // For USD -> BTC, we need USD account details from the payer
            setPayinDetails({
                accountNumber: '',
                routingNumber: '',
            });
        }
        // For NGN -> KES, we don't need any additional details from the payer
    };

    const handlePayinDetailsChange = (e) => {
        console.log({ ...payinDetails, [e.target.name]: e.target.value });
        setPayinDetails({ ...payinDetails, [e.target.name]: e.target.value });
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

            let finalPayinDetails = {
                amount: invoice.amount,
                paymentDetails: payinDetails
            };

            let finalPayoutDetails = {};

            if (fromCurrency === 'USD' && invoice.currency === 'BTC') {
                finalPayoutDetails = {
                    address: invoiceCreatorPaymentDetails.btc_address
                };
            } else if (fromCurrency === 'NGN' && invoice.currency === 'KES') {
                finalPayoutDetails = {
                    kes_account_number: invoiceCreatorPaymentDetails.kes_account_number
                };
            }

            const rfq = await TbdService.createAndSendRfq(selectedOffering, user.encrypted_portable_did, enteredPassword, finalPayinDetails, finalPayoutDetails, user.name);

            const { quote, close } = await TbdService.pollForQuote(selectedOffering.metadata.from, user.encrypted_portable_did, rfq.exchangeId, enteredPassword);

            if (quote) {
                setQuote(quote);
                const userConfirmed = window.confirm(`Do you want to place an order for ${quote.data.payin.amount} ${quote.data.payin.currencyCode} to pay ${invoice.amount} ${invoice.currency}?`);

                if (userConfirmed) {
                    const order = await TbdService.createAndSendOrder(quote, user.encrypted_portable_did, enteredPassword);
                    const { statusUpdates, close } = await TbdService.pollForOrderStatus(quote.metadata.from, user.encrypted_portable_did, order.exchangeId, enteredPassword);

                    setOrderStatus(statusUpdates[statusUpdates.length - 1]);


                    if (close.data.success) {
                        const updateResponse = await fetch(`/api/invoices/${invoice.id}/pay`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                        });

                        if (updateResponse.ok) {
                            alert('Payment completed successfully and invoice status updated!');

                            const transactionData = {
                                from_currency: quote.data.payin.currencyCode,
                                to_currency: quote.data.payout.currencyCode,
                                from_amount: quote.data.payin.amount,
                                to_amount: quote.data.payout.amount,
                                status: 'completed',
                                pfi_did: quote.metadata.from,
                                exchange_id: quote.exchangeId,
                                // invoice_id: invoice.id
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
                                // alert("ok trx sved")
                                setShowRatingModal(true);
                            } catch (error) {
                                console.error('Error storing transaction:', error);
                            }
                        } else {
                            console.error('Failed to update invoice status');
                            alert('Payment completed, but failed to update invoice status. Please contact support.');
                        }
                        // handleClose();
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
            handleClose();
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
                            {fromCurrency === 'USD' && invoice.currency === 'BTC' && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="USD Account Number"
                                        name="accountNumber"
                                        value={payinDetails.accountNumber || ''}
                                        onChange={handlePayinDetailsChange}
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        label="USD Routing Number"
                                        name="routingNumber"
                                        value={payinDetails.routingNumber || ''}
                                        onChange={handlePayinDetailsChange}
                                        margin="normal"
                                    />
                                </>
                            )}
                            {fromCurrency === 'NGN' && invoice.currency === 'KES' && (
                                <Typography>Payment will be made to your KES account on file.</Typography>
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


        </>

    );
};

export default PayInvoiceModal;