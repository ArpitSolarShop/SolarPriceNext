"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  InputAdornment,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import { SolarPower, PriceCheck, RestartAlt, PictureAsPdf, WhatsApp, Print } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

import type { Product } from "../types/quote";
import { products, companyDetails, GST_RATE, EXTRA_HEIGHT_RATE } from "../data/priceList";
import { formatCurrency } from "../lib/utils";

type DialogMode = "whatsapp" | "customerPrint";

export default function SolarPricingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [extraMargin, setExtraMargin] = useState<number>(0);
  const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
  const [extraWireLength, setExtraWireLength] = useState<number>(0);
  const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
  const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [location, setLocation] = useState<string>("Varanasi");
  const [salespersonName, setSalespersonName] = useState<string>("");
  const [nowString, setNowString] = useState("");
  const [todayString, setTodayString] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("whatsapp");
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const salesPrintRef = useRef<HTMLDivElement>(null);
  const customerPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNowString(new Date().toLocaleString());
    setTodayString(new Date().toLocaleDateString());
  }, []);

  const {
    basePrice,
    marginPrice,
    wirePrice,
    heightPrice,
    outOfVnsPrice,
    subtotal,
    gstAmount,
    total,
  } = useMemo(() => {
    if (!selectedProduct)
      return { basePrice: 0, marginPrice: 0, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gstAmount: 0, total: 0 };
    const basePriceVal = selectedProduct.price;
    const marginPriceVal = extraMargin;
    const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
    // Extra Height Cost = (Extra Height) × (Rate per ft/m) × (System kW)
    const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE * selectedProduct.kWp : 0;
    const outOfVnsPriceVal = location !== "Varanasi" ? selectedProduct.outOfVns : 0;

    const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
    const gstAmountVal = +(subtotalVal * GST_RATE).toFixed(2);
    const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
    return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gstAmount: gstAmountVal, total: totalVal };
  }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location]);

  const safeDiscount = Math.max(0, discount || 0);
  const grandTotal = Math.max(0, +(total - safeDiscount).toFixed(2));

  const handleReset = () => {
    setSelectedProduct(products[0] || null);
    setExtraMargin(0);
    setExtraWireChecked(false);
    setExtraWireLength(0);
    setExtraHeightChecked(false);
    setExtraHeightValue(0);
    setDiscount(0);
    setLocation("Varanasi");
    setSalespersonName("");
  };

  // react-to-print v3 API: use contentRef
  const handlePrintSales = useReactToPrint({ contentRef: salesPrintRef, documentTitle: `SalesCopy_ArpitSolar_${new Date().toISOString().slice(0, 10)}` });
  const handlePrintCustomer = useReactToPrint({ contentRef: customerPrintRef, documentTitle: `CustomerCopy_ArpitSolar_${new Date().toISOString().slice(0, 10)}` });

  const handleOpenDialog = (mode: DialogMode) => { setDialogMode(mode); setDialogOpen(true); };
  const handleCloseDialog = () => setDialogOpen(false);

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const buildQuotePayload = () => {
    const customerSubtotal = basePrice + marginPrice + wirePrice + heightPrice + outOfVnsPrice;
    const customerGst = +(customerSubtotal * GST_RATE).toFixed(2);
    const customerTotal = +(customerSubtotal + customerGst).toFixed(2);
    return {
      customerInfo,
      selectedProduct,
      salespersonName,
      location,
      extraMargin,
      calculations: {
        basePrice,
        marginPrice,
        wirePrice,
        heightPrice,
        outOfVnsPrice,
        subtotal: customerSubtotal,
        gstAmount: customerGst,
        total: customerTotal,
        discount: safeDiscount,
        grandTotal: Math.max(0, +(customerTotal - safeDiscount).toFixed(2)),
      },
    };
  };

  const saveQuoteRecord = async (payload: any) => {
    try {
      await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch (e) {
      console.error("Failed to save quote record", e);
    }
  };

  const sendWhatsApp = async () => {
    if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
      setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: "error" });
      return;
    }
    setLoading(true);
    handleCloseDialog();

    const payload = { ...buildQuotePayload(), channel: 'whatsapp', taxRate: 0.089, currency: 'INR' };

    try {
      const response = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send quote");
      // Save record to Supabase via our capture route
      await saveQuoteRecord(payload);
      setNotification({ open: true, message: "Quotation sent successfully!", severity: "success" });
    } catch (error: any) {
      setNotification({ open: true, message: error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const printCustomerCopy = async () => {
    // Validation optional for print; keep consistent with WhatsApp
    if (!customerInfo.name || !customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
      setNotification({ open: true, message: "Please fill customer name and a valid 10-digit phone number.", severity: "error" });
      return;
    }
    setLoading(true);
    handleCloseDialog();
    const payload = { ...buildQuotePayload(), channel: 'customer_print', taxRate: 0.089, currency: 'INR' };
    try {
      // Save the record first (for tracking)
      await saveQuoteRecord(payload);
      // Then trigger the print
      await handlePrintCustomer?.();
      setNotification({ open: true, message: "Customer copy ready to print.", severity: "success" });
    } catch (e: any) {
      setNotification({ open: true, message: e.message || "Failed to print customer copy.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogPrimary = async () => {
    if (dialogMode === "whatsapp") return sendWhatsApp();
    return printCustomerCopy();
  };

  if (!selectedProduct) return <Typography>No Products Available</Typography>;

  const animationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  } as const;

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "grey.50", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: "xl", mx: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Image src={companyDetails.logo} alt="Arpit Solar Logo" width={180} height={60} priority />
          </Box>
          <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}>
            <SolarPower sx={{ verticalAlign: "middle" }} /> Solar Pricing Calculator
          </Typography>

          <Grid container spacing={4}>
            {/* Left column - Configuration */}
            <Grid>
              <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Configuration
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid>
                      <FormControl fullWidth>
                        <InputLabel id="product-select-label">Select Product</InputLabel>
                        <Select
                          labelId="product-select-label"
                          label="Select Product"
                          value={`${selectedProduct.kWp}-${selectedProduct.phase}`}
                          onChange={(e: SelectChangeEvent) => {
                            const [kWp, phase] = e.target.value.split("-").map(parseFloat);
                            setSelectedProduct(
                              products.find((p) => p.kWp === kWp && p.phase === phase) || products[0]
                            );
                          }}
                        >
                          {products.map((p) => (
                            <MenuItem key={`${p.kWp}-${p.phase}`} value={`${p.kWp}-${p.phase}`}>{
                              `${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`
                            }</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid>
                      <TextField
                        label="Salesperson Name"
                        fullWidth
                        value={salespersonName}
                        onChange={(e) => setSalespersonName(e.target.value)}
                      />
                    </Grid>

                    <Grid>
                      <TextField
                        label="Extra Margin"
                        type="number"
                        fullWidth
                        value={extraMargin === 0 ? "" : extraMargin}
                        onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    </Grid>

                    <Grid>
                      <TextField
                        label="Discount"
                        type="number"
                        fullWidth
                        value={discount === 0 ? "" : discount}
                        onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    </Grid>

                    <Grid>
                      <FormControl fullWidth>
                        <InputLabel id="location-select-label">Location</InputLabel>
                        <Select
                          labelId="location-select-label"
                          label="Location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        >
                          <MenuItem value="Varanasi">Varanasi</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid>
                      <FormControlLabel
                        control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />}
                        label={`Add Extra Wire (@ ${formatCurrency(selectedProduct.wire)}/m)`}
                      />
                      <AnimatePresence>
                        {extraWireChecked && (
                          <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                            <TextField
                              label="Extra Wire Length (m)"
                              type="number"
                              size="small"
                              sx={{ mt: 1, width: { xs: "100%", sm: "50%" } }}
                              value={extraWireLength === 0 ? "" : extraWireLength}
                              onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Grid>

                    <Grid>
                      <FormControlLabel
                        control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />}
                        label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)} per ft/m × kW)`}
                      />
                      <AnimatePresence>
                        {extraHeightChecked && (
                          <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                            <TextField
                              label="Extra Height (ft/m)"
                              type="number"
                              size="small"
                              sx={{ mt: 1, width: { xs: "100%", sm: "50%" } }}
                              value={extraHeightValue === 0 ? "" : extraHeightValue}
                              onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Grid>

                    <Grid>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
                        <Button variant="contained" onClick={async () => { await saveQuoteRecord({ ...buildQuotePayload(), channel: 'sales_print', taxRate: 0.089, currency: 'INR' }); handlePrintSales?.(); }} startIcon={<Print />}>Print Sales Copy</Button>
                        <Button variant="contained" onClick={() => handleOpenDialog("customerPrint")} startIcon={<PictureAsPdf />}>Print Customer Copy</Button>
                        <Button variant="contained" color="success" onClick={() => handleOpenDialog("whatsapp")} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading}>{loading ? "Sending..." : "Send on WhatsApp"}</Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right column - Price Breakdown */}
            <Grid>
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
                <Paper elevation={3} sx={{ borderRadius: 3, p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    <PriceCheck /> Price Breakdown
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[
                      { label: "Base Price", value: basePrice },
                      { label: "Extra Margin", value: marginPrice, bold: true },
                      { label: "Vendor Margin (60%)", value: marginPrice * 0.6, indent: true },
                      { label: "Salesperson Margin (40%)", value: marginPrice * 0.4, indent: true },
                      { label: "Extra Wire Cost", value: wirePrice },
                      { label: "Extra Height Cost", value: heightPrice },
                      { label: "Out of Varanasi Charge", value: outOfVnsPrice },
                    ]
                      .filter((item) => item.value > 0 || item.label === "Base Price")
                      .map((item) => (
                        <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", pl: item.indent ? 2 : 0, color: item.indent ? "text.secondary" : "text.primary", fontSize: item.indent ? "0.9rem" : "1rem" }}>
                          <Typography variant="body1">{item.label}:</Typography>
                          <Typography variant="body1" fontWeight={item.bold ? 600 : 400}>{formatCurrency(item.value)}</Typography>
                        </Box>
                      ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography>GST (8.9%):</Typography><Typography>{formatCurrency(gstAmount)}</Typography></Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
                    {safeDiscount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", color: "success.main" }}>
                        <Typography variant="h6" fontWeight="bold">Discount:</Typography>
                        <Typography variant="h6" fontWeight="bold">-{formatCurrency(safeDiscount)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="h6" fontWeight="bold">Grand Total:</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(grandTotal)}</Typography></Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{dialogMode === "whatsapp" ? "Send Quotation to Customer" : "Customer Copy Print"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{dialogMode === "whatsapp" ? "Enter customer details. The quote will be sent to WhatsApp." : "Enter customer details to print a customer-friendly copy."}</DialogContentText>
          <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
          <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDialogPrimary} variant="contained" color={dialogMode === "whatsapp" ? "success" : "primary"}>{dialogMode === "whatsapp" ? (loading ? "Sending..." : "Send") : (loading ? "Printing..." : "Print")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: "100%" }}>{notification.message}</Alert>
      </Snackbar>

      {/* Hidden printable areas */}
      <div style={{ display: "none" }}>
        {/* Sales Copy (Internal) */}
        <div ref={salesPrintRef} style={{ padding: 24, color: "black", width: "800px" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Image src={companyDetails.logo} alt="Arpit Solar Logo" width={140} height={50} />
            <Box textAlign="right">
              <Typography variant="h6">Arpit Solar - Sales Copy</Typography>
              <Typography variant="body2">{nowString}</Typography>
              <Typography variant="body2">Salesperson: {salespersonName || "N/A"}</Typography>
              <Typography variant="body2">Location: {location}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>System Details</Typography>
          <Typography>System: {selectedProduct!.kWp} kWp (Phase {selectedProduct!.phase})</Typography>
          <Typography>Module: {selectedProduct!.module}W × {selectedProduct!.qty} Qty</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Price Breakdown</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow><TableCell>Base Price</TableCell><TableCell align="right">{formatCurrency(basePrice)}</TableCell></TableRow>
                <TableRow><TableCell>Extra Margin</TableCell><TableCell align="right">{formatCurrency(marginPrice)}</TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 4, color: "text.secondary" }}>Vendor Margin (60%)</TableCell><TableCell align="right" sx={{ color: "text.secondary" }}>{formatCurrency(marginPrice * 0.6)}</TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 4, color: "text.secondary" }}>Salesperson Margin (40%)</TableCell><TableCell align="right" sx={{ color: "text.secondary" }}>{formatCurrency(marginPrice * 0.4)}</TableCell></TableRow>
                {wirePrice > 0 && (<TableRow><TableCell>Extra Wire Cost</TableCell><TableCell align="right">{formatCurrency(wirePrice)}</TableCell></TableRow>)}
                {heightPrice > 0 && (<TableRow><TableCell>Extra Height Cost (H × Rate × kW)</TableCell><TableCell align="right">{formatCurrency(heightPrice)}</TableCell></TableRow>)}
                {outOfVnsPrice > 0 && (<TableRow><TableCell>Out of Varanasi Charge</TableCell><TableCell align="right">{formatCurrency(outOfVnsPrice)}</TableCell></TableRow>)}
                <TableRow><TableCell sx={{ fontWeight: 600 }}>Subtotal (Before GST)</TableCell><TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</TableCell></TableRow>
                <TableRow><TableCell>GST (8.9%)</TableCell><TableCell align="right">{formatCurrency(gstAmount)}</TableCell></TableRow>
                <TableRow><TableCell>Total (After GST)</TableCell><TableCell align="right">{formatCurrency(total)}</TableCell></TableRow>
                {safeDiscount > 0 && (<TableRow><TableCell sx={{ color: "success.main", fontWeight: 600 }}>Discount</TableCell><TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>-{formatCurrency(safeDiscount)}</TableCell></TableRow>)}
                <TableRow sx={{ '& > *': { fontWeight: 700 } }}><TableCell>Grand Total</TableCell><TableCell align="right">{formatCurrency(grandTotal)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">Internal copy for sales records. Not intended for customer distribution.</Typography>
        </div>

        {/* Customer Copy */}
        <div ref={customerPrintRef} style={{ padding: 24, color: "black", width: "800px" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Image src={companyDetails.logo} alt="Arpit Solar Logo" width={140} height={50} />
            <Box textAlign="right">
              <Typography variant="h6">Arpit Solar - Quotation</Typography>
              <Typography variant="body2">Date: {todayString}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>Customer Details</Typography>
          <Typography><strong>Name:</strong> {customerInfo.name || "N/A"}</Typography>
          <Typography><strong>Phone:</strong> {customerInfo.phone || "N/A"}</Typography>
          <Typography><strong>Address:</strong> {customerInfo.address || "N/A"}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>System Details</Typography>
          <Typography>System: {selectedProduct!.kWp} kWp (Phase {selectedProduct!.phase})</Typography>
          <Typography>Module: {selectedProduct!.module}W × {selectedProduct!.qty} Qty</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Price Summary</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow><TableCell>Base Price</TableCell><TableCell align="right">{formatCurrency(basePrice)}</TableCell></TableRow>
                {marginPrice > 0 && (<TableRow><TableCell>Extra Margin</TableCell><TableCell align="right">{formatCurrency(marginPrice)}</TableCell></TableRow>)}
                {wirePrice > 0 && (<TableRow><TableCell>Extra Wire Cost</TableCell><TableCell align="right">{formatCurrency(wirePrice)}</TableCell></TableRow>)}
                {heightPrice > 0 && (<TableRow><TableCell>Extra Height Cost</TableCell><TableCell align="right">{formatCurrency(heightPrice)}</TableCell></TableRow>)}
                {outOfVnsPrice > 0 && (<TableRow><TableCell>Out of Varanasi Charge</TableCell><TableCell align="right">{formatCurrency(outOfVnsPrice)}</TableCell></TableRow>)}
                <TableRow><TableCell sx={{ fontWeight: 600 }}>Subtotal (Before GST)</TableCell><TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</TableCell></TableRow>
                <TableRow><TableCell>GST (8.9%)</TableCell><TableCell align="right">{formatCurrency(gstAmount)}</TableCell></TableRow>
                <TableRow><TableCell>Total (After GST)</TableCell><TableCell align="right">{formatCurrency(total)}</TableCell></TableRow>
                {safeDiscount > 0 && (<TableRow><TableCell sx={{ color: "success.main", fontWeight: 600 }}>Discount</TableCell><TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>-{formatCurrency(safeDiscount)}</TableCell></TableRow>)}
                <TableRow sx={{ '& > *': { fontWeight: 700 } }}><TableCell>Grand Total</TableCell><TableCell align="right">{formatCurrency(grandTotal)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">Thank you for considering Arpit Solar.</Typography>
        </div>
      </div>
    </>
  );
}
