// "use client";

// import { useState, useMemo, useRef } from "react";
// import {
//   Select, MenuItem, InputLabel, FormControl, TextField, Checkbox,
//   FormControlLabel, Button, Card, CardContent, Typography, Box, Grid,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Divider,
//   Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Snackbar, Alert
// } from "@mui/material";
// import type { SelectChangeEvent } from '@mui/material/Select';
// import { SolarPower, PriceCheck, RestartAlt, TableChart, PictureAsPdf, WhatsApp } from "@mui/icons-material";
// import { motion, AnimatePresence } from "framer-motion";
// import { useReactToPrint } from "react-to-print";

// import type { Product } from '../types/quote';
// import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from '../data/priceList';
// import { formatCurrency } from '../lib/utils';

// export default function SolarPricingPage() {
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
//   const [extraMargin, setExtraMargin] = useState<number>(0);
//   const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
//   const [extraWireLength, setExtraWireLength] = useState<number>(0);
//   const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
//   const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
//   const [location, setLocation] = useState<string>("Varanasi");
//   const [salespersonName, setSalespersonName] = useState<string>("");

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

//   const printRef = useRef<HTMLDivElement>(null);

//   const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = useMemo(() => {
//     if (!selectedProduct) return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
//     const basePriceVal = selectedProduct.price;
//     const marginPriceVal = extraMargin;
//     const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
//     const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE : 0;
//     const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;
//     const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
//     const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
//     const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
//     return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
//   }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

//   const handleReset = () => {
//     setSelectedProduct(products[0] || null);
//     setExtraMargin(0);
//     setExtraWireChecked(false);
//     setExtraWireLength(0);
//     setExtraHeightChecked(false);
//     setExtraHeightValue(0);
//     setLocation("Varanasi");
//     setSalespersonName("");
//   };

//   // ✅ FIXED: Correct usage of the useReactToPrint hook
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: `Quotation_ArpitSolar_${new Date().toISOString().slice(0, 10)}`,
//   });

//   const handleOpenDialog = () => setDialogOpen(true);
//   const handleCloseDialog = () => setDialogOpen(false);

//   const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
//   };

//   const handleSendQuote = async () => {
//     if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
//         setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: 'error' });
//         return;
//     }
//     setLoading(true);
//     handleCloseDialog();

//     const customerSubtotal = basePrice + wirePrice + heightPrice + outOfVnsPrice;
//     const customerGst = customerSubtotal * GST_RATE;
//     const customerTotal = customerSubtotal + customerGst;

//     const payload = {
//       customerInfo,
//       selectedProduct,
//       salespersonName,
//       location,
//       calculations: { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal: customerSubtotal, gstAmount: customerGst, total: customerTotal }
//     };

//     try {
//       const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Failed to send quote');
//       setNotification({ open: true, message: 'Quotation sent successfully!', severity: 'success' });
//     } catch (error: any) {
//       setNotification({ open: true, message: error.message, severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!selectedProduct) return <Typography>No Products Available</Typography>

//   const animationVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//     exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
//   };

//   return (
//     <>
//       <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
//         <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
//             </Box>
//             <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}><SolarPower sx={{ verticalAlign: 'middle' }} /> Solar Pricing Calculator</Typography>
            
//             <Grid container spacing={4}>
//                 {/* ✅ FIXED: GRID COMPONENT */}
//                 <Grid item xs={12} lg={7}>
//                     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//                         <CardContent sx={{ p: 3 }}>
//                             <Typography variant="h6" sx={{ mb: 3 }}>Configuration</Typography>
//                             <Grid container spacing={3}>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="product-select-label">Select Product</InputLabel>
//                                     <Select labelId="product-select-label" label="Select Product" value={`${selectedProduct.kWp}-${selectedProduct.phase}`} onChange={(e: SelectChangeEvent) => { const [kWp, phase] = e.target.value.split("-").map(parseFloat); setSelectedProduct(products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]); }}>
//                                         {products.map((p) => <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{`${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`}</MenuItem>)}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12} sm={6}><TextField label="Salesperson Name" fullWidth value={salespersonName} onChange={(e) => setSalespersonName(e.target.value)} /></Grid>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12} sm={6}><TextField label="Extra Margin" type="number" fullWidth value={extraMargin === 0 ? '' : extraMargin} onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel id="location-select-label">Location</InputLabel><Select labelId="location-select-label" label="Location" value={location} onChange={(e) => setLocation(e.target.value)}><MenuItem value="Varanasi">Varanasi</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl></Grid>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12}><FormControlLabel control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />} label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`} /><AnimatePresence>{extraWireChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit"><TextField label="Extra Wire Length (m)" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraWireLength === 0 ? '' : extraWireLength} onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))} /></motion.div>}</AnimatePresence></Grid>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12}><FormControlLabel control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />} label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)}/kWp)`} /><AnimatePresence>{extraHeightChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit"><TextField label="Extra Height kWp" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraHeightValue === 0 ? '' : extraHeightValue} onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))} /></motion.div>}</AnimatePresence></Grid>
//                                 {/* ✅ FIXED: GRID COMPONENT */}
//                                 <Grid item xs={12} sx={{ mt: 2 }}><Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}><Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button><Button variant="contained" onClick={handlePrint} startIcon={<PictureAsPdf />}>Print Internal PDF</Button><Button variant="contained" color="success" onClick={handleOpenDialog} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? 'Sending...' : 'Send on WhatsApp'}</Button></Box></Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//                 {/* ✅ FIXED: GRID COMPONENT */}
//                 <Grid item xs={12} lg={5}>
//                     <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
//                         <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
//                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}><PriceCheck /> Price Breakdown</Typography>
//                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                                 {[{ label: "Base Price", value: basePrice }, { label: "Extra Margin", value: marginPrice, bold: true }, { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true }, { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true }, { label: "Extra Wire Cost", value: wirePrice }, { label: "Extra Height Cost", value: heightPrice }, { label: "Out of Varanasi Charge", value: outOfVnsPrice }].map((item) => (item.value > 0 || item.label === "Base Price") && <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', pl: item.indent ? 2 : 0, color: item.indent ? 'text.secondary' : 'text.primary', fontSize: item.indent ? '0.9rem' : '1rem' }}><Typography variant="body1">{item.label}:</Typography><Typography variant="body1" fontWeight={item.bold ? '600' : '400'}>{formatCurrency(item.value)}</Typography></Box>)}
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
//                             </Box>
//                         </Paper>
//                     </motion.div>
//                 </Grid>
//             </Grid>
//         </Box>
//       </Box>

