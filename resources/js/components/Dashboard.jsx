import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Avatar, Modal, Box } from '@mui/material';
import { Bell, LogOut, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountOverview from './AccountOverview';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import InvoiceListingComponent from './InvoiceListingComponent';
import ConversionModal from './ConversionModal';
import InvoiceModal from './InvoiceModal';
import PayInvoiceModal from './PayInvoiceModal';
import TbdService from '../services/TbdService';


const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [conversionModalOpen, setConversionModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [payInvoiceModalOpen, setPayInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const navigate = useNavigate();
    const [exportDidModalOpen, setExportDidModalOpen] = useState(false);
    const [exportedDid, setExportedDid] = useState('');


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

    const handleExportDid = async () => {
        try {
            const encryptedPortableDid = user.encrypted_portable_did;
            const password = prompt("Enter your password to export your DID:");
            if (!password) return;

            const exportedDid = await TbdService.exportPortableDid(encryptedPortableDid, password);
            setExportedDid(JSON.stringify(exportedDid, null, 2));
            setExportDidModalOpen(true);
        } catch (error) {
            console.error('Error exporting DID:', error);
            alert('Failed to export DID. Please check your password and try again.');
        }
    };


    const handleCopyDid = () => {
        navigator.clipboard.writeText(exportedDid);
        alert('DID copied to clipboard!');
    };

    const handleDownloadDid = () => {
        const blob = new Blob([exportedDid], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portable-did.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleExportDid}
                                sx={{ mr: 2 }}
                            >
                                Export DID
                            </Button>
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
           <Modal
                open={exportDidModalOpen}
                onClose={() => setExportDidModalOpen(false)}
                aria-labelledby="export-did-modal"
                aria-describedby="modal-to-display-exported-did"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="export-did-modal" variant="h6" component="h2">
                        Exported Portable DID
                    </Typography>
                    <Box sx={{ mt: 2, mb: 2, maxHeight: '200px', overflow: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {exportedDid}
                        </pre>
                    </Box>
                    <Button onClick={handleCopyDid} variant="contained" sx={{ mr: 1 }}>Copy to Clipboard</Button>
                    <Button onClick={handleDownloadDid} variant="outlined">Download as JSON</Button>
                </Box>
            </Modal>

        </Container>
    );
};

export default Dashboard;