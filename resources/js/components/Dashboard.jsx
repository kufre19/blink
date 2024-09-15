import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Avatar } from '@mui/material';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountOverview from './AccountOverview';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import InvoiceListingComponent from './InvoiceListingComponent';
import ConversionModal from './ConversionModal';
import InvoiceModal from './InvoiceModal';
import PayInvoiceModal from './PayInvoiceModal';
import { Link } from 'react-router-dom';


const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [conversionModalOpen, setConversionModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [payInvoiceModalOpen, setPayInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        fetchUserData();
        fetchTransactions();
        fetchInvoices();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const userData = await response.json();
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
                setTransactions(transactionsData);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchInvoices = async () => {
        try {
            const response = await fetch('/api/invoices', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const invoicesData = await response.json();
                setInvoices(invoicesData);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };


    const handlePayInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setPayInvoiceModalOpen(true);
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
                    <QuickActions
                        onConversionClick={() => setConversionModalOpen(true)}
                        onInvoiceClick={() => setInvoiceModalOpen(true)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <RecentTransactions transactions={transactions} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <InvoiceListingComponent
                        invoices={invoices}
                        onPayClick={handlePayInvoice}
                        user={user}
                    />
                </Grid>
            </Grid>
            <ConversionModal
                open={conversionModalOpen}
                handleClose={() => setConversionModalOpen(false)}
                user={user}
                fetchTransactions={fetchTransactions}
            />

            <InvoiceModal
                open={invoiceModalOpen}
                handleClose={() => {
                    setInvoiceModalOpen(false);
                    fetchInvoices();
                }}
                user={user}
            />

            {selectedInvoice && (
                <PayInvoiceModal
                    open={payInvoiceModalOpen}
                    handleClose={() => {
                        setPayInvoiceModalOpen(false);
                        setSelectedInvoice(null);
                        fetchInvoices();
                    }}
                    user={user}
                    invoice={selectedInvoice}
                />
            )}
{/* 
            <Button component={Link} to="/profile" variant="contained" color="primary" sx={{ mt: 2 }}>
                Update Payment Details
            </Button> */}
        </Container>
    );
};

export default Dashboard;