//       <Dialog open={dialogOpen} onClose={handleCloseDialog}>
//         <DialogTitle>Send Quotation to Customer</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2 }}>Enter customer details. The quote will be sent to their WhatsApp.</DialogContentText>
//           <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange}/>
//           <TextField margin="dense" name="phone" label="WhatsApp Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange}/>
//           <TextField margin="dense" name="address" label="Customer Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange}/>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSendQuote}>Send</Button>
//         </DialogActions>
//       </Dialog>
      
//       <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
//         <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
//       </Snackbar>
      
//       <Box sx={{ display: 'none' }}><Box ref={printRef} sx={{p: 4}}> {/* TODO: Internal Print Content */} </Box></Box>
//     </>
//   );
// }











// "use client";

// import { useState, useMemo, useRef } from "react";
// import {
//   Select, MenuItem, InputLabel, FormControl, TextField, Checkbox,
//   FormControlLabel, Button, Card, CardContent, Typography, Box,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Divider,
//   Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Snackbar, Alert
// } from "@mui/material";
// import type { SelectChangeEvent } from '@mui/material/Select';
// import Grid from '@mui/material/Grid';
// import { SolarPower, PriceCheck, RestartAlt, TableChart, PictureAsPdf, WhatsApp } from "@mui/icons-material";
// import { motion, AnimatePresence } from "framer-motion";
// import { useReactToPrint } from "react-to-print";

// import type { Product } from '../types/quote';
// import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from '../data/priceList';
// import { formatCurrency } from '../lib/utils';

// export default function SolarPricingPage() {
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
//   const [extraMargin, setExtraMargin] = useState<number>(0);
//   const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
//   const [extraWireLength, setExtraWireLength] = useState<number>(0);
//   const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
//   const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
//   const [location, setLocation] = useState<string>("Varanasi");
//   const [salespersonName, setSalespersonName] = useState<string>("");
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
//   const printRef = useRef<HTMLDivElement>(null);

//   const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = useMemo(() => {
//     if (!selectedProduct) return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
//     const basePriceVal = selectedProduct.price;
//     const marginPriceVal = extraMargin;
//     const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
//     const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE : 0;
//     const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;
//     const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
//     const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
//     const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
//     return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
//   }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

//   const handleReset = () => {
//     setSelectedProduct(products[0] || null);
//     setExtraMargin(0);
//     setExtraWireChecked(false);
//     setExtraWireLength(0);
//     setExtraHeightChecked(false);
//     setExtraHeightValue(0);
//     setLocation("Varanasi");
//     setSalespersonName("");
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: `Quotation_ArpitSolar_${new Date().toISOString().slice(0, 10)}`,
//   });

//   const handleOpenDialog = () => setDialogOpen(true);
//   const handleCloseDialog = () => setDialogOpen(false);

//   const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
//   };

//   const handleSendQuote = async () => {
//     if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
//         setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: 'error' });
//         return;
//     }
//     setLoading(true);
//     handleCloseDialog();
//     const customerSubtotal = basePrice + wirePrice + heightPrice + outOfVnsPrice;
//     const customerGst = customerSubtotal * GST_RATE;
//     const customerTotal = customerSubtotal + customerGst;
//     const payload = {
//       customerInfo,
//       selectedProduct,
//       salespersonName,
//       location,
//       calculations: { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal: customerSubtotal, gstAmount: customerGst, total: customerTotal }
//     };

//     try {
//       const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Failed to send quote');
//       setNotification({ open: true, message: 'Quotation sent successfully!', severity: 'success' });
//     } catch (error: any) {
//       setNotification({ open: true, message: error.message, severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!selectedProduct) return <Typography>No Products Available</Typography>;

//   const animationVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//     exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
//   };

//   return (
//     <>
//       <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
//         <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
//             </Box>
//             <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
//               <SolarPower sx={{ verticalAlign: 'middle' }} /> Solar Pricing Calculator
//             </Typography>
//             <Grid container spacing={4}>
//                 <Grid item xs={12} lg={7}>
//                     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//                         <CardContent sx={{ p: 3 }}>
//                             <Typography variant="h6" sx={{ mb: 3 }}>Configuration</Typography>
//                             <Grid container spacing={3}>
//                                 <Grid item xs={12}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="product-select-label">Select Product</InputLabel>
//                                     <Select labelId="product-select-label" label="Select Product" value={`${selectedProduct.kWp}-${selectedProduct.phase}`} onChange={(e: SelectChangeEvent) => { const [kWp, phase] = e.target.value.split("-").map(parseFloat); setSelectedProduct(products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]); }}>
//                                         {products.map((p) => <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{`${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`}</MenuItem>)}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <TextField label="Salesperson Name" fullWidth value={salespersonName} onChange={(e) => setSalespersonName(e.target.value)} />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <TextField label="Extra Margin" type="number" fullWidth value={extraMargin === 0 ? '' : extraMargin} onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="location-select-label">Location</InputLabel>
//                                     <Select labelId="location-select-label" label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
//                                       <MenuItem value="Varanasi">Varanasi</MenuItem>
//                                       <MenuItem value="Other">Other</MenuItem>
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />} label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`} />
//                                   <AnimatePresence>
//                                     {extraWireChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Wire Length (m)" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraWireLength === 0 ? '' : extraWireLength} onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />} label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)}/kWp)`} />
//                                   <AnimatePresence>
//                                     {extraHeightChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Height kWp" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraHeightValue === 0 ? '' : extraHeightValue} onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid item xs={12} sx={{ mt: 2 }}>
//                                   <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                                     <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
//                                     <Button variant="contained" onClick={handlePrint} startIcon={<PictureAsPdf />}>Print Internal PDF</Button>
//                                     <Button variant="contained" color="success" onClick={handleOpenDialog} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? 'Sending...' : 'Send on WhatsApp'}</Button>
//                                   </Box>
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//                 <Grid item xs={12} lg={5}>
//                     <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
//                         <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
//                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}><PriceCheck /> Price Breakdown</Typography>
//                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                                 {[{ label: "Base Price", value: basePrice }, { label: "Extra Margin", value: marginPrice, bold: true }, { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true }, { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true }, { label: "Extra Wire Cost", value: wirePrice }, { label: "Extra Height Cost", value: heightPrice }, { label: "Out of Varanasi Charge", value: outOfVnsPrice }].map((item) => (item.value > 0 || item.label === "Base Price") && <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', pl: item.indent ? 2 : 0, color: item.indent ? 'text.secondary' : 'text.primary', fontSize: item.indent ? '0.9rem' : '1rem' }}><Typography variant="body1">{item.label}:</Typography><Typography variant="body1" fontWeight={item.bold ? '600' : '400'}>{formatCurrency(item.value)}</Typography></Box>)}
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
//                             </Box>
//                         </Paper>
//                     </motion.div>
//                 </Grid>
//             </Grid>
//         </Box>
//       </Box>
//       <Dialog open={dialogOpen} onClose={handleCloseDialog}>
//         <DialogTitle>Send Quotation to Customer</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2 }}>Enter customer details. The quote will be sent to WhatsApp.</DialogContentText>
//           <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSendQuote} variant="contained" color="success">Send</Button>
//         </DialogActions>
//       </Dialog>
//       <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
//         <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
//           {notification.message}
//         </Alert>
//       </Snackbar>
//       <div style={{ display: "none" }}>
//         <div ref={printRef}>
//             {/* You can add a structured print component here later */}
//             <h2>Arpit Solar Quotation</h2>
//             <p><strong>To:</strong> {customerInfo.name}</p>
//             <p><strong>Total:</strong> {formatCurrency(total)}</p>
//         </div>
//       </div>
//     </>
//   );
// }












// "use client";

// import { useState, useMemo, useRef } from "react";
// import {
//   Select, MenuItem, InputLabel, FormControl, TextField, Checkbox,
//   FormControlLabel, Button, Card, CardContent, Typography, Box,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Divider,
//   Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Snackbar, Alert
// } from "@mui/material";
// import type { SelectChangeEvent } from '@mui/material/Select';
// import Grid from '@mui/material/Grid';
// import { SolarPower, PriceCheck, RestartAlt, TableChart, PictureAsPdf, WhatsApp } from "@mui/icons-material";
// import { motion, AnimatePresence } from "framer-motion";
// import { useReactToPrint } from "react-to-print";

// import type { Product } from '../types/quote';
// import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from '../data/priceList';
// import { formatCurrency } from '../lib/utils';

// export default function SolarPricingPage() {
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
//   const [extraMargin, setExtraMargin] = useState<number>(0);
//   const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
//   const [extraWireLength, setExtraWireLength] = useState<number>(0);
//   const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
//   const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
//   const [location, setLocation] = useState<string>("Varanasi");
//   const [salespersonName, setSalespersonName] = useState<string>("");
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

//   const printRef = useRef<HTMLDivElement>(null);

//   const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = useMemo(() => {
//     if (!selectedProduct) return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
//     const basePriceVal = selectedProduct.price;
//     const marginPriceVal = extraMargin;
//     const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
//     const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE : 0;
//     const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;
//     const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
//     const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
//     const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
//     return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
//   }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

//   const handleReset = () => {
//     setSelectedProduct(products[0] || null);
//     setExtraMargin(0);
//     setExtraWireChecked(false);
//     setExtraWireLength(0);
//     setExtraHeightChecked(false);
//     setExtraHeightValue(0);
//     setLocation("Varanasi");
//     setSalespersonName("");
//   };

//   const handlePrint = useReactToPrint({
//     contentRef: printRef,
//     documentTitle: `Quotation_ArpitSolar_${new Date().toISOString().slice(0, 10)}`,
//   });

//   const handleOpenDialog = () => setDialogOpen(true);
//   const handleCloseDialog = () => setDialogOpen(false);
//   const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
//   };

//   const handleSendQuote = async () => {
//     if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
//         setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: 'error' });
//         return;
//     }
//     setLoading(true);
//     handleCloseDialog();
//     const customerSubtotal = basePrice + wirePrice + heightPrice + outOfVnsPrice;
//     const customerGst = customerSubtotal * GST_RATE;
//     const customerTotal = customerSubtotal + customerGst;
//     const payload = {
//       customerInfo,
//       selectedProduct,
//       salespersonName,
//       location,
//       calculations: { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal: customerSubtotal, gstAmount: customerGst, total: customerTotal }
//     };

//     try {
//       const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Failed to send quote');
//       setNotification({ open: true, message: 'Quotation sent successfully!', severity: 'success' });
//     } catch (error: any) {
//       setNotification({ open: true, message: error.message, severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!selectedProduct) return <Typography>No Products Available</Typography>;

//   const animationVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//     exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
//   };

//   return (
//     <>
//       <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
//         <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
//             </Box>
//             <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
//               <SolarPower sx={{ verticalAlign: 'middle' }} /> Solar Pricing Calculator
//             </Typography>
//             <Grid container spacing={4}>
//                 <Grid item xs={12} lg={7}>
//                     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//                         <CardContent sx={{ p: 3 }}>
//                             <Typography variant="h6" sx={{ mb: 3 }}>Configuration</Typography>
//                             <Grid container spacing={3}>
//                                 <Grid item xs={12}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="product-select-label">Select Product</InputLabel>
//                                     <Select labelId="product-select-label" label="Select Product" value={`${selectedProduct.kWp}-${selectedProduct.phase}`} onChange={(e: SelectChangeEvent) => { const [kWp, phase] = e.target.value.split("-").map(parseFloat); setSelectedProduct(products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]); }}>
//                                         {products.map((p) => <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{`${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`}</MenuItem>)}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <TextField label="Salesperson Name" fullWidth value={salespersonName} onChange={(e) => setSalespersonName(e.target.value)} />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <TextField label="Extra Margin" type="number" fullWidth value={extraMargin === 0 ? '' : extraMargin} onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="location-select-label">Location</InputLabel>
//                                     <Select labelId="location-select-label" label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
//                                       <MenuItem value="Varanasi">Varanasi</MenuItem>
//                                       <MenuItem value="Other">Other</MenuItem>
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />} label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`} />
//                                   <AnimatePresence>
//                                     {extraWireChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Wire Length (m)" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraWireLength === 0 ? '' : extraWireLength} onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />} label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)}/kWp)`} />
//                                   <AnimatePresence>
//                                     {extraHeightChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Height kWp" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraHeightValue === 0 ? '' : extraHeightValue} onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid item xs={12} sx={{ mt: 2 }}>
//                                   <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                                     <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
//                                     <Button variant="contained" onClick={handlePrint} startIcon={<PictureAsPdf />}>Print Internal PDF</Button>
//                                     <Button variant="contained" color="success" onClick={handleOpenDialog} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? 'Sending...' : 'Send on WhatsApp'}</Button>
//                                   </Box>
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//                 <Grid item xs={12} lg={5}>
//                     <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
//                         <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
//                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}><PriceCheck /> Price Breakdown</Typography>
//                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                                 {[{ label: "Base Price", value: basePrice }, { label: "Extra Margin", value: marginPrice, bold: true }, { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true }, { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true }, { label: "Extra Wire Cost", value: wirePrice }, { label: "Extra Height Cost", value: heightPrice }, { label: "Out of Varanasi Charge", value: outOfVnsPrice }].map((item) => (item.value > 0 || item.label === "Base Price") && <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', pl: item.indent ? 2 : 0, color: item.indent ? 'text.secondary' : 'text.primary', fontSize: item.indent ? '0.9rem' : '1rem' }}><Typography variant="body1">{item.label}:</Typography><Typography variant="body1" fontWeight={item.bold ? '600' : '400'}>{formatCurrency(item.value)}</Typography></Box>)}
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
//                             </Box>
//                         </Paper>
//                     </motion.div>
//                 </Grid>
//             </Grid>
//         </Box>
//       </Box>
//       <Dialog open={dialogOpen} onClose={handleCloseDialog}>
//         <DialogTitle>Send Quotation to Customer</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2 }}>Enter customer details. The quote will be sent to WhatsApp.</DialogContentText>
//           <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSendQuote} variant="contained" color="success">Send</Button>
//         </DialogActions>
//       </Dialog>
//       <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
//         <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
//           {notification.message}
//         </Alert>
//       </Snackbar>

//       <div style={{ display: 'none' }}>
//         <div ref={printRef} style={{ padding: '32px', color: 'black' }}>
//             <Typography variant="h4" gutterBottom>Arpit Solar Quotation</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Customer Details:</Typography>
//             <Typography><strong>Name:</strong> {customerInfo.name || 'N/A'}</Typography>
//             <Typography><strong>Phone:</strong> {customerInfo.phone || 'N/A'}</Typography>
//             <Typography><strong>Address:</strong> {customerInfo.address || 'N/A'}</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">System Details:</Typography>
//             <Typography><strong>System:</strong> {selectedProduct.kWp} kWp (Phase {selectedProduct.phase})</Typography>
//             <Typography><strong>Module:</strong> {selectedProduct.module}W x {selectedProduct.qty} Qty</Typography>
//             <Divider sx={{ my: 2 }} />
//             <TableContainer component={Paper} variant="outlined">
//                 <Table size="small">
//                     <TableBody>
//                         <TableRow>
//                             <TableCell>Subtotal (Before GST)</TableCell>
//                             <TableCell align="right">{formatCurrency(subtotal)}</TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell>GST (8.9%)</TableCell>
//                             <TableCell align="right">{formatCurrency(gstAmount)}</TableCell>
//                         </TableRow>
//                         <TableRow sx={{ '& > *': { fontWeight: 'bold', fontSize: '1.1rem' } }}>
//                             <TableCell>Grand Total</TableCell>
//                             <TableCell align="right">{formatCurrency(total)}</TableCell>
//                         </TableRow>
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </div>
//       </div>
//     </>
//   );
// }













// "use client";

// import { useState, useMemo, useRef } from "react";
// import {
//   Select, MenuItem, InputLabel, FormControl, TextField, Checkbox,
//   FormControlLabel, Button, Card, CardContent, Typography, Box,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Divider,
//   Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Snackbar, Alert
// } from "@mui/material";
// import type { SelectChangeEvent } from '@mui/material/Select';
// import Grid from '@mui/material/Grid';
// import { SolarPower, PriceCheck, RestartAlt, TableChart, PictureAsPdf, WhatsApp } from "@mui/icons-material";
// import { motion, AnimatePresence } from "framer-motion";
// import { useReactToPrint } from "react-to-print";

// import type { Product } from '../types/quote';
// import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from '../data/priceList';
// import { formatCurrency } from '../lib/utils';

// export default function SolarPricingPage() {
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
//   const [extraMargin, setExtraMargin] = useState<number>(0);
//   const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
//   const [extraWireLength, setExtraWireLength] = useState<number>(0);
//   const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
//   const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
//   const [location, setLocation] = useState<string>("Varanasi");
//   const [salespersonName, setSalespersonName] = useState<string>("");
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

//   const printRef = useRef<HTMLDivElement>(null);

//   const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = useMemo(() => {
//     if (!selectedProduct) return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
//     const basePriceVal = selectedProduct.price;
//     const marginPriceVal = extraMargin;
//     const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
//     const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE : 0;
//     const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;
//     const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
//     const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
//     const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
//     return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
//   }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

//   const handleReset = () => {
//     setSelectedProduct(products[0] || null);
//     setExtraMargin(0);
//     setExtraWireChecked(false);
//     setExtraWireLength(0);
//     setExtraHeightChecked(false);
//     setExtraHeightValue(0);
//     setLocation("Varanasi");
//     setSalespersonName("");
//   };

//   const handlePrint = useReactToPrint({
//     contentRef: printRef,
//     documentTitle: `Quotation_ArpitSolar_${new Date().toISOString().slice(0, 10)}`,
//   });

//   const handleOpenDialog = () => setDialogOpen(true);
//   const handleCloseDialog = () => setDialogOpen(false);
//   const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
//   };

//   const handleSendQuote = async () => {
//     if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
//         setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: 'error' });
//         return;
//     }
//     setLoading(true);
//     handleCloseDialog();
//     const customerSubtotal = basePrice + wirePrice + heightPrice + outOfVnsPrice;
//     const customerGst = customerSubtotal * GST_RATE;
//     const customerTotal = customerSubtotal + customerGst;
//     const payload = {
//       customerInfo,
//       selectedProduct,
//       salespersonName,
//       location,
//       calculations: { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal: customerSubtotal, gstAmount: customerGst, total: customerTotal }
//     };

//     try {
//       const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Failed to send quote');
//       setNotification({ open: true, message: 'Quotation sent successfully!', severity: 'success' });
//     } catch (error: any) {
//       setNotification({ open: true, message: error.message, severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!selectedProduct) return <Typography>No Products Available</Typography>;

//   const animationVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//     exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
//   };

//   return (
//     <>
//       <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
//         <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
//             </Box>
//             <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
//               <SolarPower sx={{ verticalAlign: 'middle' }} /> Solar Pricing Calculator
//             </Typography>
//             <Grid container spacing={4}>
//                 <Grid item xs={12} lg={7}>
//                     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//                         <CardContent sx={{ p: 3 }}>
//                             <Typography variant="h6" sx={{ mb: 3 }}>Configuration</Typography>
//                             <Grid container spacing={3}>
//                                 <Grid item xs={12}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="product-select-label">Select Product</InputLabel>
//                                     <Select labelId="product-select-label" label="Select Product" value={`${selectedProduct.kWp}-${selectedProduct.phase}`} onChange={(e: SelectChangeEvent) => { const [kWp, phase] = e.target.value.split("-").map(parseFloat); setSelectedProduct(products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]); }}>
//                                         {products.map((p) => <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{`${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`}</MenuItem>)}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <TextField label="Salesperson Name" fullWidth value={salespersonName} onChange={(e) => setSalespersonName(e.target.value)} />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <TextField label="Extra Margin" type="number" fullWidth value={extraMargin === 0 ? '' : extraMargin} onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="location-select-label">Location</InputLabel>
//                                     <Select labelId="location-select-label" label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
//                                       <MenuItem value="Varanasi">Varanasi</MenuItem>
//                                       <MenuItem value="Other">Other</MenuItem>
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />} label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`} />
//                                   <AnimatePresence>
//                                     {extraWireChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Wire Length (m)" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraWireLength === 0 ? '' : extraWireLength} onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />} label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)}/kWp)`} />
//                                   <AnimatePresence>
//                                     {extraHeightChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Height kWp" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraHeightValue === 0 ? '' : extraHeightValue} onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid item xs={12} sx={{ mt: 2 }}>
//                                   <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                                     <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
//                                     <Button variant="contained" onClick={handlePrint} startIcon={<PictureAsPdf />}>Print Internal PDF</Button>
//                                     <Button variant="contained" color="success" onClick={handleOpenDialog} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? 'Sending...' : 'Send on WhatsApp'}</Button>
//                                   </Box>
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//                 <Grid item xs={12} lg={5}>
//                     <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
//                         <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
//                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}><PriceCheck /> Price Breakdown</Typography>
//                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                                 {[{ label: "Base Price", value: basePrice }, { label: "Extra Margin", value: marginPrice, bold: true }, { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true }, { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true }, { label: "Extra Wire Cost", value: wirePrice }, { label: "Extra Height Cost", value: heightPrice }, { label: "Out of Varanasi Charge", value: outOfVnsPrice }].map((item) => (item.value > 0 || item.label === "Base Price") && <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', pl: item.indent ? 2 : 0, color: item.indent ? 'text.secondary' : 'text.primary', fontSize: item.indent ? '0.9rem' : '1rem' }}><Typography variant="body1">{item.label}:</Typography><Typography variant="body1" fontWeight={item.bold ? '600' : '400'}>{formatCurrency(item.value)}</Typography></Box>)}
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
//                             </Box>
//                         </Paper>
//                     </motion.div>
//                 </Grid>
//             </Grid>
//         </Box>
//       </Box>
//       <Dialog open={dialogOpen} onClose={handleCloseDialog}>
//         <DialogTitle>Send Quotation to Customer</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2 }}>Enter customer details. The quote will be sent to WhatsApp.</DialogContentText>
//           <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSendQuote} variant="contained" color="success">Send</Button>
//         </DialogActions>
//       </Dialog>
//       <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
//         <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
//           {notification.message}
//         </Alert>
//       </Snackbar>

//       <div style={{ display: 'none' }}>
//         <div ref={printRef} style={{ padding: '32px', color: 'black' }}>
//             <Typography variant="h4" gutterBottom>Arpit Solar Quotation</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Customer Details:</Typography>
//             <Typography><strong>Name:</strong> {customerInfo.name || 'N/A'}</Typography>
//             <Typography><strong>Phone:</strong> {customerInfo.phone || 'N/A'}</Typography>
//             <Typography><strong>Address:</strong> {customerInfo.address || 'N/A'}</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">System Details:</Typography>
//             <Typography><strong>System:</strong> {selectedProduct.kWp} kWp (Phase {selectedProduct.phase})</Typography>
//             <Typography><strong>Module:</strong> {selectedProduct.module}W x {selectedProduct.qty} Qty</Typography>
//             <Divider sx={{ my: 2 }} />
//             <TableContainer component={Paper} variant="outlined">
//                 <Table size="small">
//                     <TableBody>
//                         <TableRow>
//                             <TableCell>Subtotal (Before GST)</TableCell>
//                             <TableCell align="right">{formatCurrency(subtotal)}</TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell>GST (8.9%)</TableCell>
//                             <TableCell align="right">{formatCurrency(gstAmount)}</TableCell>
//                         </TableRow>
//                         <TableRow sx={{ '& > *': { fontWeight: 'bold', fontSize: '1.1rem' } }}>
//                             <TableCell>Grand Total</TableCell>
//                             <TableCell align="right">{formatCurrency(total)}</TableCell>
//                         </TableRow>
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </div>
//       </div>
//     </>
//   );
// }











// "use client";

// import { useState, useMemo, useRef } from "react";
// import {
//   Select, MenuItem, InputLabel, FormControl, TextField, Checkbox,
//   FormControlLabel, Button, Card, CardContent, Typography, Box,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Divider,
//   Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Snackbar, Alert
// } from "@mui/material";
// import type { SelectChangeEvent } from '@mui/material/Select';
// import Grid from '@mui/material/Grid';
// import { SolarPower, PriceCheck, RestartAlt, TableChart, PictureAsPdf, WhatsApp } from "@mui/icons-material";
// import { motion, AnimatePresence } from "framer-motion";
// import { useReactToPrint } from "react-to-print";

// import type { Product } from '../types/quote';
// import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from '../data/priceList';
// import { formatCurrency } from '../lib/utils';

// export default function SolarPricingPage() {
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
//   const [extraMargin, setExtraMargin] = useState<number>(0);
//   const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
//   const [extraWireLength, setExtraWireLength] = useState<number>(0);
//   const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
//   const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
//   const [location, setLocation] = useState<string>("Varanasi");
//   const [salespersonName, setSalespersonName] = useState<string>("");
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

//   const printRef = useRef<HTMLDivElement>(null);

//   const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = useMemo(() => {
//     if (!selectedProduct) return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
//     const basePriceVal = selectedProduct.price;
//     const marginPriceVal = extraMargin;
//     const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
//     const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE : 0;
//     const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;
//     const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
//     const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
//     const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
//     return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
//   }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

//   const handleReset = () => {
//     setSelectedProduct(products[0] || null);
//     setExtraMargin(0);
//     setExtraWireChecked(false);
//     setExtraWireLength(0);
//     setExtraHeightChecked(false);
//     setExtraHeightValue(0);
//     setLocation("Varanasi");
//     setSalespersonName("");
//   };

//   const handlePrint = useReactToPrint({
//     contentRef: printRef,
//     documentTitle: `Quotation_ArpitSolar_${new Date().toISOString().slice(0, 10)}`,
//   });

//   const handleOpenDialog = () => setDialogOpen(true);
//   const handleCloseDialog = () => setDialogOpen(false);
//   const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
//   };

//   const handleSendQuote = async () => {
//     if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
//         setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: 'error' });
//         return;
//     }
//     setLoading(true);
//     handleCloseDialog();
//     const customerSubtotal = basePrice + wirePrice + heightPrice + outOfVnsPrice;
//     const customerGst = customerSubtotal * GST_RATE;
//     const customerTotal = customerSubtotal + customerGst;
//     const payload = {
//       customerInfo,
//       selectedProduct,
//       salespersonName,
//       location,
//       calculations: { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal: customerSubtotal, gstAmount: customerGst, total: customerTotal }
//     };

//     try {
//       const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Failed to send quote');
//       setNotification({ open: true, message: 'Quotation sent successfully!', severity: 'success' });
//     } catch (error: any) {
//       setNotification({ open: true, message: error.message, severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!selectedProduct) return <Typography>No Products Available</Typography>;

//   const animationVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//     exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
//   };

//   return (
//     <>
//       <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
//         <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
//             </Box>
//             <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
//               <SolarPower sx={{ verticalAlign: 'middle' }} /> Solar Pricing Calculator
//             </Typography>
//             <Grid container spacing={4}>
//                 <Grid component="div" item xs={12} lg={7}>
//                     <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
//                         <CardContent sx={{ p: 3 }}>
//                             <Typography variant="h6" sx={{ mb: 3 }}>Configuration</Typography>
//                             <Grid container spacing={3}>
//                                 <Grid component="div" item xs={12}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="product-select-label">Select Product</InputLabel>
//                                     <Select labelId="product-select-label" label="Select Product" value={`${selectedProduct.kWp}-${selectedProduct.phase}`} onChange={(e: SelectChangeEvent) => { const [kWp, phase] = e.target.value.split("-").map(parseFloat); setSelectedProduct(products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]); }}>
//                                         {products.map((p) => <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{`${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`}</MenuItem>)}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid component="div" item xs={12} sm={6}>
//                                   <TextField label="Salesperson Name" fullWidth value={salespersonName} onChange={(e) => setSalespersonName(e.target.value)} />
//                                 </Grid>
//                                 <Grid component="div" item xs={12} sm={6}>
//                                   <TextField label="Extra Margin" type="number" fullWidth value={extraMargin === 0 ? '' : extraMargin} onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
//                                 </Grid>
//                                 <Grid component="div" item xs={12} sm={6}>
//                                   <FormControl fullWidth>
//                                     <InputLabel id="location-select-label">Location</InputLabel>
//                                     <Select labelId="location-select-label" label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
//                                       <MenuItem value="Varanasi">Varanasi</MenuItem>
//                                       <MenuItem value="Other">Other</MenuItem>
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>
//                                 <Grid component="div" item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />} label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`} />
//                                   <AnimatePresence>
//                                     {extraWireChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Wire Length (m)" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraWireLength === 0 ? '' : extraWireLength} onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid component="div" item xs={12}>
//                                   <FormControlLabel control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />} label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)}/kWp)`} />
//                                   <AnimatePresence>
//                                     {extraHeightChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
//                                       <TextField label="Extra Height kWp" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraHeightValue === 0 ? '' : extraHeightValue} onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))} />
//                                     </motion.div>}
//                                   </AnimatePresence>
//                                 </Grid>
//                                 <Grid component="div" item xs={12} sx={{ mt: 2 }}>
//                                   <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                                     <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
//                                     <Button variant="contained" onClick={handlePrint} startIcon={<PictureAsPdf />}>Print Internal PDF</Button>
//                                     <Button variant="contained" color="success" onClick={handleOpenDialog} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? 'Sending...' : 'Send on WhatsApp'}</Button>
//                                   </Box>
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//                 <Grid component="div" item xs={12} lg={5}>
//                     <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
//                         <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
//                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}><PriceCheck /> Price Breakdown</Typography>
//                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                                 {[{ label: "Base Price", value: basePrice }, { label: "Extra Margin", value: marginPrice, bold: true }, { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true }, { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true }, { label: "Extra Wire Cost", value: wirePrice }, { label: "Extra Height Cost", value: heightPrice }, { label: "Out of Varanasi Charge", value: outOfVnsPrice }].map((item) => (item.value > 0 || item.label === "Base Price") && <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', pl: item.indent ? 2 : 0, color: item.indent ? 'text.secondary' : 'text.primary', fontSize: item.indent ? '0.9rem' : '1rem' }}><Typography variant="body1">{item.label}:</Typography><Typography variant="body1" fontWeight={item.bold ? '600' : '400'}>{formatCurrency(item.value)}</Typography></Box>)}
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
//                                 <Divider sx={{ my: 1 }} />
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
//                             </Box>
//                         </Paper>
//                     </motion.div>
//                 </Grid>
//             </Grid>
//         </Box>
//       </Box>
//       <Dialog open={dialogOpen} onClose={handleCloseDialog}>
//         <DialogTitle>Send Quotation to Customer</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2 }}>Enter customer details. The quote will be sent to WhatsApp.</DialogContentText>
//           <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
//           <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSendQuote} variant="contained" color="success">Send</Button>
//         </DialogActions>
//       </Dialog>
//       <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
//         <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
//           {notification.message}
//         </Alert>
//       </Snackbar>

//       <div style={{ display: 'none' }}>
//         <div ref={printRef} style={{ padding: '32px', color: 'black' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
//             </Box>
//             <Typography variant="h4" gutterBottom align="center">Arpit Solar Internal Quotation</Typography>
//             <Typography variant="subtitle1" align="center" gutterBottom>Date: {new Date().toLocaleDateString()}</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Sales Details:</Typography>
//             <Typography><strong>Salesperson Name:</strong> {salespersonName || 'N/A'}</Typography>
//             <Typography><strong>Location:</strong> {location}</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Customer Details:</Typography>
//             <Typography><strong>Name:</strong> {customerInfo.name || 'N/A'}</Typography>
//             <Typography><strong>Phone:</strong> {customerInfo.phone || 'N/A'}</Typography>
//             <Typography><strong>Address:</strong> {customerInfo.address || 'N/A'}</Typography>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">System Details:</Typography>
//             <Typography><strong>System:</strong> {selectedProduct.kWp} kWp (Phase {selectedProduct.phase})</Typography>
//             <Typography><strong>Module:</strong> {selectedProduct.module}W x {selectedProduct.qty} Qty</Typography>
//             {extraWireChecked && <Typography><strong>Extra Wire:</strong> {extraWireLength}m @ {formatCurrency(selectedProduct.wire)}/m</Typography>}
//             {extraHeightChecked && <Typography><strong>Extra Height:</strong> {extraHeightValue} kWp @ {formatCurrency(EXTRA_HEIGHT_RATE)}/kWp</Typography>}
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Price Breakdown:</Typography>
//             <TableContainer component={Paper} variant="outlined">
//                 <Table size="small">
//                     <TableBody>
//                         <TableRow>
//                             <TableCell>Base Price</TableCell>
//                             <TableCell align="right">{formatCurrency(basePrice)}</TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell>Extra Margin</TableCell>
//                             <TableCell align="right">{formatCurrency(marginPrice)}</TableCell>
//                         </TableRow>
//                         <TableRow sx={{ '& > *': { color: 'text.secondary' } }}>
//                             <TableCell sx={{ pl: 4 }}>Vendor Margin (60%)</TableCell>
//                             <TableCell align="right">{formatCurrency(marginPrice * 0.6)}</TableCell>
//                         </TableRow>
//                         <TableRow sx={{ '& > *': { color: 'text.secondary' } }}>
//                             <TableCell sx={{ pl: 4 }}>Salesperson Margin (40%)</TableCell>
//                             <TableCell align="right">{formatCurrency(marginPrice * 0.4)}</TableCell>
//                         </TableRow>
//                         {wirePrice > 0 && <TableRow>
//                             <TableCell>Extra Wire Cost</TableCell>
//                             <TableCell align="right">{formatCurrency(wirePrice)}</TableCell>
//                         </TableRow>}
//                         {heightPrice > 0 && <TableRow>
//                             <TableCell>Extra Height Cost</TableCell>
//                             <TableCell align="right">{formatCurrency(heightPrice)}</TableCell>
//                         </TableRow>}
//                         {outOfVnsPrice > 0 && <TableRow>
//                             <TableCell>Out of Varanasi Charge</TableCell>
//                             <TableCell align="right">{formatCurrency(outOfVnsPrice)}</TableCell>
//                         </TableRow>}
//                         <TableRow>
//                             <TableCell>Subtotal (Before GST)</TableCell>
//                             <TableCell align="right">{formatCurrency(subtotal)}</TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell>GST (8.9%)</TableCell>
//                             <TableCell align="right">{formatCurrency(gstAmount)}</TableCell>
//                         </TableRow>
//                         <TableRow sx={{ '& > *': { fontWeight: 'bold', fontSize: '1.1rem' } }}>
//                             <TableCell>Grand Total</TableCell>
//                             <TableCell align="right">{formatCurrency(total)}</TableCell>
//                         </TableRow>
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </div>
//       </div>
//     </>
//   );
// }
















"use client";

import { useState, useMemo, useRef } from "react";
import {
  Select, MenuItem, InputLabel, FormControl, TextField, Checkbox,
  FormControlLabel, Button, Card, CardContent, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableRow, Paper, InputAdornment, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Snackbar, Alert
} from "@mui/material";
import type { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import { SolarPower, PriceCheck, RestartAlt, PictureAsPdf, WhatsApp } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

import type { Product } from '../types/quote';
import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from '../data/priceList';
import { formatCurrency } from '../lib/utils';

export default function SolarPricingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [extraMargin, setExtraMargin] = useState<number>(0);
  const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
  const [extraWireLength, setExtraWireLength] = useState<number>(0);
  const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
  const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
  const [location, setLocation] = useState<string>("Varanasi");
  const [salespersonName, setSalespersonName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  
  // ✅ 1. State to track if the dialog is for 'whatsapp' or 'print'
  const [dialogPurpose, setDialogPurpose] = useState<'whatsapp' | 'print' | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const { basePrice, marginPrice, wirePrice, heightPrice, outOfVnsPrice, subtotal, gstAmount, total } = useMemo(() => {
    if (!selectedProduct) return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
    const basePriceVal = selectedProduct.price;
    const marginPriceVal = extraMargin;
    const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
    const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE : 0;
    const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;
    const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
    const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
    const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
    return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
  }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

  const handleReset = () => {
    setSelectedProduct(products[0] || null);
    setExtraMargin(0);
    setExtraWireChecked(false);
    setExtraWireLength(0);
    setExtraHeightChecked(false);
    setExtraHeightValue(0);
    setLocation("Varanasi");
    setSalespersonName("");
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Quotation_ArpitSolar_${new Date().toISOString().slice(0, 10)}`,
  });

  const handleCloseDialog = () => setDialogOpen(false);
  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };
  
  // ✅ 2. New function to decide whether to print immediately or open the dialog
  const handleInitiatePrint = () => {
    if (!customerInfo.name && !customerInfo.phone) {
      setDialogPurpose('print');
      setDialogOpen(true);
    } else {
      handlePrint();
    }
  };

  const handleSendQuote = async () => {
    if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
        setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: 'error' });
        return;
    }
    setLoading(true);
    handleCloseDialog();
    const customerSubtotal = basePrice + wirePrice + heightPrice + outOfVnsPrice;
    const customerGst = customerSubtotal * GST_RATE;
    const customerTotal = customerSubtotal + customerGst;
    const payload = {
      customerInfo,
      selectedProduct,
      salespersonName,
      location,
      calculations: { basePrice, wirePrice, heightPrice, outOfVnsPrice, subtotal: customerSubtotal, gstAmount: customerGst, total: customerTotal }
    };

    try {
      const response = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send quote');
      setNotification({ open: true, message: 'Quotation sent successfully!', severity: 'success' });
    } catch (error: any) {
      setNotification({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProduct) return <Typography>No Products Available</Typography>;

  const animationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img src={companyDetails.logo} alt="Arpit Solar Logo" style={{ maxWidth: '180px', height: 'auto' }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
              <SolarPower sx={{ verticalAlign: 'middle' }} /> Solar Pricing Calculator
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={7}>
                    <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>Configuration</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <FormControl fullWidth>
                                    <InputLabel id="product-select-label">Select Product</InputLabel>
                                    <Select labelId="product-select-label" label="Select Product" value={`${selectedProduct.kWp}-${selectedProduct.phase}`} onChange={(e: SelectChangeEvent) => { const [kWp, phase] = e.target.value.split("-").map(parseFloat); setSelectedProduct(products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]); }}>
                                        {products.map((p) => <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{`${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`}</MenuItem>)}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField label="Salesperson Name" fullWidth value={salespersonName} onChange={(e) => setSalespersonName(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField label="Extra Margin" type="number" fullWidth value={extraMargin === 0 ? '' : extraMargin} onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel id="location-select-label">Location</InputLabel>
                                    <Select labelId="location-select-label" label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
                                      <MenuItem value="Varanasi">Varanasi</MenuItem>
                                      <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControlLabel control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />} label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`} />
                                  <AnimatePresence>
                                    {extraWireChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                                      <TextField label="Extra Wire Length (m)" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraWireLength === 0 ? '' : extraWireLength} onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))} />
                                    </motion.div>}
                                  </AnimatePresence>
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControlLabel control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />} label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)}/kWp)`} />
                                  <AnimatePresence>
                                    {extraHeightChecked && <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                                      <TextField label="Extra Height kWp" type="number" size="small" sx={{ mt: 1, width: { xs: '100%', sm: '50%' } }} value={extraHeightValue === 0 ? '' : extraHeightValue} onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))} />
                                    </motion.div>}
                                  </AnimatePresence>
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
                                    {/* ✅ 3. Update the Print button's onClick handler */}
                                    <Button variant="contained" onClick={handleInitiatePrint} startIcon={<PictureAsPdf />}>Print Internal PDF</Button>
                                    {/* ✅ 4. Update the WhatsApp button's onClick handler */}
                                    <Button variant="contained" color="success" onClick={() => { setDialogPurpose('whatsapp'); setDialogOpen(true); }} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? 'Sending...' : 'Send on WhatsApp'}</Button>
                                  </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={5}>
                    <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
                        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}><PriceCheck /> Price Breakdown</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {[{ label: "Base Price", value: basePrice }, { label: "Extra Margin", value: marginPrice, bold: true }, { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true }, { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true }, { label: "Extra Wire Cost", value: wirePrice }, { label: "Extra Height Cost", value: heightPrice }, { label: "Out of Varanasi Charge", value: outOfVnsPrice }].map((item) => (item.value > 0 || item.label === "Base Price") && <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', pl: item.indent ? 2 : 0, color: item.indent ? 'text.secondary' : 'text.primary', fontSize: item.indent ? '0.9rem' : '1rem' }}><Typography variant="body1">{item.label}:</Typography><Typography variant="body1" fontWeight={item.bold ? '600' : '400'}>{formatCurrency(item.value)}</Typography></Box>)}
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Send Quotation to Customer</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Enter customer details. The quote will be sent to WhatsApp.</DialogContentText>
          <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
          <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
        </DialogContent>
        {/* ✅ 5. Conditionally render the dialog's action button */}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogPurpose === 'whatsapp' ? (
            <Button onClick={handleSendQuote} variant="contained" color="success">Send</Button>
          ) : (
            <Button onClick={() => {
                handleCloseDialog();
                // A small timeout allows the state to update before printing
                setTimeout(() => {
                    handlePrint();
                }, 100);
            }} variant="contained">Save & Print</Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <div style={{ display: 'none' }}>
        <div ref={printRef} style={{ padding: '32px', color: 'black' }}>
            <Typography variant="h4" gutterBottom align="center">Arpit Solar Internal Quotation</Typography>
            <Typography variant="subtitle1" align="center" gutterBottom>Date: {new Date().toLocaleDateString()}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Sales Details:</Typography>
            <Typography><strong>Salesperson Name:</strong> {salespersonName || 'N/A'}</Typography>
            <Typography><strong>Location:</strong> {location}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Customer Details:</Typography>
            <Typography><strong>Name:</strong> {customerInfo.name || 'N/A'}</Typography>
            <Typography><strong>Phone:</strong> {customerInfo.phone || 'N/A'}</Typography>
            <Typography><strong>Address:</strong> {customerInfo.address || 'N/A'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">System Details:</Typography>
            <Typography><strong>System:</strong> {selectedProduct.kWp} kWp (Phase {selectedProduct.phase})</Typography>
            <Typography><strong>Module:</strong> {selectedProduct.module}W x {selectedProduct.qty} Qty</Typography>
            {extraWireChecked && <Typography><strong>Extra Wire:</strong> {extraWireLength}m @ {formatCurrency(selectedProduct.wire)}/m</Typography>}
            {extraHeightChecked && <Typography><strong>Extra Height:</strong> {extraHeightValue} kWp @ {formatCurrency(EXTRA_HEIGHT_RATE)}/kWp</Typography>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Price Breakdown:</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableBody>
                        <TableRow><TableCell>Base Price</TableCell><TableCell align="right">{formatCurrency(basePrice)}</TableCell></TableRow>
                        <TableRow><TableCell>Extra Margin</TableCell><TableCell align="right">{formatCurrency(marginPrice)}</TableCell></TableRow>
                        <TableRow sx={{ '& > *': { color: 'text.secondary' } }}><TableCell sx={{ pl: 4 }}>Vendor Margin (60%)</TableCell><TableCell align="right">{formatCurrency(marginPrice * 0.6)}</TableCell></TableRow>
                        <TableRow sx={{ '& > *': { color: 'text.secondary' } }}><TableCell sx={{ pl: 4 }}>Salesperson Margin (40%)</TableCell><TableCell align="right">{formatCurrency(marginPrice * 0.4)}</TableCell></TableRow>
                        {wirePrice > 0 && <TableRow><TableCell>Extra Wire Cost</TableCell><TableCell align="right">{formatCurrency(wirePrice)}</TableCell></TableRow>}
                        {heightPrice > 0 && <TableRow><TableCell>Extra Height Cost</TableCell><TableCell align="right">{formatCurrency(heightPrice)}</TableCell></TableRow>}
                        {outOfVnsPrice > 0 && <TableRow><TableCell>Out of Varanasi Charge</TableCell><TableCell align="right">{formatCurrency(outOfVnsPrice)}</TableCell></TableRow>}
                        <TableRow><TableCell>Subtotal (Before GST)</TableCell><TableCell align="right">{formatCurrency(subtotal)}</TableCell></TableRow>
                        <TableRow><TableCell>GST (8.9%)</TableCell><TableCell align="right">{formatCurrency(gstAmount)}</TableCell></TableRow>
                        <TableRow sx={{ '& > *': { fontWeight: 'bold', fontSize: '1.1rem' } }}><TableCell>Grand Total</TableCell><TableCell align="right">{formatCurrency(total)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
      </div>
    </>
  );
}